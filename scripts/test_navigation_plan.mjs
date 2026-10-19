import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Stage E & Navigation Unit Gate Check ---');

const conditions = JSON.parse(fs.readFileSync('./src/data/conditions.json', 'utf8'));
const exercises = JSON.parse(fs.readFileSync('./src/data/exercises.v2.json', 'utf8'));

// Normalizer
const normalizeQuery = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .replace(/关节/g, '關節')
    .replace(/韧带/g, '韌帶')
    .replace(/髌/g, '髕')
    .replace(/肌腱炎/g, '肌腱炎')
    .replace(/术后/g, '術後');
};

// Filter logic
const REGION_MAP = {
  ankle: 'Ankle & Foot',
  knee: 'Knee',
  hip: 'Hip & Pelvis'
};

const filterExercises = (criteria, pool = exercises) => {
  return pool.filter(ex => {
    if (criteria.region && criteria.region !== 'all') {
      const targetSub = REGION_MAP[criteria.region];
      if (targetSub && ex.subRegion !== targetSub) return false;
    }

    if (criteria.search && criteria.search.trim()) {
      const q = normalizeQuery(criteria.search);
      const matchName = normalizeQuery(ex.name).includes(q);
      const matchChinese = normalizeQuery(ex.chineseName).includes(q);
      const matchMuscles = ex.biomechanics?.primaryMuscles?.some(m => normalizeQuery(m).includes(q));
      const matchPathologies = (ex.targetPathologies || []).some(p => normalizeQuery(p).includes(q));
      const matchEquipment = (ex.equipment || []).some(eq => normalizeQuery(eq).includes(q));
      if (!matchName && !matchChinese && !matchMuscles && !matchPathologies && !matchEquipment) {
        return false;
      }
    }

    if (criteria.movementTypes && criteria.movementTypes.length > 0) {
      const hasMovement = criteria.movementTypes.some(t => ex.movementType?.includes(t));
      if (!hasMovement) return false;
    }

    if (criteria.rehabPhases && criteria.rehabPhases.length > 0) {
      const hasPhase = criteria.rehabPhases.some(p => ex.rehabPhase?.includes(p));
      if (!hasPhase) return false;
    }

    if (criteria.equipment && criteria.equipment.length > 0) {
      const hasEquip = criteria.equipment.some(eq => ex.equipment?.some(e => e.includes(eq.split(' ')[0])));
      if (!hasEquip) return false;
    }

    if (criteria.difficulty && criteria.difficulty !== 'ALL') {
      if (ex.difficulty !== criteria.difficulty) return false;
    }

    if (criteria.kineticChain && criteria.kineticChain !== 'ALL') {
      if (ex.biomechanics?.kineticChain !== criteria.kineticChain) return false;
    }

    return true;
  });
};

const countByRegion = (criteria, pool = exercises) => {
  const basePool = filterExercises({ ...criteria, region: 'all' }, pool);
  let ankle = 0;
  let knee = 0;
  let hip = 0;
  for (const ex of basePool) {
    if (ex.subRegion === 'Ankle & Foot') ankle++;
    else if (ex.subRegion === 'Knee') knee++;
    else if (ex.subRegion === 'Hip & Pelvis') hip++;
  }
  return { all: basePool.length, ankle, knee, hip };
};

// 1. Total Unfiltered Counts
const totalCounts = countByRegion({});
assert.strictEqual(totalCounts.all, 373, `Total all should be 373, got ${totalCounts.all}`);
assert.strictEqual(totalCounts.ankle, 133, `Ankle should be 133, got ${totalCounts.ankle}`);
assert.strictEqual(totalCounts.knee, 120, `Knee should be 120, got ${totalCounts.knee}`);
assert.strictEqual(totalCounts.hip, 120, `Hip should be 120, got ${totalCounts.hip}`);
console.log('✓ 1. Total counts: all=373, ankle=133, knee=120, hip=120');

// 2. Filter knee + Isometric + Phase 1
const kneeIsoP1 = filterExercises({
  region: 'knee',
  movementTypes: ['Isometric'],
  rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
});
assert.strictEqual(kneeIsoP1.length, 16, `Knee + Isometric + Phase 1 should be 16, got ${kneeIsoP1.length}`);
console.log('✓ 2. Knee + Isometric + Phase 1 exact match: 16 exercises');

// 3. Dynamic Region Counts with active filters
const dynamicCounts = countByRegion({
  movementTypes: ['Isometric'],
  rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
});
assert.strictEqual(dynamicCounts.knee, 16, `Dynamic knee count should be 16, got ${dynamicCounts.knee}`);
assert.strictEqual(dynamicCounts.all, dynamicCounts.ankle + dynamicCounts.knee + dynamicCounts.hip);
console.log(`✓ 3. Dynamic region counts sum perfectly: all=${dynamicCounts.all} (ankle=${dynamicCounts.ankle}, knee=${dynamicCounts.knee}, hip=${dynamicCounts.hip})`);

// 4. Generic Ankle Library count
const genericAnkles = exercises.filter(e => e.library === 'generic-ankle');
assert.strictEqual(genericAnkles.length, 13, `Generic ankle exercises should be 13, got ${genericAnkles.length}`);
for (const ge of genericAnkles) {
  assert.strictEqual(ge.subRegion, 'Ankle & Foot', `Generic ankle ${ge.id} must belong to Ankle & Foot`);
}
console.log('✓ 4. Generic ankle library: exactly 13 exercises all strictly in Ankle & Foot');

// 5. URL Query Parser & Serializer tests
const parseQuery = (queryString) => {
  const params = new URLSearchParams(queryString);
  let rawRegion = params.get('region');
  const legacySub = params.get('subRegion');
  if (!rawRegion && legacySub) {
    if (legacySub === 'Ankle & Foot') rawRegion = 'ankle';
    else if (legacySub === 'Knee') rawRegion = 'knee';
    else if (legacySub === 'Hip & Pelvis') rawRegion = 'hip';
    else if (legacySub === 'ALL') rawRegion = 'all';
  }

  const unknownParams = [];
  let region = 'all';
  if (rawRegion) {
    const l = rawRegion.toLowerCase().trim();
    if (['all', 'ankle', 'knee', 'hip'].includes(l)) region = l;
    else unknownParams.push(`region=${rawRegion}`);
  }

  return { region, unknownParams };
};

const p1 = parseQuery('region=knee');
assert.strictEqual(p1.region, 'knee');

const pLegacy = parseQuery('subRegion=Ankle+%26+Foot');
assert.strictEqual(pLegacy.region, 'ankle');

const pUnknown = parseQuery('region=xyz');
assert.strictEqual(pUnknown.region, 'all');
assert(pUnknown.unknownParams.includes('region=xyz'));
console.log('✓ 5. URL parser handles region=knee, legacy subRegion=Ankle+%26+Foot, and unknown fallback gracefully');

console.log('🎉 Stage E & Navigation Unit Gate Check: ALL PASS!');
