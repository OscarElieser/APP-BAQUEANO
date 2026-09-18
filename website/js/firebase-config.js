// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONFIGURACIÓN CENTRAL DE FIREBASE (firebase-config.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la configuración oficial de Firebase y Google OAuth en un único
//   archivo para evitar duplicación, inconsistencias y facilitar actualizaciones.
// - Habilitar Firebase Auth, Firestore y Analytics en todas las páginas del
//   ecosistema Baqueano (perfil.html, admin.html, index.html).
// - Garantizar que Firebase se inicialice UNA SOLA VEZ mediante el patrón
//   Singleton, evitando el error "Firebase App already initialized".
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - SDK Compat (CDN): Compatible con el código existente que usa window.firebase.
// - Patrón Singleton: verifica firebase.apps.length antes de cada initializeApp().
// - Google OAuth Client ID registrado para trazabilidad y seguridad del proyecto.
// - Exposición global: window.BaqueanoFirebase para verificación y depuración.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - BAQUEANO_FIREBASE_CONFIG: Objeto de configuración oficial del proyecto.
// - window.BaqueanoFirebase: Referencia global con config, estado y utilidades.
// - createGoogleProvider(): Fábrica de GoogleAuthProvider preconfigurado.
//
// ⚠️  SEGURIDAD: La apiKey de Firebase para aplicaciones web es pública por diseño.
//   La seguridad real se implementa con Firebase Security Rules en Firestore/Storage.
// ============================================================================

(function(window) {
  'use strict';

  // ==========================================================================
  // 🔑 CONFIGURACIÓN OFICIAL DEL PROYECTO FIREBASE
  // Proyecto: app-baqueano | Region: nam5 (us-central)
  // Obtenida desde: Firebase Console → Configuración del proyecto → Tus apps
  // ==========================================================================
  var BAQUEANO_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCRNrYyqmymNkVvmKNyuhp7J-hIjQXN9pA',
    authDomain: 'app-baqueano.firebaseapp.com',
    databaseURL: 'https://app-baqueano-default-rtdb.firebaseio.com',
    projectId: 'app-baqueano',
    storageBucket: 'app-baqueano.firebasestorage.app',
    messagingSenderId: '578585227888',
    appId: '1:578585227888:web:9ce48c63e629cd52f2fab5',
    measurementId: 'G-J2FBQHH47T'
  };

  // ==========================================================================
  // 🔐 CREDENCIAL GOOGLE OAUTH 2.0 WEB (Google Cloud Console → Credenciales)
  // Permite la autenticación con Google en perfil.html y admin.html.
  // El SDK de Firebase lo usa internamente — aquí lo documentamos para claridad.
  // ==========================================================================
  var BAQUEANO_GOOGLE_OAUTH_CLIENT_ID =
    '578585227888-47unuhuo1e3napu5n6ho1obmp8kip2l4.apps.googleusercontent.com';

  // ==========================================================================
  // 🚀 INICIALIZACIÓN SINGLETON
  // Verifica firebase.apps.length para garantizar una sola instancia activa.
  // Se ejecuta de inmediato al cargar el script (antes de DOMContentLoaded).
  // ==========================================================================
  function initializeFirebaseOnce() {
    if (typeof firebase === 'undefined') {
      console.warn('[Baqueano Firebase] SDK no encontrado. Carga firebase-app-compat.js antes de este script.');
      return null;
    }

    // Si ya existe al menos una instancia, devolver la existente sin re-inicializar
    if (firebase.apps && firebase.apps.length > 0) {
      return firebase.app();
    }

    try {
      var app = firebase.initializeApp(BAQUEANO_FIREBASE_CONFIG);
      console.info('[Baqueano Firebase] ✅ App inicializada. Proyecto:', BAQUEANO_FIREBASE_CONFIG.projectId, '| AppId:', BAQUEANO_FIREBASE_CONFIG.appId);
      return app;
    } catch (err) {
      // Race condition: otra instancia fue creada entre la verificación y el init
      if (err.code === 'app/duplicate-app') {
        return firebase.app();
      }
      console.error('[Baqueano Firebase] ❌ Error:', err.message);
      return null;
    }
  }

  // ==========================================================================
  // 🔵 FÁBRICA DE GOOGLE AUTH PROVIDER
  // Retorna un GoogleAuthProvider preconfigurado con scopes y prompt de cuenta.
  // Usado por: BaqueanoSession.loginWithGoogle() y admin-ops.js
  // ==========================================================================
  function createGoogleProvider() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('[Baqueano Firebase] Auth no disponible para GoogleAuthProvider.');
      return null;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    // Forzar selección de cuenta: soporte multi-perfil en el mismo dispositivo
    provider.setCustomParameters({ prompt: 'select_account' });
    // Scopes mínimos necesarios para obtener nombre, foto y correo del explorador
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
  }

  // ==========================================================================
  // 🌐 EXPOSICIÓN GLOBAL
  // ==========================================================================
  var firebaseApp = initializeFirebaseOnce();

  window.BaqueanoFirebase = {
    app:              firebaseApp,
    config:           BAQUEANO_FIREBASE_CONFIG,
    googleClientId:   BAQUEANO_GOOGLE_OAUTH_CLIENT_ID,
    createGoogleProvider: createGoogleProvider,
    isReady:          !!firebaseApp
  };

  // ==========================================================================
  // 📊 TELEMETRÍA DE PÁGINA (AUDITORÍA WEB EN TIEMPO REAL)
  // Registra visitas a la página en la colección 'audit_logs' de Firestore
  // ==========================================================================
  function logPageView() {
    if (!firebaseApp || typeof firebase === 'undefined' || !firebase.firestore) return;
    
    var db = firebase.firestore();
    var pageName = window.location.pathname.split('/').pop() || 'index.html';
    
    // Intentar obtener el usuario actual si existe en session/local storage
    var userEmail = 'Visitante Anónimo';
    try {
      var sessionData = sessionStorage.getItem('baqueano_active_user');
      if (sessionData) {
        var parsed = JSON.parse(sessionData);
        if (parsed && parsed.email) userEmail = parsed.email;
      }
    } catch(e) {}

    db.collection('audit_logs').add({
      action: 'PAGE_VISIT',
      module: 'Telemetría Web',
      description: 'Acceso detectado en la página: ' + pageName,
      performedBy: userEmail,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      status: 'success'
    }).catch(function(err) {
      console.warn('[Baqueano Telemetry] No se pudo registrar visita:', err.message);
    });
  }

  // Ejecutar el registro de visita una vez que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logPageView);
  } else {
    logPageView();
  }

})(window);
