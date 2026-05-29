import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState, useAppActions } from './hooks/useAppState';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import PullScreen from './components/PullScreen';
import HistoryScreen from './components/HistoryScreen';
import type { AccentColor } from './types';

const ACCENT_PALETTES: Record<AccentColor, Record<number, string>> = {
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
    500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
  },
  purple: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
    500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
    500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
  }
};

function AppContent() {
  const { state } = useAppState();

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = 
        state.theme === 'dark' || 
        (state.theme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [state.theme]);

  // Handle Accent Color
  useEffect(() => {
    const root = window.document.documentElement;
    const palette = ACCENT_PALETTES[state.accentColor];
    
    Object.entries(palette).forEach(([stop, color]) => {
      root.style.setProperty(`--brand-${stop}`, color);
    });
  }, [state.accentColor]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a1a] text-gray-900 dark:text-gray-100 font-['Inter',sans-serif] selection:bg-brand-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, var(--brand-500) 0.03, transparent 50%), radial-gradient(circle at 80% 20%, var(--brand-400) 0.02, transparent 50%), radial-gradient(circle at 50% 80%, var(--brand-600) 0.02, transparent 50%)',
        }}
      />

      <main className="relative z-10 w-full max-w-5xl mx-auto min-h-screen pb-20 md:pb-0 md:pt-6 px-4">
        <AnimatePresence mode="wait">
          {state.view === 'dashboard' && <Dashboard key="dashboard" />}
          {state.view === 'pull' && <PullScreen key="pull" />}
          {state.view === 'history' && <HistoryScreen key="history" />}
        </AnimatePresence>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
      
      {/* Desktop Navigation (Top Bar) */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-[#0a0a1a] border-b border-gray-100 dark:border-white/10 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-black font-[Outfit] text-gradient">FoodGacha</span>
          </div>
          <div className="flex items-center gap-6">
            <DesktopNavLink view="pull" label="Gacha" active={state.view === 'pull'} />
            <DesktopNavLink view="dashboard" label="Dashboard" active={state.view === 'dashboard'} />
            <DesktopNavLink view="history" label="History" active={state.view === 'history'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopNavLink({ view, label, active }: { view: any, label: string, active: boolean }) {
  const { setView } = useAppActions();
  return (
    <button
      onClick={() => setView(view)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600' 
          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
