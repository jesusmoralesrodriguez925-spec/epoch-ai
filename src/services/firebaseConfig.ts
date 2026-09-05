// Firebase App Configuration & SDK Initialization for KODI
import { initializeApp, getApps, getApp, FirebaseApp, setLogLevel as setAppLogLevel } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  setLogLevel as setFirestoreLogLevel, 
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const config = {
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  oAuthClientId: firebaseConfig.oAuthClientId,
};

// Suppress internal verbose offline warning logs
try {
  setAppLogLevel('silent');
  setFirestoreLogLevel('silent');
} catch {}

// Intercept harmless internal Firestore offline connection messages
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args[0] ? String(args[0]) : '';
    if (
      message.includes('Could not reach Cloud Firestore backend') ||
      message.includes('Backend didn\'t respond within 10 seconds') ||
      message.includes('@firebase/firestore')
    ) {
      console.debug('[Firestore]: Modo offline activo. Operando con caché local y sincronización en segundo plano.');
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0] ? String(args[0]) : '';
    if (
      message.includes('Could not reach Cloud Firestore backend') ||
      message.includes('Backend didn\'t respond within 10 seconds') ||
      message.includes('@firebase/firestore')
    ) {
      console.debug('[Firestore]: Modo offline activo.');
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize Firebase App instance cleanly (avoid multiple initializations)
export const firebaseApp: FirebaseApp = !getApps().length
  ? initializeApp(config)
  : getApp();

// Initialize Firebase Authentication instance
export const auth: Auth = getAuth(firebaseApp);

// Initialize Firestore Database instance safely with forced long polling & local persistent cache
// This eliminates the 10-second WebChannel stream connection timeout in mobile/proxied networks
let firestoreInstance: Firestore | null = null;
try {
  firestoreInstance = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  try {
    firestoreInstance = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    });
  } catch {
    try {
      firestoreInstance = getFirestore(firebaseApp);
    } catch {
      firestoreInstance = null;
    }
  }
}

export const firestore: Firestore | null = firestoreInstance;

// Configure Google Auth Provider with custom parameters and select_account prompt
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});


