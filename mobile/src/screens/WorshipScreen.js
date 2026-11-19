/**
 * RIFQ Muslim - Worship hub.
 * Today's five prayers, reading and dhikr progress, fasting, sync status and
 * entries into every worship module.
 */
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Row, Screen, SectionTitle, Stat } from '../components/UI';
import { spacing, radius } from '../theme';

const MODULES = [
  { key: 'tracker', title: 'Worship tracker', hint: 'Five prayers, 7-day history', glyph: '\u2705' },
  { key: 'tasbih', title: 'Tasbih', hint: 'Dhikr counter with history', glyph: '\u{1F4FF}' },
  { key: 'quran', title: 'Quran', hint: 'Read, bookmark, listen', glyph: '\u{1F4D6}' },
  { key: 'duas', title: 'Duas', hint: 'Everyday supplications', glyph: '\u{1F932}' },
  { key: 'hadith', title: 'Hadith', hint: 'Authentic narrations', glyph: '\u{1F4DC}' },
  { key: 'names', title: '99 Names of Allah', hint: 'Asma ul-Husna', glyph: '\u2728' },
  { key: 'ramadan', title: 'Ramadan', hint: 'Suhoor, iftar, fasting log', glyph: '\u{1F319}' },
  { key: 'zakat', title: 'Zakat', hint: 'Calculator with nisab', glyph: '\u{1F4B0}' },
  { key: 'hajj', title: 'Hajj & Umrah', hint: 'Step-by-step rites', glyph: '\u{1F54B}' },
  { key: 'knowledge', title: 'Knowledge', hint: 'Articles and fiqh basics', glyph: '\u{1F4DA}' }
];

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function WorshipScreen() {
  const { theme, t, navigate, collections, upsert, removeItem, next, formatTime, user, auth, syncState, syncNow, prefs } = useApp();
  const c = theme.c;

  const todayKey = new Date().toISOString().slice(0, 10);
  const done = useMemo(() => {
    const map = {};
    for (const item of collections.worship || []) {
      if (item.type === 'prayer' && item.date === todayKey) map[item.prayer] = true;
    }
    return map;
  }, [collections.worship, todayKey]);

  const completed = PRAYERS.filter((key) => done[key]).length;
  const fasts = (collections.worship || []).filter((item) => item.type === 'fast');
  const bookmarks = (collections.quran || []).filter((item) => item.type === 'bookmark');
  const dhikr = (collections.tasbih || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const togglePrayer = (key) => {
    const id = `prayer-${todayKey}-${key}`;
    if (done[key]) removeItem('worship', id);
    else upsert('worship', { id, type: 'prayer', prayer: key, value: true, date: todayKey, at: new Date().toISOString() });
  };

  return (
    <Screen>
      <SectionTitle right={<Badge label={auth.token ? 'Synced account' : 'Guest'} tone={auth.token ? 'good' : 'warn'} />}>
        {t('worship')}
      </SectionTitle>

      {!auth.token && (
        <Notice tone="soft" title="Sign in to sync">
          Your worship log, bookmarks and Tasbih counts are saved on this device. Sign in to keep them across Android and iOS.
        </Notice>
      )}

      <Card tone="gold">
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.label, { color: c.muted }]}>{t('today')}</Text>
            <Text style={[styles.big, { color: c.emerald }]}>{completed}/5 prayers</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.label, { color: c.muted }]}>{t('nextPrayer')}</Text>
            <Text style={{ color: c.ink, fontWeight: '800' }}>{next ? `${t(next.key)} ${formatTime(next.time)}` : '-'}</Text>
          </View>
        </View>
        <View style={styles.prayerRow}>
          {PRAYERS.map((key) => (
            <Pressable
              key={key}
              onPress={() => togglePrayer(key)}
              style={[
                styles.prayerChip,
                {
                  borderColor: done[key] ? c.emerald : c.line,
                  backgroundColor: done[key] ? c.emerald : 'transparent'
                }
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: !!done[key] }}
            >
              <Text style={{ color: done[key] ? '#FFFFFF' : c.inkSoft, fontSize: 11.5, fontWeight: '700' }}>{t(key)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.sub, { color: c.muted }]}>Tap a prayer to mark it prayed today.</Text>
      </Card>

      <View style={styles.statRow}>
        <Stat label="Fasts" value={String(fasts.length)} hint="logged" />
        <Stat label={t('bookmarks')} value={String(bookmarks.length)} hint={t('quran')} />
        <Stat label="Dhikr" value={String(dhikr)} hint="counts" />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <SectionTitle>Sync</SectionTitle>
          <Badge
            label={syncState.status === 'syncing' ? 'Syncing' : syncState.status === 'error' ? 'Error' : syncState.at ? 'Up to date' : 'Not signed in'}
            tone={syncState.status === 'error' ? 'bad' : syncState.at ? 'good' : 'soft'}
          />
        </View>
        <Row label={t('profile')} value={user?.name || user?.email || 'Guest'} />
        <Row label="Last sync" value={syncState.at ? new Date(syncState.at).toLocaleString() : '-'} />
        {syncState.error ? <Text style={[styles.sub, { color: c.bad }]}>{syncState.error}</Text> : null}
        <View style={styles.row}>
          <Button label="Sync now" small onPress={() => (auth.token ? syncNow() : navigate('auth'))} />
          <Button label={t('settings')} small variant="ghost" onPress={() => navigate('settings')} />
        </View>
      </Card>

      <Card>
        <SectionTitle>Modules</SectionTitle>
        {MODULES.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => navigate(item.key)}
            style={[styles.module, { borderBottomColor: c.line }]}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 20, marginRight: spacing.md }}>{item.glyph}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 14 }}>{item.title}</Text>
              <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1 }}>{item.hint}</Text>
            </View>
            <Text style={{ color: c.emerald, fontWeight: '800' }}>{'\u203A'}</Text>
          </Pressable>
        ))}
      </Card>

      <Text style={[styles.sub, { color: c.muted, textAlign: 'center' }]}>
        {prefs.lang === 'ar' ? '\u0627\u0644\u0639\u0628\u0627\u062F\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629' : 'Your daily worship, kept in one place.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  big: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  sub: { fontSize: 11.5, marginTop: spacing.sm, lineHeight: 17 },
  prayerRow: { flexDirection: 'row', gap: 6, marginTop: spacing.md, flexWrap: 'wrap' },
  prayerChip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  module: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth }
});
