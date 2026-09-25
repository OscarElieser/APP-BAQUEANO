// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PATRÓN CIRCUIT BREAKER DE RESILIENCIA (circuit-breaker.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Evitar que fallos repetidos o lentitud en Firebase saturen el backend y bloqueen
//   la experiencia del usuario.
// - Conmutar rápidamente al modo de contingencia en Supabase cuando Firebase esté caído.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Máquina de estados: CLOSED (Normal) -> OPEN (Falla activa) -> HALF_OPEN (Prueba).
// - Umbral de fallos consecutivos configurable (5 por defecto).
// - Tiempo de enfriamiento (30 segundos) antes de intentar restablecimiento gradual.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `CircuitBreaker`: Clase administradora de contingencia y fallover.
// - `firebaseCircuitBreaker`: Instancia singleton para operaciones con Firestore.
// ============================================================================
"use strict";

class CircuitBreaker {
  constructor({ name = "service", failureThreshold = 5, resetTimeoutMs = 30000 } = {}) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.state = "CLOSED"; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();
  }

  isOpen() {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        this.lastStateChange = now;
        console.warn(`[CircuitBreaker:${this.name}] Estado transicionado a HALF_OPEN para prueba de recuperación.`);
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = "CLOSED";
        this.successCount = 0;
        this.lastStateChange = Date.now();
        console.info(`[CircuitBreaker:${this.name}] Servicio recuperado. Estado reabierto a CLOSED.`);
      }
    }
  }

  recordFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    console.warn(`[CircuitBreaker:${this.name}] Falla registrada (#${this.failureCount}): ${error?.message || error}`);

    if (this.state === "HALF_OPEN" || this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.lastStateChange = Date.now();
      console.error(`[CircuitBreaker:${this.name}] Umbral superado. Circuito ABIERTO (OPEN). Conmutando a modo de respaldo.`);
    }
  }

  async execute(primaryFn, fallbackFn) {
    if (this.isOpen()) {
      if (typeof fallbackFn === "function") {
        return fallbackFn(new Error(`Circuit breaker for ${this.name} is OPEN`));
      }
      throw new Error(`Circuit breaker for ${this.name} is OPEN and no fallback was provided`);
    }

    try {
      const result = await primaryFn();
      this.recordSuccess();
      return { data: result, fromFallback: false };
    } catch (err) {
      this.recordFailure(err);
      if (typeof fallbackFn === "function") {
        const fallbackResult = await fallbackFn(err);
        return { data: fallbackResult, fromFallback: true, error: err.message };
      }
      throw err;
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      lastStateChange: new Date(this.lastStateChange).toISOString()
    };
  }
}

const firebaseCircuitBreaker = new CircuitBreaker({ name: "firebase-firestore", failureThreshold: 5, resetTimeoutMs: 30000 });

module.exports = {
  CircuitBreaker,
  firebaseCircuitBreaker
};
