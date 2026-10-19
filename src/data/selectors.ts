import { Condition, Exercise, AppliesToCondition, ConditionContextOverride } from '../types/exercise';
import { allConditions, allExercises, conditionMap, exerciseMap } from './exercises';

export interface ConditionExerciseItem {
  exercise: Exercise;
  basis: string;
  phases: string[];
}

export interface PhaseGroup {
  phase: string;
  items: ConditionExerciseItem[];
}

// 1. Get conditions filtered by region
export const conditionsByRegion = (region?: string): Condition[] => {
  if (!region || region === 'ALL') {
    return allConditions.filter(c => !c.isPlaceholder);
  }
  return allConditions.filter(c => !c.isPlaceholder && c.region === region);
};

// 2. Get single condition
export const getConditionById = (id: string): Condition | undefined => {
  if (!id) return undefined;
  const direct = conditionMap.get(id);
  if (direct) return direct;
  const clean = id.toLowerCase().trim();
  return allConditions.find(c => c.id.toLowerCase() === clean);
};

// Character normalizer for robust bilingual search
const normalizeQuery = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Full-width to half-width alphanumeric & punctuation
    .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    // Common Simplified to Traditional variants in medical terminology
    .replace(/关节/g, '關節')
    .replace(/韧带/g, '韌帶')
    .replace(/髌/g, '髕')
    .replace(/肌腱炎/g, '肌腱炎')
    .replace(/术后/g, '術後')
    // Vernacular equivalents mapping
    .replace(/膝蓋痛/g, '膝痛')
    .replace(/膝蓋/g, '膝')
    .replace(/跑步後小腿前面痛/g, '小腿前面痛')
    .replace(/腳跟痛/g, '足底筋膜病變');
};

// 3. Search conditions with intelligent ranking
export const searchConditions = (query: string): Condition[] => {
  const q = normalizeQuery(query);
  if (!q) return allConditions.filter(c => !c.isPlaceholder);

  const scored: { condition: Condition; score: number }[] = [];

  for (const c of allConditions) {
    if (c.isPlaceholder) continue;

    const normZh = normalizeQuery(c.nameZh);
    const normEn = normalizeQuery(c.nameEn);
    const aliases = (c.aliases || []).map(a => normalizeQuery(a));

    let maxScore = 0;

    // Exact matches
    if (normZh === q || normEn === q || aliases.some(a => a === q)) {
      maxScore = Math.max(maxScore, 100);
    }
    // Starts with
    else if (normZh.startsWith(q) || normEn.startsWith(q) || aliases.some(a => a.startsWith(q))) {
      maxScore = Math.max(maxScore, 60);
    }
    // Substring contains
    else if (normZh.includes(q) || normEn.includes(q) || aliases.some(a => a.includes(q))) {
      maxScore = Math.max(maxScore, 30);
    }
    // Keyword tokens
    else {
      const tokens = q.split(/\s+/).filter(Boolean);
      const allText = `${normZh} ${normEn} ${aliases.join(' ')}`;
      const matchesAll = tokens.every(token => allText.includes(token));
      if (matchesAll) {
        maxScore = Math.max(maxScore, 15);
      }
    }

    if (maxScore > 0) {
      scored.push({ condition: c, score: maxScore });
    }
  }

  // Sort descending by score, then alphabetical
  scored.sort((a, b) => b.score - a.score || a.condition.nameZh.localeCompare(b.condition.nameZh, 'zh-Hant'));
  return scored.map(s => s.condition);
};

// Helper: Apply conditionContext overrides to an exercise
export const applyConditionContext = (exercise: Exercise, conditionId: string): Exercise => {
  if (!exercise.conditionContext || !exercise.conditionContext[conditionId]) {
    return exercise;
  }

  const override = exercise.conditionContext[conditionId];
  return {
    ...exercise,
    execution: {
      ...exercise.execution,
      startingPosition: override.startingPosition || exercise.execution.startingPosition,
      description: override.description || exercise.execution.description,
      coachingCues: override.coachingCues || exercise.execution.coachingCues,
      commonErrors: override.precautions || exercise.execution.commonErrors
    },
    precautions: override.precautions || exercise.precautions,
    regressions: (override.regressions as any) || exercise.regressions,
    progressions: (override.progressions as any) || exercise.progressions,
    dosage: override.dosage ? { ...exercise.dosage, ...override.dosage } : exercise.dosage
  };
};

const STANDARD_PHASES = [
  'Phase 1: 急性保護/神經肌肉活化',
  'Phase 2: 次急性控制負荷',
  'Phase 3: 後期肌力與肥大強化',
  'Phase 4: 增強式與重返運動'
];

const DIFFICULTY_ORDER: Record<string, number> = {
  'Beginner (初階)': 1,
  'Intermediate (中階)': 2,
  'Advanced (進階)': 3
};

// 4. Get exercises for condition grouped by phase
export const exercisesForCondition = (conditionId: string): PhaseGroup[] => {
  if (!conditionId) return [];

  // Match all exercises that apply to this condition
  const matchedItems: { exercise: Exercise; basis: string; phase: string }[] = [];

  for (const ex of allExercises) {
    const app = ex.appliesTo?.find(a => a.conditionId === conditionId);
    if (app) {
      const customizedEx = applyConditionContext(ex, conditionId);
      const phases = app.rehabPhase && app.rehabPhase.length > 0 ? app.rehabPhase : [STANDARD_PHASES[0]];
      
      for (const p of phases) {
        matchedItems.push({
          exercise: customizedEx,
          basis: app.basis,
          phase: p
        });
      }
    }
  }

  // Group by phase
  const groups: PhaseGroup[] = [];

  for (const phaseName of STANDARD_PHASES) {
    const phaseItems = matchedItems.filter(item => item.phase === phaseName);
    if (phaseItems.length > 0) {
      // Sort within phase: mentioned first or primary first?
      // Master prompt says: "依難度由易到難；mentioned 排前並標「文中提及」"
      phaseItems.sort((a, b) => {
        // mentioned comes first if required by prompt
        if (a.basis === 'mentioned' && b.basis !== 'mentioned') return -1;
        if (b.basis === 'mentioned' && a.basis !== 'mentioned') return 1;

        const diffA = DIFFICULTY_ORDER[a.exercise.difficulty] || 2;
        const diffB = DIFFICULTY_ORDER[b.exercise.difficulty] || 2;
        return diffA - diffB;
      });

      groups.push({
        phase: phaseName,
        items: phaseItems.map(pi => ({
          exercise: pi.exercise,
          basis: pi.basis,
          phases: [pi.phase]
        }))
      });
    }
  }

  return groups;
};

// 5. Generic Ankle Library
export const genericAnkleLibrary = (): Exercise[] => {
  return allExercises.filter(ex => ex.library === 'generic-ankle');
};

// 6. Generic exercises suggested for a condition
export const suggestedExercisesForCondition = (conditionId: string): Exercise[] => {
  return allExercises.filter(ex => 
    ex.suggestedConditions && ex.suggestedConditions.includes(conditionId)
  );
};

// 7. General search over all exercises
export const searchExercises = (query: string): Exercise[] => {
  const q = normalizeQuery(query);
  if (!q) return allExercises;

  return allExercises.filter(ex => {
    const matchName = normalizeQuery(ex.name).includes(q);
    const matchChinese = normalizeQuery(ex.chineseName).includes(q);
    const matchMuscles = ex.biomechanics.primaryMuscles.some(m => normalizeQuery(m).includes(q));
    const matchPathologies = ex.targetPathologies.some(p => normalizeQuery(p).includes(q));
    const matchEquipment = ex.equipment.some(eq => normalizeQuery(eq).includes(q));
    return matchName || matchChinese || matchMuscles || matchPathologies || matchEquipment;
  });
};

export interface ExerciseFilterCriteria {
  region?: 'all' | 'ankle' | 'knee' | 'hip';
  movementTypes?: string[];
  rehabPhases?: string[];
  equipment?: string[];
  difficulty?: string;
  kineticChain?: string;
  search?: string;
}

const REGION_MAP: Record<string, string> = {
  ankle: 'Ankle & Foot',
  knee: 'Knee',
  hip: 'Hip & Pelvis'
};

// 8. Filter exercises strictly according to criteria
export const filterExercises = (criteria: ExerciseFilterCriteria, pool: Exercise[] = allExercises): Exercise[] => {
  return pool.filter(ex => {
    // 1. Region filter
    if (criteria.region && criteria.region !== 'all') {
      const targetSub = REGION_MAP[criteria.region];
      if (targetSub && ex.subRegion !== targetSub) {
        return false;
      }
    }

    // 2. Search keyword
    if (criteria.search && criteria.search.trim()) {
      const q = normalizeQuery(criteria.search);
      const matchName = normalizeQuery(ex.name).includes(q);
      const matchChinese = normalizeQuery(ex.chineseName).includes(q);
      const matchMuscles = ex.biomechanics.primaryMuscles.some(m => normalizeQuery(m).includes(q));
      const matchPathologies = ex.targetPathologies.some(p => normalizeQuery(p).includes(q));
      const matchEquipment = ex.equipment.some(eq => normalizeQuery(eq).includes(q));
      if (!matchName && !matchChinese && !matchMuscles && !matchPathologies && !matchEquipment) {
        return false;
      }
    }

    // 3. Movement types (OR within types)
    if (criteria.movementTypes && criteria.movementTypes.length > 0) {
      const hasMovement = criteria.movementTypes.some(t => ex.movementType.includes(t as any));
      if (!hasMovement) return false;
    }

    // 4. Rehab phases (OR within phases)
    if (criteria.rehabPhases && criteria.rehabPhases.length > 0) {
      const hasPhase = criteria.rehabPhases.some(p => ex.rehabPhase.includes(p as any));
      if (!hasPhase) return false;
    }

    // 5. Equipment (OR within equipment)
    if (criteria.equipment && criteria.equipment.length > 0) {
      const hasEquip = criteria.equipment.some(eq => ex.equipment.some(e => e.includes(eq.split(' ')[0])));
      if (!hasEquip) return false;
    }

    // 6. Difficulty
    if (criteria.difficulty && criteria.difficulty !== 'ALL') {
      if (ex.difficulty !== criteria.difficulty) return false;
    }

    // 7. Kinetic Chain
    if (criteria.kineticChain && criteria.kineticChain !== 'ALL') {
      if (ex.biomechanics.kineticChain !== criteria.kineticChain) return false;
    }

    return true;
  });
};

// 9. Count exercises per region under current OTHER criteria
export const countByRegion = (criteria: Omit<ExerciseFilterCriteria, 'region'>, pool: Exercise[] = allExercises): Record<'all' | 'ankle' | 'knee' | 'hip', number> => {
  const basePool = filterExercises({ ...criteria, region: 'all' }, pool);
  
  let ankle = 0;
  let knee = 0;
  let hip = 0;

  for (const ex of basePool) {
    if (ex.subRegion === 'Ankle & Foot') ankle++;
    else if (ex.subRegion === 'Knee') knee++;
    else if (ex.subRegion === 'Hip & Pelvis') hip++;
  }

  return {
    all: basePool.length,
    ankle,
    knee,
    hip
  };
};

