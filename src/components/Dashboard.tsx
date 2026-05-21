import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
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
} from '../types';
import RestaurantCard from './RestaurantCard';

const EMOJI_OPTIONS = [
  '🍔', '🍕', '🌮', '🍣', '🍜', '🥡', '🍝', '🥪', '🍗', '🦞',
  '🍱', '🥘', '🧆', '🌯', '🥙', '🍲', '🍛', '🍤', '🥗', '🍰',
  '🧁', '☕', '🍦', '🥐', '🍩', '🫕', '🥓', '🍖', '🥩', '👨‍🍳',
];

const CATEGORY_OPTIONS = [
  'Fast Food', 'Asian', 'Italian', 'Mexican', 'Healthy', 'Bakery', 'Fine Dining', 'Cafe'
];

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#94a3b8',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

type Section = 'restaurants' | 'rates' | 'profile';

const IS_AUTH_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function UserProfile() {
  const { user } = useUser();
  return (
    <div>
      <p className="text-sm font-black text-gray-900">{user?.fullName || 'Gourmet'}</p>
      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Premium Member</p>
    </div>
  );
}

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
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Fast Food');
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

    const payload = { 
      name: name.trim(), 
      emoji, 
      rarity, 
      imageUrl: imageUrl.trim() || undefined,
      category 
    };

    if (editingId) {
      editRestaurant({ id: editingId, ...payload });
      setEditingId(null);
    } else {
      addRestaurant(payload);
    }
    setName('');
    setImageUrl('');
    setEmoji('🍔');
    setRarity('common');
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.name);
    setImageUrl(r.imageUrl || '');
    setEmoji(r.emoji);
    setRarity(r.rarity);
    setCategory(r.category || 'Fast Food');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setImageUrl('');
    setEmoji('🍔');
    setRarity('common');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-12 md:gap-8"
    >
      {/* Sidebar-ish for Desktop / Top for Mobile */}
      <div className="md:col-span-4 lg:col-span-3 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-black text-gray-900 font-[Outfit] tracking-tight text-gradient">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Build your ultimate food pool
          </p>
        </div>

        {/* Section toggle */}
        <div className="flex flex-row md:flex-col gap-1 p-1 rounded-2xl bg-gray-100 mb-6">
          {(['restaurants', 'rates', 'profile'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-1 md:flex-none md:text-left md:px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeSection === s ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {activeSection === s && (
                <motion.div
                  layoutId="section-bg"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {s === 'restaurants' && <span>🍔</span>}
                {s === 'rates' && <span>📈</span>}
                {s === 'profile' && <span>👤</span>}
                {s === 'restaurants'
                  ? `Pool (${state.restaurants.length})`
                  : s === 'rates'
                  ? 'Rates'
                  : 'Profile'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-8 lg:col-span-9 mt-4 md:mt-0">
        <AnimatePresence mode="wait">
          {/* ═══ RESTAURANTS ═══ */}
          {activeSection === 'restaurants' && (
            <motion.div
              key="restaurants"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Add/Edit form */}
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-2">
                    {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Emoji selector */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 text-3xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-inner"
                      >
                        {emoji}
                      </button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute top-20 left-0 z-40 grid grid-cols-6 gap-1 p-2 rounded-2xl bg-white border border-gray-100 shadow-2xl"
                          >
                            {EMOJI_OPTIONS.map((e) => (
                              <button
                                key={e}
                                type="button"
                                onClick={() => {
                                  setEmoji(e);
                                  setShowEmojiPicker(false);
                                }}
                                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-gray-50 transition-colors ${
                                  emoji === e ? 'bg-amber-50 ring-1 ring-amber-200' : ''
                                }`}
                              >
                                {e}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Restaurant name..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-base text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL (optional)..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Rarity</label>
                      <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value as Rarity)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                        style={{ color: RARITY_COLORS[rarity] }}
                      >
                        {RARITIES.map((r) => (
                          <option key={r} value={r} className="text-gray-900">
                            {RARITY_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!name.trim()}
                      className="flex-1 py-3.5 rounded-2xl bg-amber-500 text-white text-sm font-black uppercase tracking-widest disabled:opacity-30 disabled:grayscale hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
                    >
                      {editingId ? 'Update Restaurant' : 'Add to Pool'}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3.5 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Restaurant grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-6xl mb-4">🍱</p>
                    <p className="text-gray-400 font-medium">Your pool is empty. Add some flavor above!</p>
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
              <div className="rounded-3xl border border-gray-100 bg-white p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900 font-[Outfit]">
                    Rate Distribution
                  </h2>
                  <button
                    onClick={() => setWeights(DEFAULT_WEIGHTS)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-500 transition-colors bg-amber-50 px-3 py-1.5 rounded-lg"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="space-y-6">
                  {RARITIES.map((r) => (
                    <div key={r} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          className="text-xs font-black uppercase tracking-widest"
                          style={{ color: RARITY_COLORS[r] }}
                        >
                          {RARITY_LABELS[r]}
                        </label>
                        <span className="text-sm font-mono font-bold text-gray-400">
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
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, ${RARITY_COLORS[r]} ${state.weights[r]}%, #f3f4f6 ${state.weights[r]}%)`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Distribution preview */}
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                    Visual Mix
                  </p>
                  <div className="flex rounded-full overflow-hidden h-4 shadow-inner bg-gray-50">
                    {RARITIES.map((r) =>
                      percentages[r] > 0 ? (
                        <motion.div
                          key={r}
                          layout
                          className="h-full"
                          style={{
                            width: `${percentages[r]}%`,
                            backgroundColor: RARITY_COLORS[r],
                          }}
                        />
                      ) : null
                    )}
                  </div>
                </div>

                {/* Pity info */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Pity Tracker</p>
                    <span className="text-xs font-bold text-amber-600">
                      {state.pityCounter} / {PITY_THRESHOLD}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-amber-500"
                      animate={{ width: `${(state.pityCounter / PITY_THRESHOLD) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-600/70 mt-3 font-medium">
                    Guaranteed Rare+ result after {PITY_THRESHOLD} consecutive Common/Uncommon pulls.
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
              className="space-y-6"
            >
              {/* User Identity / Auth */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {IS_AUTH_ENABLED ? (
                    <>
                      <SignedOut>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
                        <div>
                          <p className="text-sm font-black text-gray-900">Guest Explorer</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Progress saved locally</p>
                        </div>
                      </SignedOut>
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                        <UserProfile />
                      </SignedIn>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Guest Mode</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Auth disabled on localhost</p>
                      </div>
                    </>
                  )}
                </div>
                
                {IS_AUTH_ENABLED && (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                        Sync Account
                      </button>
                    </SignInButton>
                  </SignedOut>
                )}
              </div>

              {/* XP & Level card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                    Prestige Level
                  </h2>
                  <span className="text-3xl font-black font-[Outfit] text-gradient">
                    Lv. {state.level}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-gray-100 overflow-hidden mb-3 p-1">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm shadow-amber-200"
                    animate={{ width: `${progress.fraction * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>EXP: {state.xp.toLocaleString()}</span>
                  <span>
                    {progress.needed > 0
                      ? `${progress.needed - progress.current} XP to next rank`
                      : 'Culinary Master!'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Virtual Points & Daily */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Token Balance
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">💎</span>
                    <span className="text-3xl font-black font-[Outfit] text-gray-900">
                      {state.virtualPoints}
                    </span>
                  </div>
                  <button
                    onClick={claimDailyPoints}
                    disabled={!canClaimDaily}
                    className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      canClaimDaily
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {canClaimDaily ? `Claim +${DAILY_POINTS_REWARD} 💎` : 'Claimed Today ✓'}
                  </button>
                </div>

                {/* Level unlocks */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    Milestones
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(LEVEL_UNLOCKS).slice(0, 4).map(([lvl, desc]) => {
                      const unlocked = state.level >= Number(lvl);
                      return (
                        <div
                          key={lvl}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                            unlocked ? 'bg-amber-50' : 'bg-gray-50'
                          }`}
                        >
                          <span className={`text-[10px] font-black font-mono w-6 ${unlocked ? 'text-amber-600' : 'text-gray-300'}`}>
                            {lvl}
                          </span>
                          <span className={`text-[10px] font-bold ${unlocked ? 'text-gray-700' : 'text-gray-300'}`}>
                            {desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}