'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Waves,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Building2,
  Ambulance,
  User,
  Radio,
  Cpu,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';

type UserRole = 'municipal' | 'responder' | 'citizen';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('municipal');
  const [email, setEmail] = useState('officer.ward.ab@mcgm.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Quick preset logins for hackathon evaluation and testing
  const handleQuickRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'municipal') {
      setEmail('officer.ward.ab@mcgm.gov.in');
      setPassword('manning_twin_2026');
    } else if (selectedRole === 'responder') {
      setEmail('sdrf.unit7@ndrf.gov.in');
      setPassword('rescue_corridor_alpha');
    } else {
      setEmail('aarav.sharma@gmail.com');
      setPassword('mumbai_citizen_safe');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authenticating against backend / role token
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (role === 'municipal') {
          router.push('/digital-twin');
        } else if (role === 'responder') {
          router.push('/safe-route');
        } else {
          router.push('/reports');
        }
      }, 1000);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Dynamic Background Atmospheric Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">
        {/* Left Side: Real-time Telemetry & Intelligence HUD (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border border-sky-500/25 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/40">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-medium">
                <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                <span>Command Hub Auth</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Mesh v2.0
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Street-Level <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Disaster Intelligence
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Authorized access for municipal drainage authorities, emergency response teams, and active citizen monitors.
              </p>
            </div>

            {/* Live Telemetry Snapshot Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-sky-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5 text-sky-300">
                  <Cpu className="w-3.5 h-3.5" />
                  Manning Engine Status
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">PILOT WARD</div>
                  <div className="font-bold text-white text-xs mt-0.5">South Mumbai A/B</div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">SENSOR MESH</div>
                  <div className="font-bold text-sky-400 text-xs mt-0.5">18 Active Nodes</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Hydraulic Inundation Model</span>
                <span className="font-mono text-white font-semibold">Q = (1/n)·A·R^(2/3)·S^(1/2)</span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>End-to-end encrypted telemetry feeds</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-based municipal dispatch authorization</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-latency OSRM rescue corridor calculation</span>
              </div>
            </div>
          </div>

          {/* Bottom Stamp */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>SIH 2026 Prototype</span>
            <span className="text-sky-400">Security Level: Tier 1</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 rounded-3xl glass-panel border border-sky-500/25 relative shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Welcome to StreetFlood
                </h1>
                <p className="text-xs text-slate-400">Sign in to your disaster command dashboard</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors hidden sm:block"
            >
              Back to Home →
            </Link>
          </div>

          {/* Quick 1-Click Role Switcher */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Select Access Role:</span>
              <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Click Demo Fill
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('municipal')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'municipal'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Municipal Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('responder')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'responder'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Ambulance className="w-4 h-4" />
                <span>Responder</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect('citizen')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'citizen'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Citizen</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Official Email / ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Security Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 w-4 h-4"
                />
                <span>Remember this terminal session</span>
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3" /> SSL Secured
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authSuccess}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                authSuccess
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/30 hover:scale-[1.01]'
              } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : authSuccess ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Access Granted! Redirecting...</span>
                </div>
              ) : (
                <>
                  <span>Sign In as {role === 'municipal' ? 'Municipal Lead' : role === 'responder' ? 'Emergency Responder' : 'Citizen'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Single Sign-On Separator */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center relative">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Or Connect With Official ID
            </span>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setEmail('official.sso@india.gov.in');
                  setPassword('gov_sso_verified');
                }}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Gov e-Pramaan SSO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('citizen.digilocker@gmail.com');
                  setPassword('digi_verified_token');
                }}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>DigiLocker Auth</span>
              </button>
            </div>
          </div>

          {/* Footer Toggle */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an assigned terminal account?{' '}
            <Link href="/signup" className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4">
              Register New Organization or Citizen Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>Reset Emergency Access Key</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Reset Instructions Dispatched</h4>
                <p className="text-xs text-slate-300">
                  A verification token and reset link have been dispatched to your official email ID.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered official or citizen email. We will send a 6-digit OTP code to verify your credentials.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@mcgm.gov.in"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/25"
                  >
                    Send Reset Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
