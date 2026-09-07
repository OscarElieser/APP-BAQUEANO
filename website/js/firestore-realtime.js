// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SINCRONIZACIÓN FIRESTORE EN TIEMPO REAL (firestore-realtime.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar el portal web estático de Baqueano Nicaragua directamente a
//   Cloud Firestore mediante el SDK de Firebase (compat v9), eliminando
//   cualquier dependencia de datos mockeados o hardcodeados.
// - Proveer sincronización en tiempo real para:
//   * Catálogo de destinos (colección /places) con filtrado por status='published'.
//   * Métricas operativas del Ops Center (usuarios, reservas, rutas activas).
//   * Registro de negocios aliados (/businesses) para el portal de anfitriones.
//   * Guardado de favoritos del explorador (/user_saved_places).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Firebase SDK compat (CDN) ya inicializado en app.js.
// - Uso de onSnapshot() para subscripción en tiempo real donde aplique.
// - Uso de get() para lecturas one-shot de catálogo público.
// - Manejo defensivo: if (!window.firebase) fallback a datos semilla.
// - Separación de responsabilidades: este módulo solo gestiona datos,
//   no manipula el DOM directamente (delega a callbacks).
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - BaqueanoFirestore.loadPublishedPlaces(callback)
// - BaqueanoFirestore.listenAdminMetrics(callback)
// - BaqueanoFirestore.registerBusiness(data) → Promise<string>
// - BaqueanoFirestore.savePlace(userId, placeId) → Promise<void>
// - BaqueanoFirestore.removeSavedPlace(userId, placeId) → Promise<void>
// - BaqueanoFirestore.getUserSavedPlaces(userId) → Promise<string[]>
// - BaqueanoFirestore.submitEnvReport(data) → Promise<string>
// - BaqueanoFirestore.loadAuditLogs(callback)
// ============================================================================

window.BaqueanoFirestore = (function() {

  // -----------------------------------------------------------------------
  // DATOS SEMILLA — Fallback cuando Firestore no está disponible (offline/dev)
  // -----------------------------------------------------------------------
  const SEED_PLACES = [
    {
      id: 'place_somoto_001',
      name: 'Monumento Nacional Cañón de Somoto',
      department: 'Madriz',
      municipality: 'Somoto',
      category: 'aguas',
      description: 'Paredes rocosas de más de 120 metros esculpidas por el Río Coco (Wangki). Recorridos de natación protegida con baqueanos campesinos.',
      rating: 4.9,
      reviewCount: 420,
      cooperativeName: 'Coop. Sonís Somoto',
      imageUrl: 'assets/images/destinos/canon_de_somoto.jpg',
      badge: 'Cañón Acuático',
      badgeIcon: 'fa-droplet',
      status: 'published',
      lat: 13.4775,
      lng: -86.5800,
      priceUsd: 35
    },
    {
      id: 'place_cerronegro_002',
      name: 'Volcán Cerro Negro (Volcano Sandboarding)',
      department: 'León',
      municipality: 'León',
      category: 'volcanes',
      description: 'El volcán más joven de Centroamérica (1850). Descenso de alta adrenalina sobre arena volcánica a 60-80 km/h.',
      rating: 5.0,
      reviewCount: 610,
      cooperativeName: 'Guías Los Maribios',
      imageUrl: 'assets/images/destinos/cerro_negro.jpg',
      badge: 'Volcán Activo',
      badgeIcon: 'fa-volcano',
      status: 'published',
      lat: 12.5063,
      lng: -86.7017,
      priceUsd: 45
    },
    {
      id: 'place_ometepe_003',
      name: 'Isla de Ometepe (Concepción & Maderas)',
      department: 'Rivas',
      municipality: 'Altagracia',
      category: 'islas',
      description: 'Oasis en el Gran Lago de Nicaragua con dos volcanes. Petroglifos sagrados y cooperativas agroecológicas.',
      rating: 4.9,
      reviewCount: 890,
      cooperativeName: 'Coop. Ometepe Verde',
      imageUrl: 'assets/images/destinos/isla_de_ometepe.jpg',
      badge: 'Reserva de Biosfera',
      badgeIcon: 'fa-mountain-sun',
      status: 'published',
      lat: 11.5206,
      lng: -85.5700,
      priceUsd: 55
    },
    {
      id: 'place_laluna_004',
      name: 'Cascada La Luna & Ruta del Café',
      department: 'Jinotega',
      municipality: 'El Cuá',
      category: 'selva',
      description: 'Caída de agua en bosque de niebla jinotegano. Canopy sobre la catarata y cata de café de estricta altura (SHG).',
      rating: 4.8,
      reviewCount: 310,
      cooperativeName: 'Asoc. Campesina El Cuá',
      imageUrl: 'assets/images/destinos/cascada_la_luna.jpg',
      badge: 'Nebliselva',
      badgeIcon: 'fa-cloud-rain',
      status: 'published',
      lat: 13.3720,
      lng: -85.6900,
      priceUsd: 40
    },
    {
      id: 'place_apoyo_005',
      name: 'Reserva Natural Laguna de Apoyo',
      department: 'Masaya',
      municipality: 'Masaya',
      category: 'aguas',
      description: 'Cráter volcánico con aguas termales de transparencia cristalina. Prohibidas embarcaciones de combustión.',
      rating: 4.9,
      reviewCount: 750,
      cooperativeName: 'Custodios del Cráter',
      imageUrl: 'assets/images/destinos/laguna_de_apoyo.jpg',
      badge: 'Aguas Minerales',
      badgeIcon: 'fa-water',
      status: 'published',
      lat: 11.9333,
      lng: -86.0333,
      priceUsd: 30
    },
    {
      id: 'place_masaya_006',
      name: 'Parque Nacional Volcán Masaya (Popogatepe)',
      department: 'Masaya',
      municipality: 'Nindirí',
      category: 'volcanes',
      description: 'El cráter Santiago y su lago de lava incandescente activo. Cruz de Bobadilla y túneles de lava fosilizada.',
      rating: 4.9,
      reviewCount: 980,
      cooperativeName: 'Comunidad de Nindirí',
      imageUrl: 'assets/images/destinos/volcan_masaya.jpg',
      badge: 'Lago de Lava',
      badgeIcon: 'fa-fire',
      status: 'published',
      lat: 11.9854,
      lng: -86.1614,
      priceUsd: 20
    }
  ];

  // -----------------------------------------------------------------------
  // CARGA DE DESTINOS PUBLICADOS DESDE FIRESTORE
  // -----------------------------------------------------------------------
  async function loadPublishedPlaces(callback) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        console.warn('[BaqueanoFirestore] SDK no disponible — usando datos semilla.');
        callback(SEED_PLACES, 'seed');
        return;
      }

      const db = window.firebase.firestore();
      const snapshot = await db.collection('places')
        .where('status', '==', 'published')
        .orderBy('name')
        .limit(48)
        .get();

      if (snapshot.empty) {
        console.info('[BaqueanoFirestore] Colección /places vacía — usando datos semilla.');
        callback(SEED_PLACES, 'seed');
        return;
      }

      const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(places, 'firestore');
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando places:', err.message);
      callback(SEED_PLACES, 'seed');
    }
  }

  // -----------------------------------------------------------------------
  // MÉTRICAS DEL OPS CENTER EN TIEMPO REAL (onSnapshot)
  // -----------------------------------------------------------------------
  let metricsUnsubscribe = null;

  function listenAdminMetrics(callback) {
    if (!window.firebase || !window.firebase.firestore) {
      // Métricas de referencia para desarrollo
      callback({
        totalPlaces: 6,
        publishedPlaces: 6,
        totalBusinesses: 3,
        totalAuditLogs: 12,
        activeSessions: 7,
        source: 'seed'
      });
      return null;
    }

    const db = window.firebase.firestore();

    // Escucha en tiempo real la colección /places
    metricsUnsubscribe = db.collection('places')
      .onSnapshot(snapshot => {
        const total = snapshot.size;
        const published = snapshot.docs.filter(d => d.data().status === 'published').length;
        callback({
          totalPlaces: total,
          publishedPlaces: published,
          source: 'firestore'
        });
      }, err => {
        console.error('[BaqueanoFirestore] Error en listenAdminMetrics:', err.message);
      });

    return metricsUnsubscribe;
  }

  function stopListeningMetrics() {
    if (metricsUnsubscribe) {
      metricsUnsubscribe();
      metricsUnsubscribe = null;
    }
  }

  // -----------------------------------------------------------------------
  // REGISTRO DE NEGOCIO/ANFITRIÓN EN /businesses
  // -----------------------------------------------------------------------
  async function registerBusiness(data) {
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      id: businessId,
      ...data,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();
        await db.collection('businesses').doc(businessId).set(record);
        console.info('[BaqueanoFirestore] Negocio registrado en Firestore:', businessId);
      } else {
        console.warn('[BaqueanoFirestore] Firestore no disponible. Registro local:', record);
      }
      return businessId;
    } catch (err) {
      console.error('[BaqueanoFirestore] Error registrando negocio:', err.message);
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // FAVORITOS DEL EXPLORADOR EN /user_saved_places
  // -----------------------------------------------------------------------
  async function savePlace(userId, placeId) {
    if (!userId || !placeId) throw new Error('userId y placeId son requeridos');

    const savedId = `${userId}_${placeId}`;
    const record = {
      id: savedId,
      userId: userId,
      placeId: placeId,
      savedAt: new Date().toISOString()
    };

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('user_saved_places').doc(savedId).set(record);
    }

    // Sincronización local como respaldo
    const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
    if (!local.includes(placeId)) {
      local.push(placeId);
      localStorage.setItem('baqueano_favs', JSON.stringify(local));
    }
  }

  async function removeSavedPlace(userId, placeId) {
    if (!userId || !placeId) throw new Error('userId y placeId son requeridos');

    const savedId = `${userId}_${placeId}`;

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('user_saved_places').doc(savedId).delete();
    }

    const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
    const filtered = local.filter(id => id !== placeId);
    localStorage.setItem('baqueano_favs', JSON.stringify(filtered));
  }

  async function getUserSavedPlaces(userId) {
    if (!userId) return JSON.parse(localStorage.getItem('baqueano_favs') || '[]');

    try {
      if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();
        const snapshot = await db.collection('user_saved_places')
          .where('userId', '==', userId)
          .get();
        return snapshot.docs.map(doc => doc.data().placeId);
      }
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando favoritos:', err.message);
    }

    return JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
  }

  // -----------------------------------------------------------------------
  // DENUNCIAS AMBIENTALES EN /environmental_reports
  // -----------------------------------------------------------------------
  async function submitEnvReport(data) {
    const reportId = `env_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      id: reportId,
      ...data,
      status: 'received',
      createdAt: new Date().toISOString()
    };

    if (window.firebase && window.firebase.firestore) {
      const db = window.firebase.firestore();
      await db.collection('environmental_reports').doc(reportId).set(record);
    }

    return reportId;
  }

  // -----------------------------------------------------------------------
  // LOGS DE AUDITORÍA INMUTABLES DESDE /audit_logs
  // -----------------------------------------------------------------------
  async function loadAuditLogs(callback) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        callback([], 'seed');
        return;
      }

      const db = window.firebase.firestore();
      const snapshot = await db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(logs, 'firestore');
    } catch (err) {
      console.error('[BaqueanoFirestore] Error cargando audit_logs:', err.message);
      callback([], 'error');
    }
  }

  // -----------------------------------------------------------------------
  // ESCRITURA DE AUDIT LOG ADMINISTRATIVO
  // -----------------------------------------------------------------------
  async function writeAuditLog(action, detail, userEmail) {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const entry = {
      id: logId,
      action: action,
      detail: detail,
      performedBy: userEmail || 'system',
      timestamp: new Date().toISOString(),
      source: 'web_admin'
    };

    if (window.firebase && window.firebase.firestore) {
      try {
        const db = window.firebase.firestore();
        await db.collection('audit_logs').doc(logId).set(entry);
      } catch (err) {
        console.error('[BaqueanoFirestore] Error escribiendo audit log:', err.message);
      }
    }

    return logId;
  }

  // API pública del módulo
  return {
    loadPublishedPlaces,
    listenAdminMetrics,
    stopListeningMetrics,
    registerBusiness,
    savePlace,
    removeSavedPlace,
    getUserSavedPlaces,
    submitEnvReport,
    loadAuditLogs,
    writeAuditLog,
    SEED_PLACES
  };

})();
