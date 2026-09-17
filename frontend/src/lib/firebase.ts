import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only once
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const app = !getApps().length
  ? initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'demo-api-key',
            authDomain: 'floodtwin-demo.firebaseapp.com',
            projectId: 'floodtwin-demo',
            storageBucket: 'floodtwin-demo.appspot.com',
            messagingSenderId: '123456789',
            appId: '1:123456789:web:abcdef',
          }
    )
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
