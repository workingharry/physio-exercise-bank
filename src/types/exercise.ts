export type MacroRegion = 
  | 'Lower Limb' 
  | 'Upper Limb' 
  | 'Spine & Core' 
  | 'Full Body & Functional';

export type SubRegion =
  // Lower Limb (V1 Core)
  | 'Hip & Pelvis'
  | 'Knee'
  | 'Ankle & Foot'
  | 'Lower Limb Kinetic Chain'
  // Upper Limb (V2 Ready)
  | 'Shoulder & Scapula'
  | 'Elbow & Forearm'
  | 'Wrist & Hand'
  | 'Upper Limb Kinetic Chain'
  // Spine & Core (V3 Ready)
  | 'Cervical Spine'
  | 'Thoracic & Ribcage'
  | 'Lumbar & SIJ'
  | 'Core & Pelvic Floor'
  // Full Body (V4 Ready)
  | 'Gait & Running Mechanics'
  | 'Whole-Body Plyometrics & Agility';

export interface Condition {
  id: string;
  nameEn: string;
  nameZh: string;
  region: 'Ankle & Foot' | 'Knee' | 'Hip & Pelvis' | string;
  aliases: string[];
  bundleId: number;
  bundleSize: number;
  bundleLabel: string;
  isPlaceholder: boolean;
  nameInferred: boolean;
  mentionTagging: 'ok' | 'none' | string;
  phaseCoverage: string[];
  dataWarnings: string[];
}

export type EvidenceBasis = 'primary' | 'mentioned' | 'group' | 'suggested-pending-review' | string;

export interface AppliesToCondition {
  conditionId: string;
  basis: EvidenceBasis;
  rehabPhase: string[];
}

export interface ConditionContextOverride {
  startingPosition?: string;
  description?: string;
  coachingCues?: string[];
  precautions?: string[];
  regressions?: { name: string; rationale: string }[];
  progressions?: { name: string; rationale: string }[];
  dosage?: {
    sets?: string;
    reps?: string;
    holdDuration?: string;
    frequency?: string;
    rest?: string;
    tempo?: string;
  };
}

export interface ExecutionStep {
  stepNumber: number;
  title?: string;
  instruction: string;
  stepImageUrl?: string;
  keyPoint?: string;
}

export interface ExerciseMedia {
  thumbnailUrl: string;
  galleryUrls?: string[];
  muscleDiagramUrl?: string;
  videoUrl?: string;
  videoType?: 'local' | 'youtube' | 'gif';
}

export interface Exercise {
  id: string;
  name: string;
  chineseName: string;
  macroRegion: MacroRegion;
  subRegion: SubRegion;
  movementType: ('Isometric' | 'Concentric' | 'Eccentric' | 'Plyometric' | 'Mobility' | 'Proprioception' | 'Stability' | 'Motor Control')[];
  rehabPhase: ('Phase 1: 急性保護/神經肌肉活化' | 'Phase 2: 次急性控制負荷' | 'Phase 3: 後期肌力與肥大強化' | 'Phase 4: 增強式與重返運動' | string)[];
  targetPathologies: string[];
  equipment: string[];
  difficulty: 'Beginner (初階)' | 'Intermediate (中階)' | 'Advanced (進階)';
  media: ExerciseMedia;
  biomechanics: {
    primaryMuscles: string[];
    secondaryMuscles: string[];
    stabilizerMuscles: string[];
    planesOfMotion: ('矢狀面 (Sagittal)' | '額狀面 (Frontal)' | '水平面 (Transverse)' | '多平面 (Multi-planar)')[];
    jointActions: string[];
    kineticChain: '開放鏈 (OKC)' | '閉鎖鏈 (CKC)' | '混合鏈 (Mixed)';
  };
  description: string;
  execution: {
    startingPosition: string;
    description?: string;
    steps: ExecutionStep[];
    coachingCues: string[];
    commonErrors: string[];
  };
  regressions: { id?: string; name: string; rationale: string }[];
  progressions: { id?: string; name: string; rationale: string }[];
  dosage: {
    sets: string;
    reps: string;
    holdDuration?: string;
    frequency: string;
    rest: string;
    tempo?: string;
  };
  contraindications: string[];
  precautions: string[];
  clinicalNotes?: string;

  // PhysioBank v2 Multi-to-Multi Condition Architecture
  appliesTo?: AppliesToCondition[];
  conditionContext?: Record<string, ConditionContextOverride>;
  legacyIds?: string[];
  legacyGroups?: string[];
  library?: string;
  regions?: string[];
  contraindicationsStatus?: string;
  chineseNameIsFallback?: boolean;
  suggestedConditions?: string[];
}

export interface RehabProtocolPhase {
  phaseNumber: number;
  phaseName: string;
  timeframe: string;
  clinicalGoals: string[];
  criteriaToProgress: string[];
  exercises: string[]; // exercise IDs
}

export interface RehabProtocol {
  id: string;
  name: string;
  chineseName: string;
  subRegion: SubRegion;
  indication: string;
  durationWeeks?: string;
  guidelineReference?: string;
  phases: RehabProtocolPhase[];
  keyPrecautions?: string[];
  evidenceLevel?: string;
}

export interface RoutineItem {
  exerciseId: string;
  customSets: string;
  customReps: string;
  customHold?: string;
  therapistNotes?: string;
}
