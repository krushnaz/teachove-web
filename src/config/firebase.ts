import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDRQnSs5QmvNrfEDE2GIwyfas3SkDFZyn4',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'schoolapp-20eb1.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'schoolapp-20eb1',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'schoolapp-20eb1.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '716866888427',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:716866888427:web:322c3fffbd31976df7d4ae',
};

export const FIREBASE_VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  const supported = await isSupported();
  if (!supported) return null;

  if (!messagingInstance) {
    messagingInstance = getMessaging(getFirebaseApp());
  }
  return messagingInstance;
}
