/**
 * RIFQ Muslim - Duas.
 * Categorised supplications with Arabic, transliteration, translation and the
 * source reference, plus favourites and copy-to-clipboard.
 */
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Empty, Field, Pill, Row, Screen, SectionTitle } from '../components/UI';
import { DUAS } from '../data/content';
import { spacing } from '../theme';

export default function DuasScreen() {
  const { theme, t, prefs, collections, upsert, removeItem, auth, navigate } = useApp();
  const c = theme.c;
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(DUAS.map((dua) => dua.category)))], []);
  const favourites = (collections.favorites || []).filter((item) => item.type === 'dua');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DUAS.filter((dua) => {
      const inCategory = category === 'All' || dua.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        dua.title.toLowerCase().includes(q) ||
        dua.translation.toLowerCase().includes(q) ||
        (dua.translit || '').toLowerCase().includes(q) ||
        dua.arabic.includes(query.trim())
      );
    });
  }, [category, query]);

  const copy = async (dua) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${dua.arabic}\n${dua.translit}\n${dua.translation}\n(${dua.reference})`);
      } else {
        await require('expo-clipboard').setStringAsync(`${dua.arabic}\n${dua.translit}\n${dua.translation}\n(${dua.reference})`);
      }
      setCopied(dua.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard is optional */
    }
  };

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${list.length} duas`} tone="good" />}>{t('duas')}</SectionTitle>

      <Card>
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Title, meaning or Arabic" />
        <View style={styles.pills}>
          {categories.map((item) => (
            <Pill key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
          ))}
        </View>
      </Card>

      {!!favourites.length && (
        <Card>
          <SectionTitle>Favourites</SectionTitle>
          {favourites.map((item) => (
            <Row key={item.id} label={item.title} value="remove" onPress={() => removeItem('favorites', item.id)} />
          ))}
        </Card>
      )}

      {!list.length && <Empty title="No dua found" hint="Try another category or search word." />}

      {list.map((dua) => {
        const open = openId === dua.id;
        const favId = `dua-${dua.id}`;
        const saved = (collections.favorites || []).some((item) => item.id === favId);
        return (
          <Card key={dua.id}>
            <Pressable onPress={() => setOpenId(open ? null : dua.id)} accessibilityRole="button">
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.category, { color: c.gold }]}>{dua.category}</Text>
                  <Text style={[styles.title, { color: c.ink }]}>{dua.title}</Text>
                </View>
                <Text style={{ color: c.emerald, fontWeight: '800' }}>{open ? '\u2212' : '+'}</Text>
              </View>
            </Pressable>

            {open && (
              <>
                <Text style={[styles.arabic, { color: c.ink }]}>{dua.arabic}</Text>
                {prefs.showTransliteration && dua.translit ? (
                  <Text style={[styles.translit, { color: c.muted }]}>{dua.translit}</Text>
                ) : null}
                {prefs.showTranslation && <Text style={[styles.translation, { color: c.inkSoft }]}>{dua.translation}</Text>}
                <Text style={[styles.reference, { color: c.muted }]}>{dua.reference}</Text>
                <View style={styles.row}>
                  <Pill
                    label={saved ? 'Saved \u2605' : 'Save \u2606'}
                    active={saved}
                    onPress={() =>
                      saved
                        ? removeItem('favorites', favId)
                        : upsert('favorites', { id: favId, type: 'dua', title: dua.title, arabic: dua.arabic, at: new Date().toISOString() })
                    }
                  />
                  <Pill label={copied === dua.id ? 'Copied \u2713' : 'Copy'} onPress={() => copy(dua)} />
                </View>
              </>
            )}
          </Card>
        );
      })}

      {!auth.token && (
        <Row label={t('signIn')} value="sync favourites" onPress={() => navigate('auth')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center' },
  category: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  arabic: { fontSize: 22, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md },
  translit: { fontSize: 12, fontStyle: 'italic', marginTop: spacing.sm, lineHeight: 18 },
  translation: { fontSize: 13, lineHeight: 21, marginTop: spacing.sm },
  reference: { fontSize: 11, marginTop: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }
});
