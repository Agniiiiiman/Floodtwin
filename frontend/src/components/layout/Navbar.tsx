'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import {
  Waves,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  LogOut,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  Lock
} from 'lucide-react';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section tracking for landing page
      if (pathname === '/') {
        const sections = ['how-it-works', 'features'];
        let current = 'home';
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 200) {
              current = id;
              break;
            }
          }
        }
        setActiveSection(current);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  interface NavItem {
    name: string;
    href: string;
    id?: string;
  }

  // Show internal feature tools ONLY when user is logged in
  const navLinks: NavItem[] = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Digital Twin', href: '/digital-twin' },
        { name: 'Simulation', href: '/simulation' },
        { name: 'Safe Route', href: '/safe-route' },
        { name: 'Rainfall Radar', href: '/rainfall-map' },
        { name: 'Citizen Reports', href: '/reports' },
      ]
    : [
        { name: 'Home', href: '/', id: 'home' },
        { name: 'Features', href: '/#features', id: 'features' },
        { name: 'How It Works', href: '/#how-it-works', id: 'how-it-works' },
      ];

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-transparent py-3.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform duration-300">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 font-extrabold tracking-wider text-lg">
                <span className="text-sky-400">URBAN</span>
                <span className="text-white font-black">FLOOD</span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-sky-300/80 -mt-1">
                Urban Risk Layer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-slate-900/80 p-1.5 rounded-full border border-sky-500/25 backdrop-blur-xl shadow-lg shadow-slate-950/40">
            {navLinks.map((link) => {
              const isActive = isAuthenticated
                ? pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href))
                : (link.id ? activeSection === link.id : pathname === link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Authenticated Menu OR Login/Signup Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            {isAuthenticated && user ? (
              /* Authenticated User Menu */
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 text-white text-xs transition-all cursor-pointer shadow-md"
                  >
                    <span className="text-base">{user.avatar}</span>
                    <span className="hidden sm:inline-block font-semibold max-w-[110px] truncate text-slate-200">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-sky-500/30 p-2 shadow-2xl backdrop-blur-md z-50 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{user.avatar}</span>
                          <div className="truncate">
                            <div className="text-xs font-bold text-white truncate">{user.name}</div>
                            <div className="text-[10px] text-sky-400 font-mono truncate">{user.roleTitle}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 truncate">
                          Sector: {user.ward}
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-sky-500/20 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-400" />
                        <span>Command Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated Buttons */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-sky-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl glass-panel text-sky-400 hover:text-white hover:border-sky-400/50 transition-colors w-9 h-9 flex items-center justify-center cursor-pointer"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-600" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl glass-panel text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 glass-panel rounded-2xl border border-sky-500/20 flex flex-col space-y-1.5 animate-fadeIn">
            {navLinks.map((link) => {
              const isActive = isAuthenticated
                ? pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href))
                : (link.id ? activeSection === link.id : pathname === link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md shadow-sky-500/25'
                      : 'text-slate-200 hover:bg-sky-500/20 hover:text-sky-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {!isAuthenticated ? (
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold text-center shadow-md shadow-sky-500/25"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-bold text-center flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
