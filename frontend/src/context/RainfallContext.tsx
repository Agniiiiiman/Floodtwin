'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

interface RainfallContextType {
  rainfallIntensity: number; // in mm/hr (10 - 150)
  setRainfallIntensity: (val: number) => void;
  windAngle: number; // in degrees (-20 to 20)
  setWindAngle: (val: number) => void;
  isStormActive: boolean;
  rainDensityLevel: 'light' | 'moderate' | 'heavy' | 'cloudburst';
}

const RainfallContext = createContext<RainfallContextType | undefined>(undefined);

export function RainfallProvider({ children }: { children: React.ReactNode }) {
  const [rainfallIntensity, setRainfallIntensity] = useState<number>(45); // default moderate urban rain
  const [windAngle, setWindAngle] = useState<number>(6); // slight realistic slant

  const rainDensityLevel = useMemo(() => {
    if (rainfallIntensity < 25) return 'light';
    if (rainfallIntensity < 55) return 'moderate';
    if (rainfallIntensity < 90) return 'heavy';
    return 'cloudburst';
  }, [rainfallIntensity]);

  const isStormActive = rainfallIntensity >= 75;

  return (
    <RainfallContext.Provider
      value={{
        rainfallIntensity,
        setRainfallIntensity,
        windAngle,
        setWindAngle,
        isStormActive,
        rainDensityLevel,
      }}
    >
      {children}
    </RainfallContext.Provider>
  );
}

export function useRainfall() {
  const context = useContext(RainfallContext);
  if (!context) {
    // Return graceful fallback so components work even if outside provider
    return {
      rainfallIntensity: 45,
      setRainfallIntensity: () => {},
      windAngle: 6,
      setWindAngle: () => {},
      isStormActive: false,
      rainDensityLevel: 'moderate' as const,
    };
  }
  return context;
}
