import { motion } from 'framer-motion';
import type { Rarity } from '../types';
import { RARITY_LABELS, RARITY_STARS } from '../types';

const RARITY_CLASSES: Record<Rarity, string> = {
  common: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-500 dark:text-slate-300 border-slate-500/20 dark:border-slate-500/40',
  uncommon: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/40',
  rare: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/20 dark:border-blue-500/40',
  epic: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/20 dark:border-purple-500/40',
  legendary: 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border-brand-500/20 dark:border-brand-500/40',
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
