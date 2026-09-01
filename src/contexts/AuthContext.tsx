import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut, onIdTokenChanged } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  authError: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let localSessionApplied = false;
    const isLoopback = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

    const tryLocalSession = async () => {
      if (!isLoopback || cancelled || localSessionApplied) return false;
      try {
        const response = await fetch('/api/auth/local-session');
        if (!response.ok) return false;
        const local = await response.json() as { token: string; user: { uid: string; email: string; displayName: string } };
        if (cancelled) return false;
        localSessionApplied = true;
        setUser(local.user as User);
        setToken(local.token);
        setLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (cancelled || localSessionApplied) return;
      setUser(currentUser);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
        
        // Ensure user exists in our DB
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
        } catch (error) {
          console.error("Failed to sync user with DB", error);
        }
      } else {
        if (await tryLocalSession()) return;
        setToken(null);
      }
      setLoading(false);
    });

    // Firebase initialization can be delayed by blocked third-party requests.
    // Keep loopback development usable without weakening production auth.
    const localFallbackTimer = isLoopback ? window.setTimeout(() => { void tryLocalSession(); }, 1500) : undefined;
    return () => {
      cancelled = true;
      unsubscribe();
      if (localFallbackTimer !== undefined) window.clearTimeout(localFallbackTimer);
    };
  }, []);

  const signIn = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
      const code = error instanceof FirebaseError ? error.code : 'auth/unknown';
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/internal-error') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setAuthError(`Не вдалося увійти через Firebase (${code}). Перевірте authorized domains, Google provider і конфігурацію tenant.`);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, authError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
