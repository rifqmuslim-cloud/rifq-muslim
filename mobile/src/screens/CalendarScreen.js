/**
 * RIFQ Muslim - Hijri calendar.
 * Gregorian month grid annotated with the Hijri day, important Islamic dates and
 * the prayer times of any selected day (computed for the real location).
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Notice, Row, Screen, SectionTitle } from '../components/UI';
import { computePrayerTimes } from '../lib/prayer';
import { IMPORTANT_DAYS, hijriParts, hijriToGregorian } from '../lib/hijri';
import { spacing, radius } from '../theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const { theme, t, location, prefs, timezone, hijri, hijriNow, formatTime, now, navigate } = useApp();
  const c = theme.c;

  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const list = new Array(startWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(cursor.year, cursor.month, day, 12, 0, 0);
      list.push({ day, date, hijri: hijriParts(date, timezone) });
    }
    return list;
  }, [cursor, timezone]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const important = useMemo(() => {
    const year = hijriNow?.year || 1447;
    return IMPORTANT_DAYS.map((item) => ({
      ...item,
      date: hijriToGregorian(year, item.month, item.day, timezone)
    }))
      .filter((item) => item.date instanceof Date && !Number.isNaN(item.date.getTime()))
      .sort((a, b) => a.date - b.date);
  }, [hijriNow, timezone]);

  const selectedTimes = useMemo(() => {
    if (!selected || !location) return null;
    return computePrayerTimes({ latitude: location.latitude, longitude: location.longitude, date: selected, prefs });
  }, [selected, location, prefs]);

  const shift = (delta) => {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelected(null);
  };

  const isToday = (date) =>
    date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

  return (
    <Screen>
      <SectionTitle right={<Badge label={hijriNow ? `${hijriNow.day}/${hijriNow.month}/${hijriNow.year} AH` : 'Hijri'} tone="good" />}>
        {t('calendar')}
      </SectionTitle>

      <Card tone="gold">
        <Text style={[styles.label, { color: c.muted }]}>{t('hijriDate')}</Text>
        <Text style={[styles.hijri, { color: c.emerald }]}>{hijri}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Pressable onPress={() => shift(-1)} style={[styles.navBtn, { borderColor: c.line }]} accessibilityRole="button" accessibilityLabel="Previous month">
            <Text style={{ color: c.emerald, fontWeight: '800' }}>{'\u2039'}</Text>
          </Pressable>
          <Text style={[styles.month, { color: c.ink }]}>{monthLabel}</Text>
          <Pressable onPress={() => shift(1)} style={[styles.navBtn, { borderColor: c.line }]} accessibilityRole="button" accessibilityLabel="Next month">
            <Text style={{ color: c.emerald, fontWeight: '800' }}>{'\u203A'}</Text>
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={[styles.weekday, { color: c.muted }]}>{day}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, index) => {
            if (!cell) return <View key={`empty-${index}`} style={styles.cell} />;
            const active = isToday(cell.date);
            const isSelected = selected && selected.toDateString() === cell.date.toDateString();
            const isFriday = cell.date.getDay() === 5;
            return (
              <Pressable
                key={cell.day}
                onPress={() => setSelected(cell.date)}
                style={[
                  styles.cell,
                  (active || isSelected) && { backgroundColor: c.emeraldSoft, borderRadius: radius.sm, borderColor: c.emerald, borderWidth: 1 }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${cell.day} ${monthLabel}`}
              >
                <Text style={{ color: isFriday ? c.gold : c.ink, fontWeight: active ? '800' : '600', fontSize: 13 }}>{cell.day}</Text>
                <Text style={{ color: c.muted, fontSize: 9.5 }}>{cell.hijri ? cell.hijri.day : ''}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {selected && (
        <Card>
          <SectionTitle>{selected.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</SectionTitle>
          {!selectedTimes && (
            <Notice tone="warn" title={t('unavailable')}>
              Set your location to see prayer times for this day.
            </Notice>
          )}
          {selectedTimes && (
            <>
              <Row label={t('fajr')} value={formatTime(selectedTimes.fajr)} />
              <Row label="Sunrise" value={formatTime(selectedTimes.sunrise)} />
              <Row label={t('dhuhr')} value={formatTime(selectedTimes.dhuhr)} />
              <Row label={t('asr')} value={formatTime(selectedTimes.asr)} />
              <Row label={t('maghrib')} value={formatTime(selectedTimes.maghrib)} />
              <Row label={t('isha')} value={formatTime(selectedTimes.isha)} />
            </>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle>Important dates ({hijriNow?.year || 1447} AH)</SectionTitle>
        {important.map((item) => (
          <Row
            key={`${item.month}-${item.day}`}
            label={prefs.lang === 'ar' ? item.ar : item.en}
            value={item.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          />
        ))}
      </Card>

      <Notice tone="soft" title="Hijri calculation">
        Hijri dates are derived from the Umm al-Qura calendar and may differ by a day from local moon sighting. Friday is highlighted in gold.
      </Notice>

      {!location && (
        <Pressable onPress={() => navigate('location')} style={[styles.link, { borderColor: c.line }]}>
          <Text style={{ color: c.emerald, fontWeight: '700' }}>{t('location')} {'\u203A'}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  hijri: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  sub: { fontSize: 12, marginTop: 4 },
  navBtn: { borderWidth: 1, borderRadius: radius.pill, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 15, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginTop: spacing.md },
  weekday: { flex: 1, textAlign: 'center', fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  cell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  link: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md }
});
