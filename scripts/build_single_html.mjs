import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const htmlFile = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlFile)) {
  console.error('❌ dist/index.html not found. Please run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlFile, 'utf8');

// Inline CSS
const cssMatch = html.match(/href="(\/assets\/[^"]+\.css)"/);
if (cssMatch) {
  const cssPath = path.join(distDir, cssMatch[1].replace(/^\//, ''));
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    html = html.replace(/<link rel="stylesheet"[^>]+>/, `<style>\n${cssContent}\n</style>`);
    console.log('✓ Inlined CSS bundle');
  }
}

// Inline JS
const jsMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
if (jsMatch) {
  const jsPath = path.join(distDir, jsMatch[1].replace(/^\//, ''));
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const safeJs = jsContent.replace(/<\/script>/gi, '<\\/script>');
    html = html.replace(/<script type="module"[^>]+><\/script>/, `<script type="module">\n${safeJs}\n</script>`);
    console.log('✓ Inlined JavaScript bundle');
  }
}

// Write to dist and project root
const outDist = path.join(distDir, 'physio_bank_standalone.html');
const outRoot = path.join(projectRoot, 'physio_bank_standalone.html');

fs.writeFileSync(outDist, html, 'utf8');
fs.writeFileSync(outRoot, html, 'utf8');

console.log(`🎉 Successfully generated Standalone Single-File HTML!`);
console.log(`📁 Saved to:`);
console.log(`   1. ${outRoot}`);
console.log(`   2. ${outDist}`);
console.log(`📦 File size: ${(fs.statSync(outRoot).size / 1024 / 1024).toFixed(2)} MB`);
