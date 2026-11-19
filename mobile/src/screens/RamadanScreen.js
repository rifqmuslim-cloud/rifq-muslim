/**
 * RIFQ Muslim - Ramadan.
 * Suhoor and iftar derived from the same computed Fajr/Maghrib, live countdown,
 * 30-day timetable and a fasting log stored in the shared worship collection.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Row, Screen, SectionTitle, Stat } from '../components/UI';
import { computePrayerTimes, formatCountdown } from '../lib/prayer';
import { hijriParts } from '../lib/hijri';
import { spacing, radius } from '../theme';

export default function RamadanScreen() {
  const { theme, t, location, prefs, formatTime, now, times, navigate, hijriNow, inRamadan, collections, upsert, removeItem, timezone } = useApp();
  const c = theme.c;
  const [showAll, setShowAll] = useState(false);

  const days = useMemo(() => {
    if (!location) return [];
    const list = [];
    const today = new Date();
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date(today.getTime() + offset * 86400000);
      const computed = computePrayerTimes({ latitude: location.latitude, longitude: location.longitude, date, prefs });
      const hijri = hijriParts(date, timezone);
      if (computed) list.push({ date, hijri, times: computed });
    }
    return list;
  }, [location, prefs, timezone]);

  const fasting = (collections.worship || []).filter((item) => item.type === 'fast');
  const todayKey = new Date().toISOString().slice(0, 10);
  const fastedToday = fasting.some((item) => item.id === `fast-${todayKey}`);

  const suhoor = times?.fajr;
  const iftar = times?.maghrib;
  const countdownTarget = now < suhoor ? suhoor : iftar;
  const remaining = countdownTarget ? countdownTarget.getTime() - now.getTime() : null;

  if (!location) {
    return (
      <Screen>
        <SectionTitle>{t('ramadan')}</SectionTitle>
        <Notice tone="warn" title={t('unavailable')}>
          Suhoor and iftar are computed from your real coordinates and timezone.
        </Notice>
        <Button label={t('location')} onPress={() => navigate('location')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle right={<Badge label={inRamadan ? 'Ramadan' : 'Outside Ramadan'} tone={inRamadan ? 'good' : 'soft'} />}>
        {t('ramadan')}
      </SectionTitle>

      <Card tone="gold">
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.label, { color: c.muted }]}>{now < suhoor ? t('suhoor') : t('iftar')}</Text>
            <Text style={[styles.big, { color: c.emerald }]}>{formatTime(countdownTarget)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.label, { color: c.muted }]}>{hijriNow ? `${hijriNow.day} Ramadan ${hijriNow.year}` : 'Hijri'}</Text>
            <Text style={[styles.countdown, { color: c.gold }]}>{formatCountdown(remaining)}</Text>
          </View>
        </View>
        <Text style={[styles.sub, { color: c.muted }]}>
          {now < suhoor ? 'Until Fajr (end of suhoor)' : 'Until Maghrib (iftar)'} {'\u00B7'} {location.city}, {location.country}
        </Text>
      </Card>

      <View style={styles.statRow}>
        <Stat label="Fasts logged" value={String(fasting.length)} hint="this account" />
        <Stat label={t('suhoor')} value={formatTime(suhoor)} hint="Fajr" />
        <Stat label={t('iftar')} value={formatTime(iftar)} hint="Maghrib" />
      </View>

      <Card>
        <SectionTitle>Today</SectionTitle>
        <Row label={t('suhoor')} value={formatTime(suhoor)} />
        <Row label={t('iftar')} value={formatTime(iftar)} />
        <Row label="Isha / Taraweeh" value={formatTime(times?.isha)} />
        <Row label="Last third of night" value={formatTime(times?.lastThird)} />
        <View style={{ marginTop: spacing.md }}>
          <Button
            label={fastedToday ? 'Fasted today \u2713 (tap to undo)' : 'Log today\u2019s fast'}
            variant={fastedToday ? 'ghost' : 'primary'}
            onPress={() =>
              fastedToday
                ? removeItem('worship', `fast-${todayKey}`)
                : upsert('worship', { id: `fast-${todayKey}`, type: 'fast', value: true, date: todayKey, at: new Date().toISOString() })
            }
          />
        </View>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>30-day timetable</SectionTitle>
          <Button label={showAll ? 'Show 7' : 'Show 30'} small variant="ghost" onPress={() => setShowAll((v) => !v)} />
        </View>
        <View style={[styles.tableRow, { borderBottomColor: c.line }]}>
          <Text style={[styles.th, { color: c.muted, flex: 1.3 }]}>Date</Text>
          <Text style={[styles.th, { color: c.muted, flex: 1, textAlign: 'center' }]}>Hijri</Text>
          <Text style={[styles.th, { color: c.muted, flex: 1, textAlign: 'center' }]}>{t('suhoor')}</Text>
          <Text style={[styles.th, { color: c.muted, flex: 1, textAlign: 'center' }]}>{t('iftar')}</Text>
        </View>
        {days.slice(0, showAll ? 30 : 7).map((entry) => (
          <View key={entry.date.toISOString()} style={[styles.tableRow, { borderBottomColor: c.line }]}>
            <Text style={[styles.td, { color: c.ink, flex: 1.3 }]}>
              {entry.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </Text>
            <Text style={[styles.td, { color: c.inkSoft, flex: 1, textAlign: 'center' }]}>{entry.hijri ? entry.hijri.day : '-'}</Text>
            <Text style={[styles.td, { color: c.inkSoft, flex: 1, textAlign: 'center' }]}>{formatTime(entry.times.fajr).replace(/\s?[AP]M/i, '')}</Text>
            <Text style={[styles.td, { color: c.inkSoft, flex: 1, textAlign: 'center' }]}>{formatTime(entry.times.maghrib).replace(/\s?[AP]M/i, '')}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle>Ramadan reminder</SectionTitle>
        <Text style={[styles.sub, { color: c.inkSoft, lineHeight: 21 }]}>
          The Prophet {'\uFDFA'} said: “Whoever fasts Ramadan out of faith and hope for reward will have his previous sins forgiven.” (Bukhari)
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  big: { fontSize: 28, fontWeight: '800' },
  countdown: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sub: { fontSize: 12, marginTop: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' },
  td: { fontSize: 12, fontVariant: ['tabular-nums'] }
});
