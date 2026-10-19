import { 
  parseLibraryFiltersFromHash, 
  serializeLibraryFiltersToHash, 
  REGION_CODE_TO_SUBREGION, 
  SUBREGION_TO_REGION_CODE 
} from '../../hooks/useHashSearchParams.ts';
import { filterExercises, countByRegion } from '../selectors.ts';
import { allExercises } from '../exercises.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('🧪 Starting Navigation & Filter Unit Tests...');

// 1. Test Hash Roundtrip & Parsing
{
  const hash1 = '#/library?region=knee&type=Isometric&phase=1';
  const parsed1 = parseLibraryFiltersFromHash(hash1);
  assert(parsed1.region === 'knee', 'Region should be knee');
  assert(parsed1.movementTypes.includes('Isometric'), 'MovementTypes should contain Isometric');
  assert(parsed1.rehabPhases.some(p => p.includes('Phase 1')), 'RehabPhases should contain Phase 1');
  assert(parsed1.unknownParams.length === 0, 'No unknown params');

  const serialized1 = serializeLibraryFiltersToHash(parsed1);
  assert(serialized1 === '#/library?region=knee&type=Isometric&phase=1', `Serialized mismatch: ${serialized1}`);
}

// 2. Test Ankle+%26+Foot Legacy & URL encoding
{
  const hashLegacy = '#/library?subRegion=Ankle+%26+Foot';
  const parsedLegacy = parseLibraryFiltersFromHash(hashLegacy);
  assert(parsedLegacy.region === 'ankle', 'Legacy subRegion Ankle+%26+Foot should map to ankle');

  const hashEncoded = '#/library?region=ankle';
  const parsedEncoded = parseLibraryFiltersFromHash(hashEncoded);
  assert(parsedEncoded.region === 'ankle', 'region=ankle should parse to ankle');
}

// 3. Test Unknown Params & Fallbacks
{
  const hashUnknown = '#/library?region=xyz&phase=99';
  const parsedUnknown = parseLibraryFiltersFromHash(hashUnknown);
  assert(parsedUnknown.region === 'all', 'Unknown region should fallback to all');
  assert(parsedUnknown.unknownParams.includes('region=xyz'), 'unknownParams should track region=xyz');
  assert(parsedUnknown.unknownParams.includes('phase=99'), 'unknownParams should track phase=99');
}

// 4. Test Selectors: countByRegion & filterExercises
{
  // Total unfiltered counts
  const totalCounts = countByRegion({});
  assert(totalCounts.all === 373, `Total all should be 373, got ${totalCounts.all}`);
  assert(totalCounts.ankle === 133, `Ankle should be 133, got ${totalCounts.ankle}`);
  assert(totalCounts.knee === 120, `Knee should be 120, got ${totalCounts.knee}`);
  assert(totalCounts.hip === 120, `Hip should be 120, got ${totalCounts.hip}`);

  // Filtering with region=knee
  const kneeExercises = filterExercises({ region: 'knee' }, allExercises);
  assert(kneeExercises.length === 120, `Knee exercises should be 120, got ${kneeExercises.length}`);

  // Filtering with Knee + Isometric + Phase 1
  const kneeIsoP1 = filterExercises({
    region: 'knee',
    movementTypes: ['Isometric'],
    rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
  }, allExercises);
  assert(kneeIsoP1.length === 16, `Knee + Isometric + Phase 1 should be 16, got ${kneeIsoP1.length}`);

  // Counts with Isometric + Phase 1 across regions
  const dynamicCounts = countByRegion({
    movementTypes: ['Isometric'],
    rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
  }, allExercises);
  assert(dynamicCounts.knee === 16, `Dynamic count for knee should be 16, got ${dynamicCounts.knee}`);
  assert(dynamicCounts.all === dynamicCounts.ankle + dynamicCounts.knee + dynamicCounts.hip, 'Sum of region counts should equal all');
}

console.log('✅ All Navigation & Filter Unit Tests Passed Successfully!');
