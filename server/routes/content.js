'use strict';
/**
 * RIFQ Muslim - Islamic content API.
 * Qur'an (Uthmani + Sahih International), duas, hadith, 99 names, articles,
 * Hajj guide and the country/capital dataset used by the location system.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();
const DATA = path.join(__dirname, '..', 'data');

const cache = new Map();
function readJson(name) {
  if (cache.has(name)) return cache.get(name);
  const file = path.join(DATA, `${name}.json`);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  cache.set(name, value);
  return value;
}

const DATASETS = ['duas', 'hadiths', 'names', 'articles', 'hajj', 'cities'];

router.get('/list', (req, res) => {
  res.json({ datasets: DATASETS });
});

router.get('/countries', (req, res) => {
  const countries = readJson('countries');
  const q = String(req.query.q || '').trim().toLowerCase();
  const list = q
    ? countries.filter((c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase() === q || (c.capital || '').toLowerCase().includes(q))
    : countries;
  res.json({ count: list.length, countries: list });
});

/** Sūrah index (metadata only - small payload for the reader list). */
router.get('/surahs', (req, res) => {
  const quran = readJson('quran');
  res.json({
    source: quran.source,
    surahs: quran.surahs.map((s) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      revelationType: s.revelationType,
      ayahCount: s.ayahCount
    }))
  });
});

router.get('/surah/:number', (req, res) => {
  const quran = readJson('quran');
  const number = Number(req.params.number);
  const surah = quran.surahs.find((s) => s.number === number);
  if (!surah) return res.status(404).json({ error: 'surah_not_found' });
  res.json(surah);
});

router.get('/ayah/:surah/:ayah', (req, res) => {
  const quran = readJson('quran');
  const surah = quran.surahs.find((s) => s.number === Number(req.params.surah));
  const ayah = surah && surah.ayahs.find((a) => a.n === Number(req.params.ayah));
  if (!ayah) return res.status(404).json({ error: 'ayah_not_found' });
  res.json({ surah: surah.number, surahName: surah.name, englishName: surah.englishName, ...ayah });
});

router.get('/:dataset', (req, res) => {
  const { dataset } = req.params;
  if (!DATASETS.includes(dataset)) return res.status(404).json({ error: 'unknown_dataset' });
  try {
    res.json(readJson(dataset));
  } catch (err) {
    res.status(500).json({ error: 'dataset_unavailable', dataset });
  }
});

module.exports = router;
