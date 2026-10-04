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
  // 🗄️ BASE DE DATOS FIRESTORE REAL: `appbaqueano`
  // 🎯 POR QUÉ: el proyecto no tiene base `(default)`; la única es `appbaqueano`
  //    (la misma de la app Android). `firebase.firestore()` apuntaba a la base
  //    inexistente: las lecturas devolvían vacío desde caché y las escrituras
  //    quedaban en cola para siempre, sin error visible. Nada se guardaba.
  // ⚙️ CÓMO: el SDK compat solo abre `(default)`. Su propio contenedor de
  //    componentes sí crea la instancia modular de una base con nombre; se
  //    envuelve en la clase compat (`firebase.firestore.Firestore`) y un Proxy
  //    hace que `firebase.firestore()` la devuelva en TODO el sitio, sin tocar
  //    cada archivo. Un accesor cubre el caso en que el SDK de Firestore cargue
  //    después de este script. SDK fijado en 10.14.1 (las URLs lo fijan).
  // 📦 QUÉ: una sola línea decide la base (FIRESTORE_DATABASE_ID). Si no se
  //    puede abrir, se lanza un error claro en lugar de fallar en silencio.
  // ==========================================================================
  var FIRESTORE_DATABASE_ID = 'appbaqueano';
  var namedFirestore = null;

  function openNamedFirestore(namespace) {
    if (namedFirestore) return namedFirestore;
    var appCompat = firebase.app();
    var container = appCompat && appCompat._delegate && appCompat._delegate.container;
    if (!container || typeof namespace.Firestore !== 'function') {
      throw new Error('[Baqueano Firebase] Este SDK no permite abrir la base "' + FIRESTORE_DATABASE_ID + '".');
    }
    var modular = container.getProvider('firestore').getImmediate({ identifier: FIRESTORE_DATABASE_ID });
    namedFirestore = new namespace.Firestore(appCompat, modular);
    return namedFirestore;
  }

  function routeToNamedDatabase(namespace) {
    if (!namespace || namespace.__bqDatabaseId) return namespace;
    return new Proxy(namespace, {
      apply: function (target, thisArg, args) {
        var app = args[0];
        // Otras apps (con nombre propio) conservan el comportamiento del SDK.
        if (app && app.name && app.name !== '[DEFAULT]') return Reflect.apply(target, thisArg, args);
        return openNamedFirestore(target);
      },
      get: function (target, prop, receiver) {
        if (prop === '__bqDatabaseId') return FIRESTORE_DATABASE_ID;
        return Reflect.get(target, prop, receiver);
      }
    });
  }

  function installFirestoreRouting() {
    if (typeof firebase === 'undefined') return;
    var descriptor = Object.getOwnPropertyDescriptor(firebase, 'firestore');
    if (descriptor && descriptor.get && descriptor.get.__bqRouting) return;
    var routed = routeToNamedDatabase(firebase.firestore);
    var getter = function () { return routed; };
    getter.__bqRouting = true;
    Object.defineProperty(firebase, 'firestore', {
      configurable: true,
      enumerable: true,
      get: getter,
      // El SDK de Firestore se registra con `firebase.firestore = …` al cargar.
      set: function (value) { routed = routeToNamedDatabase(value); }
    });
  }

  // ==========================================================================
  // 🌐 EXPOSICIÓN GLOBAL
  // ==========================================================================
  var firebaseApp = initializeFirebaseOnce();
  try {
    installFirestoreRouting();
  } catch (routingError) {
    console.error('[Baqueano Firebase] No se pudo dirigir Firestore a "' + FIRESTORE_DATABASE_ID + '":', routingError);
  }

  window.BaqueanoFirebase = {
    app:              firebaseApp,
    config:           BAQUEANO_FIREBASE_CONFIG,
    firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    googleClientId:   BAQUEANO_GOOGLE_OAUTH_CLIENT_ID,
    createGoogleProvider: createGoogleProvider,
    isReady:          !!firebaseApp
  };

  // ==========================================================================
  // 📊 TRAZABILIDAD DE RENDIMIENTO SIN ESCRITURAS BLOQUEANTES
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

  // ==========================================================================
  // Espejo Firestore → Supabase (directiva 2026-10-03: Firestore prioritario,
  // Supabase con la misma información). Se carga en toda página con Firebase;
  // envuelve las escrituras de Firestore sin cambiar su resultado.
  // ==========================================================================
  if (!document.querySelector('script[data-bq-mirror]')) {
    var mirrorScript = document.createElement('script');
    mirrorScript.src = 'js/firestore-mirror.js?v=20261003-1';
    mirrorScript.defer = true;
    mirrorScript.setAttribute('data-bq-mirror', '');
    document.head.appendChild(mirrorScript);
  }

})(window);
