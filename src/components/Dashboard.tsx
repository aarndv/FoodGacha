import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, useAppActions } from '../hooks/useAppState';
import { getWeightPercentages } from '../gachaEngine';
import type { Rarity } from '../types';
import { RARITIES, RARITY_LABELS, DEFAULT_WEIGHTS } from '../types';
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

export default function Dashboard() {
  const { state } = useAppState();
  const { addRestaurant, removeRestaurant, editRestaurant, setWeights } =
    useAppActions();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍔');
  const [rarity, setRarity] = useState<Rarity>('common');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'restaurants' | 'rates'>('restaurants');

  const percentages = getWeightPercentages(state.weights);

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
          Manage your restaurant pool & pull rates
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] mb-6">
        {(['restaurants', 'rates'] as const).map((s) => (
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
              {s === 'restaurants' ? `Restaurants (${state.restaurants.length})` : 'Pull Rates'}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'restaurants' ? (
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
        ) : (
          <motion.div
            key="rates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Pull rate sliders */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
