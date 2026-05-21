import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { RARITIES, RARITY_LABELS } from '../types';
import type { Rarity, PullDecision } from '../types';
import RarityBadge from './RarityBadge';

const RARITY_DOT_COLORS: Record<Rarity, string> = {
  common: 'bg-slate-400',
  uncommon: 'bg-emerald-400',
  rare: 'bg-blue-400',
  epic: 'bg-purple-400',
  legendary: 'bg-amber-400',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${year} · ${h12}:${minutes} ${ampm}`;
}

function decisionBadge(decision: PullDecision) {
  if (!decision) return null;
  if (decision === 'eat') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
        🍽️ Ate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded-full">
      Passed
    </span>
  );
}

export default function HistoryScreen() {
  const { state } = useAppState();
  const { clearHistory } = useAppActions();
  const [showConfirm, setShowConfirm] = useState(false);

  const rarityCounts = RARITIES.reduce((acc, r) => {
    acc[r] = state.pullHistory.filter((p) => p.restaurant.rarity === r).length;
    return acc;
  }, {} as Record<Rarity, number>);

  const eatCount = state.pullHistory.filter((p) => p.decision === 'eat').length;
  const passCount = state.pullHistory.filter((p) => p.decision === 'pass').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[Outfit] tracking-tight">
            Pull History
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {state.pullHistory.length} total pulls
          </p>
        </div>
        {state.pullHistory.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            id="clear-history-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Stats bar */}
      {state.pullHistory.length > 0 && (
        <div className="space-y-3 mb-6">
          {/* Rarity counts */}
          <div className="flex flex-wrap gap-2">
            {RARITIES.map((r) =>
              rarityCounts[r] > 0 ? (
                <motion.div
                  key={r}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/5"
                >
                  <div className={`w-2 h-2 rounded-full ${RARITY_DOT_COLORS[r]}`} />
                  <span className="text-[10px] text-white/50 font-medium">
                    {RARITY_LABELS[r]}
                  </span>
                  <span className="text-[10px] text-white/80 font-bold">
                    {rarityCounts[r]}
                  </span>
                </motion.div>
              ) : null
            )}
          </div>

          {/* Eat/Pass summary */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px]">🍽️</span>
              <span className="text-[10px] text-emerald-400 font-bold">{eatCount} ate</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/5">
              <span className="text-[10px] text-white/50 font-bold">{passCount} passed</span>
            </div>
          </div>
        </div>
      )}

      {/* Pull list */}
      <div className="space-y-2">
        <AnimatePresence>
          {state.pullHistory.map((pull, i) => (
            <motion.div
              key={pull.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
            >
              <span className="text-2xl shrink-0">{pull.restaurant.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {pull.restaurant.name}
                  </p>
                  {pull.wasPity && (
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      PITY
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <RarityBadge rarity={pull.restaurant.rarity} />
                  {decisionBadge(pull.decision)}
                  <span className="text-[10px] text-purple-400/60 font-medium">
                    +{pull.xpEarned} XP
                  </span>
                </div>
                <p className="text-[10px] text-white/20 mt-1">
                  {formatDate(pull.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.pullHistory.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">
            <p className="text-4xl mb-3">🎰</p>
            No pulls yet. Hit that button!
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1a1a3a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-lg font-bold text-white mb-2 font-[Outfit]">
                Clear History?
              </h3>
              <p className="text-sm text-white/50 mb-5">
                This will permanently delete all {state.pullHistory.length} pull
                records. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearHistory();
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors"
                  id="confirm-clear-btn"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
