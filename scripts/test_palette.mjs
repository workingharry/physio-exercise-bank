import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- Running Palette Verification TDD (No Slate Left Behind) ---');

const TARGET_FILES = [
  'src/components/common/AnatomySvgPlaceholder.tsx',
  'src/components/common/Lightbox.tsx',
  'src/components/layout/WholeBodyNav.tsx',
  'src/components/library/CompactTableView.tsx',
  'src/components/library/DataQualityModal.tsx',
  'src/components/builder/RoutineBuilderView.tsx',
  'src/components/custom/CustomStudioView.tsx'
];

let totalViolations = 0;
const violationDetails = [];

TARGET_FILES.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.error(`File missing: ${file}`);
    totalViolations++;
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for Tailwind slate classes, e.g. bg-slate-900, text-slate-400, border-slate-700
    const matches = line.match(/(?:bg|text|border|divide|ring|from|via|to|fill|stroke)-slate-\d+/g);
    if (matches) {
      totalViolations += matches.length;
      violationDetails.push(`${file}:${idx + 1} -> ${matches.join(', ')}`);
    }
  });
});

if (totalViolations > 0) {
  console.log(`❌ RED PHASE: Found ${totalViolations} lingering slate class instances across ${TARGET_FILES.length} files:`);
  violationDetails.slice(0, 10).forEach(d => console.log('   ' + d));
  if (violationDetails.length > 10) {
    console.log(`   ... and ${violationDetails.length - 10} more.`);
  }
} else {
  console.log('✓ GREEN PHASE: 0 slate classes found! All components strictly follow Claude warm stone palette.');
}

assert.strictEqual(totalViolations, 0, `Palette test failed: ${totalViolations} slate classes remain.`);
console.log('🎉 ALL PALETTE TDD CHECKS PASSED!');
