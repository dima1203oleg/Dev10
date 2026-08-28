import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onIdTokenChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAsDev: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  signIn: async () => {},
  signOut: async () => {},
  signInAsDev: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDev = (import.meta as any).env.DEV || (import.meta as any).env.MODE !== 'production';
    if (isDev && localStorage.getItem('dev_bypass') === 'true') {
      const mockUser = {
        uid: 'dev-user-001',
        email: 'dev@tenderai.ua',
        displayName: 'Користувач TenderAI (Локально)',
        photoURL: null,
        emailVerified: true,
        getIdToken: async () => 'dev-mock-token'
      } as any;
      setUser(mockUser);
      setToken('dev-mock-token');
      setLoading(false);
      
      // Keep syncing in background if needed
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer dev-mock-token`
        }
      }).catch(err => console.warn("Dev sync failed:", err));
      
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
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
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signInAsDev = () => {
    const mockUser = {
      uid: 'dev-user-001',
      email: 'dev@tenderai.ua',
      displayName: 'Користувач TenderAI (Локально)',
      photoURL: null,
      emailVerified: true,
      getIdToken: async () => 'dev-mock-token'
    } as any;
    setUser(mockUser);
    setToken('dev-mock-token');
    localStorage.setItem('dev_bypass', 'true');
    
    fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer dev-mock-token`
      }
    }).catch(err => console.warn("Dev sync failed:", err));
  };

  const signOut = async () => {
    localStorage.removeItem('dev_bypass');
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signIn, signOut, signInAsDev }}>
      {children}
    </AuthContext.Provider>
  );
};
