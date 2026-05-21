import type { Restaurant, PullWeights, Rarity, PullResult } from './types';
import { RARITIES } from './types';

/**
 * Weighted random selection engine.
 *
 * 1. Groups restaurants by rarity.
 * 2. Normalizes weights to probabilities.
 * 3. Rolls for a tier, then uniformly picks within it.
 * 4. Skips empty tiers and redistributes weight.
 */
export function executePull(
  restaurants: Restaurant[],
  weights: PullWeights
): PullResult | null {
  if (restaurants.length === 0) return null;

  // Group by rarity
  const grouped: Partial<Record<Rarity, Restaurant[]>> = {};
  for (const r of restaurants) {
    if (!grouped[r.rarity]) grouped[r.rarity] = [];
    grouped[r.rarity]!.push(r);
  }

  // Build weighted pool of available tiers only
  const availableTiers: { rarity: Rarity; weight: number }[] = [];
  for (const rarity of RARITIES) {
    if (grouped[rarity] && grouped[rarity]!.length > 0 && weights[rarity] > 0) {
      availableTiers.push({ rarity, weight: weights[rarity] });
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
