import { motion } from 'framer-motion';
import type { Restaurant, Rarity } from '../types';
import RarityBadge from './RarityBadge';

const GLOW_COLORS: Record<Rarity, string> = {
  common: 'shadow-slate-200',
  uncommon: 'shadow-emerald-100',
  rare: 'shadow-blue-100',
  epic: 'shadow-purple-100',
  legendary: 'shadow-amber-200',
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
        className={`relative rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-2xl ${GLOW_COLORS[restaurant.rarity]}`}
        style={{ perspective: 1000 }}
      >
        {/* Rarity glow ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: `0 0 60px 20px ${getRarityColor(restaurant.rarity)}`,
          }}
        />

        <div className="relative z-10">
          {restaurant.imageUrl ? (
            <motion.img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
          ) : (
            <motion.div
              className="text-7xl mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            >
              {restaurant.emoji}
            </motion.div>
          )}

          <motion.h2
            className="text-3xl font-black text-gray-900 mb-2 font-[Outfit]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {restaurant.name}
          </motion.h2>

          {restaurant.category && (
            <motion.span
              className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {restaurant.category}
            </motion.span>
          )}

          <div className="flex justify-center">
            <RarityBadge rarity={restaurant.rarity} size="md" animate />
          </div>
        </div>
      </motion.div>
    );
  }

  // List variant (Card style like reference image)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-gray-50">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">
            {restaurant.emoji}
          </div>
        )}
        
        {/* Rarity accent bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${getRarityBg(restaurant.rarity)}`} />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 truncate leading-tight">{restaurant.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <RarityBadge rarity={restaurant.rarity} />
              {restaurant.category && (
                <span className="text-[10px] font-bold text-gray-400 uppercase">{restaurant.category}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
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
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Remove restaurant"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.751-2.689l1.005-11.36.149.022a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: 'rgba(148,163,184,0.1)',
    uncommon: 'rgba(52,211,153,0.15)',
    rare: 'rgba(96,165,250,0.15)',
    epic: 'rgba(168,85,247,0.15)',
    legendary: 'rgba(251,191,36,0.2)',
  };
  return colors[rarity];
}

function getRarityBg(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: 'bg-slate-400',
    uncommon: 'bg-emerald-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500',
  };
  return colors[rarity];
}
