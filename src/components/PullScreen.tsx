import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { executePull } from '../gachaEngine';
import RestaurantCard from './RestaurantCard';
import Particles from './Particles';
import type { Rarity } from '../types';

type PullPhase = 'idle' | 'windup' | 'flash' | 'reveal' | 'result';

const BG_GLOW: Record<Rarity, string> = {
  common: 'radial-gradient(circle, rgba(148,163,184,0.08) 0%, transparent 70%)',
  uncommon: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
  rare: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
  epic: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
  legendary: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)',
};

export default function PullScreen() {
  const { state } = useAppState();
  const { executePullAction, clearPull } = useAppActions();
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [resultRarity, setResultRarity] = useState<Rarity>('common');
  const canPull = state.restaurants.length > 0;

  const handlePull = useCallback(() => {
    if (!canPull || phase !== 'idle') return;
    const result = executePull(state.restaurants, state.weights);
    if (!result) return;
    setResultRarity(result.restaurant.rarity);
    setPhase('windup');
    setTimeout(() => {
      setPhase('flash');
      setTimeout(() => {
        executePullAction(result);
        setPhase('reveal');
        setTimeout(() => setPhase('result'), 1200);
      }, 300);
    }, 800);
  }, [canPull, phase, state.restaurants, state.weights, executePullAction]);

  const handlePullAgain = () => { clearPull(); setPhase('idle'); };

  const flashBg = resultRarity === 'legendary'
    ? 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, transparent 100%)'
    : resultRarity === 'epic'
    ? 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 100%)'
    : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 100%)';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'result') && state.currentPull && (
          <motion.div className="absolute inset-0 z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: BG_GLOW[state.currentPull.restaurant.rarity] }} />
        )}
      </AnimatePresence>

      {phase === 'idle' && <Particles rarity="rare" mode="idle" />}
      {(phase === 'reveal' || phase === 'result') && state.currentPull && (
        <Particles rarity={state.currentPull.restaurant.rarity} mode="burst" count={40} />
      )}

      <AnimatePresence>
        {phase === 'windup' && (
          <motion.div className="absolute inset-0 z-20 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} className="absolute w-0.5 h-32 bg-gradient-to-t from-transparent via-purple-400/60 to-transparent"
                style={{ rotate: `${i * 45}deg` }}
                initial={{ scale: 3, opacity: 0 }} animate={{ scale: 0.3, opacity: [0, 1, 0.5] }} transition={{ duration: 0.8, ease: 'easeIn' }} />
            ))}
            <motion.div className="w-4 h-4 rounded-full bg-white" initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 0.8, 1.2] }}
              transition={{ duration: 0.8 }} style={{ boxShadow: '0 0 40px 20px rgba(168,85,247,0.5)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div className="absolute inset-0 z-30" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3 }} style={{ background: flashBg }} />
        )}
      </AnimatePresence>

      <motion.div className="relative z-20 w-full flex flex-col items-center justify-center px-4"
        animate={phase === 'reveal' && resultRarity === 'legendary' ? { x: [0, -5, 5, -3, 3, 0], y: [0, -3, 3, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="idle" className="flex flex-col items-center gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <div className="text-center">
                <motion.h1 className="text-4xl font-[Outfit] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-2"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}>Food Gacha</motion.h1>
                <p className="text-white/30 text-sm">Where are we eating today?</p>
              </div>
              <motion.button onClick={handlePull} disabled={!canPull} className="relative group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="pull-button">
                <motion.div className="absolute inset-0 rounded-full"
                  animate={{ boxShadow: ['0 0 20px 5px rgba(168,85,247,0.3)', '0 0 40px 15px rgba(236,72,153,0.4)', '0 0 20px 5px rgba(168,85,247,0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }} />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center shadow-2xl">
                  <div className="w-[120px] h-[120px] rounded-full bg-[#0a0a1a] flex items-center justify-center">
                    <span className="text-2xl font-[Outfit] font-black text-white tracking-widest">PULL!</span>
                  </div>
                </div>
              </motion.button>
              {!canPull && <p className="text-amber-400/60 text-xs text-center">Add restaurants in the Dashboard first</p>}
              <p className="text-white/20 text-xs">{state.restaurants.length} restaurants in pool</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(phase === 'reveal' || phase === 'result') && state.currentPull && (
            <motion.div key="result" className="flex flex-col items-center gap-6 w-full max-w-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RestaurantCard restaurant={state.currentPull.restaurant} variant="reveal" />
              {phase === 'result' && (
                <motion.div className="flex gap-3 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <button onClick={handlePullAgain} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/20" id="pull-again-btn">
                    Pull Again!
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
