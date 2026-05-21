# Source Directory Guidelines

## State Management
- All global state should reside in `src/hooks/useAppState.tsx`.
- Use the `useAppActions` hook for modifying state to maintain a clean interface.
- New state properties must be added to `AppState` in `src/types.ts` and initialized in `getInitialState`.
- Persistence is handled via `useEffect` hooks in `AppProvider` calling `saveToStorage`.

## Components
- Components should be modular and located in `src/components/`.
- Use Framer Motion for animations.
- Prefer Tailwind CSS for styling.
- UI components should be consistent with the dark theme and rarity colors.

## Gacha Logic
- Any modifications to the pull logic should be made in `src/gachaEngine.ts`.
- Ensure `executePull` remains pure and deterministic (except for the random factor).
- Rarity tiers and weights are defined in `src/types.ts`.

## Utilities
- Use `src/utils/storage.ts` for all LocalStorage interactions.
- Add new utility functions to appropriate files in `src/utils/`.
