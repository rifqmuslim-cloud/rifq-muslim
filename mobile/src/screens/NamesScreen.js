/**
 * RIFQ Muslim - 99 Names of Allah.
 * Arabic name, transliteration and meaning, with search and favourites.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Empty, Field, Screen, SectionTitle } from '../components/UI';
import { NAMES_99 } from '../data/content';
import { spacing, radius } from '../theme';

export default function NamesScreen() {
  const { theme, t, collections, upsert, removeItem } = useApp();
  const c = theme.c;
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const names = NAMES_99.map(([arabic, translit, meaning], index) => ({ index: index + 1, arabic, translit, meaning }));

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return names;
    return names.filter(
      (item) =>
        item.translit.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.arabic.includes(query.trim()) ||
        String(item.index) === q
    );
  }, [query, names]);

  return (
    <Screen>
      <SectionTitle right={<Badge label="Asma ul-Husna" tone="good" />}>{t('names')}</SectionTitle>

      <Card>
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Name, meaning or number" />
        <Text style={[styles.hint, { color: c.muted }]}>
          “Allah has ninety-nine names; whoever preserves them will enter Paradise.” (Bukhari 2736)
        </Text>
      </Card>

      {!list.length && <Empty title="No name found" hint="Try another spelling or meaning." />}

      <View style={styles.grid}>
        {list.map((item) => {
          const favId = `name-${item.index}`;
          const saved = (collections.favorites || []).some((entry) => entry.id === favId);
          const open = openIndex === item.index;
          return (
            <Pressable
              key={item.index}
              onPress={() => setOpenIndex(open ? null : item.index)}
              onLongPress={() =>
                saved
                  ? removeItem('favorites', favId)
                  : upsert('favorites', { id: favId, type: 'name', title: item.translit, at: new Date().toISOString() })
              }
              style={[
                styles.tile,
                { borderColor: saved ? c.gold : c.line, backgroundColor: open ? c.emeraldSoft : c.card }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.index} ${item.translit}`}
            >
              <Text style={[styles.number, { color: c.muted }]}>{item.index}</Text>
              <Text style={[styles.arabic, { color: c.emerald }]}>{item.arabic}</Text>
              <Text style={[styles.translit, { color: c.ink }]}>{item.translit}</Text>
              {open && <Text style={[styles.meaning, { color: c.inkSoft }]}>{item.meaning}</Text>}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: c.muted, textAlign: 'center' }]}>
        Tap a name for its meaning. Long-press to save it to your favourites.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tile: { width: '48%', borderWidth: 1, borderRadius: radius.md, padding: spacing.md, minHeight: 104 },
  number: { fontSize: 10, fontWeight: '700' },
  arabic: { fontSize: 24, textAlign: 'center', marginVertical: 4, writingDirection: 'rtl' },
  translit: { fontSize: 12.5, fontWeight: '800', textAlign: 'center' },
  meaning: { fontSize: 11, textAlign: 'center', marginTop: 6, lineHeight: 16 },
  hint: { fontSize: 11.5, lineHeight: 17, marginTop: spacing.sm }
});
