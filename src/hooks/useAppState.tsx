import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppState, AppAction, Restaurant, PullDecision } from '../types';
import {
  DEFAULT_WEIGHTS,
  FREE_REROLLS_PER_SESSION,
  RARITY_RANK,
  DAILY_POINTS_REWARD,
  XP_THRESHOLDS,
} from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { calculateLevel } from '../gachaEngine';

/* ── Default starter restaurants ─────────────────────────────────── */

const STARTER_RESTAURANTS: Restaurant[] = [
  { id: crypto.randomUUID(), name: "McDonald's", rarity: 'common', emoji: '🍔' },
  { id: crypto.randomUUID(), name: 'Subway', rarity: 'common', emoji: '🥪' },
  { id: crypto.randomUUID(), name: 'Pizza Hut', rarity: 'common', emoji: '🍕' },
  { id: crypto.randomUUID(), name: 'KFC', rarity: 'common', emoji: '🍗' },
  { id: crypto.randomUUID(), name: 'Taco Bell', rarity: 'uncommon', emoji: '🌮' },
  { id: crypto.randomUUID(), name: 'Panda Express', rarity: 'uncommon', emoji: '🥡' },
  { id: crypto.randomUUID(), name: 'Chipotle', rarity: 'uncommon', emoji: '🌯' },
  { id: crypto.randomUUID(), name: 'Olive Garden', rarity: 'rare', emoji: '🍝' },
  { id: crypto.randomUUID(), name: 'Red Lobster', rarity: 'rare', emoji: '🦞' },
  { id: crypto.randomUUID(), name: 'Nobu', rarity: 'epic', emoji: '🍣' },
  { id: crypto.randomUUID(), name: 'The French Laundry', rarity: 'legendary', emoji: '👨‍🍳' },
];

/* ── Today helper ────────────────────────────────────────────────── */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Initial state ───────────────────────────────────────────────── */

function getInitialState(): AppState {
  const storedXp = loadFromStorage<number>('xp', 0);
  return {
    restaurants: loadFromStorage('restaurants', STARTER_RESTAURANTS),
    weights: loadFromStorage('weights', DEFAULT_WEIGHTS),
    pullHistory: loadFromStorage('pullHistory', []),
    currentPull: null,
    view: 'pull',
    isPulling: false,

    pityCounter: loadFromStorage('pityCounter', 0),

    freeRerolls: FREE_REROLLS_PER_SESSION,
    rerollsUsed: 0,

    xp: storedXp,
    level: calculateLevel(storedXp, XP_THRESHOLDS),

    virtualPoints: loadFromStorage('virtualPoints', 0),
    lastDailyClaimDate: loadFromStorage('lastDailyClaimDate', null),

    activeCategoryFilter: null,
    theme: loadFromStorage('theme', 'system'),
    accentColor: loadFromStorage('accentColor', 'amber'),
    restaurantLayout: loadFromStorage('restaurantLayout', 'grid'),
  };
}

/* ── Reducer ─────────────────────────────────────────────────────── */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_RESTAURANT':
      return {
        ...state,
        restaurants: [
          ...state.restaurants,
          { ...action.payload, id: crypto.randomUUID() },
        ],
      };

    case 'REMOVE_RESTAURANT':
      return {
        ...state,
        restaurants: state.restaurants.filter((r) => r.id !== action.payload),
      };

    case 'EDIT_RESTAURANT':
      return {
        ...state,
        restaurants: state.restaurants.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'SET_WEIGHTS':
      return { ...state, weights: action.payload };

    case 'EXECUTE_PULL': {
      const pull = action.payload;
      const isHighTier = RARITY_RANK[pull.restaurant.rarity] >= RARITY_RANK['rare'];
      const newXp = state.xp + pull.xpEarned;
      return {
        ...state,
        currentPull: pull,
        pullHistory: [pull, ...state.pullHistory],
        isPulling: true,
        pityCounter: isHighTier ? 0 : state.pityCounter + 1,
        xp: newXp,
        level: calculateLevel(newXp, XP_THRESHOLDS),
      };
    }

    case 'SET_PULLING':
      return { ...state, isPulling: action.payload };

    case 'DECIDE_PULL': {
      if (!state.currentPull) return state;
      const updated = { ...state.currentPull, decision: action.payload };
      return {
        ...state,
        currentPull: updated,
        pullHistory: state.pullHistory.map((p) =>
          p.id === updated.id ? updated : p
        ),
      };
    }

    case 'REROLL': {
      // Replace current pull with new one, keep old in history as "rerolled"
      const newPull = action.payload;
      const isHighTier = RARITY_RANK[newPull.restaurant.rarity] >= RARITY_RANK['rare'];
      const newXp = state.xp + newPull.xpEarned;
      return {
        ...state,
        currentPull: newPull,
        pullHistory: [newPull, ...state.pullHistory],
        freeRerolls: state.freeRerolls > 0 ? state.freeRerolls - 1 : state.freeRerolls,
        rerollsUsed: state.rerollsUsed + 1,
        pityCounter: isHighTier ? 0 : state.pityCounter + 1,
        xp: newXp,
        level: calculateLevel(newXp, XP_THRESHOLDS),
      };
    }

    case 'CLAIM_DAILY_POINTS':
      return {
        ...state,
        virtualPoints: state.virtualPoints + DAILY_POINTS_REWARD,
        lastDailyClaimDate: todayISO(),
      };

    case 'SPEND_POINTS':
      return {
        ...state,
        virtualPoints: Math.max(0, state.virtualPoints - action.payload),
      };

    case 'CLEAR_PULL':
      return { ...state, currentPull: null, isPulling: false };

    case 'CLEAR_HISTORY':
      return { ...state, pullHistory: [] };

    case 'SET_VIEW':
      return { ...state, view: action.payload, currentPull: null, isPulling: false };

    case 'SET_CATEGORY_FILTER':
      return { ...state, activeCategoryFilter: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_ACCENT_COLOR':
      return { ...state, accentColor: action.payload };

    case 'SET_RESTAURANT_LAYOUT':
      return { ...state, restaurantLayout: action.payload };

    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────── */

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Sync to localStorage on relevant state changes
  useEffect(() => {
    saveToStorage('restaurants', state.restaurants);
  }, [state.restaurants]);

  useEffect(() => {
    saveToStorage('weights', state.weights);
  }, [state.weights]);

  useEffect(() => {
    saveToStorage('pullHistory', state.pullHistory);
  }, [state.pullHistory]);

  useEffect(() => {
    saveToStorage('pityCounter', state.pityCounter);
  }, [state.pityCounter]);

  useEffect(() => {
    saveToStorage('xp', state.xp);
  }, [state.xp]);

  useEffect(() => {
    saveToStorage('virtualPoints', state.virtualPoints);
  }, [state.virtualPoints]);

  useEffect(() => {
    saveToStorage('lastDailyClaimDate', state.lastDailyClaimDate);
  }, [state.lastDailyClaimDate]);

  useEffect(() => {
    saveToStorage('theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    saveToStorage('accentColor', state.accentColor);
  }, [state.accentColor]);

  useEffect(() => {
    saveToStorage('restaurantLayout', state.restaurantLayout);
  }, [state.restaurantLayout]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppActions() {
  const { dispatch } = useAppState();

  const addRestaurant = useCallback(
    (restaurant: Omit<Restaurant, 'id'>) =>
      dispatch({ type: 'ADD_RESTAURANT', payload: restaurant }),
    [dispatch]
  );

  const removeRestaurant = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_RESTAURANT', payload: id }),
    [dispatch]
  );

  const editRestaurant = useCallback(
    (restaurant: Restaurant) =>
      dispatch({ type: 'EDIT_RESTAURANT', payload: restaurant }),
    [dispatch]
  );

  const setWeights = useCallback(
    (weights: AppState['weights']) =>
      dispatch({ type: 'SET_WEIGHTS', payload: weights }),
    [dispatch]
  );

  const executePullAction = useCallback(
    (result: AppState['currentPull']) => {
      if (result) dispatch({ type: 'EXECUTE_PULL', payload: result });
    },
    [dispatch]
  );

  const setPulling = useCallback(
    (pulling: boolean) =>
      dispatch({ type: 'SET_PULLING', payload: pulling }),
    [dispatch]
  );

  const decidePull = useCallback(
    (decision: PullDecision) =>
      dispatch({ type: 'DECIDE_PULL', payload: decision }),
    [dispatch]
  );

  const reroll = useCallback(
    (newResult: AppState['currentPull']) => {
      if (newResult) dispatch({ type: 'REROLL', payload: newResult });
    },
    [dispatch]
  );

  const claimDailyPoints = useCallback(
    () => dispatch({ type: 'CLAIM_DAILY_POINTS' }),
    [dispatch]
  );

  const spendPoints = useCallback(
    (amount: number) => dispatch({ type: 'SPEND_POINTS', payload: amount }),
    [dispatch]
  );

  const clearPull = useCallback(
    () => dispatch({ type: 'CLEAR_PULL' }),
    [dispatch]
  );

  const clearHistory = useCallback(
    () => dispatch({ type: 'CLEAR_HISTORY' }),
    [dispatch]
  );

  const setView = useCallback(
    (view: AppState['view']) =>
      dispatch({ type: 'SET_VIEW', payload: view }),
    [dispatch]
  );

  const setCategoryFilter = useCallback(
    (category: string | null) =>
      dispatch({ type: 'SET_CATEGORY_FILTER', payload: category }),
    [dispatch]
  );

  const setTheme = useCallback(
    (theme: AppState['theme']) =>
      dispatch({ type: 'SET_THEME', payload: theme }),
    [dispatch]
  );

  const setAccentColor = useCallback(
    (color: AppState['accentColor']) =>
      dispatch({ type: 'SET_ACCENT_COLOR', payload: color }),
    [dispatch]
  );

  const setRestaurantLayout = useCallback(
    (layout: AppState['restaurantLayout']) =>
      dispatch({ type: 'SET_RESTAURANT_LAYOUT', payload: layout }),
    [dispatch]
  );

  return {
    addRestaurant,
    removeRestaurant,
    editRestaurant,
    setWeights,
    executePullAction,
    setPulling,
    decidePull,
    reroll,
    claimDailyPoints,
    spendPoints,
    clearPull,
    clearHistory,
    setView,
    setCategoryFilter,
    setTheme,
    setAccentColor,
    setRestaurantLayout,
  };
}
