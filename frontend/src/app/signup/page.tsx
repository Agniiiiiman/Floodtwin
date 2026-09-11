'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Waves,
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Building2,
  Ambulance,
  QrCode,
  Sparkles,
  Award,
  Radio,
  FileCheck2
} from 'lucide-react';

type UserRole = 'citizen' | 'municipal' | 'responder';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('citizen');
  const [fullName, setFullName] = useState('Dr. Priya Deshmukh');
  const [email, setEmail] = useState('priya.deshmukh@mumbai-resilience.org');
  const [phone, setPhone] = useState('+91 98201 44552');
  const [ward, setWard] = useState('Ward A/B - South Mumbai (Pilot Zone)');
  const [password, setPassword] = useState('FloodSafe@2026');
  const [confirmPassword, setConfirmPassword] = useState('FloodSafe@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Quick Demo Auto-fill presets
  const handleQuickPreset = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'citizen') {
      setFullName('Aarav Mehta');
      setEmail('aarav.mehta@gmail.com');
      setPhone('+91 98765 43210');
      setWard('Ward A/B - South Mumbai (Pilot Zone)');
      setPassword('CitizenPass#2026');
      setConfirmPassword('CitizenPass#2026');
    } else if (selectedRole === 'municipal') {
      setFullName('Er. Rajesh Shinde (Executive Drainage Eng.)');
      setEmail('rajesh.shinde@mcgm.gov.in');
      setPhone('+91 98210 99881');
      setWard('Ward A/B - South Mumbai (Pilot Zone)');
      setPassword('ManningAdmin!99');
      setConfirmPassword('ManningAdmin!99');
    } else {
      setFullName('Capt. Vikram Rathore');
      setEmail('vikram.rathore@ndrf-unit5.gov.in');
      setPhone('+91 94112 00412');
      setWard('Citywide Emergency Evacuation Grid');
      setPassword('RescueLeader#404');
      setConfirmPassword('RescueLeader#404');
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 70, label: 'Good', color: 'bg-amber-400' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength();

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Disaster Intelligence Data Protocol.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSignupSuccess(true);
      setTimeout(() => {
        if (role === 'municipal') {
          router.push('/digital-twin');
        } else if (role === 'responder') {
          router.push('/safe-route');
        } else {
          router.push('/reports');
        }
      }, 1200);
    }, 1300);
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-10 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-stretch">
        {/* Left Side: Dynamic Live Digital ID Pass */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border border-sky-500/25 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-sky-950/40">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Digital Pass Generator</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                SIH 2026
              </span>
            </div>

            {/* Dynamic ID Card Preview */}
            <div className="rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950/80 border border-sky-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white tracking-wider">STREETFLOOD</div>
                    <div className="text-[9px] text-sky-400 font-mono -mt-0.5">DISASTER RESILIENCE NETWORK</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    role === 'municipal'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                      : role === 'responder'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-purple-500/20 text-purple-300 border-purple-400'
                  }`}>
                    {role === 'municipal' ? 'MUNICIPAL LEAD' : role === 'responder' ? 'FIRST RESPONDER' : 'CITIZEN SENTRY'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'SF'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{fullName || 'Your Full Name'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{email || 'email@domain.com'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-mono">SECTOR JURISDICTION</span>
                    <span className="font-semibold text-sky-300 truncate block mt-0.5">{ward.split(' - ')[0]}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-mono">SECURITY CLEARANCE</span>
                    <span className="font-semibold text-emerald-400 block mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                {/* QR Code and Pass ID */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>SF-2026-ID#{Math.abs(fullName.length * 941 + 1024)}</span>
                  </div>
                  <span className="text-emerald-400">STATUS: ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Why Onboard Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                Network Access Privileges
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Real-time access to 130+ Global Radar sectors & live precipitation countdown.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Geotagged crowdsourced flood reporting with instant hydraulic corroboration.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Manning equation sandbox to stress-test 100+ mm/hr cloudburst scenarios.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Powered by Open-Meteo & OSRM</span>
            <span className="text-sky-400">Zero Cost • Open Data</span>
          </div>
        </div>

        {/* Right Side: Interactive Registration Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 rounded-3xl glass-panel border border-sky-500/25 relative shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Create Account
                </h1>
                <p className="text-xs text-slate-400">Join the Urban Flood Resilience Network</p>
              </div>
            </div>
            <Link
              href="/login"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors hidden sm:block"
            >
              Sign In Instead →
            </Link>
          </div>

          {/* Quick Demo Pre-fill Tabs */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Select Account Category:</label>
              <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Click Auto Fill
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('citizen')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'citizen'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Citizen / Resident</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('municipal')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'municipal'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Municipal Eng.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('responder')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                  role === 'responder'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ambulance className="w-4 h-4" />
                <span>First Responder</span>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Deshmukh"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone / Emergency Hotline */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Emergency Mobile No.</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Primary Ward / Operational Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Pilot Ward / Jurisdiction</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Ward A/B - South Mumbai (Pilot Zone)">Ward A/B - South Mumbai (Pilot Zone)</option>
                    <option value="Ward C/D - Marine Lines & Malabar Hill">Ward C/D - Marine Lines & Malabar Hill</option>
                    <option value="Ward F/North - Matunga & Sion Flood Basin">Ward F/North - Matunga & Sion Flood Basin</option>
                    <option value="Ward G/South - Worli Coastal Drainage">Ward G/South - Worli Coastal Drainage</option>
                    <option value="Ward H/West - Bandra & Khar Surcharge Corridor">Ward H/West - Bandra & Khar Surcharge Corridor</option>
                    <option value="Citywide Emergency Evacuation Grid">Citywide Emergency Evacuation Grid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Set Secure Password</label>
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Strength: {strength.label}</span>
                    <span>Min. 8 characters</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                {password && confirmPassword && (
                  <div className="text-[10px] font-mono pt-1">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-snug">
                  I agree to the{' '}
                  <span className="text-sky-400 underline underline-offset-2">Disaster Intelligence Protocol</span>, 
                  allowing anonymized telemetry corroboration for community flood safety.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || signupSuccess}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all duration-200 mt-2 ${
                signupSuccess
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/30 hover:scale-[1.01]'
              } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Minting Digital Pass & Provisioning Access...</span>
                </div>
              ) : signupSuccess ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Pass Minted Successfully! Launching Dashboard...</span>
                </div>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Complete Registration & Launch Pass</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to sign in */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an active StreetFlood pass?{' '}
            <Link href="/login" className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4">
              Sign In to Command Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
