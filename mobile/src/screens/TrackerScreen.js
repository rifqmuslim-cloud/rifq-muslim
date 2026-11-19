/**
 * RIFQ Muslim - Worship tracker.
 * 7-day grid of the five prayers plus fasting, with completion percentage and a
 * streak - the same records the backend stores for every signed-in device.
 */
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Notice, Row, Screen, SectionTitle, Stat } from '../components/UI';
import { spacing, radius } from '../theme';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function TrackerScreen() {
  const { theme, t, collections, upsert, removeItem, navigate } = useApp();
  const c = theme.c;

  const days = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(base.getTime() - offset * 86400000);
      list.push({ date, key: dayKey(date) });
    }
    return list;
  }, []);

  const worship = collections.worship || [];
  const has = (dateKey, prayer) => worship.some((item) => item.type === 'prayer' && item.date === dateKey && item.prayer === prayer);
  const fasted = (dateKey) => worship.some((item) => item.type === 'fast' && (item.date === dateKey || item.id === `fast-${dateKey}`));

  const toggle = (dateKey, prayer) => {
    const id = `prayer-${dateKey}-${prayer}`;
    if (has(dateKey, prayer)) removeItem('worship', id);
    else upsert('worship', { id, type: 'prayer', prayer, value: true, date: dateKey, at: new Date().toISOString() });
  };

  const totalSlots = days.length * PRAYERS.length;
  const doneCount = days.reduce((sum, day) => sum + PRAYERS.filter((prayer) => has(day.key, prayer)).length, 0);
  const percent = totalSlots ? Math.round((doneCount / totalSlots) * 100) : 0;

  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];
    const complete = PRAYERS.every((prayer) => has(day.key, prayer));
    if (complete) streak += 1;
    else if (index !== days.length - 1) break;
  }

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${percent}%`} tone={percent >= 80 ? 'good' : percent >= 40 ? 'warn' : 'soft'} />}>
        {t('tracker')}
      </SectionTitle>

      <View style={styles.statRow}>
        <Stat label="This week" value={`${doneCount}/${totalSlots}`} hint="prayers" />
        <Stat label={t('streak')} value={String(streak)} hint="full days" />
        <Stat label="Fasts" value={String(days.filter((day) => fasted(day.key)).length)} hint="last 7 days" />
      </View>

      <Card>
        <SectionTitle>Last 7 days</SectionTitle>
        <View style={[styles.headRow, { borderBottomColor: c.line }]}>
          <Text style={[styles.th, { color: c.muted, width: 52 }]}>Day</Text>
          {PRAYERS.map((prayer) => (
            <Text key={prayer} style={[styles.th, { color: c.muted, flex: 1, textAlign: 'center' }]}>
              {t(prayer).slice(0, 3)}
            </Text>
          ))}
          <Text style={[styles.th, { color: c.muted, width: 34, textAlign: 'center' }]}>Fast</Text>
        </View>

        {days.map((day) => (
          <View key={day.key} style={[styles.row, { borderBottomColor: c.line }]}>
            <View style={{ width: 52 }}>
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 12 }}>
                {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
              </Text>
              <Text style={{ color: c.muted, fontSize: 10 }}>
                {day.date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
              </Text>
            </View>
            {PRAYERS.map((prayer) => {
              const on = has(day.key, prayer);
              return (
                <Pressable
                  key={prayer}
                  onPress={() => toggle(day.key, prayer)}
                  style={[styles.cell, { borderColor: on ? c.emerald : c.line, backgroundColor: on ? c.emerald : 'transparent' }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${prayer} ${day.key}`}
                  accessibilityState={{ selected: on }}
                >
                  <Text style={{ color: on ? '#FFFFFF' : 'transparent', fontSize: 11, fontWeight: '800' }}>{'\u2713'}</Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => {
                const id = `fast-${day.key}`;
                if (fasted(day.key)) removeItem('worship', id);
                else upsert('worship', { id, type: 'fast', value: true, date: day.key, at: new Date().toISOString() });
              }}
              style={[styles.cell, { borderColor: fasted(day.key) ? c.gold : c.line, backgroundColor: fasted(day.key) ? c.gold : 'transparent' }]}
              accessibilityRole="button"
              accessibilityLabel={`fast ${day.key}`}
            >
              <Text style={{ color: fasted(day.key) ? '#FFFFFF' : 'transparent', fontSize: 11, fontWeight: '800' }}>{'\u2713'}</Text>
            </Pressable>
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle>Progress</SectionTitle>
        <View style={[styles.bar, { backgroundColor: c.line }]}>
          <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: c.emerald }]} />
        </View>
        <Row label="Prayers completed" value={`${doneCount} of ${totalSlots}`} />
        <Row label="Completion" value={`${percent}%`} />
        <Row label="Full days" value={String(days.filter((day) => PRAYERS.every((prayer) => has(day.key, prayer))).length)} />
      </Card>

      <Notice tone="soft" title="Saved to your account">
        Every tick is stored in the shared worship collection, so your progress appears on Android, iOS and the web with the same account.
      </Notice>

      <Card>
        <SectionTitle>More worship</SectionTitle>
        <Row label={t('tasbih')} value="open" onPress={() => navigate('tasbih')} />
        <Row label={t('ramadan')} value="open" onPress={() => navigate('ramadan')} />
        <Row label={t('quran')} value="open" onPress={() => navigate('quran')} />
        <Row label={t('zakat')} value="open" onPress={() => navigate('zakat')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  headRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cell: { width: 30, height: 30, borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  bar: { height: 10, borderRadius: 5, overflow: 'hidden', marginVertical: spacing.md },
  barFill: { height: 10, borderRadius: 5 }
});
