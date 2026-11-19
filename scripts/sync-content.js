'use strict';
/**
 * RIFQ Muslim - content sync.
 *
 * The API serves the shared Islamic content and the country/city datasets from
 * server/data. Those files are generated from the single source of truth in
 * mobile/src/data so the app and the backend can never drift apart.
 *
 * Run with: node scripts/sync-content.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mobileData = path.join(root, 'mobile', 'src', 'data');
const serverData = path.join(root, 'server', 'data');

fs.mkdirSync(serverData, { recursive: true });

/** mobile/src/data/content.js is ESM; strip the export keywords and evaluate it. */
function loadContentModule() {
  const file = path.join(mobileData, 'content.js');
  const source = fs.readFileSync(file, 'utf8').replace(/\bexport\s+(const|function|let|var)\s+/g, '$1 ');
  const factory = new Function(
    `${source}
     return { DUAS, HADITHS, NAMES_99, ARTICLES, HAJJ_STEPS, TASBIH_PRESETS, DAILY_VERSES };`
  );
  return factory();
}

function writeJson(name, value) {
  const file = path.join(serverData, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(value, null, 1));
  const count = Array.isArray(value) ? value.length : Object.keys(value).length;
  console.log(`  ${path.relative(root, file)}  (${count} entries, ${(fs.statSync(file).size / 1024).toFixed(0)} kB)`);
}

function copyJson(from, to) {
  const value = JSON.parse(fs.readFileSync(path.join(mobileData, from), 'utf8'));
  writeJson(to, value);
}

const content = loadContentModule();

console.log('RIFQ Muslim - syncing shared content into server/data');
writeJson('duas', content.DUAS);
writeJson('hadiths', content.HADITHS);
writeJson('names', content.NAMES_99);
writeJson('articles', content.ARTICLES);
writeJson('hajj', content.HAJJ_STEPS);
writeJson('tasbih', content.TASBIH_PRESETS);
writeJson('verses', content.DAILY_VERSES);
copyJson('countries.json', 'countries');
copyJson('cities.json', 'cities');

// The Quran file is large and shipped with the backend; report it if present.
const quran = path.join(serverData, 'quran.json');
if (fs.existsSync(quran)) {
  const data = JSON.parse(fs.readFileSync(quran, 'utf8'));
  console.log(`  server/data/quran.json  (${(data.surahs || []).length} surahs, source: ${data.source || 'unknown'})`);
} else {
  console.log('  WARNING: server/data/quran.json is missing - run scripts/fetch-quran.js');
}

console.log('Done.');
