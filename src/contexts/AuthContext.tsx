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
    const devUser = {
      uid: 'dev-user-001',
      email: 'dev@tenderai.ua',
      displayName: 'Користувач TenderAI',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    } as any;
    setUser(devUser);
    setToken('dev-token-001');
    
    // Attempt sync
    fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer dev-token-001`
      }
    }).catch(err => console.error("Failed to sync dev user with DB", err));
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
    <AuthContext.Provider value={{ user, loading, token, signIn, signOut, signInAsDev }}>
      {children}
    </AuthContext.Provider>
  );
};
