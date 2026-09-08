'use client';

import React, { useEffect, useRef } from 'react';

export function RainEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous drops
    container.innerHTML = '';
    const dropCount = 75;

    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('span');
      drop.className = 'absolute bottom-full w-[1.5px] bg-gradient-to-b from-transparent to-sky-400/60 pointer-events-none rounded-full';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.height = `${15 + Math.random() * 25}px`;
      drop.style.opacity = `${0.2 + Math.random() * 0.6}`;
      
      const duration = 0.6 + Math.random() * 0.9;
      const delay = Math.random() * 2;
      
      drop.style.animation = `rainFall ${duration}s linear infinite`;
      drop.style.animationDelay = `${delay}s`;

      container.appendChild(drop);
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes rainFall {
          0% {
            transform: translateY(-50px);
          }
          100% {
            transform: translateY(105vh);
          }
        }
      `}</style>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      />
    </>
  );
}
