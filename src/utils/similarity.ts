import { Exercise } from '../types/exercise';

export interface SimilarExerciseMatch {
  exercise: Exercise;
  score: number;
  matchingPoints: string[];
}

/**
 * Calculates similarity between a target exercise and other exercises.
 * Scoring Criteria:
 * - Same SubRegion: +30
 * - Shared Primary Muscles: +25 per shared muscle
 * - Same Kinetic Chain (OKC / CKC): +15
 * - Shared Contraction / Movement Type: +10 per shared type
 * - Shared Equipment: +10
 * - Same Difficulty: +10
 */
export function findSimilarExercises(
  target: Exercise,
  allExercises: Exercise[],
  limit = 4
): SimilarExerciseMatch[] {
  const matches: SimilarExerciseMatch[] = [];

  const targetMuscles = new Set(target.biomechanics.primaryMuscles.map(m => m.toLowerCase().trim()));
  const targetTypes = new Set(target.movementType);
  const targetEquipment = new Set(target.equipment.map(e => e.toLowerCase().trim()));

  for (const ex of allExercises) {
    if (ex.id === target.id) continue;

    let score = 0;
    const matchingPoints: string[] = [];

    // 1. SubRegion (+30)
    if (ex.subRegion === target.subRegion) {
      score += 30;
      matchingPoints.push(`同為 ${ex.subRegion} 區域`);
    }

    // 2. Primary Muscles (+25 each)
    const sharedMuscles: string[] = [];
    for (const m of ex.biomechanics.primaryMuscles) {
      if (targetMuscles.has(m.toLowerCase().trim())) {
        sharedMuscles.push(m);
        score += 25;
      }
    }
    if (sharedMuscles.length > 0) {
      matchingPoints.push(`共有肌群: ${sharedMuscles.slice(0, 2).join('、')}`);
    }

    // 3. Kinetic Chain (+15)
    if (ex.biomechanics.kineticChain && ex.biomechanics.kineticChain === target.biomechanics.kineticChain) {
      score += 15;
      matchingPoints.push(`同為 ${ex.biomechanics.kineticChain}`);
    }

    // 4. Movement Type (+10 each)
    const sharedTypes: string[] = [];
    for (const t of ex.movementType) {
      if (targetTypes.has(t)) {
        sharedTypes.push(t);
        score += 10;
      }
    }
    if (sharedTypes.length > 0) {
      matchingPoints.push(`相同收縮: ${sharedTypes[0]}`);
    }

    // 5. Equipment (+10)
    const hasSharedEquip = ex.equipment.some(e => targetEquipment.has(e.toLowerCase().trim()));
    if (hasSharedEquip) {
      score += 10;
    }

    // 6. Difficulty (+10)
    if (ex.difficulty === target.difficulty) {
      score += 10;
    }

    // Only include if score > 35 (at least same region or multiple strong clinical overlaps)
    if (score >= 40) {
      matches.push({ exercise: ex, score, matchingPoints });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit);
}
