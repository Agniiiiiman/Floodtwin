import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { RainfallProvider } from '@/context/RainfallContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { RainEnvironment } from '@/components/environment/RainEnvironment';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UrbanFlood | Street-Level Urban Flood Risk & Digital Twin',
  description:
    'Explainable street-level urban flood risk, indicative depth ranges, safe routing, and citizen corroboration for Smart India Hackathon 2026.',
  keywords: [
    'Flood Digital Twin',
    'Urban Flood Management',
    'Manning Equation Simulation',
    'Emergency Safe Routing',
    'Open-Meteo Rainfall Map',
    'Smart India Hackathon',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-white relative bg-slate-950">
        <ThemeProvider>
          <RainfallProvider>
            <AuthProvider>
              {/* Photorealistic Multi-Layer Rainy Urban Environment */}
              <RainEnvironment />

              {/* Application UI (Floating on top of environment) */}
              <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
                <Navbar />
                <main className="flex-grow pt-20">{children}</main>
                <Footer />
              </div>
              <AuthModal />
            </AuthProvider>
          </RainfallProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
