#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SCRIPT DE CUSTOM CLAIMS FIREBASE AUTH
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Establecer los Custom Claims de Firebase Auth para las cuentas oficiales
//   del ecosistema Baqueano Nicaragua, resolviendo el ítem de deuda técnica #3.
// - Los Custom Claims permiten que las Firestore Security Rules validen
//   el rol directamente desde el token JWT sin consultas adicionales:
//   * super_admin: oscarelieser.informatica.inatec@gmail.com
//   * auditor: vigoronmixt@gmail.com
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Usa Firebase Admin SDK con Service Account privado (NO incluir en Git).
// - Se ejecuta UNA SOLA VEZ por cuenta o cuando cambien los roles.
// - Requiere: GOOGLE_APPLICATION_CREDENTIALS o la variable FIREBASE_SERVICE_ACCOUNT_KEY.
//
// 📦 3. QUÉ (WHAT / USO):
// - Ejecutar con: node set-admin-claims.js
// - Variables de entorno requeridas:
//   * FIREBASE_SERVICE_ACCOUNT_PATH: ruta al JSON de Service Account (privado)
//   * O: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
//
// ⚠️ ADVERTENCIA DE SEGURIDAD:
// - NUNCA incluir el Service Account JSON en el repositorio Git.
// - NUNCA exponer FIREBASE_PRIVATE_KEY en código cliente o variables públicas.
// ============================================================================

const admin = require('firebase-admin');
const path = require('path');

// Verificar que se proporcione el Service Account
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Carga desde archivo local (desarrollo)
  serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
} else if (process.env.FIREBASE_PRIVATE_KEY) {
  // Carga desde variables de entorno (CI/CD)
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID || 'app-baqueano',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
} else {
  console.error('❌ ERROR: Se requiere FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_PRIVATE_KEY.');
  console.error('   Proporciona el Service Account desde Firebase Console → Configuración del proyecto → Cuentas de servicio.');
  process.exit(1);
}

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'app-baqueano'
  });
}

const auth = admin.auth();

// Cuentas oficiales con sus roles y Custom Claims
const OFFICIAL_ACCOUNTS = [
  {
    email: 'oscarelieser.informatica.inatec@gmail.com',
    claims: {
      role: 'super_admin',
      canWrite: true,
      canPublish: true,
      canAudit: true,
      canBroadcast: true,
      canViewFinances: true,
      canManageBusinesses: true,
      ecosistema: 'baqueano_nicaragua'
    },
    label: '👑 Super Administrador General'
  },
  {
    email: 'vigoronmixt@gmail.com',
    claims: {
      role: 'auditor',
      canWrite: false,
      canPublish: false,
      canAudit: true,
      canBroadcast: false,
      canViewFinances: true,
      canManageBusinesses: false,
      ecosistema: 'baqueano_nicaragua'
    },
    label: '🔍 Auditor Oficial de Cumplimiento (Ley 306)'
  }
];

async function setCustomClaims() {
  console.log('\n🧭 BAQUEANO — Configuración de Custom Claims Firebase Auth\n');
  console.log('='.repeat(60));

  for (const account of OFFICIAL_ACCOUNTS) {
    try {
      console.log(`\n➤ Procesando: ${account.label}`);
      console.log(`  Email: ${account.email}`);

      // Buscar usuario por email
      let user;
      try {
        user = await auth.getUserByEmail(account.email);
        console.log(`  UID: ${user.uid}`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          console.warn(`  ⚠️  Usuario no encontrado. Debe iniciar sesión al menos una vez en la app.`);
          continue;
        }
        throw err;
      }

      // Establecer Custom Claims
      await auth.setCustomUserClaims(user.uid, account.claims);

      console.log(`  ✅ Custom Claims establecidos:`);
      console.log(`     role: "${account.claims.role}"`);
      console.log(`     canWrite: ${account.claims.canWrite}`);
      console.log(`     canAudit: ${account.claims.canAudit}`);
      console.log(`     canBroadcast: ${account.claims.canBroadcast}`);

    } catch (err) {
      console.error(`  ❌ Error configurando ${account.email}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Proceso completado. Los Custom Claims se aplican en el próximo login del usuario.');
  console.log('   Para forzar la renovación del token, el usuario debe cerrar sesión y volver a entrar.\n');

  process.exit(0);
}

setCustomClaims();
