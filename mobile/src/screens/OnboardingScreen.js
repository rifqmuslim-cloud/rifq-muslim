/**
 * RIFQ Muslim - onboarding.
 * Branded introduction, feature tour, language choice and the location permission
 * request that powers prayer times, Qibla and the Hijri calendar.
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Button, Card, Notice, Pill, Row } from '../components/UI';
import { spacing, radius } from '../theme';

const FEATURES = [
  { glyph: '\u{1F54B}', title: 'Prayer times from your real location', hint: 'GPS coordinates, city, country capital and IANA timezone.' },
  { glyph: '\u{1F9ED}', title: 'Qibla compass', hint: 'Bearing to the Kaaba from where you actually are.' },
  { glyph: '\u{1F4D6}', title: 'Quran, duas and hadith', hint: 'Uthmani text with translation, audio and bookmarks.' },
  { glyph: '\u{1F4FF}', title: 'Tasbih and worship tracker', hint: 'Dhikr counts and prayer progress synced to your account.' },
  { glyph: '\u{1F319}', title: 'Ramadan and Hijri calendar', hint: 'Suhoor, iftar and important Islamic dates.' }
];

export default function OnboardingScreen() {
  const { theme, t, prefs, setPref, setOnboarded, refreshLocation, locStatus, locError, navigate, lang } = useApp();
  const c = theme.c;
  const [step, setStep] = useState(0);

  const finish = () => {
    setOnboarded(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.cream }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: c.emerald }]}>
          <Text style={styles.kicker}>{'\u262A'}  RIFQ MUSLIM  {'\u262A'}</Text>
          <Text style={styles.arabic}>{'\u0631\u0650\u0641\u0652\u0642 \u0645\u0633\u0644\u0645'}</Text>
          <Text style={styles.tagline}>Your Faith, Your Daily Companion.</Text>
          <Text style={styles.credit}>Made by Eng Mohamud Yusuf</Text>
        </View>

        {step === 0 && (
          <Card>
            <Text style={[styles.h2, { color: c.ink }]}>Welcome</Text>
            <Text style={[styles.p, { color: c.inkSoft }]}>
              RIFQ Muslim brings accurate prayer times, the Qibla, the Quran and daily worship tools to Android and iOS - computed
              from your own coordinates and timezone, never from a fixed default city.
            </Text>
            {FEATURES.map((item) => (
              <View key={item.title} style={styles.feature}>
                <Text style={{ fontSize: 20, marginRight: spacing.md }}>{item.glyph}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.ink, fontWeight: '700', fontSize: 13.5 }}>{item.title}</Text>
                  <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>{item.hint}</Text>
                </View>
              </View>
            ))}
            <Button label="Continue" onPress={() => setStep(1)} />
          </Card>
        )}

        {step === 1 && (
          <Card>
            <Text style={[styles.h2, { color: c.ink }]}>{t('language')}</Text>
            <View style={styles.pills}>
              {[{ id: 'en', label: 'English' }, { id: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' }, { id: 'so', label: 'Somali' }].map((item) => (
                <Pill key={item.id} label={item.label} active={lang === item.id} onPress={() => setPref('lang', item.id)} />
              ))}
            </View>
            <Row label="Appearance" value={prefs.dark ? 'Dark' : 'Light'} onPress={() => setPref('dark', !prefs.dark)} />
            <View style={{ marginTop: spacing.lg }}>
              <Button label="Continue" onPress={() => setStep(2)} />
            </View>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <Text style={[styles.h2, { color: c.ink }]}>{t('location')}</Text>
            <Text style={[styles.p, { color: c.inkSoft }]}>
              RIFQ Muslim needs your location to identify your city, region, country and capital, to detect the correct IANA timezone
              and to calculate prayer times, the Qibla and Ramadan timings for exactly where you are.
            </Text>
            <Text style={[styles.p, { color: c.muted }]}>
              Location is used on your device only and is never shared publicly. You can turn automatic detection off at any time and
              choose a city manually instead.
            </Text>
            {locError ? <Notice tone="warn" title={t('unavailable')}>{locError}</Notice> : null}
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <Button
                label={locStatus === 'detecting' ? 'Detecting...' : 'Allow location & detect my city'}
                loading={locStatus === 'detecting'}
                onPress={async () => {
                  const result = await refreshLocation();
                  if (result?.ok) setStep(3);
                }}
              />
              <Button label="Choose my city manually" variant="ghost" onPress={() => setOnboarded(true)} />
              <Button label="Skip for now" variant="ghost" onPress={finish} />
            </View>
          </Card>
        )}

        {step === 3 && (
          <Card tone="gold">
            <Text style={[styles.h2, { color: c.ink }]}>You are ready</Text>
            <Text style={[styles.p, { color: c.inkSoft }]}>
              Your location is set. Prayer times, the next prayer countdown and the Qibla now follow your real position - and they
              update automatically when you travel.
            </Text>
            <Button label="Open RIFQ Muslim" onPress={finish} />
            <View style={{ marginTop: spacing.sm }}>
              <Button label="Sign in to sync my account" variant="ghost" onPress={() => { finish(); setTimeout(() => navigate('auth'), 0); }} />
            </View>
          </Card>
        )}

        <Text style={[styles.footer, { color: c.muted }]}>
          RIFQ Muslim {'\u00B7'} {t('tagline')} {'\u00B7'} Made by Eng Mohamud Yusuf
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl || 40 },
  hero: { borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg },
  kicker: { color: '#E7C766', fontSize: 11, letterSpacing: 3, fontWeight: '800' },
  arabic: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 6 },
  tagline: { color: '#E7C766', fontSize: 13, marginTop: 4 },
  credit: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: spacing.md },
  h2: { fontSize: 19, fontWeight: '800', marginBottom: spacing.sm },
  p: { fontSize: 13, lineHeight: 20, marginBottom: spacing.sm },
  feature: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  pills: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm, flexWrap: 'wrap' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: spacing.lg }
});
