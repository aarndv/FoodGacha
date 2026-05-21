import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { executePull, xpProgress } from '../gachaEngine';
import RestaurantCard from './RestaurantCard';
import Particles from './Particles';
import type { Rarity } from '../types';
import {
  PITY_THRESHOLD,
  REROLL_POINT_COST,
  XP_THRESHOLDS,
} from '../types';

type PullPhase = 'idle' | 'windup' | 'flash' | 'reveal' | 'result';

const BG_GLOW: Record<Rarity, string> = {
  common: 'radial-gradient(circle, rgba(148,163,184,0.08) 0%, transparent 70%)',
  uncommon: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
  rare: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
  epic: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
};

const WINDUP_COLORS: Record<number, string> = {
  1: 'via-purple-400/60',
  5: 'via-blue-400/60',
  7: 'via-pink-400/60',
  10: 'via-amber-400/60',
};

export default function PullScreen() {
  const { state } = useAppState();
  const {
    executePullAction,
    clearPull,
    decidePull,
    reroll,
    spendPoints,
  } = useAppActions();
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [resultRarity, setResultRarity] = useState<Rarity>('common');
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const canPull = state.restaurants.length > 0;

  const progress = xpProgress(state.xp, XP_THRESHOLDS);
  const pityProgress = state.pityCounter;
  const pityClose = pityProgress >= PITY_THRESHOLD - 3 && pityProgress < PITY_THRESHOLD;

  // Determine wind-up color based on level
  const windupColor = state.level >= 10
    ? WINDUP_COLORS[10]
    : state.level >= 7
    ? WINDUP_COLORS[7]
    : state.level >= 5
    ? WINDUP_COLORS[5]
    : WINDUP_COLORS[1];

  const canFreeReroll = state.freeRerolls > 0;
  const canPointReroll = state.virtualPoints >= REROLL_POINT_COST;

  const handlePull = useCallback(() => {
    if (!canPull || phase !== 'idle') return;
    const result = executePull(state.restaurants, state.weights, state.pityCounter);
    if (!result) return;
    setResultRarity(result.restaurant.rarity);
    setPhase('windup');
    setTimeout(() => {
      setPhase('flash');
      setTimeout(() => {
        executePullAction(result);
        setPhase('reveal');
        // Show XP popup
        setXpPopup(result.xpEarned);
        setTimeout(() => setXpPopup(null), 2000);
        // Confetti for legendary or epic at higher levels
        if (
          result.restaurant.rarity === 'legendary' ||
          (result.restaurant.rarity === 'epic' && state.level >= 7)
        ) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
        setTimeout(() => setPhase('result'), 1200);
      }, 300);
    }, 800);
  }, [canPull, phase, state.restaurants, state.weights, state.pityCounter, state.level, executePullAction]);

  const handleEat = () => {
    decidePull('eat');
    setTimeout(() => { clearPull(); setPhase('idle'); }, 600);
  };

  const handlePass = () => {
    decidePull('pass');
    setTimeout(() => { clearPull(); setPhase('idle'); }, 600);
  };

  const handleReroll = (useFree: boolean) => {
    if (!useFree) {
      if (!canPointReroll) return;
      spendPoints(REROLL_POINT_COST);
    } else {
      if (!canFreeReroll) return;
    }
    const newResult = executePull(state.restaurants, state.weights, state.pityCounter);
    if (!newResult) return;
    setResultRarity(newResult.restaurant.rarity);
    // Quick flash for reroll
    setPhase('flash');
    setTimeout(() => {
      reroll(newResult);
      setPhase('reveal');
      setXpPopup(newResult.xpEarned);
      setTimeout(() => setXpPopup(null), 2000);
      if (
        newResult.restaurant.rarity === 'legendary' ||
        (newResult.restaurant.rarity === 'epic' && state.level >= 7)
      ) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setTimeout(() => setPhase('result'), 1200);
    }, 300);
  };

  const handlePullAgain = () => {
    clearPull();
    setPhase('idle');
  };

  const flashBg = resultRarity === 'legendary'
    ? 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, transparent 100%)'
    : resultRarity === 'epic'
    ? 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 100%)'
    : resultRarity === 'rare'
    ? 'radial-gradient(circle, rgba(96,165,250,0.6) 0%, transparent 100%)'
    : 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 100%)';

  // Should we shake? Epic at level 7+, Legendary always
  const shouldShake =
    phase === 'reveal' &&
    (resultRarity === 'legendary' ||
      (resultRarity === 'epic' && state.level >= 7) ||
      (resultRarity === 'rare' && state.level >= 10));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Confetti for legendary */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={resultRarity === 'legendary' ? 400 : 200}
          colors={
            resultRarity === 'legendary'
              ? ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff', '#fef3c7']
              : ['#a855f7', '#c084fc', '#7c3aed', '#ddd6fe', '#ffffff']
          }
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 60 }}
        />
      )}

      {/* Background glow */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'result') && state.currentPull && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: BG_GLOW[state.currentPull.restaurant.rarity] }}
          />
        )}
      </AnimatePresence>

      {/* Level-unlocked gold summon BG (level 10+) */}
      {state.level >= 10 && phase === 'idle' && (
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.08) 0%, transparent 60%)',
          }}
        />
      )}

      {phase === 'idle' && <Particles rarity={state.level >= 10 ? 'legendary' : 'rare'} mode="idle" />}
      {(phase === 'reveal' || phase === 'result') && state.currentPull && (
        <Particles rarity={state.currentPull.restaurant.rarity} mode="burst" count={resultRarity === 'legendary' ? 80 : 40} />
      )}

      {/* Wind-up */}
      <AnimatePresence>
        {phase === 'windup' && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(state.level >= 5 ? 12 : 8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-0.5 h-32 bg-gradient-to-t from-transparent ${windupColor} to-transparent`}
                style={{ rotate: `${i * (360 / (state.level >= 5 ? 12 : 8))}deg` }}
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 0.3, opacity: [0, 1, 0.5] }}
                transition={{ duration: 0.8, ease: 'easeIn' }}
              />
            ))}
            <motion.div
              className="w-4 h-4 rounded-full bg-white"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0.8, 1.2] }}
              transition={{ duration: 0.8 }}
              style={{ boxShadow: '0 0 40px 20px rgba(168,85,247,0.5)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3 }}
            style={{ background: flashBg }}
          />
        )}
      </AnimatePresence>

      {/* XP popup */}
      <AnimatePresence>
        {xpPopup !== null && (
          <motion.div
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 px-4 py-2 rounded-full bg-purple-600/80 backdrop-blur text-white text-sm font-bold"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            +{xpPopup} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with optional shake */}
      <motion.div
        className="relative z-20 w-full flex flex-col items-center justify-center px-4"
        animate={
          shouldShake
            ? {
                x: resultRarity === 'legendary'
                  ? [0, -8, 8, -6, 6, -3, 3, 0]
                  : [0, -4, 4, -2, 2, 0],
                y: resultRarity === 'legendary'
                  ? [0, -5, 5, -3, 3, -1, 1, 0]
                  : [0, -2, 2, -1, 1, 0],
              }
            : {}
        }
        transition={{ duration: resultRarity === 'legendary' ? 0.6 : 0.4 }}
      >
        {/* Idle state */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-center">
                <motion.h1
                  className="text-4xl font-[Outfit] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-2"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Food Gacha
                </motion.h1>
                <p className="text-white/30 text-sm">Where are we eating today?</p>
              </div>

              {/* XP / Level bar */}
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Lv. {state.level}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {progress.needed > 0 ? `${progress.current} / ${progress.needed} XP` : 'MAX'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.fraction * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />
                </div>
              </div>

              {/* Pull button */}
              <motion.button
                onClick={handlePull}
                disabled={!canPull}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="pull-button"
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px 5px rgba(168,85,247,0.3)',
                      '0 0 40px 15px rgba(236,72,153,0.4)',
                      '0 0 20px 5px rgba(168,85,247,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center shadow-2xl">
                  <div className="w-[120px] h-[120px] rounded-full bg-[#0a0a1a] flex items-center justify-center">
                    <span className="text-2xl font-[Outfit] font-black text-white tracking-widest">
                      PULL!
                    </span>
                  </div>
                </div>
              </motion.button>

              {!canPull && (
                <p className="text-amber-400/60 text-xs text-center">
                  Add restaurants in the Dashboard first
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-[10px] text-white/30">
                <span>{state.restaurants.length} in pool</span>
                <span className="w-px h-3 bg-white/10" />
                <span>
                  Pity: {pityProgress}/{PITY_THRESHOLD}
                  {pityClose && (
                    <span className="text-amber-400 ml-1">🔥</span>
                  )}
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span>💎 {state.virtualPoints}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal + Result */}
        <AnimatePresence mode="wait">
          {(phase === 'reveal' || phase === 'result') && state.currentPull && (
            <motion.div
              key="result"
              className="flex flex-col items-center gap-4 w-full max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Pity badge */}
              {state.currentPull.wasPity && (
                <motion.div
                  className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  ✨ Pity Activated!
                </motion.div>
              )}

              <RestaurantCard
                restaurant={state.currentPull.restaurant}
                variant="reveal"
              />

              {phase === 'result' && (
                <motion.div
                  className="flex flex-col gap-2 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Eat / Pass buttons */}
                  {!state.currentPull.decision && (
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleEat}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
                        id="eat-btn"
                      >
                        🍽️ Let's Eat!
                      </button>
                      <button
                        onClick={handlePass}
                        className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/[0.1] transition-all"
                        id="pass-btn"
                      >
                        Pass
                      </button>
                    </div>
                  )}

                  {/* Decision made feedback */}
                  {state.currentPull.decision && (
                    <motion.div
                      className={`text-center py-3 rounded-xl text-sm font-semibold ${
                        state.currentPull.decision === 'eat'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-white/[0.04] text-white/40'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {state.currentPull.decision === 'eat'
                        ? '🎉 Bon appétit!'
                        : 'Passed — maybe next time!'}
                    </motion.div>
                  )}

                  {/* Reroll + Pull Again row */}
                  <div className="flex gap-2 w-full">
                    {!state.currentPull.decision && (canFreeReroll || canPointReroll) && (
                      <button
                        onClick={() => handleReroll(canFreeReroll)}
                        className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-white/50 text-xs font-medium hover:bg-white/[0.08] transition-all"
                        id="reroll-btn"
                      >
                        🔄 Reroll
                        <span className="block text-[10px] text-white/30 mt-0.5">
                          {canFreeReroll
                            ? `${state.freeRerolls} free left`
                            : `${REROLL_POINT_COST} 💎`}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={handlePullAgain}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/20"
                      id="pull-again-btn"
                    >
                      Pull Again!
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
