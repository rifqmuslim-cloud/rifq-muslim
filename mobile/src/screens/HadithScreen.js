/**
 * RIFQ Muslim - Hadith.
 * Authentic narrations with topic filters, search and saved favourites.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Empty, Field, Pill, Screen, SectionTitle } from '../components/UI';
import { HADITHS } from '../data/content';
import { spacing } from '../theme';

export default function HadithScreen() {
  const { theme, t, prefs, collections, upsert, removeItem } = useApp();
  const c = theme.c;
  const [topic, setTopic] = useState('All');
  const [query, setQuery] = useState('');

  const topics = useMemo(() => ['All', ...Array.from(new Set(HADITHS.map((item) => item.topic)))], []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HADITHS.filter((item) => {
      if (topic !== 'All' && item.topic !== topic) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.arabic.includes(query.trim())
      );
    });
  }, [topic, query]);

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${list.length} narrations`} tone="good" />}>{t('hadith')}</SectionTitle>

      <Card>
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Topic, text or reference" />
        <View style={styles.pills}>
          {topics.map((item) => (
            <Pill key={item} label={item} active={topic === item} onPress={() => setTopic(item)} />
          ))}
        </View>
      </Card>

      {!list.length && <Empty title="No hadith found" hint="Try another topic or search word." />}

      {list.map((item) => {
        const favId = `hadith-${item.id}`;
        const saved = (collections.favorites || []).some((entry) => entry.id === favId);
        return (
          <Card key={item.id}>
            <View style={styles.head}>
              <Text style={[styles.topic, { color: c.gold }]}>{item.topic}</Text>
              <Pill
                label={saved ? '\u2605' : '\u2606'}
                active={saved}
                onPress={() =>
                  saved
                    ? removeItem('favorites', favId)
                    : upsert('favorites', { id: favId, type: 'hadith', title: item.title, text: item.text, at: new Date().toISOString() })
                }
              />
            </View>
            <Text style={[styles.title, { color: c.ink }]}>{item.title}</Text>
            <Text style={[styles.arabic, { color: c.ink }]}>{item.arabic}</Text>
            {prefs.showTranslation && <Text style={[styles.text, { color: c.inkSoft }]}>{item.text}</Text>}
            <Text style={[styles.reference, { color: c.muted }]}>{item.reference}</Text>
          </Card>
        );
      })}

      <Text style={[styles.reference, { color: c.muted, textAlign: 'center' }]}>
        Narrations are quoted from the major collections with their references.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  topic: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '800', marginBottom: spacing.sm },
  arabic: { fontSize: 21, lineHeight: 38, textAlign: 'right', writingDirection: 'rtl' },
  text: { fontSize: 13, lineHeight: 21, marginTop: spacing.sm },
  reference: { fontSize: 11, marginTop: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }
});
