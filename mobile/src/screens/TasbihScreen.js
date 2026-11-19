/**
 * RIFQ Muslim - Tasbih (dhikr counter).
 * Haptic counting, presets, per-session history saved to the shared backend so
 * counts follow the user across Android, iOS and web.
 */
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Empty, Pill, Row, Screen, SectionTitle, Stat } from '../components/UI';
import { spacing, radius } from '../theme';

const PRESETS = [
  { label: 'SubhanAllah', arabic: '\u0633\u0628\u062D\u0627\u0646 \u0627\u0644\u0644\u0647', target: 33 },
  { label: 'Alhamdulillah', arabic: '\u0627\u0644\u062D\u0645\u062F \u0644\u0644\u0647', target: 33 },
  { label: 'Allahu Akbar', arabic: '\u0627\u0644\u0644\u0647 \u0623\u0643\u0628\u0631', target: 34 },
  { label: 'La ilaha illa Allah', arabic: '\u0644\u0627 \u0625\u0644\u0647 \u0625\u0644\u0627 \u0627\u0644\u0644\u0647', target: 100 },
  { label: 'Astaghfirullah', arabic: '\u0623\u0633\u062A\u063A\u0641\u0631 \u0627\u0644\u0644\u0647', target: 100 },
  { label: 'Salawat', arabic: '\u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064A\u0647 \u0648\u0633\u0644\u0645', target: 100 }
];

function buzz() {
  if (Platform.OS === 'web') return;
  try {
    require('expo-haptics').impactAsync(require('expo-haptics').ImpactFeedbackStyle.Light);
  } catch {
    /* haptics are optional */
  }
}

export default function TasbihScreen() {
  const { theme, t, collections, upsert, removeItem, auth, user } = useApp();
  const c = theme.c;
  const [preset, setPreset] = useState(PRESETS[0]);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(PRESETS[0].target);

  const sessions = useMemo(
    () => [...(collections.tasbih || [])].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [collections.tasbih]
  );
  const total = sessions.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const rounds = Math.floor(count / (target || 1));

  const save = () => {
    if (!count) return;
    upsert('tasbih', {
      id: `tasbih-${Date.now()}`,
      dhikr: preset.label,
      arabic: preset.arabic,
      count,
      target,
      rounds,
      at: new Date().toISOString()
    });
    setCount(0);
  };

  return (
    <Screen>
      <SectionTitle right={<Badge label={auth.token ? `Synced${user?.name ? ` \u00B7 ${user.name}` : ''}` : 'Local only'} tone={auth.token ? 'good' : 'warn'} />}>
        {t('tasbih')}
      </SectionTitle>

      <Card tone="gold">
        <View style={styles.center}>
          <Text style={[styles.arabic, { color: c.emerald }]}>{preset.arabic}</Text>
          <Text style={[styles.dhikr, { color: c.inkSoft }]}>{preset.label}</Text>
          <Pressable
            onPress={() => {
              setCount((value) => value + 1);
              buzz();
            }}
            style={[styles.counter, { borderColor: c.gold, backgroundColor: c.emeraldSoft }]}
            accessibilityRole="button"
            accessibilityLabel={`Count ${count}`}
          >
            <Text style={[styles.count, { color: c.emerald }]}>{count}</Text>
            <Text style={[styles.countHint, { color: c.muted }]}>of {target} {'\u00B7'} {rounds} rounds</Text>
          </Pressable>
          <View style={styles.row}>
            <Button label="Reset" small variant="ghost" onPress={() => setCount(0)} />
            <Button label={t('save')} small onPress={save} />
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Dhikr</SectionTitle>
        <View style={styles.pills}>
          {PRESETS.map((item) => (
            <Pill
              key={item.label}
              label={item.label}
              active={preset.label === item.label}
              onPress={() => {
                setPreset(item);
                setTarget(item.target);
                setCount(0);
              }}
            />
          ))}
        </View>
        <SectionTitle>Target</SectionTitle>
        <View style={styles.pills}>
          {[33, 34, 99, 100, 500, 1000].map((value) => (
            <Pill key={value} label={String(value)} active={target === value} onPress={() => setTarget(value)} />
          ))}
        </View>
      </Card>

      <View style={styles.statRow}>
        <Stat label="Total dhikr" value={String(total)} hint="all sessions" />
        <Stat label="Sessions" value={String(sessions.length)} hint="saved" />
      </View>

      <Card>
        <SectionTitle>History</SectionTitle>
        {!sessions.length && <Empty title="No sessions yet" hint="Count your dhikr and press Save to keep it in your account." />}
        {sessions.slice(0, 20).map((item) => (
          <Row
            key={item.id}
            label={item.dhikr}
            value={`${item.count} \u00B7 ${new Date(item.at || item.updatedAt).toLocaleDateString()}`}
            onPress={() => removeItem('tasbih', item.id)}
          />
        ))}
        {!!sessions.length && <Text style={[styles.hint, { color: c.muted }]}>Tap a session to delete it.</Text>}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  arabic: { fontSize: 26, lineHeight: 44, textAlign: 'center' },
  dhikr: { fontSize: 13, marginTop: 4 },
  counter: { width: 190, height: 190, borderRadius: 95, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  count: { fontSize: 58, fontWeight: '800', fontVariant: ['tabular-nums'] },
  countHint: { fontSize: 11.5 },
  row: { flexDirection: 'row', gap: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  hint: { fontSize: 11.5, marginTop: spacing.sm }
});
