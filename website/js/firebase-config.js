// ============================================================================
// ðŸ§­ BAQUEANO ECOSYSTEM â€” CONFIGURACIÃ“N CENTRAL DE FIREBASE (firebase-config.js)
// ============================================================================
//
// ðŸŽ¯ 1. POR QUÃ‰ (WHY / PROPÃ“SITO):
// - Centralizar la configuraciÃ³n oficial de Firebase y Google OAuth en un Ãºnico
//   archivo para evitar duplicaciÃ³n, inconsistencias y facilitar actualizaciones.
// - Habilitar Firebase Auth, Firestore y Analytics en todas las pÃ¡ginas del
//   ecosistema Baqueano (perfil.html, admin.html, index.html).
// - Garantizar que Firebase se inicialice UNA SOLA VEZ mediante el patrÃ³n
//   Singleton, evitando el error "Firebase App already initialized".
//
// âš™ï¸ 2. CÃ“MO (HOW / ARQUITECTURA & IMPLEMENTACIÃ“N):
// - SDK Compat (CDN): Compatible con el cÃ³digo existente que usa window.firebase.
// - PatrÃ³n Singleton: verifica firebase.apps.length antes de cada initializeApp().
// - Google OAuth Client ID registrado para trazabilidad y seguridad del proyecto.
// - ExposiciÃ³n global: window.BaqueanoFirebase para verificaciÃ³n y depuraciÃ³n.
//
// ðŸ“¦ 3. QUÃ‰ (WHAT / ENTIDADES EXPUESTAS):
// - BAQUEANO_FIREBASE_CONFIG: Objeto de configuraciÃ³n oficial del proyecto.
// - window.BaqueanoFirebase: Referencia global con config, estado y utilidades.
// - createGoogleProvider(): FÃ¡brica de GoogleAuthProvider preconfigurado.
//
// âš ï¸  SEGURIDAD: La apiKey de Firebase para aplicaciones web es pÃºblica por diseÃ±o.
//   La seguridad real se implementa con Firebase Security Rules en Firestore/Storage.
// ============================================================================

(function(window) {
  'use strict';

  // ==========================================================================
  // ðŸ”‘ CONFIGURACIÃ“N OFICIAL DEL PROYECTO FIREBASE
  // Proyecto: app-baqueano | Region: nam5 (us-central)
  // Obtenida desde: Firebase Console â†’ ConfiguraciÃ³n del proyecto â†’ Tus apps
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
  // ðŸ” CREDENCIAL GOOGLE OAUTH 2.0 WEB (Google Cloud Console â†’ Credenciales)
  // Permite la autenticaciÃ³n con Google en perfil.html y admin.html.
  // El SDK de Firebase lo usa internamente â€” aquÃ­ lo documentamos para claridad.
  // ==========================================================================
  var BAQUEANO_GOOGLE_OAUTH_CLIENT_ID =
    '578585227888-47unuhuo1e3napu5n6ho1obmp8kip2l4.apps.googleusercontent.com';

  // ==========================================================================
  // ðŸš€ INICIALIZACIÃ“N SINGLETON
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
      console.info('[Baqueano Firebase] âœ… App inicializada. Proyecto:', BAQUEANO_FIREBASE_CONFIG.projectId, '| AppId:', BAQUEANO_FIREBASE_CONFIG.appId);
      return app;
    } catch (err) {
      // Race condition: otra instancia fue creada entre la verificaciÃ³n y el init
      if (err.code === 'app/duplicate-app') {
        return firebase.app();
      }
      console.error('[Baqueano Firebase] âŒ Error:', err.message);
      return null;
    }
  }

  // ==========================================================================
  // ðŸ”µ FÃBRICA DE GOOGLE AUTH PROVIDER
  // Retorna un GoogleAuthProvider preconfigurado con scopes y prompt de cuenta.
  // Usado por: BaqueanoSession.loginWithGoogle() y admin-ops.js
  // ==========================================================================
  function createGoogleProvider() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('[Baqueano Firebase] Auth no disponible para GoogleAuthProvider.');
      return null;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    // Forzar selecciÃ³n de cuenta: soporte multi-perfil en el mismo dispositivo
    provider.setCustomParameters({ prompt: 'select_account' });
    // Scopes mÃ­nimos necesarios para obtener nombre, foto y correo del explorador
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
  }

  // ==========================================================================
  // ðŸŒ EXPOSICIÃ“N GLOBAL
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
  // ðŸ“Š TRAZABILIDAD DE RENDIMIENTO SIN ESCRITURAS BLOQUEANTES
  // ==========================================================================
  function logPageView() {
    var pageName = window.location.pathname.split('/').pop() || 'index.html';
    var navigationEntry = window.performance && performance.getEntriesByType
      ? performance.getEntriesByType('navigation')[0]
      : null;
    var detail = {
      page: pageName,
      domReadyMs: navigationEntry ? Math.round(navigationEntry.domContentLoadedEventEnd) : null,
      loadMs: navigationEntry ? Math.round(navigationEntry.loadEventEnd) : null,
      online: navigator.onLine
    };
    window.dispatchEvent(new CustomEvent('baqueano:page-ready', { detail: detail }));
    console.info('[Baqueano Performance]', detail);
  }

  if (document.readyState === 'complete') logPageView();
  else window.addEventListener('load', logPageView, { once: true });

})(window);
