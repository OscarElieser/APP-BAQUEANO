/**
 * WHY
 * Provides one browser-safe Firebase client layer for web and admin.
 *
 * HOW
 * Reads only NEXT_PUBLIC variables, initializes lazily, and exposes typed helpers.
 *
 * WHAT
 * Firebase app, auth, Firestore, storage accessors, and collection path helpers.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, type CollectionReference, type DocumentData } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function getBaqueanoFirebaseApp(): FirebaseApp {
  if (!firebaseConfig.projectId) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID for Baqueano web Firebase.");
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getBaqueanoAuth() {
  return getAuth(getBaqueanoFirebaseApp());
}

export function getBaqueanoDb() {
  return getFirestore(getBaqueanoFirebaseApp());
}

export function getBaqueanoStorage() {
  return getStorage(getBaqueanoFirebaseApp());
}

export function baqueanoCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(getBaqueanoDb(), path) as CollectionReference<T>;
}
