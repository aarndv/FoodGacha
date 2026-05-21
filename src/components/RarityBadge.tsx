import { motion } from 'framer-motion';
import type { Rarity } from '../types';
import { RARITY_LABELS, RARITY_STARS } from '../types';

const RARITY_CLASSES: Record<Rarity, string> = {
  common: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  uncommon: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

interface Props {
  rarity: Rarity;
  size?: 'sm' | 'md';
  animate?: boolean;
}

export default function RarityBadge({ rarity, size = 'sm', animate = false }: Props) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide uppercase ${sizeClasses} ${RARITY_CLASSES[rarity]}`}
    >
      <span className="opacity-80">{RARITY_STARS[rarity]}</span>
      {RARITY_LABELS[rarity]}
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
    >
      {badge}
    </motion.div>
  );
}
