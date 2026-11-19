'use strict';
/**
 * RIFQ Muslim - shared data store.
 *
 * A small, dependency-free document store that persists to a single JSON file
 * with atomic writes. It is used as the shared backend database for Android,
 * iOS and the web build: every device talks to the same server, so an account
 * created on Android sees the same profile, Quran bookmarks, tasbih records,
 * worship progress and preferences on iOS.
 *
 * Production note: the default file lives on the container filesystem. If the
 * host does not provide a persistent volume (the AppJet Free plan does not),
 * data is kept for the life of the container. Set DATA_DIR to a mounted volume
 * for durable storage. The store API is intentionally tiny so it can be
 * swapped for Postgres without touching the routes.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const EMPTY = { users: [], sessions: [], data: {}, resetCodes: {}, audit: [], meta: {} };

let db = JSON.parse(JSON.stringify(EMPTY));
let writeQueued = false;

function load() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    db = { ...JSON.parse(JSON.stringify(EMPTY)), ...parsed };
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[rifq] store: could not read db.json, starting fresh:', err.message);
    }
    db = JSON.parse(JSON.stringify(EMPTY));
  }
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('[rifq] store: write failed:', err.message);
  }
}

/** Queue one write per tick so bursts of small updates cost a single flush. */
function save() {
  if (writeQueued) return;
  writeQueued = true;
  setTimeout(() => {
    writeQueued = false;
    persist();
  }, 25);
}

load();

function getDb() {
  return db;
}

function resetDb(next) {
  db = { ...JSON.parse(JSON.stringify(EMPTY)), ...(next || {}) };
  persist();
}

/** Per-user collections that devices are allowed to sync. */
const COLLECTIONS = [
  'bookmarks', // Quran bookmarks {surah, ayah, note, createdAt}
  'lastRead', // {surah, ayah, updatedAt}
  'tasbih', // {id, dhikr, count, target, completedAt}
  'worship', // daily worship log {date, fajr..isha, quran, dhikr, fasting}
  'favorites', // saved duas / hadith / names
  'prefs', // calculation method, madhab, theme, language, notifications
  'reminders', // custom reminders
  'fasting', // Ramadan / voluntary fast log
  'quranProgress', // memorisation / reading plan progress
  'notes' // personal notes on ayahs / hadith
];

function userData(userId) {
  if (!db.data[userId]) db.data[userId] = {};
  return db.data[userId];
}

function readCollection(userId, name) {
  if (!COLLECTIONS.includes(name)) throw new Error('unknown_collection');
  const bucket = userData(userId)[name];
  if (!bucket) return { items: [], version: 0, updatedAt: null };
  return bucket;
}

function writeCollection(userId, name, items, expectedVersion) {
  if (!COLLECTIONS.includes(name)) throw new Error('unknown_collection');
  const store = userData(userId);
  const current = store[name] || { items: [], version: 0, updatedAt: null };
  if (typeof expectedVersion === 'number' && expectedVersion !== current.version) {
    return { conflict: true, ...current };
  }
  const next = {
    items,
    version: current.version + 1,
    updatedAt: new Date().toISOString()
  };
  store[name] = next;
  save();
  return next;
}

module.exports = { getDb, save, resetDb, COLLECTIONS, readCollection, writeCollection, DATA_DIR, DB_FILE, load };
