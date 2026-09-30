'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export function EmergencyFloatingButton() {
  const pathname = usePathname();

  // Hide on emergency page since the full emergency console is already active there
  if (pathname === '/emergency') {
    return null;
  }

  return (
    <Link
      href="/emergency"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-2xl shadow-rose-600/50 hover:shadow-rose-600/80 transition-all duration-300 transform hover:scale-110 border-2 border-rose-400/50 group cursor-pointer"
      aria-label="Flood Emergency One-Call System"
      title="Flood Emergency One-Call System"
    >
      <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/30 pointer-events-none" />
      <AlertTriangle className="w-7 h-7 text-white drop-shadow-lg relative z-10 group-hover:animate-pulse" />
    </Link>
  );
}
