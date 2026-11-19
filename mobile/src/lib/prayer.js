/**
 * RIFQ Muslim - prayer time engine.
 *
 * All times are computed from the user's real GPS coordinates with the adhan
 * library (astronomical calculation, no hardcoded city or fixed offset) and
 * formatted in the IANA timezone of the detected location, so daylight saving
 * and multi-timezone countries are handled by the platform tz database.
 */
import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Qibla,
  Madhab,
  HighLatitudeRule
} from 'adhan';

export const CALC_METHODS = [
  { id: 'MWL', label: 'Muslim World League', region: 'Europe, Far East, parts of US' },
  { id: 'ISNA', label: 'Islamic Society of North America', region: 'North America' },
  { id: 'Egypt', label: 'Egyptian General Authority', region: 'Africa, Syria, Iraq, Lebanon' },
  { id: 'Makkah', label: 'Umm al-Qura, Makkah', region: 'Arabian Peninsula' },
  { id: 'Karachi', label: 'University of Islamic Sciences, Karachi', region: 'Pakistan, India, Bangladesh' },
  { id: 'Dubai', label: 'Dubai', region: 'United Arab Emirates' },
  { id: 'Kuwait', label: 'Kuwait', region: 'Kuwait' },
  { id: 'Qatar', label: 'Qatar', region: 'Qatar' },
  { id: 'Singapore', label: 'Singapore (MUIS)', region: 'Singapore, South East Asia' },
  { id: 'Turkey', label: 'Diyanet, Turkey', region: 'Turkey' },
  { id: 'Tehran', label: 'Institute of Geophysics, Tehran', region: 'Iran' },
  { id: 'MoonsightingCommittee', label: 'Moonsighting Committee', region: 'Worldwide' }
];

const BUILDERS = {
  MWL: () => CalculationMethod.MuslimWorldLeague(),
  ISNA: () => CalculationMethod.NorthAmerica(),
  Egypt: () => CalculationMethod.Egyptian(),
  Makkah: () => CalculationMethod.UmmAlQura(),
  Karachi: () => CalculationMethod.Karachi(),
  Dubai: () => CalculationMethod.Dubai(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Qatar: () => CalculationMethod.Qatar(),
  Singapore: () => CalculationMethod.Singapore(),
  Turkey: () => CalculationMethod.Turkey(),
  Tehran: () => CalculationMethod.Tehran(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee()
};

/** Sensible default method per country (only a default - the user can change it). */
export function suggestedMethod(countryCode) {
  const map = {
    SO: 'MWL', KE: 'MWL', ET: 'MWL', DJ: 'MWL',
    SA: 'Makkah', AE: 'Dubai', KW: 'Kuwait', QA: 'Qatar', BH: 'Makkah', OM: 'Makkah', YE: 'Makkah',
    EG: 'Egypt', SD: 'Egypt', LY: 'Egypt', DZ: 'Egypt', TN: 'Egypt', MA: 'Egypt',
    PK: 'Karachi', IN: 'Karachi', BD: 'Karachi', AF: 'Karachi', LK: 'Karachi',
    US: 'ISNA', CA: 'ISNA', GB: 'MoonsightingCommittee',
    TR: 'Turkey', IR: 'Tehran', SG: 'Singapore', MY: 'Singapore', ID: 'Singapore'
  };
  return map[String(countryCode || '').toUpperCase()] || 'MWL';
}

export function buildParams(prefs = {}) {
  const builder = BUILDERS[prefs.calcMethod] || BUILDERS.MWL;
  const params = builder();
  params.madhab = prefs.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  if (prefs.highLatitude === 'seventh') params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  else if (prefs.highLatitude === 'angle') params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  else params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  return params;
}

export const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function computePrayerTimes({ latitude, longitude, date = new Date(), prefs = {} }) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  const coordinates = new Coordinates(latitude, longitude);
  const times = new PrayerTimes(coordinates, date, buildParams(prefs));
  let sunnah = null;
  try {
    sunnah = new SunnahTimes(times);
  } catch {
    sunnah = null;
  }
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    midnight: sunnah ? sunnah.middleOfTheNight : null,
    lastThird: sunnah ? sunnah.lastThirdOfTheNight : null,
    coordinates: { latitude, longitude }
  };
}

export function prayerRows(times) {
  if (!times) return [];
  return [
    { key: 'fajr', time: times.fajr },
    { key: 'sunrise', time: times.sunrise, info: true },
    { key: 'dhuhr', time: times.dhuhr },
    { key: 'asr', time: times.asr },
    { key: 'maghrib', time: times.maghrib },
    { key: 'isha', time: times.isha }
  ];
}

/** Next prayer (rolls over to tomorrow's Fajr after Isha). */
export function nextPrayer({ latitude, longitude, now = new Date(), prefs = {} }) {
  const today = computePrayerTimes({ latitude, longitude, date: now, prefs });
  if (!today) return null;
  const obligations = prayerRows(today).filter((row) => !row.info);
  for (const row of obligations) {
    if (row.time.getTime() > now.getTime()) {
      return {
        key: row.key,
        time: row.time,
        tomorrow: false,
        current: currentPrayer(today, now),
        remainingMs: row.time.getTime() - now.getTime()
      };
    }
  }
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrow = computePrayerTimes({ latitude, longitude, date: tomorrowDate, prefs });
  return {
    key: 'fajr',
    time: tomorrow ? tomorrow.fajr : null,
    tomorrow: true,
    current: currentPrayer(today, now),
    remainingMs: tomorrow ? tomorrow.fajr.getTime() - now.getTime() : null
  };
}

export function currentPrayer(times, now = new Date()) {
  const obligations = prayerRows(times).filter((row) => !row.info);
  let current = null;
  for (const row of obligations) {
    if (row.time.getTime() <= now.getTime()) current = row;
  }
  return current ? current.key : 'isha';
}

export function qiblaBearing(latitude, longitude) {
  return Qibla(new Coordinates(latitude, longitude));
}

export function formatTime(date, { timeZone, hour12 = true, withSeconds = false } = {}) {
  if (!date || Number.isNaN(date.getTime())) return '--:--';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}),
      hour12,
      timeZone: timeZone || undefined
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

export function formatDateLong(date, { timeZone, locale = 'en' } = {}) {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : locale === 'so' ? 'so' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timeZone || undefined
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function formatCountdown(ms) {
  if (ms == null || ms < 0) return '--:--:--';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Offset in minutes for an IANA zone at a given instant, plus DST detection. */
export function zoneInfo(timeZone, date = new Date()) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = fmt.formatToParts(date);
    const name = (parts.find((p) => p.type === 'timeZoneName') || {}).value || 'GMT+00:00';
    const match = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    let offsetMinutes = 0;
    if (match) {
      offsetMinutes = (Number(match[2]) * 60 + Number(match[3] || 0)) * (match[1] === '-' ? -1 : 1);
    }
    const jan = offsetFor(timeZone, new Date(Date.UTC(date.getUTCFullYear(), 0, 15, 12)));
    const jul = offsetFor(timeZone, new Date(Date.UTC(date.getUTCFullYear(), 6, 15, 12)));
    const observesDST = jan !== jul;
    const isDST = observesDST && offsetMinutes === Math.max(jan, jul);
    const sign = offsetMinutes < 0 ? '-' : '+';
    const abs = Math.abs(offsetMinutes);
    return {
      offsetMinutes,
      offsetLabel: `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`,
      observesDST,
      isDST
    };
  } catch {
    return { offsetMinutes: 0, offsetLabel: 'UTC+00:00', observesDST: false, isDST: false };
  }
}

function offsetFor(timeZone, date) {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const parts = dtf.formatToParts(date).reduce((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
    const asUTC = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour === '24' ? '00' : parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return 0;
  }
}
