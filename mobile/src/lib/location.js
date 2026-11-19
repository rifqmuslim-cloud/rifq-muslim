/**
 * RIFQ Muslim - location system.
 *
 * Real device GPS -> reverse geocoding -> city/region/country/capital ->
 * coordinate-based IANA timezone. Nothing is invented: if permission is denied
 * or the provider fails, the app reports "Location unavailable" and offers an
 * explicitly-labelled manual selection.
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import tzlookup from 'tz-lookup';
import countries from '../data/countries.json';
import cities from '../data/cities.json';
import { api } from '../api';

export const MODES = { GPS: 'gps', MANUAL: 'manual', UNAVAILABLE: 'unavailable' };

export function timezoneFor(latitude, longitude) {
  try {
    return tzlookup(latitude, longitude) || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function countryByIso(iso2) {
  return countries.find((c) => c.iso2 === String(iso2 || '').toUpperCase()) || null;
}

export function countryByName(name) {
  const needle = String(name || '').toLowerCase();
  return countries.find((c) => c.name.toLowerCase() === needle) || null;
}

export function flagFor(iso2) {
  const c = countryByIso(iso2);
  if (c && c.flag) return c.flag;
  if (!iso2 || iso2.length !== 2) return '\u{1F30D}';
  return String.fromCodePoint(...iso2.toUpperCase().split('').map((ch) => 127397 + ch.charCodeAt(0)));
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

/** Offline nearest known city - clearly marked as approximate, never as GPS. */
export function nearestKnownCity(latitude, longitude) {
  let best = null;
  let bestDistance = Infinity;
  for (const city of cities) {
    const d = haversine(latitude, longitude, city.lat, city.lon);
    if (d < bestDistance) {
      bestDistance = d;
      best = city;
    }
  }
  if (!best) return null;
  return { ...best, distanceKm: Math.round(bestDistance) };
}

export function distanceBetween(a, b) {
  if (!a || !b) return Infinity;
  return haversine(a.latitude, a.longitude, b.latitude, b.longitude);
}

export async function requestPermission() {
  if (Platform.OS === 'web') {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return { granted: false, reason: 'This browser does not provide geolocation.' };
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve({ granted: true }),
        (err) =>
          resolve({
            granted: false,
            reason:
              err && err.code === 1
                ? 'Location permission was denied. You can enable it in your browser settings.'
                : 'Location could not be determined.'
          }),
        { timeout: 10000 }
      );
    });
  }
  const services = await Location.hasServicesEnabledAsync();
  if (!services) return { granted: false, reason: 'Location services (GPS) are turned off on this device.' };
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return { granted: false, reason: 'Location permission was denied. RIFQ Muslim needs it to detect your city and prayer times.' };
  }
  return { granted: true };
}

/** Current device position with accuracy metadata. */
export async function getDevicePosition() {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not available in this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? null
          }),
        (err) => reject(new Error(err && err.code === 1 ? 'permission_denied' : 'position_unavailable')),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    });
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null
  };
}

/**
 * Resolve full location information for a coordinate pair.
 * Returns { mode, city, region, district, country, countryCode, capital, flag,
 *           latitude, longitude, accuracy, timezone, provider, note, updatedAt }
 */
export async function resolveLocation({ latitude, longitude, accuracy = null, lang = 'en' }) {
  const timezone = timezoneFor(latitude, longitude);
  let place = null;
  let note = null;
  let provider = null;

  try {
    const remote = await api.reverseGeocode(latitude, longitude, lang);
    place = remote;
    provider = remote.provider || remote.source || 'remote';
    if (remote.source === 'offline_approximation') note = remote.note;
  } catch (err) {
    const near = nearestKnownCity(latitude, longitude);
    if (near) {
      const country = countryByIso(near.iso2) || countryByName(near.country);
      place = {
        city: near.name,
        region: near.region,
        country: country ? country.name : near.country,
        countryCode: country ? country.iso2 : near.iso2,
        capital: country ? country.capital : null,
        flag: country ? country.flag : null
      };
      provider = 'device_offline';
      note = `Online place lookup is unavailable. Nearest known city is ${near.name}, about ${near.distanceKm} km away - this is an approximation, not a GPS-resolved city.`;
    } else {
      throw err;
    }
  }

  const country = countryByIso(place.countryCode) || countryByName(place.country);
  return {
    mode: MODES.GPS,
    city: place.city || null,
    region: place.region || null,
    district: place.district || null,
    country: country ? country.name : place.country || null,
    countryCode: country ? country.iso2 : place.countryCode || null,
    capital: country ? country.capital : place.capital || null,
    flag: country ? country.flag : place.flag || null,
    latitude,
    longitude,
    accuracy,
    timezone,
    provider,
    note,
    updatedAt: new Date().toISOString()
  };
}

/** Full automatic flow: permission -> position -> reverse geocode. */
export async function detectLocation(lang = 'en') {
  const permission = await requestPermission();
  if (!permission.granted) {
    return { ok: false, reason: permission.reason, mode: MODES.UNAVAILABLE };
  }
  try {
    const position = await getDevicePosition();
    const info = await resolveLocation({ ...position, lang });
    return { ok: true, location: info };
  } catch (err) {
    return {
      ok: false,
      reason:
        err.message === 'permission_denied'
          ? 'Location permission was denied. You can enable it in your device settings.'
          : 'Your position could not be determined right now. Move to an open area or select your location manually.',
      mode: MODES.UNAVAILABLE
    };
  }
}

/** Explicit manual selection - always labelled as manual, never as GPS. */
export function manualLocation({ city, region, country, countryCode, latitude, longitude, timezone }) {
  const c = countryByIso(countryCode) || countryByName(country);
  const lat = typeof latitude === 'number' ? latitude : c?.latlng?.[0] ?? null;
  const lon = typeof longitude === 'number' ? longitude : c?.latlng?.[1] ?? null;
  return {
    mode: MODES.MANUAL,
    city: city || (c ? c.capital : null),
    region: region || null,
    district: null,
    country: c ? c.name : country || null,
    countryCode: c ? c.iso2 : countryCode || null,
    capital: c ? c.capital : null,
    flag: c ? c.flag : flagFor(countryCode),
    latitude: lat,
    longitude: lon,
    accuracy: null,
    timezone: timezone || (lat != null && lon != null ? timezoneFor(lat, lon) : c?.timezones?.[0] || 'UTC'),
    provider: 'manual',
    note: 'Manually selected location. Prayer times use the coordinates and timezone you chose.',
    updatedAt: new Date().toISOString()
  };
}

export function manualCityOption(city) {
  return manualLocation({
    city: city.name,
    region: city.region,
    country: city.country,
    countryCode: city.iso2,
    latitude: city.lat,
    longitude: city.lon
  });
}

export const SOMALI_CITIES = cities.filter((c) => c.iso2 === 'SO');
export const QUICK_CITIES = cities.slice(0, 24);
export { countries, cities };
