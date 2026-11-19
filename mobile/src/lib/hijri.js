/**
 * RIFQ Muslim - Hijri calendar helpers.
 * Uses the platform ICU Umm al-Qura calendar (no hardcoded date tables), so the
 * Hijri date stays correct across years and devices.
 */
import { MONTHS_HIJRI } from '../i18n';

export function hijriParts(date = new Date(), timeZone) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: timeZone || undefined
    });
    const parts = fmt.formatToParts(date).reduce((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
    return { day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) };
  } catch {
    return null;
  }
}

export function hijriLabel(date, { timeZone, lang = 'en', withDay = true } = {}) {
  const parts = hijriParts(date, timeZone);
  if (!parts) return '';
  const months = MONTHS_HIJRI[lang] || MONTHS_HIJRI.en;
  const monthName = months[parts.month - 1] || '';
  return `${withDay ? `${parts.day} ` : ''}${monthName} ${parts.year} AH`;
}

export function isRamadan(date, timeZone) {
  const parts = hijriParts(date, timeZone);
  return !!parts && parts.month === 9;
}

/** Find the Gregorian date for a Hijri day by scanning (bounded, ~1 year). */
export function hijriToGregorian(year, month, day, timeZone) {
  const start = new Date(Date.UTC(2000, 0, 1));
  let cursor = new Date();
  cursor.setUTCHours(12, 0, 0, 0);
  for (let i = 0; i < 400; i += 1) {
    const check = new Date(cursor.getTime() + i * 86400000);
    const parts = hijriParts(check, timeZone);
    if (parts && parts.year === year && parts.month === month && parts.day === day) return check;
  }
  return null;
}

/** Gregorian month grid annotated with Hijri day numbers (for the calendar screen). */
export function monthGrid(year, month, timeZone) {
  const first = new Date(Date.UTC(year, month, 1, 12));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = first.getUTCDay();
  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(Date.UTC(year, month, d, 12));
    cells.push({ day: d, date, hijri: hijriParts(date, timeZone) });
  }
  return cells;
}

export const IMPORTANT_DAYS = [
  { month: 1, day: 1, en: 'Islamic New Year', ar: 'رأس السنة الهجرية' },
  { month: 1, day: 10, en: 'Day of Ashura', ar: 'يوم عاشوراء' },
  { month: 3, day: 12, en: 'Mawlid (12 Rabi al-Awwal)', ar: 'المولد النبوي' },
  { month: 7, day: 27, en: 'Isra and Mi\u2019raj', ar: 'الإسراء والمعراج' },
  { month: 8, day: 15, en: 'Mid-Sha\u2019ban', ar: 'ليلة النصف من شعبان' },
  { month: 9, day: 1, en: 'First day of Ramadan', ar: 'أول رمضان' },
  { month: 9, day: 27, en: 'Laylat al-Qadr (likely)', ar: 'ليلة القدر (مرجحة)' },
  { month: 10, day: 1, en: 'Eid al-Fitr', ar: 'عيد الفطر' },
  { month: 12, day: 9, en: 'Day of Arafah', ar: 'يوم عرفة' },
  { month: 12, day: 10, en: 'Eid al-Adha', ar: 'عيد الأضحى' }
];
