import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, useAppActions } from '../hooks/useAppState';
import RarityBadge from './RarityBadge';
import type { Rarity, PullDecision } from '../types';

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

function decisionBadge(decision: PullDecision) {
  if (!decision) return null;
  const isEat = decision === 'eat';
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
        isEat ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {isEat ? 'Ordered' : 'Passed'}
    </span>
  );
}

export default function HistoryScreen() {
  const { state } = useAppState();
  const { clearHistory } = useAppActions();
  const [showConfirm, setShowConfirm] = useState(false);

  const stats = useMemo(() => {
    const acc = {} as Record<Rarity, number>;
    state.pullHistory.forEach((p) => {
      const r = p.restaurant.rarity;
      acc[r] = (acc[r] || 0) + 1;
    });
    const eatCount = state.pullHistory.filter((p) => p.decision === 'eat').length;
    const passCount = state.pullHistory.filter((p) => p.decision === 'pass').length;
    return { acc, eatCount, passCount };
  }, [state.pullHistory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-[Outfit] tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {state.pullHistory.length} total pulls recorded
          </p>
        </div>
        {state.pullHistory.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Clear History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.751-2.689l1.005-11.36.149.022a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {state.pullHistory.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xl font-black text-gray-900">{stats.eatCount}</p>
            <p className="text-[10px] font-bold uppercase text-emerald-500">Ordered</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xl font-black text-gray-900">{stats.passCount}</p>
            <p className="text-[10px] font-bold uppercase text-gray-400">Passed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xl font-black text-gray-900">{Math.round((stats.eatCount / state.pullHistory.length) * 100)}%</p>
            <p className="text-[10px] font-bold uppercase text-amber-500">Rate</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {state.pullHistory.map((pull, i) => (
            <motion.div
              key={pull.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {pull.restaurant.imageUrl ? (
                  <img src={pull.restaurant.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  pull.restaurant.emoji
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {pull.restaurant.name}
                  </p>
                  {pull.wasPity && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest">
                      Pity
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <RarityBadge rarity={pull.restaurant.rarity} />
                  {decisionBadge(pull.decision)}
                  <span className="text-[10px] font-bold text-amber-500">
                    +{pull.xpEarned} XP
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-gray-300">
                  {formatDate(pull.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.pullHistory.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-6xl mb-4">📜</p>
            <p className="text-gray-400 font-medium">No orders yet. Start pulling!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <p className="text-3xl mb-4">🗑️</p>
              <h3 className="text-xl font-black text-gray-900 mb-2">Clear History?</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                This will permanently delete all {state.pullHistory.length} pull records. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                >
                  Keep It
                </button>
                <button
                  onClick={() => {
                    clearHistory();
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-sm font-black uppercase tracking-widest hover:bg-red-400 transition-all"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}