'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, PRESET_PERSONAS } from '@/context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    loginAsPreset,
    signup,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'commander' | 'engineer' | 'citizen'>('commander');
  const [ward, setWard] = useState('Ward A (Colaba / Fort / Nariman Point)');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode with context state when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email) {
          throw new Error('Please enter your email address');
        }
        await login(email, password, role, name);
        setSuccessMessage('Welcome back! Initializing telemetry session...');
      } else {
        if (!name || !email) {
          throw new Error('Please complete all required fields');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(name, email, password, role, ward);
        setSuccessMessage('Account registered! Granting operational clearance...');
      }

      setTimeout(() => {
        setLoading(false);
        closeAuthModal();
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    }
  };

  const handlePresetSelect = async (presetKey: 'commander' | 'engineer' | 'citizen') => {
    setError(null);
    setLoading(true);
    const persona = PRESET_PERSONAS[presetKey];
    setSuccessMessage(`Authenticating as ${persona.name} (${persona.roleTitle})...`);

    try {
      await loginAsPreset(presetKey);
      setTimeout(() => {
        setLoading(false);
        closeAuthModal();
        router.push('/dashboard');
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setError('Unable to authenticate persona.');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-sky-500/30 p-6 sm:p-8 shadow-2xl shadow-sky-500/10 z-10 my-8 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>SIH 2026 • Urban Flood Command Access</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'signin' ? 'Sign In to Command Center' : 'Create Urban Flood Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {mode === 'signin'
              ? 'Access real-time Ward A/B flood digital twins, live Manning hydraulics, and evacuation routing.'
              : 'Join as a Municipal Commander, Hydro Engineer, or Ground Citizen Responder.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Quick Persona Logins */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              1-Click Demo Personas
            </span>
            <span className="text-[10px] text-sky-400 font-mono">Instant Sandbox Access</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Commander */}
            <button
              type="button"
              onClick={() => handlePresetSelect('commander')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/20 text-left transition-all group flex flex-col justify-between"
            >
              <div className="text-lg mb-1">{PRESET_PERSONAS.commander.avatar}</div>
              <div>
                <div className="text-[11px] font-bold text-white group-hover:text-sky-300 truncate">
                  Commander
                </div>
                <div className="text-[9px] text-slate-400 truncate">Disaster Lead</div>
              </div>
            </button>

            {/* Engineer */}
            <button
              type="button"
              onClick={() => handlePresetSelect('engineer')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group flex flex-col justify-between"
            >
              <div className="text-lg mb-1">{PRESET_PERSONAS.engineer.avatar}</div>
              <div>
                <div className="text-[11px] font-bold text-white group-hover:text-emerald-300 truncate">
                  Hydro Eng.
                </div>
                <div className="text-[9px] text-slate-400 truncate">Drainage Dept</div>
              </div>
            </button>

            {/* Citizen */}
            <button
              type="button"
              onClick={() => handlePresetSelect('citizen')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all group flex flex-col justify-between"
            >
              <div className="text-lg mb-1">{PRESET_PERSONAS.citizen.avatar}</div>
              <div>
                <div className="text-[11px] font-bold text-white group-hover:text-purple-300 truncate">
                  Citizen
                </div>
                <div className="text-[9px] text-slate-400 truncate">Responder</div>
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-400">
            or continue with credentials
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Rajesh Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder={mode === 'signin' ? 'officer@disastermgmt.gov.in' : 'your.email@agency.gov.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs placeholder:text-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-white text-xs focus:outline-none"
                >
                  <option value="commander">Disaster Commander</option>
                  <option value="engineer">Hydraulic Engineer</option>
                  <option value="citizen">Citizen Volunteer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Jurisdiction / Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-white text-xs focus:outline-none"
                >
                  <option value="Ward A (Colaba / Fort)">Ward A (Colaba / Fort)</option>
                  <option value="Ward B (Sandhurst Road)">Ward B (Sandhurst)</option>
                  <option value="Ward C (Marine Lines)">Ward C (Marine Lines)</option>
                  <option value="Ward D (Malabar Hill)">Ward D (Malabar Hill)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating & Loading Dashboard...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In & Enter Dashboard' : 'Complete Registration & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            {mode === 'signin' ? (
              <>
                New to Urban Flood?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sky-400 font-semibold hover:underline ml-1"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sky-400 font-semibold hover:underline ml-1"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
