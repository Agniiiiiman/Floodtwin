'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'commander' | 'engineer' | 'citizen';
  roleTitle: string;
  ward: string;
  avatar: string;
  clearanceLevel: string;
  agency: string;
}

export const PRESET_PERSONAS: Record<string, UserProfile> = {
  commander: {
    id: 'user-cmd-01',
    name: 'Cmdr. Vikram Sen',
    email: 'v.sen@disastermgmt.gov.in',
    role: 'commander',
    roleTitle: 'Disaster Incident Commander',
    ward: 'Ward A / Colaba Fort',
    avatar: '👨‍✈️',
    clearanceLevel: 'Level 4 (Emergency Surcharge Override)',
    agency: 'National Disaster Response Force (NDRF)',
  },
  engineer: {
    id: 'user-eng-02',
    name: 'Dr. Priya Nair',
    email: 'p.nair@mcgm.gov.in',
    role: 'engineer',
    roleTitle: 'Hydraulic Systems Engineer',
    ward: 'Ward A & B Drainage Mesh',
    avatar: '👩‍🔬',
    clearanceLevel: 'Level 3 (Hydro Physics Telemetry & Sensor Mesh)',
    agency: 'Municipal Stormwater Management Dept',
  },
  citizen: {
    id: 'user-cit-03',
    name: 'Aarav Mehta',
    email: 'aarav.m@urbanflood.citizen',
    role: 'citizen',
    roleTitle: 'Community First Responder',
    ward: 'Marine Drive Sector 2',
    avatar: '🧑‍🚒',
    clearanceLevel: 'Level 1 (Ground Reporting & Geotag Verification)',
    agency: 'Citizen Resilience Network',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isFirebaseActive: boolean;
  loading: boolean;
  login: (email: string, password?: string, role?: 'commander' | 'engineer' | 'citizen', customName?: string) => Promise<void>;
  loginAsPreset: (presetKey: 'commander' | 'engineer' | 'citizen') => Promise<void>;
  signup: (name: string, email: string, password?: string, role?: 'commander' | 'engineer' | 'citizen', ward?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'urbanflood_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Listen to Firebase Auth state change if configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Local demo mode: restore from localStorage
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Could not read auth state from localStorage', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUser(data);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
          } else {
            // Fallback profile if Firestore doc hasn't been written yet
            const defaultProfile: UserProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Officer',
              email: fbUser.email || '',
              role: 'commander',
              roleTitle: 'Disaster Incident Commander',
              ward: 'Ward A / South Mumbai',
              avatar: '👨‍✈️',
              clearanceLevel: 'Level 4 (Emergency Surcharge Override)',
              agency: 'National Disaster Response Force (NDRF)',
            };
            setUser(defaultProfile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultProfile));
          }
        } catch (err) {
          console.error('Error loading user profile from Firestore:', err);
        }
      } else {
        // Only clear if not using a demo persona stored in localStorage
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.id.startsWith('user-')) {
              setUser(parsed);
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveLocalSession = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to write auth to localStorage', e);
    }
  };

  const login = async (
    email: string,
    password?: string,
    role: 'commander' | 'engineer' | 'citizen' = 'commander',
    customName?: string
  ) => {
    // If Firebase is configured and password is provided, perform real Firebase Auth
    if (isFirebaseConfigured && password && password.length >= 6) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      // Attempt to retrieve profile from Firestore
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          saveLocalSession(profile);
          setIsAuthModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn('Firestore doc read error:', err);
      }
      
      const template = PRESET_PERSONAS[role];
      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: customName || fbUser.displayName || email.split('@')[0],
        email,
        role,
        roleTitle: template.roleTitle,
        ward: 'Ward A / South Mumbai',
        avatar: template.avatar,
        clearanceLevel: template.clearanceLevel,
        agency: template.agency,
      };
      saveLocalSession(newProfile);
      setIsAuthModalOpen(false);
      return;
    }

    // Local fallback / preset simulator
    await new Promise((resolve) => setTimeout(resolve, 400));
    const matchedPreset = Object.values(PRESET_PERSONAS).find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedPreset) {
      saveLocalSession(matchedPreset);
    } else {
      const template = PRESET_PERSONAS[role];
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: customName || email.split('@')[0],
        email,
        role,
        roleTitle: template.roleTitle,
        ward: 'Ward A / South Mumbai',
        avatar: template.avatar,
        clearanceLevel: template.clearanceLevel,
        agency: template.agency,
      };
      saveLocalSession(newUser);
    }
    setIsAuthModalOpen(false);
  };

  const loginAsPreset = async (presetKey: 'commander' | 'engineer' | 'citizen') => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    saveLocalSession(PRESET_PERSONAS[presetKey]);
    setIsAuthModalOpen(false);
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    role: 'commander' | 'engineer' | 'citizen' = 'citizen',
    ward: string = 'Ward A - South Mumbai'
  ) => {
    const template = PRESET_PERSONAS[role];

    // If Firebase is configured and password is provided, create in Firebase Auth + Firestore
    if (isFirebaseConfigured && password && password.length >= 6) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const profile: UserProfile = {
        id: fbUser.uid,
        name,
        email,
        role,
        roleTitle: template.roleTitle,
        ward: ward || 'Ward A / South Mumbai',
        avatar: template.avatar,
        clearanceLevel: template.clearanceLevel,
        agency: template.agency,
      };

      // Store in Firestore database
      try {
        await setDoc(doc(db, 'users', fbUser.uid), profile);
      } catch (err) {
        console.warn('Could not save user profile to Firestore:', err);
      }

      saveLocalSession(profile);
      setIsAuthModalOpen(false);
      return;
    }

    // Local fallback simulator
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      roleTitle: template.roleTitle,
      ward: ward || 'Ward A / South Mumbai',
      avatar: template.avatar,
      clearanceLevel: template.clearanceLevel,
      agency: template.agency,
    };
    saveLocalSession(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    } finally {
      saveLocalSession(null);
      setFirebaseUser(null);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isFirebaseActive: isFirebaseConfigured,
        loading,
        login,
        loginAsPreset,
        signup,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
