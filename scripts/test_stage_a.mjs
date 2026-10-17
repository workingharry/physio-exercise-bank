import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Stage A Gate Check ---');

const conditions = JSON.parse(fs.readFileSync('./src/data/conditions.json', 'utf8'));
const exercises = JSON.parse(fs.readFileSync('./src/data/exercises.v2.json', 'utf8'));

// 1. Check ID uniqueness
const condIds = new Set();
for (const c of conditions) {
  assert(!condIds.has(c.id), `Duplicate condition ID: ${c.id}`);
  condIds.add(c.id);
}
console.log(`✓ 1. Condition IDs unique (${conditions.length} conditions)`);

const exIds = new Set();
for (const e of exercises) {
  assert(!exIds.has(e.id), `Duplicate exercise ID: ${e.id}`);
  exIds.add(e.id);
}
console.log(`✓ 2. Exercise IDs unique (${exercises.length} exercises)`);

// 2. appliesTo.conditionId all exist
for (const e of exercises) {
  for (const a of e.appliesTo || []) {
    assert(condIds.has(a.conditionId), `Exercise ${e.id} references non-existent condition ${a.conditionId}`);
  }
}
console.log('✓ 3. All appliesTo.conditionId exist in conditions.json');

// 3. Each non-placeholder condition has >= 1 exercise
const condCounts = {};
for (const c of conditions) condCounts[c.id] = 0;
for (const e of exercises) {
  for (const a of e.appliesTo || []) {
    if (condCounts[a.conditionId] !== undefined) {
      condCounts[a.conditionId]++;
    }
  }
}

for (const c of conditions) {
  if (!c.isPlaceholder) {
    assert(condCounts[c.id] >= 1, `Non-placeholder condition ${c.id} has 0 exercises`);
  }
}
console.log('✓ 4. All non-placeholder conditions have >= 1 exercise');

// 4. conditionContext keys must be in appliesTo
for (const e of exercises) {
  const appConds = new Set((e.appliesTo || []).map(a => a.conditionId));
  for (const cId of Object.keys(e.conditionContext || {})) {
    assert(appConds.has(cId), `Exercise ${e.id} has conditionContext for ${cId} which is not in appliesTo`);
  }
}
console.log('✓ 5. All conditionContext keys are valid appliesTo conditions');

// 5. Test legacyIds mapping
const legacyMap = new Map();
for (const e of exercises) {
  for (const lid of e.legacyIds || []) {
    if (!legacyMap.has(lid)) {
      legacyMap.set(lid, e.id);
    }
  }
}
assert(legacyMap.size > 0, 'legacyMap should contain legacy IDs');
console.log(`✓ 6. legacyIds mapping verified (${legacyMap.size} legacy IDs tracked)`);

console.log('🎉 ALL STAGE A GATE ASSERTIONS PASSED!');
