// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONFIGURACIÓN CENTRAL DE FIREBASE (firebase-config.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la configuración de Firebase y Google OAuth en un único archivo
//   para evitar duplicación, inconsistencias y facilitar actualizaciones futuras.
// - Habilitar la autenticación con Google (OAuth 2.0) en todas las páginas que
//   requieran identidad del usuario (perfil.html, admin.html, index.html).
// - Garantizar que Firebase se inicialice una sola vez, evitando errores
//   "Firebase App already initialized" en entornos con múltiples scripts.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Patrón Singleton: verifica firebase.apps.length antes de inicializar.
// - Google OAuth: usa GoogleAuthProvider con customParameters para forzar
//   selección de cuenta, soportando múltiples perfiles en el mismo dispositivo.
// - El client_id de OAuth (obtenido desde Google Cloud Console → Credenciales)
//   se registra en el proveedor para mayor seguridad y trazabilidad.
// - Exposición global: window.BaqueanoFirebase para verificación y depuración.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - BAQUEANO_FIREBASE_CONFIG: Objeto de configuración oficial del proyecto.
// - BAQUEANO_GOOGLE_OAUTH_CLIENT_ID: Client ID de Google Cloud OAuth 2.0 Web.
// - window.BaqueanoFirebase: Referencia global a la instancia de Firebase.
// - createGoogleProvider(): Fábrica de GoogleAuthProvider preconfigurado.
// ============================================================================

(function(window) {
  'use strict';

  // ==========================================================================
  // CONFIGURACIÓN OFICIAL DEL PROYECTO FIREBASE
  // Proyecto: app-baqueano | Región: nam5 (us-central)
  // ==========================================================================
  var BAQUEANO_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDgdMOJ19RjsgY79LXDIeWlZ48uW5Oo6GE',
    authDomain: 'app-baqueano.firebaseapp.com',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com/',
    projectId: 'app-baqueano',
    storageBucket: 'app-baqueano.firebasestorage.app',
    messagingSenderId: '578585227888',
    appId: '1:578585227888:web:3e5c9b0d7a8f4c2a1d9b5e'
  };

  // ==========================================================================
  // CREDENCIAL GOOGLE OAUTH 2.0 WEB (Client ID de Google Cloud Console)
  // Proyecto: app-baqueano | Tipo: Aplicación web
  // Usado por: GoogleAuthProvider, Firebase Auth y Google Identity Services
  // ==========================================================================
  var BAQUEANO_GOOGLE_OAUTH_CLIENT_ID =
    '578585227888-47unuhuo1e3napu5n6ho1obmp8kip2l4.apps.googleusercontent.com';

  // ==========================================================================
  // INICIALIZACIÓN SINGLETON — Evita "Firebase App already initialized"
  // Se ejecuta inmediatamente al cargar este script, antes de cualquier módulo.
  // ==========================================================================
  function initializeFirebaseOnce() {
    // Verificar si el SDK Firebase (compat) está disponible
    if (typeof firebase === 'undefined') {
      console.warn('[Baqueano Firebase] SDK de Firebase no encontrado. Carga firebase-app-compat.js antes de este script.');
      return null;
    }

    // Patrón Singleton: inicializar solo si no hay instancias previas
    if (firebase.apps && firebase.apps.length > 0) {
      // Firebase ya fue inicializado (posiblemente por otro script)
      return firebase.app();
    }

    try {
      var app = firebase.initializeApp(BAQUEANO_FIREBASE_CONFIG);
      console.info('[Baqueano Firebase] ✅ Inicializado correctamente. Proyecto:', BAQUEANO_FIREBASE_CONFIG.projectId);
      return app;
    } catch (err) {
      // Capturar error "app already exists" en caso de race condition
      if (err.code === 'app/duplicate-app') {
        return firebase.app();
      }
      console.error('[Baqueano Firebase] ❌ Error de inicialización:', err.message);
      return null;
    }
  }

  // ==========================================================================
  // FÁBRICA DE GOOGLE AUTH PROVIDER
  // Retorna un proveedor preconfigurado con el client_id oficial del proyecto.
  // ==========================================================================
  function createGoogleProvider() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('[Baqueano Firebase] Auth no disponible para crear GoogleAuthProvider.');
      return null;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    // Forzar selección de cuenta para soporte multi-perfil
    provider.setCustomParameters({
      prompt: 'select_account',
      // El client_id es registrado automáticamente por Firebase SDK,
      // pero lo exponemos aquí para documentación y trazabilidad
      client_id: BAQUEANO_GOOGLE_OAUTH_CLIENT_ID
    });
    // Agregar scopes adicionales para perfil completo del usuario
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
  }

  // ==========================================================================
  // EJECUTAR INICIALIZACIÓN Y EXPONER GLOBALMENTE
  // ==========================================================================
  var firebaseApp = initializeFirebaseOnce();

  // Exponer globalmente para que otros módulos puedan verificar el estado
  window.BaqueanoFirebase = {
    app: firebaseApp,
    config: BAQUEANO_FIREBASE_CONFIG,
    googleClientId: BAQUEANO_GOOGLE_OAUTH_CLIENT_ID,
    createGoogleProvider: createGoogleProvider,
    isReady: !!firebaseApp
  };

  // Mantener compatibilidad con código existente que usa window.firebase directamente
  // (navigation.js, admin-ops.js, firestore-realtime.js, user-session.js)
  // Firebase SDK ya se expone como window.firebase automáticamente al cargarse.

})(window);
