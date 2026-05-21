import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppState, AppAction, Restaurant } from '../types';
import { DEFAULT_WEIGHTS } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

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

/* ── Initial state ───────────────────────────────────────────────── */

function getInitialState(): AppState {
  return {
    restaurants: loadFromStorage('restaurants', STARTER_RESTAURANTS),
    weights: loadFromStorage('weights', DEFAULT_WEIGHTS),
    pullHistory: loadFromStorage('pullHistory', []),
    currentPull: null,
    view: 'pull',
    isPulling: false,
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

    case 'EXECUTE_PULL':
      return {
        ...state,
        currentPull: action.payload,
        pullHistory: [action.payload, ...state.pullHistory],
        isPulling: true,
      };

    case 'SET_PULLING':
      return { ...state, isPulling: action.payload };

    case 'CLEAR_PULL':
      return { ...state, currentPull: null, isPulling: false };

    case 'CLEAR_HISTORY':
      return { ...state, pullHistory: [] };

    case 'SET_VIEW':
      return { ...state, view: action.payload, currentPull: null, isPulling: false };

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

  return {
    addRestaurant,
    removeRestaurant,
    editRestaurant,
    setWeights,
    executePullAction,
    setPulling,
    clearPull,
    clearHistory,
    setView,
  };
}
