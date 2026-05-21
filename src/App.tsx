import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState } from './hooks/useAppState';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import PullScreen from './components/PullScreen';
import HistoryScreen from './components/HistoryScreen';

function AppContent() {
  const { state } = useAppState();

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-['Inter',sans-serif] selection:bg-purple-500/30 overflow-x-hidden">
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.03) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(251,191,36,0.02) 0%, transparent 50%)',
        }}
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {state.view === 'dashboard' && <Dashboard key="dashboard" />}
          {state.view === 'pull' && <PullScreen key="pull" />}
          {state.view === 'history' && <HistoryScreen key="history" />}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
