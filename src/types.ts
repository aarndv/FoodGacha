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

export interface Restaurant {
  id: string;
  name: string;
  rarity: Rarity;
  emoji: string;
}

export interface PullResult {
  id: string;
  restaurant: Restaurant;
  timestamp: number;
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

export type View = 'dashboard' | 'pull' | 'history';

export interface AppState {
  restaurants: Restaurant[];
  weights: PullWeights;
  pullHistory: PullResult[];
  currentPull: PullResult | null;
  view: View;
  isPulling: boolean;
}

export type AppAction =
  | { type: 'ADD_RESTAURANT'; payload: Omit<Restaurant, 'id'> }
  | { type: 'REMOVE_RESTAURANT'; payload: string }
  | { type: 'EDIT_RESTAURANT'; payload: Restaurant }
  | { type: 'SET_WEIGHTS'; payload: PullWeights }
  | { type: 'EXECUTE_PULL'; payload: PullResult }
  | { type: 'SET_PULLING'; payload: boolean }
  | { type: 'CLEAR_PULL' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_VIEW'; payload: View };
