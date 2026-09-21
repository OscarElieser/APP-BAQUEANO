import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount))
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY no está definido. Fallback a credenciales predeterminadas (Application Default Credentials).");
      initializeApp({ credential: applicationDefault() });
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
