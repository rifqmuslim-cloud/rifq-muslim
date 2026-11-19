'use strict';
/**
 * RIFQ Muslim - synchronized user data (Android, iOS and web share one store).
 * Every route requires a valid token; users can only read and write their own
 * collections. Versions provide optimistic concurrency so two devices cannot
 * silently overwrite each other.
 */
const express = require('express');
const { requireAuth } = require('../auth');
const { COLLECTIONS, readCollection, writeCollection, getDb, save } = require('../store');

const router = express.Router();
router.use(requireAuth);

const MAX_ITEMS = 5000;

function sanitizeItems(name, items) {
  if (!Array.isArray(items)) return { error: 'items_must_be_array' };
  if (items.length > MAX_ITEMS) return { error: 'too_many_items' };
  const cleaned = items.slice(0, MAX_ITEMS).map((item) => {
    if (item === null || typeof item !== 'object') return { value: String(item).slice(0, 500) };
    const out = {};
    for (const [k, v] of Object.entries(item)) {
      if (typeof k !== 'string' || k.length > 60) continue;
      if (typeof v === 'string') out[k] = v.slice(0, 20000);
      else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v;
      else if (Array.isArray(v)) out[k] = v.slice(0, 500);
      else if (typeof v === 'object') out[k] = JSON.parse(JSON.stringify(v));
    }
    return out;
  });
  return { items: cleaned };
}

/** Full snapshot - used at sign-in to hydrate a new device. */
router.get('/', (req, res) => {
  const snapshot = {};
  for (const name of COLLECTIONS) snapshot[name] = readCollection(req.user.id, name);
  res.json({ userId: req.user.id, collections: snapshot });
});

router.get('/:collection', (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'unknown_collection' });
  res.json(readCollection(req.user.id, collection));
});

router.put('/:collection', (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'unknown_collection' });
  const { items, version } = req.body || {};
  const clean = sanitizeItems(collection, items);
  if (clean.error) return res.status(400).json({ error: clean.error });
  const result = writeCollection(req.user.id, collection, clean.items, typeof version === 'number' ? version : undefined);
  if (result.conflict) {
    return res.status(409).json({
      error: 'version_conflict',
      message: 'This data was changed on another device. Merge and retry.',
      server: { items: result.items, version: result.version, updatedAt: result.updatedAt }
    });
  }
  res.json(result);
});

/** Bulk merge used after sign-in or when the app comes back online. */
router.post('/bulk', (req, res) => {
  const { collections } = req.body || {};
  if (!collections || typeof collections !== 'object') return res.status(400).json({ error: 'invalid_input' });
  const results = {};
  for (const [name, payload] of Object.entries(collections)) {
    if (!COLLECTIONS.includes(name)) continue;
    const items = Array.isArray(payload) ? payload : payload && payload.items;
    const clean = sanitizeItems(name, items);
    if (clean.error) {
      results[name] = { error: clean.error };
      continue;
    }
    const next = writeCollection(req.user.id, name, clean.items);
    results[name] = { version: next.version, updatedAt: next.updatedAt, count: clean.items.length };
  }
  res.json({ ok: true, results });
});

/** Append-only activity log for worship streaks across devices. */
router.post('/worship/complete', (req, res) => {
  const { date, key, value } = req.body || {};
  if (!date || !key) return res.status(400).json({ error: 'invalid_input' });
  const current = readCollection(req.user.id, 'worship');
  const items = Array.isArray(current.items) ? [...current.items] : [];
  const index = items.findIndex((row) => row && row.date === date);
  const entry = index >= 0 ? { ...items[index] } : { date };
  entry[key] = value === undefined ? true : value;
  entry.updatedAt = new Date().toISOString();
  if (index >= 0) items[index] = entry;
  else items.push(entry);
  const sorted = items.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-400);
  const next = writeCollection(req.user.id, 'worship', sorted);
  res.json({ entry, version: next.version });
});

router.get('/meta/status', (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  res.json({ role: user.role, collections: COLLECTIONS, lastSync: new Date().toISOString() });
});

module.exports = router;
