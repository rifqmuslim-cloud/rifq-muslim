'use strict';
/**
 * RIFQ Muslim - worldwide location services.
 *
 * Reverse geocoding uses real coordinates supplied by the device. Provider
 * order: BigDataCloud (no key required) -> OpenStreetMap Nominatim. Results are
 * enriched with the official capital, ISO code, flag and IANA timezone from the
 * bundled country dataset so the app never confuses the user's current city
 * with their country's capital.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const { rateLimit } = require('../auth');

const router = express.Router();
const DATA = path.join(__dirname, '..', 'data');
const UA = 'RIFQMuslim/1.0 (Islamic companion app; contact: developer)';

let countryCache = null;
function countries() {
  if (!countryCache) countryCache = JSON.parse(fs.readFileSync(path.join(DATA, 'countries.json'), 'utf8'));
  return countryCache;
}
function countryByIso(iso2) {
  return countries().find((c) => c.iso2 === String(iso2 || '').toUpperCase()) || null;
}
function countryByName(name) {
  const needle = String(name || '').toLowerCase();
  return countries().find((c) => c.name.toLowerCase() === needle) || null;
}

const geoCache = new Map();
function cached(key) {
  const hit = geoCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  geoCache.delete(key);
  return null;
}
function remember(key, value, ttlMs = 60 * 60 * 1000) {
  if (geoCache.size > 5000) geoCache.clear();
  geoCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

function validCoord(lat, lon) {
  const a = Number(lat);
  const b = Number(lon);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a < -90 || a > 90 || b < -180 || b > 180) return null;
  return { lat: a, lon: b };
}

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`status_${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function bigDataCloud(lat, lon, lang) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${encodeURIComponent(lang || 'en')}`;
  const data = await fetchJson(url);
  const city = data.city || data.locality || data.principalSubdivision || null;
  return {
    provider: 'bigdatacloud',
    city,
    locality: data.locality || null,
    district: data.localityInfo?.administrative?.slice(-1)?.[0]?.name || null,
    region: data.principalSubdivision || null,
    regionCode: data.principalSubdivisionCode || null,
    country: data.countryName || null,
    countryCode: data.countryCode || null,
    continent: data.continent || null,
    postcode: data.postcode || null
  };
}

async function nominatimReverse(lat, lon, lang) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=${encodeURIComponent(lang || 'en')}&zoom=14&addressdetails=1`;
  const data = await fetchJson(url);
  const a = data.address || {};
  return {
    provider: 'nominatim',
    city: a.city || a.town || a.village || a.hamlet || a.municipality || a.county || null,
    locality: a.village || a.hamlet || a.suburb || a.neighbourhood || null,
    district: a.city_district || a.district || a.county || null,
    region: a.state || a.region || a.state_district || null,
    regionCode: null,
    country: a.country || null,
    countryCode: a.country_code ? a.country_code.toUpperCase() : null,
    continent: null,
    postcode: a.postcode || null,
    displayName: data.display_name || null
  };
}

/** Nearest bundled city - used only when every online provider fails. */
function offlineNearest(lat, lon) {
  try {
    const cities = JSON.parse(fs.readFileSync(path.join(DATA, 'cities.json'), 'utf8'));
    let best = null;
    let bestD = Infinity;
    for (const c of cities) {
      const d = haversine(lat, lon, c.lat, c.lon);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    if (!best) return null;
    return { city: best.name, region: best.region || null, country: best.country, countryCode: best.iso2, distanceKm: Math.round(bestD) };
  } catch {
    return null;
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

router.get('/reverse', rateLimit({ windowMs: 60000, max: 120 }), async (req, res) => {
  const coords = validCoord(req.query.lat, req.query.lon);
  if (!coords) return res.status(400).json({ error: 'invalid_coordinates' });
  const lang = String(req.query.lang || 'en').slice(0, 5);
  const key = `rev:${coords.lat.toFixed(4)}:${coords.lon.toFixed(4)}:${lang}`;
  const hit = cached(key);
  if (hit) return res.json({ ...hit, cached: true });

  let place = null;
  const errors = [];
  for (const provider of [bigDataCloud, nominatimReverse]) {
    try {
      place = await provider(coords.lat, coords.lon, lang);
      if (place && (place.country || place.city)) break;
    } catch (err) {
      errors.push(`${provider.name}:${err.message}`);
      place = null;
    }
  }

  if (!place) {
    const near = offlineNearest(coords.lat, coords.lon);
    if (!near) {
      return res.status(503).json({
        error: 'geocoder_unavailable',
        message: 'Could not identify this location right now. Select your city manually or retry.',
        errors
      });
    }
    const country = countryByIso(near.countryCode) || countryByName(near.country);
    return res.json(
      remember(key, {
        source: 'offline_approximation',
        accurate: false,
        note: `Network geocoding unavailable - nearest known city is ${near.city} (about ${near.distanceKm} km away).`,
        city: near.city,
        region: near.region,
        country: country ? country.name : near.country,
        countryCode: country ? country.iso2 : near.countryCode,
        capital: country ? country.capital : null,
        flag: country ? country.flag : null,
        timezone: country ? country.timezones[0] : null,
        latitude: coords.lat,
        longitude: coords.lon
      }, 5 * 60 * 1000)
    );
  }

  const country = countryByIso(place.countryCode) || countryByName(place.country);
  const payload = {
    source: 'gps',
    accurate: true,
    provider: place.provider,
    city: place.city || place.locality || (country ? country.capital : null),
    locality: place.locality || null,
    district: place.district || null,
    region: place.region || null,
    regionCode: place.regionCode || null,
    country: country ? country.name : place.country,
    countryCode: country ? country.iso2 : place.countryCode,
    capital: country ? country.capital : null,
    flag: country ? country.flag : null,
    continent: place.continent || (country ? country.region : null),
    latitude: coords.lat,
    longitude: coords.lon,
    postcode: place.postcode || null,
    displayName: place.displayName || null
  };
  remember(key, payload);
  res.json(payload);
});

router.get('/search', rateLimit({ windowMs: 60000, max: 90 }), async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'query_too_short' });
  const lang = String(req.query.lang || 'en').slice(0, 5);
  const key = `search:${q.toLowerCase()}:${lang}`;
  const hit = cached(key);
  if (hit) return res.json({ ...hit, cached: true });
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&addressdetails=1&accept-language=${encodeURIComponent(lang)}&q=${encodeURIComponent(q)}`;
    const rows = await fetchJson(url);
    const results = (rows || []).map((row) => {
      const a = row.address || {};
      const country = countryByIso(a.country_code) || countryByName(a.country);
      return {
        label: row.display_name,
        city: a.city || a.town || a.village || a.municipality || a.county || row.name,
        region: a.state || a.region || null,
        country: country ? country.name : a.country,
        countryCode: country ? country.iso2 : a.country_code?.toUpperCase(),
        capital: country ? country.capital : null,
        flag: country ? country.flag : null,
        latitude: Number(row.lat),
        longitude: Number(row.lon)
      };
    });
    remember(key, { results }, 30 * 60 * 1000);
    res.json({ results });
  } catch (err) {
    res.status(503).json({ error: 'search_unavailable', message: 'Location search is unavailable right now.', detail: err.message });
  }
});

/** Nearby mosques from OpenStreetMap Overpass (no API key required). */
router.get('/mosques', rateLimit({ windowMs: 60000, max: 30 }), async (req, res) => {
  const coords = validCoord(req.query.lat, req.query.lon);
  if (!coords) return res.status(400).json({ error: 'invalid_coordinates' });
  const radius = Math.min(Math.max(Number(req.query.radius) || 5000, 500), 25000);
  const key = `mosques:${coords.lat.toFixed(3)}:${coords.lon.toFixed(3)}:${radius}`;
  const hit = cached(key);
  if (hit) return res.json({ ...hit, cached: true });
  const query = `[out:json][timeout:20];(
    node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${coords.lat},${coords.lon});
    way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${coords.lat},${coords.lon});
  );out center 40;`;
  try {
    const res2 = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: `data=${encodeURIComponent(query)}`
    });
    if (!res2.ok) throw new Error(`overpass_${res2.status}`);
    const data = await res2.json();
    const places = (data.elements || [])
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat == null || lon == null) return null;
        const tags = el.tags || {};
        return {
          id: `${el.type}/${el.id}`,
          name: tags.name || tags['name:en'] || 'Mosque',
          distanceKm: Math.round(haversine(coords.lat, coords.lon, lat, lon) * 10) / 10,
          latitude: lat,
          longitude: lon,
          street: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
          city: tags['addr:city'] || null
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    const payload = { source: 'openstreetmap_overpass', radius, count: places.length, places };
    remember(key, payload, 30 * 60 * 1000);
    res.json(payload);
  } catch (err) {
    res.status(503).json({ error: 'mosque_search_unavailable', message: 'Mosque search is unavailable right now.', detail: err.message });
  }
});

module.exports = router;
