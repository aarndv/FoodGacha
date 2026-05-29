import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { executePull } from '../gachaEngine';
import RestaurantCard from './RestaurantCard';
import Particles from './Particles';
import type { Rarity } from '../types';
import {
  PITY_THRESHOLD,
  REROLL_POINT_COST,
} from '../types';

type PullPhase = 'idle' | 'windup' | 'flash' | 'reveal' | 'result';

const BG_GLOW: Record<Rarity, string> = {
  common: 'radial-gradient(circle, rgba(148,163,184,0.1) 0%, transparent 70%)',
  uncommon: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
  rare: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
  epic: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
};

const WINDUP_COLORS: Record<number, string> = {
  1: 'via-brand-400/60',
  5: 'via-brand-500/60',
  7: 'via-brand-600/60',
  10: 'via-brand-700/60',
};

export default function PullScreen() {
  const { state } = useAppState();
  const {
    executePullAction,
    clearPull,
    decidePull,
    reroll,
    spendPoints,
    setCategoryFilter,
  } = useAppActions();
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [resultRarity, setResultRarity] = useState<Rarity>('common');
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(state.restaurants.map(r => r.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [state.restaurants]);

  const filteredRestaurants = useMemo(() => {
    if (!state.activeCategoryFilter) return state.restaurants;
    return state.restaurants.filter(r => r.category === state.activeCategoryFilter);
  }, [state.restaurants, state.activeCategoryFilter]);

  const canPull = filteredRestaurants.length > 0;

  const pityProgress = state.pityCounter;
  const pityClose = pityProgress >= PITY_THRESHOLD - 3 && pityProgress < PITY_THRESHOLD;

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
    const result = executePull(state.restaurants, state.weights, state.pityCounter, state.activeCategoryFilter);
    if (!result) return;
    setResultRarity(result.restaurant.rarity);
    setPhase('windup');
    setTimeout(() => {
      setPhase('flash');
      setTimeout(() => {
        executePullAction(result);
        setPhase('reveal');
        setXpPopup(result.xpEarned);
        setTimeout(() => setXpPopup(null), 2000);
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
  }, [canPull, phase, state.restaurants, state.weights, state.pityCounter, state.activeCategoryFilter, state.level, executePullAction]);

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
    const newResult = executePull(state.restaurants, state.weights, state.pityCounter, state.activeCategoryFilter);
    if (!newResult) return;
    setResultRarity(newResult.restaurant.rarity);
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
    ? 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 100%)'
    : resultRarity === 'epic'
    ? 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 100%)'
    : resultRarity === 'rare'
    ? 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 100%)'
    : 'radial-gradient(circle, var(--brand-500) 0.2, transparent 100%)';

  const shouldShake =
    phase === 'reveal' &&
    (resultRarity === 'legendary' ||
      (resultRarity === 'epic' && state.level >= 7) ||
      (resultRarity === 'rare' && state.level >= 10));

  return (
    <div className="relative min-h-[calc(100vh-80px)] md:min-h-screen flex flex-col items-center justify-center overflow-hidden py-10 transition-colors duration-300">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={resultRarity === 'legendary' ? 400 : 200}
          colors={['var(--brand-400)', 'var(--brand-500)', 'var(--brand-300)', '#ffffff', 'var(--brand-100)']}
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
              className="w-4 h-4 rounded-full bg-brand-400"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0.8, 1.2] }}
              transition={{ duration: 0.8 }}
              style={{ boxShadow: '0 0 40px 20px var(--brand-500) 0.3' }}
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
            className="fixed top-24 left-1/2 z-50 -translate-x-1/2 px-4 py-2 rounded-full bg-brand-500 text-white text-sm font-black shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            +{xpPopup} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="relative z-20 w-full flex flex-col items-center justify-center px-4"
        animate={
          shouldShake
            ? {
                x: resultRarity === 'legendary' ? [0, -8, 8, -6, 6, -3, 3, 0] : [0, -4, 4, -2, 2, 0],
                y: resultRarity === 'legendary' ? [0, -5, 5, -3, 3, -1, 1, 0] : [0, -2, 2, -1, 1, 0],
              }
            : {}
        }
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              className="flex flex-col items-center gap-8 w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-center">
                <h1 className="text-5xl font-black font-[Outfit] text-gradient mb-2">
                  FoodGacha
                </h1>
                <p className="text-gray-400 font-medium">Your next meal is a pull away</p>
              </div>

              {/* Category Filter */}
              <div className="w-full space-y-3">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Filter by Style</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      state.activeCategoryFilter === null 
                        ? 'bg-brand-500 text-white shadow-md' 
                        : 'bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/10'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        state.activeCategoryFilter === cat 
                          ? 'bg-brand-500 text-white shadow-md' 
                          : 'bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pull button */}
              <motion.button
                onClick={handlePull}
                disabled={!canPull}
                className="relative group mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-brand-500/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-40 h-40 rounded-full bg-white dark:bg-gray-900 p-2 shadow-2xl border border-gray-100 dark:border-white/10">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 flex items-center justify-center">
                    <span className="text-3xl font-black font-[Outfit] text-white tracking-widest drop-shadow-md">
                      PULL
                    </span>
                  </div>
                </div>
              </motion.button>

              {!canPull && (
                <p className="text-brand-600 font-bold text-xs text-center bg-brand-50 dark:bg-brand-500/10 px-4 py-2 rounded-full">
                  No {state.activeCategoryFilter} restaurants in your pool!
                </p>
              )}

              {/* Status footer */}
              <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-50 dark:border-white/10 shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <span className="text-brand-500">💎</span>
                  <span>{state.virtualPoints}</span>
                </div>
                <div className="w-px h-3 bg-gray-100 dark:bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span>Pity: {pityProgress}/10</span>
                  {pityClose && <span className="animate-pulse">🔥</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal + Result */}
        <AnimatePresence mode="wait">
          {(phase === 'reveal' || phase === 'result') && state.currentPull && (
            <motion.div
              key="result"
              className="flex flex-col items-center gap-6 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {state.currentPull.wasPity && (
                <motion.div
                  className="px-4 py-1.5 rounded-full bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                  className="flex flex-col gap-3 w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {!state.currentPull.decision && (
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleEat}
                        className="flex-1 py-4 rounded-2xl bg-gray-900 dark:bg-white dark:text-[#0a0a1a] text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Let's Eat!
                      </button>
                      <button
                        onClick={handlePass}
                        className="flex-1 py-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                      >
                        Pass
                      </button>
                    </div>
                  )}

                  {state.currentPull.decision && (
                    <motion.div
                      className={`text-center py-4 rounded-2xl text-sm font-black uppercase tracking-widest ${
                        state.currentPull.decision === 'eat'
                          ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {state.currentPull.decision === 'eat' ? '🎉 Bon appétit!' : 'Skipped'}
                    </motion.div>
                  )}

                  <div className="flex gap-2 w-full">
                    {!state.currentPull.decision && (canFreeReroll || canPointReroll) && (
                      <button
                        onClick={() => handleReroll(canFreeReroll)}
                        className="flex-1 py-3 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 text-xs font-black uppercase tracking-widest border border-brand-100 dark:border-brand-500/20 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all"
                      >
                        🔄 Reroll
                        <span className="block text-[8px] opacity-60 mt-0.5">
                          {canFreeReroll ? `${state.freeRerolls} free left` : `${REROLL_POINT_COST} 💎`}
                        </span>
                      </button>
                    )}
                    {(state.currentPull.decision || (!canFreeReroll && !canPointReroll)) && (
                      <button
                        onClick={handlePullAgain}
                        className="flex-1 py-4 rounded-2xl bg-brand-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-500/20"
                      >
                        Pull Again!
                      </button>
                    )}
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