'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, ShieldAlert, ArrowRight, Sparkles, Activity, Home } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  moduleName?: string;
  requiredClearance?: string;
}

export function AuthGuard({
  children,
  moduleName = 'Operational Module',
  requiredClearance = 'Municipal Clearance Level 1+',
}: AuthGuardProps) {
  const { isAuthenticated, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-500/10">
          <Activity className="w-7 h-7 animate-spin text-sky-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white tracking-wide">
            Verifying Operational Clearance...
          </p>
          <p className="text-xs text-slate-400">
            Authorizing access to {moduleName}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="relative max-w-lg w-full rounded-3xl glass-panel border border-sky-500/30 p-8 text-center shadow-2xl overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-6 text-sky-400 shadow-lg shadow-sky-500/10">
          <Lock className="w-8 h-8 text-sky-400" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Clearance Required</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">
          Sign In to Access {moduleName}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Access to real-time subterranean sensor mesh telemetry, hydraulic physics simulations, and emergency dispatch routing requires an authenticated account.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAuthModal('signup')}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-sky-500/40 font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Create Free Account</span>
          </button>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
