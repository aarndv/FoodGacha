export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const RARITY_STARS: Record<Rarity, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  epic: '★★★★',
  legendary: '★★★★★',
};

/** Numeric rank for pity comparisons. Higher = rarer. */
export const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export interface Restaurant {
  id: string;
  name: string;
  rarity: Rarity;
  emoji: string;
}

export type PullDecision = 'eat' | 'pass' | null;

export interface PullResult {
  id: string;
  restaurant: Restaurant;
  timestamp: number;
  decision: PullDecision;
  xpEarned: number;
  wasPity: boolean;
}

export interface PullWeights {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export const DEFAULT_WEIGHTS: PullWeights = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

/* ── XP & Leveling constants ─────────────────────────── */

/** XP earned per rarity pull */
export const RARITY_XP: Record<Rarity, number> = {
  common: 10,
  uncommon: 20,
  rare: 40,
  epic: 80,
  legendary: 200,
};

/** XP required for each level (index = level-1, so level 1→2 needs XP_THRESHOLDS[0]) */
export const XP_THRESHOLDS = [
  100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000,
  10000, 14000, 19000, 25000, 35000, 50000, 70000, 100000, 150000, 200000,
];

export const MAX_LEVEL = XP_THRESHOLDS.length + 1; // 21

/** Level-based unlock names shown to user */
export const LEVEL_UNLOCKS: Record<number, string> = {
  2: 'Blue flash effect',
  3: 'Pity counter display',
  5: 'Purple vortex wind-up',
  7: 'Epic screen shake',
  10: 'Gold summon background',
  15: 'Legendary confetti burst',
};

/* ── Pity & Reroll constants ─────────────────────────── */

export const PITY_THRESHOLD = 10;             // pulls without rare+ triggers pity
export const FREE_REROLLS_PER_SESSION = 2;
export const REROLL_POINT_COST = 50;          // virtual-point cost for extra rerolls
export const DAILY_POINTS_REWARD = 30;

export type View = 'dashboard' | 'pull' | 'history';

export interface AppState {
  restaurants: Restaurant[];
  weights: PullWeights;
  pullHistory: PullResult[];
  currentPull: PullResult | null;
  view: View;
  isPulling: boolean;

  /* Pity */
  pityCounter: number;        // pulls since last rare+

  /* Reroll */
  freeRerolls: number;        // remaining this session
  rerollsUsed: number;        // total rerolls this session

  /* XP & Level */
  xp: number;
  level: number;

  /* Virtual Points */
  virtualPoints: number;
  lastDailyClaimDate: string | null; // ISO date string "YYYY-MM-DD"
}

export type AppAction =
  | { type: 'ADD_RESTAURANT'; payload: Omit<Restaurant, 'id'> }
  | { type: 'REMOVE_RESTAURANT'; payload: string }
  | { type: 'EDIT_RESTAURANT'; payload: Restaurant }
  | { type: 'SET_WEIGHTS'; payload: PullWeights }
  | { type: 'EXECUTE_PULL'; payload: PullResult }
  | { type: 'SET_PULLING'; payload: boolean }
  | { type: 'DECIDE_PULL'; payload: PullDecision }
  | { type: 'REROLL'; payload: PullResult }
  | { type: 'CLAIM_DAILY_POINTS' }
  | { type: 'SPEND_POINTS'; payload: number }
  | { type: 'CLEAR_PULL' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_VIEW'; payload: View };
