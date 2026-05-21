# FoodGacha - Project Context & Guidelines

## Overview
FoodGacha is a "gacha" style food place picker application built with React, TypeScript, and Vite. It allows users to manage a list of restaurants and "pull" for a random place to eat using a weighted random system with "pity" mechanics and leveling rewards.

## Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Language:** TypeScript 6
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/vite`)
- **Animations:** Framer Motion 12
- **State Management:** React Context + `useReducer` (Custom `useAppState` hook)
- **Persistence:** LocalStorage (via `src/utils/storage.ts`)

## Project Structure
- `src/components/`: UI components (Dashboard, PullScreen, HistoryScreen, etc.)
- `src/hooks/`: Custom hooks, primarily `useAppState.tsx` for global state.
- `src/utils/`: Utility functions, including storage management.
- `src/gachaEngine.ts`: Core logic for weighted random selection and pity.
- `src/types.ts`: TypeScript interfaces and constants.
- `public/`: Static assets like icons and favicons.

## Core Logic: Gacha Engine
The `executePull` function in `src/gachaEngine.ts` implements:
1.  **Weighted Random Selection:** Tiers (Common to Legendary) have different weights.
2.  **Pity System:** If a user doesn't get a 'rare' or higher result within 10 pulls, a rare+ tier is forced.
3.  **XP & Leveling:** Each pull earns XP based on rarity, contributing to user level.

## State Management
Global state is managed in `src/hooks/useAppState.tsx` using a reducer pattern. The state includes:
- `restaurants`: List of available places.
- `weights`: Current pull weights for each rarity.
- `pullHistory`: History of all pulls.
- `xp` & `level`: User progress.
- `virtualPoints`: Currency for rerolls.

## Styling & Theme
- The application uses a dark theme (`#0a0a1a`) with purple/pink accents.
- Tailwind CSS 4 is used for styling.
- Framer Motion is used for transitions between views and pull animations.

## Development Workflows
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
