import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Expose the configured Auth instance for local diagnostics only. This does
// not expose credentials or tokens; callers must still use getIdToken().
(globalThis as typeof globalThis & { firebaseAuth?: typeof auth }).firebaseAuth = auth;
if (typeof window !== 'undefined') {
  (window as Window & { firebaseAuth?: typeof auth }).firebaseAuth = auth;
}
