"use client";
/**
 * POR QUE
 * El viajero necesita abrir rutas y contenido preparado cuando pierde conexion.
 * COMO
 * Registra un Service Worker que excluye API, autenticacion y datos sensibles.
 * QUE
 * Registro silencioso y actualizable del cache offline seguro.
 */
import { useEffect } from "react";
export function OfflineRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);
  return null;
}
