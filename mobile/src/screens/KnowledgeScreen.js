/**
 * RIFQ Muslim - Knowledge.
 * Fiqh and aqeedah articles with a verse of the day; the same content the
 * backend exposes at /api/content/articles.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Field, Screen, SectionTitle } from '../components/UI';
import { ARTICLES, DAILY_VERSES } from '../data/content';
import { spacing } from '../theme';

export default function KnowledgeScreen() {
  const { theme, t, navigate } = useApp();
  const c = theme.c;
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const verse = useMemo(() => {
    const index = Math.floor(Date.now() / 86400000) % DAILY_VERSES.length;
    return DAILY_VERSES[index];
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter(
      (item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)
    );
  }, [query]);

  const open = ARTICLES.find((item) => item.id === openId);

  if (open) {
    return (
      <Screen>
        <SectionTitle right={<Badge label="Article" tone="good" />}>{open.title}</SectionTitle>
        <Card>
          <Text style={[styles.summary, { color: c.gold }]}>{open.summary}</Text>
          {open.body.split('\n\n').map((paragraph, index) => (
            <Text key={index} style={[styles.paragraph, { color: c.inkSoft }]}>
              {paragraph}
            </Text>
          ))}
        </Card>
        <Button label="Back to articles" variant="ghost" onPress={() => setOpenId(null)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${ARTICLES.length} articles`} tone="good" />}>{t('knowledge')}</SectionTitle>

      <Card tone="gold">
        <Text style={[styles.verseLabel, { color: c.muted }]}>Verse of the day</Text>
        <Text style={[styles.verse, { color: c.emerald }]}>{verse.text}</Text>
        <Text style={[styles.reference, { color: c.muted }]}>Quran {verse.surah}:{verse.ayah}</Text>
        <Button label="Open in Quran" small variant="ghost" onPress={() => navigate('quran')} />
      </Card>

      <Card>
        <Field label="Search articles" value={query} onChangeText={setQuery} placeholder="Zakat, prayer, Ramadan..." />
      </Card>

      {list.map((item) => (
        <Pressable key={item.id} onPress={() => setOpenId(item.id)} accessibilityRole="button">
          <Card>
            <View style={styles.rowBetween}>
              <Text style={[styles.title, { color: c.ink }]}>{item.title}</Text>
              <Text style={{ color: c.emerald, fontWeight: '800' }}>{'\u203A'}</Text>
            </View>
            <Text style={[styles.summary, { color: c.muted }]}>{item.summary}</Text>
          </Card>
        </Pressable>
      ))}

      <Card>
        <SectionTitle>More</SectionTitle>
        <Button label={t('duas')} variant="ghost" onPress={() => navigate('duas')} />
        <View style={{ height: spacing.sm }} />
        <Button label={t('hadith')} variant="ghost" onPress={() => navigate('hadith')} />
        <View style={{ height: spacing.sm }} />
        <Button label={t('hajj')} variant="ghost" onPress={() => navigate('hajj')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '800', flex: 1 },
  summary: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  paragraph: { fontSize: 13.5, lineHeight: 22, marginTop: spacing.md },
  verseLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  verse: { fontSize: 16, lineHeight: 26, fontWeight: '700', marginVertical: spacing.sm },
  reference: { fontSize: 11, marginBottom: spacing.sm }
});
