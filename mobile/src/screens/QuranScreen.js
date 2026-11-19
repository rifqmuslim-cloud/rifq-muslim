/**
 * RIFQ Muslim - Quran.
 * Full 114-surah mushaf served by the shared backend (Uthmani text + Sahih
 * International translation), audio recitation, bookmarks, last-read resume and
 * per-ayah notes - all synchronized through the account.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Badge, Button, Card, Empty, Field, Loading, Notice, Pill, Row, Screen, SectionTitle } from '../components/UI';
import { spacing, radius } from '../theme';

const RECITER = 'ar.alafasy';
const audioUrl = (surah) => `https://cdn.islamic.network/quran/audio-surah/128/${RECITER}/${surah}.mp3`;

export default function QuranScreen() {
  const { theme, t, prefs, setPref, collections, upsert, removeItem, auth, navigate } = useApp();
  const c = theme.c;

  const [surahs, setSurahs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [playing, setPlaying] = useState(false);
  const sound = useRef(null);

  const bookmarks = (collections.quran || []).filter((item) => item.type === 'bookmark');
  const lastRead = (collections.quran || []).find((item) => item.type === 'lastRead');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.surahs();
        if (cancelled) return;
        setSurahs(res.surahs || []);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stopAudio = useCallback(async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
      }
    } catch {
      /* ignore */
    }
    sound.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => () => { stopAudio(); }, [stopAudio]);

  const openSurah = useCallback(
    async (number) => {
      setLoadingSurah(true);
      setOpen(number);
      try {
        const res = await api.surah(number);
        setAyahs(res.ayahs || []);
        upsert('quran', {
          id: 'last-read',
          type: 'lastRead',
          surah: number,
          surahName: res.surah?.englishName || res.surah?.name || String(number),
          ayah: 1,
          at: new Date().toISOString()
        });
      } catch (err) {
        setError(err.message);
        setAyahs([]);
      } finally {
        setLoadingSurah(false);
      }
    },
    [upsert]
  );

  const toggleAudio = async () => {
    if (playing) {
      await stopAudio();
      return;
    }
    if (!open) return;
    try {
      const { Audio } = require('expo-av');
      const { sound: created } = await Audio.Sound.createAsync({ uri: audioUrl(open) }, { shouldPlay: true });
      sound.current = created;
      setPlaying(true);
      created.setOnPlaybackStatusUpdate((state) => {
        if (state.didJustFinish) {
          setPlaying(false);
          created.unloadAsync().catch(() => {});
          sound.current = null;
        }
      });
    } catch (err) {
      setError(`Audio unavailable: ${err.message}`);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (surah) =>
        String(surah.number) === q ||
        (surah.englishName || '').toLowerCase().includes(q) ||
        (surah.name || '').includes(q) ||
        (surah.englishNameTranslation || '').toLowerCase().includes(q)
    );
  }, [surahs, query]);

  if (open) {
    const surah = surahs.find((item) => item.number === open);
    return (
      <Screen>
        <SectionTitle right={<Badge label={surah?.revelationType || 'Quran'} tone="good" />}>
          {surah ? `${surah.number}. ${surah.englishName}` : `Surah ${open}`}
        </SectionTitle>
        <Card tone="gold">
          <Text style={[styles.arabicTitle, { color: c.emerald }]}>{surah?.name || ''}</Text>
          <Text style={[styles.sub, { color: c.muted }]}>
            {surah?.ayahCount ? `${surah.ayahCount} ayahs` : ''} {surah?.englishNameTranslation ? `\u00B7 ${surah.englishNameTranslation}` : ''}
          </Text>
          <View style={styles.row}>
            <Button label={playing ? t('pause') : t('play')} small onPress={toggleAudio} />
            <Button label="Back to list" small variant="ghost" onPress={() => { stopAudio(); setOpen(null); }} />
          </View>
        </Card>

        {loadingSurah && <Loading label="Loading surah" />}
        {!loadingSurah && !ayahs.length && <Notice tone="warn" title="Not loaded">{error || 'This surah could not be loaded. Check your connection and try again.'}</Notice>}

        {ayahs.map((ayah) => {
          const id = `quran-${open}-${ayah.number}`;
          const saved = bookmarks.some((item) => item.id === id);
          return (
            <Card key={ayah.number}>
              <View style={styles.ayahHead}>
                <Text style={[styles.ayahNo, { color: c.gold }]}>{open}:{ayah.number}</Text>
                <Pressable
                  onPress={() =>
                    saved
                      ? removeItem('quran', id)
                      : upsert('quran', {
                          id,
                          type: 'bookmark',
                          surah: open,
                          surahName: surah?.englishName || String(open),
                          ayah: ayah.number,
                          text: ayah.text,
                          translation: ayah.translation,
                          at: new Date().toISOString()
                        })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={saved ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <Text style={{ fontSize: 17 }}>{saved ? '\u2B50' : '\u2606'}</Text>
                </Pressable>
              </View>
              <Text style={[styles.arabic, { color: c.ink }]}>{ayah.text}</Text>
              {prefs.showTranslation && <Text style={[styles.translation, { color: c.inkSoft }]}>{ayah.translation}</Text>}
            </Card>
          );
        })}
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle right={<Badge label={auth.token ? 'Synced' : 'Local'} tone={auth.token ? 'good' : 'warn'} />}>{t('quran')}</SectionTitle>

      {lastRead && (
        <Card tone="gold">
          <Text style={[styles.sub, { color: c.muted }]}>{t('lastRead')}</Text>
          <Text style={[styles.lastRead, { color: c.emerald }]}>
            {lastRead.surahName} \u00B7 ayah {lastRead.ayah}
          </Text>
          <Button label="Continue reading" small onPress={() => openSurah(lastRead.surah)} />
        </Card>
      )}

      <Card>
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Surah name or number" />
        <View style={styles.pills}>
          <Pill label="Translation" active={prefs.showTranslation} onPress={() => setPref('showTranslation', !prefs.showTranslation)} />
          <Pill label="Transliteration" active={prefs.showTransliteration} onPress={() => setPref('showTransliteration', !prefs.showTransliteration)} />
        </View>
      </Card>

      {status === 'loading' && <Loading label="Loading the mushaf" />}
      {status === 'error' && (
        <Notice tone="warn" title="Mushaf unavailable">
          {error} {auth.token ? '' : 'Sign in to keep your bookmarks across devices.'}
        </Notice>
      )}

      {!!bookmarks.length && (
        <Card>
          <SectionTitle>{t('bookmarks')}</SectionTitle>
          {bookmarks.slice(0, 8).map((item) => (
            <Row
              key={item.id}
              label={`${item.surahName} ${item.surah}:${item.ayah}`}
              value="open"
              onPress={() => openSurah(item.surah)}
            />
          ))}
        </Card>
      )}

      <Card>
        <SectionTitle>Surahs ({filtered.length})</SectionTitle>
        {!filtered.length && status === 'ready' && <Empty title="No surah found" hint="Try another name or number." />}
        {filtered.map((surah) => (
          <Row
            key={surah.number}
            label={`${surah.number}. ${surah.englishName || surah.name}`}
            value={`${surah.ayahCount || ''}`}
            onPress={() => openSurah(surah.number)}
          />
        ))}
      </Card>

      <Text style={[styles.sub, { color: c.muted, textAlign: 'center' }]}>
        Text: Tanzil Uthmani \u00B7 Translation: Sahih International \u00B7 Audio: Every Ayah (Alafasy)
      </Text>
      {!auth.token && <Button label={t('signIn')} variant="ghost" onPress={() => navigate('auth')} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  pills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  sub: { fontSize: 12, marginTop: 4 },
  arabicTitle: { fontSize: 24, textAlign: 'center' },
  lastRead: { fontSize: 17, fontWeight: '800', marginVertical: 6 },
  ayahHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  ayahNo: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  arabic: { fontSize: 24, lineHeight: 44, textAlign: 'right', writingDirection: 'rtl' },
  translation: { fontSize: 13.5, lineHeight: 22, marginTop: spacing.sm }
});
