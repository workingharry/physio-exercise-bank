import { Exercise, Condition } from '../types/exercise';
import rawExercises from './exercises.v2.json';
import rawConditions from './conditions.json';

export const allConditions: Condition[] = rawConditions as unknown as Condition[];
export const conditionMap = new Map<string, Condition>(allConditions.map(c => [c.id, c]));

// Hydrate exercises with backward-compatible targetPathologies
export const allExercises: Exercise[] = (rawExercises as unknown as Exercise[]).map(ex => {
  const targetPathologies = ex.appliesTo?.map(a => {
    const c = conditionMap.get(a.conditionId);
    return c ? (c.nameZh || c.nameEn) : a.conditionId;
  }) || [];

  return {
    ...ex,
    targetPathologies: targetPathologies.length > 0 ? targetPathologies : [ex.subRegion]
  };
});

export const lowerLimbExercises: Exercise[] = allExercises;

export const exerciseMap = new Map<string, Exercise>(allExercises.map(e => [e.id, e]));

// Legacy ID lookup map
const legacyIdMap = new Map<string, Exercise>();
for (const ex of allExercises) {
  if (ex.legacyIds) {
    for (const legacyId of ex.legacyIds) {
      if (!legacyIdMap.has(legacyId)) {
        legacyIdMap.set(legacyId, ex);
      }
    }
  }
}

export const getExerciseById = (id: string): Exercise | undefined => {
  if (!id) return undefined;
  // 1. Direct match
  const direct = exerciseMap.get(id);
  if (direct) return direct;

  // 2. Legacy ID match
  const legacy = legacyIdMap.get(id);
  if (legacy) return legacy;

  // 3. Fallback normalized match
  const normId = id.toLowerCase().trim();
  return allExercises.find(e => 
    e.id.toLowerCase() === normId || 
    (e.legacyIds && e.legacyIds.some(lid => lid.toLowerCase() === normId))
  );
};
