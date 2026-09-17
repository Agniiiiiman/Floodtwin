'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  isAuthenticated: boolean;
  login: (email: string, role?: 'commander' | 'engineer' | 'citizen', customName?: string) => Promise<void>;
  loginAsPreset: (presetKey: 'commander' | 'engineer' | 'citizen') => Promise<void>;
  signup: (name: string, email: string, role: 'commander' | 'engineer' | 'citizen', ward?: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'urbanflood_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read auth state from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const saveUser = (u: UserProfile | null) => {
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
    role: 'commander' | 'engineer' | 'citizen' = 'commander',
    customName?: string
  ) => {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Check if matches a preset persona
    const matchedPreset = Object.values(PRESET_PERSONAS).find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedPreset) {
      saveUser(matchedPreset);
    } else {
      const presetTemplate = PRESET_PERSONAS[role];
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: customName || email.split('@')[0],
        email,
        role,
        roleTitle: presetTemplate.roleTitle,
        ward: 'Ward A / South Mumbai',
        avatar: presetTemplate.avatar,
        clearanceLevel: presetTemplate.clearanceLevel,
        agency: presetTemplate.agency,
      };
      saveUser(newUser);
    }
    setIsAuthModalOpen(false);
  };

  const loginAsPreset = async (presetKey: 'commander' | 'engineer' | 'citizen') => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    saveUser(PRESET_PERSONAS[presetKey]);
    setIsAuthModalOpen(false);
  };

  const signup = async (
    name: string,
    email: string,
    role: 'commander' | 'engineer' | 'citizen' = 'citizen',
    ward: string = 'Ward A - South Mumbai'
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const presetTemplate = PRESET_PERSONAS[role];
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      roleTitle: presetTemplate.roleTitle,
      ward: ward || 'Ward A / South Mumbai',
      avatar: presetTemplate.avatar,
      clearanceLevel: presetTemplate.clearanceLevel,
      agency: presetTemplate.agency,
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    saveUser(null);
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
        isAuthenticated: !!user,
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
