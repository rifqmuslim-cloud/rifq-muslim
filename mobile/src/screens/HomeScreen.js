/**
 * RIFQ Muslim - Home.
 * Location card (real GPS + capital + timezone + local clock), next prayer
 * countdown, today's prayer times, Hijri date and quick actions.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Row, Screen, SectionTitle, Stat } from '../components/UI';
import { formatCountdown } from '../lib/prayer';
import { spacing, radius } from '../theme';

const QUICK = [
  { key: 'qibla', glyph: '\u{1F9ED}', label: 'Qibla' },
  { key: 'quran', glyph: '\u{1F4D6}', label: 'Quran' },
  { key: 'tasbih', glyph: '\u{1F4FF}', label: 'Tasbih' },
  { key: 'duas', glyph: '\u{1F932}', label: 'Duas' },
  { key: 'ramadan', glyph: '\u{1F319}', label: 'Ramadan' },
  { key: 'calendar', glyph: '\u{1F4C5}', label: 'Calendar' },
  { key: 'mosques', glyph: '\u{1F54C}', label: 'Mosques' },
  { key: 'zakat', glyph: '\u{1F4B0}', label: 'Zakat' }
];

export default function HomeScreen() {
  const { theme, t, location, locStatus, locError, refreshLocation, navigate, prefs, times, next, rows, localTime, localDate, hijri, inRamadan, formatTime, collections } = useApp();
  const c = theme.c;

  const streak = (collections.worship || []).filter((w) => w.type === 'prayer' && w.value === true).length;
  const modeLabel =
    location?.mode === 'gps' ? t('gpsDetected') : location?.mode === 'manual' ? t('manualSelected') : t('unavailable');

  return (
    <Screen>
      {/* ---------------------------------------------------------- hero */}
      <View style={[styles.hero, { backgroundColor: c.emerald }]}>
        <Text style={styles.heroKicker}>{'\u262A'}  RIFQ MUSLIM  {'\u262A'}</Text>
        <Text style={styles.heroTitle}>{'\u0631\u0650\u0641\u0652\u0642 \u0645\u0633\u0644\u0645'}</Text>
        <Text style={styles.heroTagline}>{t('tagline')}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroHijri}>{hijri}</Text>
          <Text style={styles.heroClock}>{localTime}</Text>
        </View>
        <Text style={styles.heroDate}>{localDate}</Text>
      </View>

      {/* ------------------------------------------------------ location */}
      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>{t('location')}</SectionTitle>
          <Badge
            label={modeLabel}
            tone={location?.mode === 'gps' ? 'good' : location?.mode === 'manual' ? 'warn' : 'bad'}
          />
        </View>

        {!location && (
          <>
            <Notice tone="warn" title={t('unavailable')}>
              {locError || 'RIFQ Muslim has not detected your location yet. Prayer times need your real coordinates.'}
            </Notice>
            <View style={styles.actions}>
              <Button
                label={locStatus === 'detecting' ? '...' : t('useGps')}
                onPress={() => refreshLocation()}
                loading={locStatus === 'detecting'}
              />
              <Button label={t('manualLocation')} variant="ghost" onPress={() => navigate('location')} />
            </View>
          </>
        )}

        {location && (
          <>
            <View style={styles.cityRow}>
              <Text style={styles.flag}>{location.flag || '\u{1F30D}'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.city, { color: c.ink }]}>{location.city || t('unavailable')}</Text>
                <Text style={[styles.sub, { color: c.muted }]}>
                  {[location.district, location.region, location.country].filter(Boolean).join(' \u00B7 ')}
                </Text>
              </View>
            </View>

            <Row label={t('country')} value={`${location.flag || ''} ${location.country || '-'}`} />
            <Row label={t('capital')} value={location.capital || '-'} />
            <Row
              label={t('coordinates')}
              value={
                location.latitude != null
                  ? `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`
                  : '-'
              }
              mono
            />
            <Row
              label={t('timezone')}
              value={`${location.timezone} (${useZoneLabel(location.timezone)})`}
              mono
            />
            <Row label={t('localTime')} value={localTime} mono />

            {location.note ? (
              <Text style={[styles.note, { color: c.muted }]}>{location.note}</Text>
            ) : null}

            <View style={styles.actions}>
              <Button
                label={locStatus === 'detecting' ? '...' : t('refreshLocation')}
                small
                onPress={() => refreshLocation()}
                loading={locStatus === 'detecting'}
              />
              <Button label={t('manualLocation')} small variant="ghost" onPress={() => navigate('location')} />
            </View>
          </>
        )}
      </Card>

      {/* -------------------------------------------------- next prayer */}
      {next && (
        <Card tone="gold">
          <Text style={[styles.nextLabel, { color: c.inkSoft }]}>{t('nextPrayer')}</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.nextName, { color: c.emerald }]}>{t(next.key)}</Text>
            <Text style={[styles.nextTime, { color: c.ink }]}>{formatTime(next.time)}</Text>
          </View>
          <Text style={[styles.countdown, { color: c.gold }]}>{formatCountdown(next.remainingMs)}</Text>
          <Text style={[styles.sub, { color: c.muted }]}>
            {t('remaining')} {next.tomorrow ? '\u00B7 tomorrow' : ''}
          </Text>
        </Card>
      )}

      {/* ------------------------------------------------ prayer times */}
      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>{t('prayerTimes')}</SectionTitle>
          <Pressable onPress={() => navigate('prayer')}>
            <Text style={{ color: c.emerald, fontWeight: '700', fontSize: 12.5 }}>{t('prayer')} {'\u203A'}</Text>
          </Pressable>
        </View>
        {!times && <Text style={[styles.sub, { color: c.muted }]}>{t('unavailable')}</Text>}
        {rows.map((row) => {
          const isNext = next && next.key === row.key && !next.tomorrow;
          return (
            <View
              key={row.key}
              style={[
                styles.prayerRow,
                { borderBottomColor: c.line },
                isNext && { backgroundColor: c.emeraldSoft, borderRadius: radius.sm }
              ]}
            >
              <Text style={[styles.prayerName, { color: row.info ? c.muted : c.ink, fontWeight: isNext ? '800' : '600' }]}>
                {t(row.key)}
              </Text>
              <Text style={[styles.prayerTime, { color: isNext ? c.emerald : c.inkSoft }]}>{formatTime(row.time)}</Text>
            </View>
          );
        })}
        {inRamadan && (
          <Notice tone="gold" title={`${t('ramadan')} \u2014 ${t('suhoor')} / ${t('iftar')}`}>
            {`${t('suhoor')}: ${formatTime(times?.fajr)}  \u00B7  ${t('iftar')}: ${formatTime(times?.maghrib)}`}
          </Notice>
        )}
      </Card>

      {/* ------------------------------------------------------ streak */}
      <View style={styles.statRow}>
        <Stat label={t('streak')} value={String(streak)} hint={t('worship')} />
        <Stat label={t('bookmarks')} value={String((collections.quran || []).filter((q) => q.type === 'bookmark').length)} hint={t('quran')} />
        <Stat label={t('tasbih')} value={String((collections.tasbih || []).reduce((sum, s) => sum + (Number(s.count) || 0), 0))} hint="dhikr" />
      </View>

      {/* ----------------------------------------------------- actions */}
      <Card>
        <SectionTitle>Quick actions</SectionTitle>
        <View style={styles.grid}>
          {QUICK.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => navigate(item.key)}
              style={[styles.tile, { borderColor: c.line, backgroundColor: c.sand }]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={{ fontSize: 22 }}>{item.glyph}</Text>
              <Text style={{ color: c.ink, fontSize: 11.5, fontWeight: '700', marginTop: 4 }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={[styles.credit, { color: c.muted }]}>
        RIFQ Muslim \u2013 {t('tagline')}
      </Text>
      <Text style={[styles.credit, { color: c.muted }]}>{t('developer')}</Text>
    </Screen>
  );
}

function useZoneLabel(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(new Date());
    return (parts.find((p) => p.type === 'timeZoneName') || {}).value || 'UTC';
  } catch {
    return 'UTC';
  }
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg },
  heroKicker: { color: '#E7C766', fontSize: 11, letterSpacing: 3, fontWeight: '800', textAlign: 'center' },
  heroTitle: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  heroTagline: { color: '#E7C766', fontSize: 13, textAlign: 'center', marginTop: 2 },
  heroMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg },
  heroHijri: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  heroClock: { color: '#E7C766', fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  heroDate: { color: 'rgba(255,255,255,0.75)', fontSize: 11.5, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  flag: { fontSize: 30, marginRight: spacing.md },
  city: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 12.5, marginTop: 2 },
  note: { fontSize: 11.5, lineHeight: 17, marginTop: spacing.sm, fontStyle: 'italic' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  nextLabel: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  nextName: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  nextTime: { fontSize: 20, fontWeight: '700' },
  countdown: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: spacing.sm },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  prayerName: { fontSize: 14.5 },
  prayerTime: { fontSize: 14.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: 76, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1 },
  credit: { textAlign: 'center', fontSize: 11.5, marginTop: 4 }
});
