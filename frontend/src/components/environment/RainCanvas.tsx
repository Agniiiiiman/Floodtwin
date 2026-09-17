'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useRainfall } from '@/context/RainfallContext';

interface RainDrop {
  x: number;
  y: number;
  z: number; // 0: background, 1: midground, 2: foreground
  length: number;
  speed: number;
  thickness: number;
  opacity: number;
}

interface SplashRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  growthRate: number;
}

export function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const { rainfallIntensity, windAngle } = useRainfall();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Device performance tier
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    // Base particle count scaled by device and live intensity
    const intensityMultiplier = Math.max(0.4, Math.min(1.8, rainfallIntensity / 45));
    let baseCount = isMobile ? 65 : isTablet ? 130 : 240;
    if (prefersReducedMotion) baseCount = 30;
    const dropCount = Math.round(baseCount * intensityMultiplier);

    const drops: RainDrop[] = [];
    const ripples: SplashRipple[] = [];

    // Initialize drops across 3 depth planes (z = 0, 1, 2)
    for (let i = 0; i < dropCount; i++) {
      const z = Math.random() < 0.45 ? 0 : Math.random() < 0.8 ? 1 : 2;
      const speedFactor = z === 0 ? 0.75 : z === 1 ? 1.05 : 1.4;
      const lengthFactor = z === 0 ? 0.7 : z === 1 ? 1.0 : 1.35;
      const thicknessFactor = z === 0 ? 0.8 : z === 1 ? 1.1 : 1.6;

      drops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        z,
        length: (16 + Math.random() * 22) * lengthFactor * (prefersReducedMotion ? 0.6 : 1),
        speed: (14 + Math.random() * 12) * speedFactor * intensityMultiplier * (prefersReducedMotion ? 0.3 : 1),
        thickness: thicknessFactor,
        opacity: z === 0 ? 0.35 + Math.random() * 0.2 : z === 1 ? 0.55 + Math.random() * 0.25 : 0.75 + Math.random() * 0.25,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const windRad = (windAngle * Math.PI) / 180;
    const windSin = Math.sin(windRad);
    const windCos = Math.cos(windRad);

    const isLight = theme === 'light';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update Ripples on lower third surfaces
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.growthRate;
        ripple.opacity -= 0.025;

        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        // Flatten ellipse for 3D road perspective
        ctx.ellipse(ripple.x, ripple.y, ripple.radius * 1.6, ripple.radius * 0.45, 0, 0, Math.PI * 2);
        
        if (isLight) {
          // In Light Mode: slate-blue ring with bright refractive edge
          ctx.strokeStyle = `rgba(35, 75, 115, ${ripple.opacity * 0.6})`;
          ctx.lineWidth = 1.2;
        } else {
          // In Dark Mode: luminous cyan-white ripple ring
          ctx.strokeStyle = `rgba(180, 225, 255, ${ripple.opacity * 0.5})`;
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw and update Rain Drops across Depth Layers
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        // Motion translation
        drop.x += drop.speed * windSin;
        drop.y += drop.speed * windCos;

        // Draw Droplet with Theme-Engineered Contrast
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.length * windSin, drop.y + drop.length * windCos);

        if (isLight) {
          // LIGHT THEME RAIN DROPLET:
          // Distinct slate-blue core with a crisp white refractive highlight
          if (drop.z === 2) {
            // Foreground: sharp refractive contrast
            const grad = ctx.createLinearGradient(
              drop.x,
              drop.y,
              drop.x + drop.length * windSin,
              drop.y + drop.length * windCos
            );
            grad.addColorStop(0, `rgba(45, 85, 130, ${drop.opacity * 0.2})`);
            grad.addColorStop(0.6, `rgba(30, 65, 105, ${drop.opacity * 0.95})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0.95)`); // Specular glint on drop tip
            ctx.strokeStyle = grad;
            ctx.lineWidth = drop.thickness * 1.5;
            ctx.shadowColor = 'rgba(15, 35, 60, 0.45)';
            ctx.shadowBlur = 2;
          } else if (drop.z === 1) {
            // Midground
            ctx.strokeStyle = `rgba(35, 75, 115, ${drop.opacity * 0.85})`;
            ctx.lineWidth = drop.thickness * 1.2;
          } else {
            // Background
            ctx.strokeStyle = `rgba(50, 90, 130, ${drop.opacity * 0.55})`;
            ctx.lineWidth = drop.thickness * 0.9;
          }
        } else {
          // DARK THEME RAIN DROPLET:
          // Translucent cyan-silver rain streak with luminescent tip
          if (drop.z === 2) {
            const grad = ctx.createLinearGradient(
              drop.x,
              drop.y,
              drop.x + drop.length * windSin,
              drop.y + drop.length * windCos
            );
            grad.addColorStop(0, `rgba(180, 220, 255, ${drop.opacity * 0.2})`);
            grad.addColorStop(0.7, `rgba(215, 240, 255, ${drop.opacity * 0.9})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 1.0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = drop.thickness * 1.3;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
            ctx.shadowBlur = 3;
          } else if (drop.z === 1) {
            ctx.strokeStyle = `rgba(180, 220, 250, ${drop.opacity * 0.75})`;
            ctx.lineWidth = drop.thickness * 1.0;
          } else {
            ctx.strokeStyle = `rgba(140, 190, 235, ${drop.opacity * 0.45})`;
            ctx.lineWidth = drop.thickness * 0.8;
          }
        }

        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Reset drop when exiting screen and occasionally spawn surface splash
        if (drop.y > height + 20 || drop.x > width + 100 || drop.x < -100) {
          // Spawn ripple on ground/road zone (bottom 40% of viewport)
          if (!prefersReducedMotion && drop.z >= 1 && Math.random() < 0.25 && ripples.length < 35) {
            const groundY = height - Math.random() * (height * 0.35);
            ripples.push({
              x: drop.x,
              y: groundY,
              radius: 1,
              maxRadius: 10 + Math.random() * 14,
              opacity: isLight ? 0.75 : 0.6,
              growthRate: 0.6 + Math.random() * 0.5,
            });
          }

          drop.y = -drop.length - Math.random() * 40;
          drop.x = Math.random() * (width + 200) - 100;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, rainfallIntensity, windAngle]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] w-full h-full transform-gpu"
    />
  );
}
