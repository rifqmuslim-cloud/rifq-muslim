'use strict';
/**
 * RIFQ Muslim - fill IANA timezones for the country dataset.
 *
 * world-countries does not carry timezone identifiers, so every country is given
 * the IANA zone of its capital, resolved from the capital's coordinates with
 * tz-lookup. GPS use always resolves the zone from the real coordinates; this
 * list only backs the manual picker and the offline fallback.
 *
 * Run with: node scripts/fill-timezones.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const target = path.join(root, 'mobile', 'src', 'data', 'countries.json');
const tzLookup = require(path.join(root, 'mobile', 'node_modules', 'tz-lookup'));

const countries = JSON.parse(fs.readFileSync(target, 'utf8'));

let filled = 0;
let failed = [];

for (const country of countries) {
  const coords = country.latlng;
  if (!Array.isArray(coords) || coords.length !== 2) {
    failed.push(`${country.name}: no coordinates`);
    continue;
  }
  const [lat, lon] = coords.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    failed.push(`${country.name}: invalid coordinates`);
    continue;
  }
  let zone = null;
  try {
    zone = tzLookup(lat, lon);
  } catch (error) {
    zone = null;
  }
  if (!zone) {
    failed.push(`${country.name}: no zone for capital coordinates`);
    continue;
  }
  const zones = Array.isArray(country.timezones) ? country.timezones : [];
  if (zones[0] !== zone) {
    country.timezones = [zone, ...zones.filter((z) => z !== zone)];
    filled += 1;
  }
}

fs.writeFileSync(target, JSON.stringify(countries, null, 2) + '\n');

console.log(`Updated ${filled} of ${countries.length} countries with a capital timezone.`);
const missing = countries.filter((c) => !Array.isArray(c.timezones) || c.timezones.length === 0);
console.log(`Countries still without a zone: ${missing.length}`);
if (missing.length) console.log(missing.map((c) => c.name).join(', '));
if (failed.length) {
  console.log('Notes:');
  failed.slice(0, 10).forEach((line) => console.log(`  - ${line}`));
}
