'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../theme/ThemeProvider';
import { RainCanvas } from './RainCanvas';

export function RainEnvironment() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* 1. LAYER 1: PHOTOREALISTIC URBAN ENVIRONMENTS (DAY vs NIGHT CROSSFADE) */}
      
      {/* Day Overcast Rainy City Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isLight ? 'opacity-90' : 'opacity-0'
        }`}
      >
        <Image
          src="/images/rainy_city_day.jpg"
          alt="Rainy Metropolitan Street Day"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter saturate-[0.85] contrast-[1.05] brightness-[0.98]"
        />
        {/* Day Overcast Atmospheric Mist & Wet Road Diffuse Glaze */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 via-slate-100/40 to-slate-200/70 mix-blend-screen" />
        <div className="absolute inset-0 bg-sky-900/10 mix-blend-multiply" />
      </div>

      {/* Night Rainy Emergency City Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          !isLight ? 'opacity-85' : 'opacity-0'
        }`}
      >
        <Image
          src="/images/rainy_city_night.jpg"
          alt="Rainy Metropolitan Street Night"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter saturate-[1.1] contrast-[1.1] brightness-[0.75]"
        />
        {/* Night Atmospheric Wet Asphalt & Emergency Dispatch Ambient Tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060c18]/75 via-[#081326]/60 to-[#070e1c]/80" />
        <div className="absolute inset-0 bg-sky-950/20 mix-blend-overlay" />
      </div>

      {/* 2. LAYER 2: DEPTH-OF-FIELD DIFFUSION & WET GROUND SPECULAR REFLECTIONS */}
      <div className="absolute inset-0 backdrop-blur-[1.5px] pointer-events-none" />

      {/* Atmospheric Horizon & Road Shimmer */}
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 transition-opacity duration-700 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-t from-slate-300/40 via-sky-200/20 to-transparent'
            : 'bg-gradient-to-t from-slate-950/70 via-sky-950/20 to-transparent'
        }`}
      />

      {/* 3. LAYER 3: MULTI-DEPTH CANVAS RAIN & SURFACE RIPPLES */}
      <RainCanvas />

      {/* 4. LAYER 4: READABILITY VIGNETTE FOR GIS PANELS & CONTROLS */}
      <div
        className={`absolute inset-0 transition-colors duration-700 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-b from-slate-100/30 via-transparent to-slate-200/50'
            : 'bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60'
        }`}
      />
    </div>
  );
}
