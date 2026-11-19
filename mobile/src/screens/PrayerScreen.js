/**
 * RIFQ Muslim - Prayer screen.
 * Today's times from the real coordinates, next prayer countdown, calculation
 * method and madhab selection, monthly timetable and notification status.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Pill, Row, Screen, SectionTitle, Toggle } from '../components/UI';
import { CALC_METHODS, computePrayerTimes, formatCountdown } from '../lib/prayer';
import { spacing, radius } from '../theme';

export default function PrayerScreen() {
  const {
    theme, t, prefs, setPref, location, navigate, times, rows, next, formatTime, zone, timezone, localDate, notifState
  } = useApp();
  const c = theme.c;
  const [showMonth, setShowMonth] = useState(false);

  const month = useMemo(() => {
    if (!location) return [];
    const base = new Date();
    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const days = new Date(year, monthIndex + 1, 0).getDate();
    const list = [];
    for (let d = 1; d <= days; d += 1) {
      const date = new Date(year, monthIndex, d, 12, 0, 0);
      const computed = computePrayerTimes({ latitude: location.latitude, longitude: location.longitude, date, prefs });
      if (computed) list.push({ day: d, times: computed });
    }
    return list;
  }, [location, prefs]);

  if (!location) {
    return (
      <Screen>
        <SectionTitle>{t('prayerTimes')}</SectionTitle>
        <Notice tone="warn" title={t('unavailable')}>
          Prayer times are calculated from your real coordinates. Detect your location or choose it manually.
        </Notice>
        <Button label={t('location')} onPress={() => navigate('location')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card tone="gold">
        <Text style={[styles.label, { color: c.muted }]}>{t('nextPrayer')}</Text>
        <View style={styles.rowBetween}>
          <Text style={[styles.big, { color: c.emerald }]}>{t(next?.key || 'fajr')}</Text>
          <Text style={[styles.time, { color: c.ink }]}>{formatTime(next?.time)}</Text>
        </View>
        <Text style={[styles.countdown, { color: c.gold }]}>{formatCountdown(next?.remainingMs)}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{localDate}</Text>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>{t('today')}</SectionTitle>
          <Badge label={location.mode === 'gps' ? t('gpsDetected') : t('manualSelected')} tone={location.mode === 'gps' ? 'good' : 'warn'} />
        </View>
        {rows.map((row) => {
          const isNext = next && next.key === row.key && !next.tomorrow;
          return (
            <View key={row.key} style={[styles.row, { borderBottomColor: c.line }, isNext && { backgroundColor: c.emeraldSoft, borderRadius: radius.sm }]}>
              <Text style={{ color: row.info ? c.muted : c.ink, fontWeight: isNext ? '800' : '600', fontSize: 14.5 }}>{t(row.key)}</Text>
              <Text style={{ color: isNext ? c.emerald : c.inkSoft, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{formatTime(row.time)}</Text>
            </View>
          );
        })}
        <Row label="Midnight" value={formatTime(times?.midnight)} />
        <Row label="Last third of night" value={formatTime(times?.lastThird)} />
      </Card>

      <Card>
        <SectionTitle>{t('calculationMethod')}</SectionTitle>
        <View style={styles.pills}>
          {CALC_METHODS.map((method) => (
            <Pill
              key={method.id}
              label={method.label}
              active={prefs.calcMethod === method.id}
              onPress={() => {
                setPref('calcMethod', method.id);
                setPref('methodLocked', true);
              }}
            />
          ))}
        </View>
        <Text style={[styles.sub, { color: c.muted }]}>
          Default for {location.country || 'your country'} is applied automatically until you choose one yourself.
        </Text>

        <SectionTitle>{t('madhab')} (Asr)</SectionTitle>
        <View style={styles.pills}>
          <Pill label="Shafi / Maliki / Hanbali" active={prefs.madhab === 'shafi'} onPress={() => setPref('madhab', 'shafi')} />
          <Pill label="Hanafi" active={prefs.madhab === 'hanafi'} onPress={() => setPref('madhab', 'hanafi')} />
        </View>

        <SectionTitle>High latitude rule</SectionTitle>
        <View style={styles.pills}>
          <Pill label="Middle of night" active={prefs.highLatitude === 'middle'} onPress={() => setPref('highLatitude', 'middle')} />
          <Pill label="Seventh of night" active={prefs.highLatitude === 'seventh'} onPress={() => setPref('highLatitude', 'seventh')} />
          <Pill label="Twilight angle" active={prefs.highLatitude === 'angle'} onPress={() => setPref('highLatitude', 'angle')} />
        </View>
      </Card>

      <Card>
        <SectionTitle>{t('notifications')}</SectionTitle>
        <Toggle
          label="Prayer alerts (Athan)"
          value={!!prefs.notifications.enabled}
          onChange={(value) => setPref('notifications', { ...prefs.notifications, enabled: value })}
          hint={
            notifState?.supported === false
              ? 'Native notifications are available in the Android and iOS apps.'
              : notifState?.error
                ? notifState.error
                : `${notifState?.scheduled || 0} alerts scheduled for your location`
          }
        />
        {prefs.notifications.enabled && (
          <>
            {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((key) => (
              <Toggle
                key={key}
                label={t(key)}
                value={prefs.notifications[key] !== false}
                onChange={(value) => setPref('notifications', { ...prefs.notifications, [key]: value })}
              />
            ))}
            <SectionTitle>Reminder before prayer</SectionTitle>
            <View style={styles.pills}>
              {[0, 5, 10, 15, 20, 30].map((minutes) => (
                <Pill
                  key={minutes}
                  label={minutes === 0 ? 'On time' : `${minutes} min`}
                  active={Number(prefs.notifications.preMinutes) === minutes}
                  onPress={() => setPref('notifications', { ...prefs.notifications, preMinutes: minutes })}
                />
              ))}
            </View>
          </>
        )}
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>Monthly timetable</SectionTitle>
          <Button label={showMonth ? 'Hide' : 'Show'} small variant="ghost" onPress={() => setShowMonth((v) => !v)} />
        </View>
        <Text style={[styles.sub, { color: c.muted }]}>{timezone} {'\u00B7'} {zone?.offsetLabel}{zone?.isDST ? ' (DST)' : ''}</Text>
        {showMonth && (
          <View style={{ marginTop: spacing.sm }}>
            <View style={[styles.row, { borderBottomColor: c.line }]}>
              <Text style={[styles.th, { color: c.muted }]}>Day</Text>
              {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => (
                <Text key={k} style={[styles.th, { color: c.muted, flex: 1, textAlign: 'center' }]}>{t(k).slice(0, 3)}</Text>
              ))}
            </View>
            {month.map((entry) => (
              <View key={entry.day} style={[styles.row, { borderBottomColor: c.line }]}>
                <Text style={[styles.td, { color: c.ink, width: 34 }]}>{entry.day}</Text>
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => (
                  <Text key={k} style={[styles.td, { color: c.inkSoft, flex: 1, textAlign: 'center' }]}>
                    {formatTime(entry.times[k], { hour12: true }).replace(/\s?[AP]M/i, '')}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </Card>

      <Text style={[styles.sub, { color: c.muted, textAlign: 'center' }]}>
        Times computed astronomically for {Number(location.latitude).toFixed(3)}, {Number(location.longitude).toFixed(3)} in {timezone}.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  big: { fontSize: 26, fontWeight: '800' },
  time: { fontSize: 22, fontWeight: '700' },
  countdown: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: spacing.sm },
  sub: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  th: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  td: { fontSize: 11.5, fontVariant: ['tabular-nums'], paddingVertical: 5 }
});
