import { motion } from 'framer-motion';
import type { Restaurant, Rarity } from '../types';
import RarityBadge from './RarityBadge';

const GLOW_COLORS: Record<Rarity, string> = {
  common: 'shadow-slate-500/20',
  uncommon: 'shadow-emerald-500/30',
  rare: 'shadow-blue-500/40',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-amber-500/60',
};

const BORDER_COLORS: Record<Rarity, string> = {
  common: 'border-l-slate-500',
  uncommon: 'border-l-emerald-500',
  rare: 'border-l-blue-500',
  epic: 'border-l-purple-500',
  legendary: 'border-l-amber-400',
};

interface Props {
  restaurant: Restaurant;
  variant?: 'list' | 'reveal';
  onRemove?: () => void;
  onEdit?: () => void;
  index?: number;
}

export default function RestaurantCard({
  restaurant,
  variant = 'list',
  onRemove,
  onEdit,
  index = 0,
}: Props) {
  if (variant === 'reveal') {
    return (
      <motion.div
        initial={{ y: 200, opacity: 0, scale: 0.5, rotateX: 45 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          mass: 1.2,
        }}
        className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl ${GLOW_COLORS[restaurant.rarity]}`}
        style={{ perspective: 1000 }}
      >
        {/* Rarity glow ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: `0 0 60px 20px ${getRarityColor(restaurant.rarity)}`,
          }}
        />

        <motion.div
          className="text-7xl mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        >
          {restaurant.emoji}
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-white mb-3 font-[Outfit]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {restaurant.name}
        </motion.h2>

        <RarityBadge rarity={restaurant.rarity} size="md" animate />
      </motion.div>
    );
  }

  // List variant
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative flex items-center gap-3 rounded-xl border border-white/5 border-l-4 ${BORDER_COLORS[restaurant.rarity]} bg-white/[0.03] backdrop-blur-sm p-3 hover:bg-white/[0.06] transition-colors`}
    >
      <span className="text-2xl shrink-0">{restaurant.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{restaurant.name}</p>
        <RarityBadge rarity={restaurant.rarity} />
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Edit restaurant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Remove restaurant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.751-2.689l1.005-11.36.149.022a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: 'rgba(148,163,184,0.15)',
    uncommon: 'rgba(52,211,153,0.25)',
    rare: 'rgba(96,165,250,0.3)',
    epic: 'rgba(168,85,247,0.35)',
    legendary: 'rgba(251,191,36,0.4)',
  };
  return colors[rarity];
}
