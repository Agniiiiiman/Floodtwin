'use client';

import React from 'react';
import { Activity, AlertCircle, WifiOff } from 'lucide-react';
import { DataMode } from '@/types';

interface DataStatusBadgeProps {
  mode: DataMode;
  lastUpdated?: string;
  compact?: boolean;
}

const statusCopy: Record<DataMode, { label: string; description: string; className: string }> = {
  live: {
    label: 'LIVE',
    description: 'Backend connected; incoming data is available.',
    className: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
  demo: {
    label: 'DEMO MODE',
    description: 'Backend data unavailable; synthetic fallback data is shown.',
    className: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  },
  offline: {
    label: 'OFFLINE',
    description: 'Data service unavailable; retrying on refresh.',
    className: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
  },
};

export function DataStatusBadge({ mode, lastUpdated, compact = false }: DataStatusBadgeProps) {
  const copy = statusCopy[mode];
  const Icon = mode === 'live' ? Activity : mode === 'demo' ? AlertCircle : WifiOff;
  const timestamp = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--';

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${copy.className}`} title={copy.description}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-[10px] font-bold tracking-wider">{copy.label}</span>
      {!compact && <span className="text-[10px] opacity-80">Updated {timestamp}</span>}
      <span className="sr-only">{copy.description}</span>
    </div>
  );
}
