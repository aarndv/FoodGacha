import type { Restaurant, PullWeights, Rarity, PullResult } from './types';
import { RARITIES, RARITY_RANK, RARITY_XP, PITY_THRESHOLD } from './types';

/**
 * Weighted random selection engine with pity support.
 *
 * 1. Groups restaurants by rarity.
 * 2. If pity is triggered, forces rare+ tier.
 * 3. Normalizes weights to probabilities.
 * 4. Rolls for a tier, then uniformly picks within it.
 * 5. Skips empty tiers and redistributes weight.
 */
export function executePull(
  restaurants: Restaurant[],
  weights: PullWeights,
  pityCounter: number = 0
): PullResult | null {
  if (restaurants.length === 0) return null;

  // Group by rarity
  const grouped: Partial<Record<Rarity, Restaurant[]>> = {};
  for (const r of restaurants) {
    if (!grouped[r.rarity]) grouped[r.rarity] = [];
    grouped[r.rarity]!.push(r);
  }

  const pityActive = pityCounter >= PITY_THRESHOLD;

  // Build weighted pool of available tiers only
  const availableTiers: { rarity: Rarity; weight: number }[] = [];
  for (const rarity of RARITIES) {
    if (!grouped[rarity] || grouped[rarity]!.length === 0) continue;
    if (weights[rarity] <= 0 && !pityActive) continue;

    // If pity is active, only allow rare+ tiers
    if (pityActive && RARITY_RANK[rarity] < RARITY_RANK['rare']) continue;

    const weight = pityActive
      ? (RARITY_RANK[rarity] >= RARITY_RANK['rare'] ? weights[rarity] || 1 : 0)
      : weights[rarity];

    if (weight > 0) {
      availableTiers.push({ rarity, weight });
    }
  }

  // Fallback: if pity is active but no rare+ restaurants exist, use all tiers
  if (availableTiers.length === 0) {
    for (const rarity of RARITIES) {
      if (grouped[rarity] && grouped[rarity]!.length > 0 && weights[rarity] > 0) {
        availableTiers.push({ rarity, weight: weights[rarity] });
      }
    }
  }

  if (availableTiers.length === 0) return null;

  // Compute total weight
  const totalWeight = availableTiers.reduce((sum, t) => sum + t.weight, 0);
  if (totalWeight <= 0) return null;

  // Roll
  let roll = Math.random() * totalWeight;
  let selectedRarity: Rarity = availableTiers[0].rarity;

  for (const tier of availableTiers) {
    roll -= tier.weight;
    if (roll <= 0) {
      selectedRarity = tier.rarity;
      break;
    }
  }

  // Pick uniformly from the selected tier
  const pool = grouped[selectedRarity]!;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: crypto.randomUUID(),
    restaurant: picked,
    timestamp: Date.now(),
    decision: null,
    xpEarned: RARITY_XP[picked.rarity],
    wasPity: pityActive && RARITY_RANK[picked.rarity] >= RARITY_RANK['rare'],
  };
}

/**
 * Compute normalized percentages for display.
 */
export function getWeightPercentages(weights: PullWeights): Record<Rarity, number> {
  const total = RARITIES.reduce((sum, r) => sum + weights[r], 0);
  if (total === 0) {
    return { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  }
  const result = {} as Record<Rarity, number>;
  for (const r of RARITIES) {
    result[r] = parseFloat(((weights[r] / total) * 100).toFixed(2));
  }
  return result;
}

/**
 * Calculate level from total XP.
 */
export function calculateLevel(xp: number, thresholds: number[]): number {
  let level = 1;
  let remaining = xp;
  for (const threshold of thresholds) {
    if (remaining >= threshold) {
      remaining -= threshold;
      level++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * XP progress within current level (0-1).
 */
export function xpProgress(xp: number, thresholds: number[]): { current: number; needed: number; fraction: number } {
  let remaining = xp;
  for (let i = 0; i < thresholds.length; i++) {
    if (remaining >= thresholds[i]) {
      remaining -= thresholds[i];
    } else {
      return { current: remaining, needed: thresholds[i], fraction: remaining / thresholds[i] };
    }
  }
  // Max level
  return { current: 0, needed: 0, fraction: 1 };
}
