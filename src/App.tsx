import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState, useAppActions } from './hooks/useAppState';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import PullScreen from './components/PullScreen';
import HistoryScreen from './components/HistoryScreen';

function AppContent() {
  const { state } = useAppState();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-['Inter',sans-serif] selection:bg-amber-500/30 overflow-x-hidden">
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(245,158,11,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.02) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(249,115,22,0.02) 0%, transparent 50%)',
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
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
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
          ? 'bg-amber-50 text-amber-600' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
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
