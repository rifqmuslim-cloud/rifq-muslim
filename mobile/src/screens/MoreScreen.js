/**
 * RIFQ Muslim - More menu.
 * Entry point to every secondary module, account actions and app information.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Row, Screen, SectionTitle } from '../components/UI';
import { spacing, radius } from '../theme';

const GROUPS = [
  {
    title: 'Worship',
    items: [
      { key: 'qibla', label: 'Qibla direction', glyph: '\u{1F9ED}' },
      { key: 'calendar', label: 'Hijri calendar', glyph: '\u{1F4C5}' },
      { key: 'ramadan', label: 'Ramadan', glyph: '\u{1F319}' },
      { key: 'tasbih', label: 'Tasbih', glyph: '\u{1F4FF}' },
      { key: 'tracker', label: 'Worship tracker', glyph: '\u2705' },
      { key: 'zakat', label: 'Zakat calculator', glyph: '\u{1F4B0}' },
      { key: 'hajj', label: 'Hajj & Umrah', glyph: '\u{1F54B}' }
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { key: 'quran', label: 'Quran', glyph: '\u{1F4D6}' },
      { key: 'duas', label: 'Duas', glyph: '\u{1F932}' },
      { key: 'hadith', label: 'Hadith', glyph: '\u{1F4DC}' },
      { key: 'names', label: '99 Names of Allah', glyph: '\u2728' },
      { key: 'knowledge', label: 'Articles & fiqh', glyph: '\u{1F4DA}' }
    ]
  },
  {
    title: 'Places & account',
    items: [
      { key: 'mosques', label: 'Nearby mosques', glyph: '\u{1F54C}' },
      { key: 'location', label: 'Location & timezone', glyph: '\u{1F4CD}' },
      { key: 'settings', label: 'Settings', glyph: '\u2699\uFE0F' },
      { key: 'profile', label: 'Profile', glyph: '\u{1F464}' }
    ]
  }
];

export default function MoreScreen() {
  const { theme, t, navigate, user, auth, isAdmin, signOut, syncState, syncNow, prefs, location, localTime, timezone, lang, setPref } = useApp();
  const c = theme.c;

  return (
    <Screen>
      <SectionTitle right={<Badge label={auth.token ? 'Signed in' : 'Guest'} tone={auth.token ? 'good' : 'warn'} />}>
        {t('more')}
      </SectionTitle>

      <Card tone="gold">
        <Text style={[styles.name, { color: c.emerald }]}>{user?.name || 'Guest user'}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{user?.email || 'Sign in to sync across Android and iOS'}</Text>
        <Row label={t('location')} value={location ? `${location.flag || ''} ${location.city || '-'}, ${location.country || '-'}` : t('unavailable')} />
        <Row label={t('localTime')} value={localTime} mono />
        <Row label={t('timezone')} value={timezone} mono />
        <View style={styles.row}>
          {!auth.token && <Button label={t('signIn')} small onPress={() => navigate('auth')} />}
          {auth.token && <Button label={t('profile')} small onPress={() => navigate('profile')} />}
          {auth.token && <Button label={t('signOut')} small variant="ghost" onPress={() => signOut()} />}
          {isAdmin && <Button label={t('admin')} small variant="gold" onPress={() => navigate('admin')} />}
        </View>
      </Card>

      {auth.token && (
        <Notice tone={syncState.status === 'error' ? 'warn' : 'soft'} title="Shared account">
          {syncState.status === 'error'
            ? `Last sync failed: ${syncState.error}`
            : syncState.at
              ? `Synced ${new Date(syncState.at).toLocaleTimeString()}`
              : 'Press Sync now to pull your data from the server.'}
          {' '}
          Your Quran bookmarks, Tasbih counts, worship log and preferences are stored on the RIFQ backend.
        </Notice>
      )}

      <Card>
        <SectionTitle>{t('language')}</SectionTitle>
        <View style={styles.row}>
          {[{ id: 'en', label: 'English' }, { id: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' }, { id: 'so', label: 'Somali' }].map((item) => (
            <Button
              key={item.id}
              label={item.label}
              small
              variant={lang === item.id ? 'primary' : 'ghost'}
              onPress={() => setPref('lang', item.id)}
            />
          ))}
        </View>
        <Row label="Appearance" value={prefs.dark ? 'Dark' : 'Light'} onPress={() => setPref('dark', !prefs.dark)} />
        <Row label="Sync now" value={auth.token ? 'Pull from server' : 'Sign in required'} onPress={() => (auth.token ? syncNow() : navigate('auth'))} />
      </Card>

      {GROUPS.map((group) => (
        <Card key={group.title}>
          <SectionTitle>{group.title}</SectionTitle>
          {group.items.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => navigate(item.key)}
              style={[styles.item, { borderBottomColor: c.line }]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={{ fontSize: 18, marginRight: spacing.md }}>{item.glyph}</Text>
              <Text style={{ flex: 1, color: c.ink, fontSize: 14, fontWeight: '600' }}>{item.label}</Text>
              <Text style={{ color: c.emerald, fontWeight: '800' }}>{'\u203A'}</Text>
            </Pressable>
          ))}
        </Card>
      ))}

      <Card>
        <SectionTitle>About</SectionTitle>
        <Row label={t('appName')} value="RIFQ Muslim" />
        <Row label="Arabic" value={'\u0631\u0650\u0641\u0652\u0642 \u0645\u0633\u0644\u0645'} />
        <Row label={t('tagline')} value="Your Faith, Your Daily Companion." />
        <Row label={t('developer')} value="Eng Mohamud Yusuf" />
        <Row label="Version" value="1.0.0" />
        <Text style={[styles.sub, { color: c.muted, marginTop: spacing.md, lineHeight: 18 }]}>
          Prayer times are calculated astronomically from your GPS coordinates and IANA timezone. Location data stays on your
          device and is never shared publicly.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth }
});
