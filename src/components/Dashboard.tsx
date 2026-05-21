import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { getWeightPercentages, xpProgress } from '../gachaEngine';
import type { Rarity } from '../types';
import {
  RARITIES,
  RARITY_LABELS,
  DEFAULT_WEIGHTS,
  PITY_THRESHOLD,
  XP_THRESHOLDS,
  LEVEL_UNLOCKS,
  DAILY_POINTS_REWARD,
  FREE_REROLLS_PER_SESSION,
  REROLL_POINT_COST,
} from '../types';
import RestaurantCard from './RestaurantCard';

const EMOJI_OPTIONS = [
  '🍔', '🍕', '🌮', '🍣', '🍜', '🥡', '🍝', '🥪', '🍗', '🦞',
  '🍱', '🥘', '🧆', '🌯', '🥙', '🍲', '🍛', '🍤', '🥗', '🍰',
  '🧁', '☕', '🍦', '🥐', '🍩', '🫕', '🥓', '🍖', '🥩', '👨‍🍳',
];

const RARITY_SLIDER_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  uncommon: '#34d399',
  rare: '#60a5fa',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

type Section = 'restaurants' | 'rates' | 'profile';

export default function Dashboard() {
  const { state } = useAppState();
  const {
    addRestaurant,
    removeRestaurant,
    editRestaurant,
    setWeights,
    claimDailyPoints,
  } = useAppActions();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍔');
  const [rarity, setRarity] = useState<Rarity>('common');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('restaurants');

  const percentages = getWeightPercentages(state.weights);
  const progress = xpProgress(state.xp, XP_THRESHOLDS);

  const todayISO = new Date().toISOString().slice(0, 10);
  const canClaimDaily = state.lastDailyClaimDate !== todayISO;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      editRestaurant({ id: editingId, name: name.trim(), emoji, rarity });
      setEditingId(null);
    } else {
      addRestaurant({ name: name.trim(), emoji, rarity });
    }
    setName('');
    setEmoji('🍔');
    setRarity('common');
  };

  const handleEdit = (r: typeof state.restaurants[0]) => {
    setEditingId(r.id);
    setName(r.name);
    setEmoji(r.emoji);
    setRarity(r.rarity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setEmoji('🍔');
    setRarity('common');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white font-[Outfit] tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your restaurant pool, rates & profile
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] mb-6">
        {(['restaurants', 'rates', 'profile'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeSection === s ? 'text-white' : 'text-white/40'
            }`}
            id={`section-${s}`}
          >
            {activeSection === s && (
              <motion.div
                layoutId="section-bg"
                className="absolute inset-0 rounded-lg bg-white/[0.08]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {s === 'restaurants'
                ? `Pool (${state.restaurants.length})`
                : s === 'rates'
                ? 'Rates'
                : 'Profile'}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ RESTAURANTS ═══ */}
        {activeSection === 'restaurants' && (
          <motion.div
            key="restaurants"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Add/Edit form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Emoji selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 text-2xl flex items-center justify-center hover:bg-white/[0.1] transition-colors"
                      id="emoji-picker-toggle"
                    >
                      {emoji}
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute top-14 left-0 z-40 grid grid-cols-6 gap-1 p-2 rounded-xl bg-[#1a1a3a] border border-white/10 shadow-2xl"
                        >
                          {EMOJI_OPTIONS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => {
                                setEmoji(e);
                                setShowEmojiPicker(false);
                              }}
                              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-white/10 transition-colors ${
                                emoji === e ? 'bg-white/15 ring-1 ring-white/20' : ''
                              }`}
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name input */}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Restaurant name..."
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    id="restaurant-name-input"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Rarity dropdown */}
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as Rarity)}
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
                    id="rarity-select"
                    style={{ color: RARITY_SLIDER_COLORS[rarity] }}
                  >
                    {RARITIES.map((r) => (
                      <option key={r} value={r} className="bg-[#1a1a3a] text-white">
                        {RARITY_LABELS[r]}
                      </option>
                    ))}
                  </select>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
                    id="add-restaurant-btn"
                  >
                    {editingId ? 'Save' : 'Add'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Restaurant list */}
            <div className="space-y-2">
              <AnimatePresence>
                {state.restaurants.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    onRemove={() => removeRestaurant(r.id)}
                    onEdit={() => handleEdit(r)}
                  />
                ))}
              </AnimatePresence>
              {state.restaurants.length === 0 && (
                <div className="text-center py-12 text-white/30 text-sm">
                  <p className="text-4xl mb-3">🍽️</p>
                  No restaurants yet. Add some above!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ PULL RATES ═══ */}
        {activeSection === 'rates' && (
          <motion.div
            key="rates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Pull Rate Distribution
                </h2>
                <button
                  onClick={() => setWeights(DEFAULT_WEIGHTS)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  id="reset-weights-btn"
                >
                  Reset
                </button>
              </div>

              {RARITIES.map((r) => (
                <div key={r} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: RARITY_SLIDER_COLORS[r] }}
                    >
                      {RARITY_LABELS[r]}
                    </label>
                    <span className="text-xs text-white/50 font-mono tabular-nums">
                      {percentages[r]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={state.weights[r]}
                    onChange={(e) =>
                      setWeights({ ...state.weights, [r]: Number(e.target.value) })
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${RARITY_SLIDER_COLORS[r]} ${state.weights[r]}%, rgba(255,255,255,0.06) ${state.weights[r]}%)`,
                    }}
                    id={`slider-${r}`}
                  />
                </div>
              ))}

              {/* Visual distribution bar */}
              <div className="pt-3 border-t border-white/5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                  Distribution Preview
                </p>
                <div className="flex rounded-full overflow-hidden h-3">
                  {RARITIES.map((r) =>
                    percentages[r] > 0 ? (
                      <motion.div
                        key={r}
                        layout
                        className="h-full"
                        style={{
                          width: `${percentages[r]}%`,
                          backgroundColor: RARITY_SLIDER_COLORS[r],
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    ) : null
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {RARITIES.map((r) => (
                    <div key={r} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: RARITY_SLIDER_COLORS[r] }}
                      />
                      <span className="text-[10px] text-white/40">{RARITY_LABELS[r]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pity info */}
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Pity System</p>
                  <span className="text-[10px] text-white/50 font-mono">
                    {state.pityCounter} / {PITY_THRESHOLD}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    animate={{ width: `${(state.pityCounter / PITY_THRESHOLD) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />
                </div>
                <p className="text-[10px] text-white/20 mt-1">
                  After {PITY_THRESHOLD} pulls without Rare+, the next pull guarantees a higher-tier result.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ PROFILE ═══ */}
        {activeSection === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* XP & Level card */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Level & XP
                </h2>
                <span className="text-lg font-[Outfit] font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Lv. {state.level}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
                  animate={{ width: `${progress.fraction * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Total XP: {state.xp.toLocaleString()}</span>
                <span>
                  {progress.needed > 0
                    ? `${progress.current} / ${progress.needed} to next level`
                    : 'Max Level!'}
                </span>
              </div>
            </div>

            {/* Level unlocks */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Level Unlocks
              </h2>
              <div className="space-y-2">
                {Object.entries(LEVEL_UNLOCKS).map(([lvl, desc]) => {
                  const unlocked = state.level >= Number(lvl);
                  return (
                    <div
                      key={lvl}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                        unlocked ? 'bg-purple-500/10' : 'bg-white/[0.02]'
                      }`}
                    >
                      <span
                        className={`text-xs font-bold font-mono w-8 ${
                          unlocked ? 'text-purple-400' : 'text-white/20'
                        }`}
                      >
                        {lvl}
                      </span>
                      <span
                        className={`text-xs ${
                          unlocked ? 'text-white/80' : 'text-white/30'
                        }`}
                      >
                        {unlocked ? '✅' : '🔒'} {desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Virtual Points & Daily */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Virtual Points
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">💎</span>
                  <span className="text-2xl font-[Outfit] font-black text-white">
                    {state.virtualPoints}
                  </span>
                </div>
                <button
                  onClick={claimDailyPoints}
                  disabled={!canClaimDaily}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    canClaimDaily
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400'
                      : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                  }`}
                  id="daily-claim-btn"
                >
                  {canClaimDaily ? `Claim +${DAILY_POINTS_REWARD} 💎` : 'Claimed Today ✓'}
                </button>
              </div>
              <div className="text-[10px] text-white/30 space-y-1">
                <p>• Earn {DAILY_POINTS_REWARD} points daily by claiming</p>
                <p>• {FREE_REROLLS_PER_SESSION} free rerolls per session</p>
                <p>• Extra rerolls cost {REROLL_POINT_COST} 💎 each</p>
              </div>
            </div>

            {/* Session stats */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Session Stats
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{state.freeRerolls}</p>
                  <p className="text-[10px] text-white/30">Free Rerolls</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{state.rerollsUsed}</p>
                  <p className="text-[10px] text-white/30">Rerolls Used</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{state.pullHistory.length}</p>
                  <p className="text-[10px] text-white/30">Total Pulls</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
