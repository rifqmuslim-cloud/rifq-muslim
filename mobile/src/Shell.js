/**
 * RIFQ Muslim - navigation shell: bottom tabs, stacked subscreens, RTL aware,
 * responsive on tablets.
 */
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from './store/AppContext';
import { spacing, radius } from './theme';

import HomeScreen from './screens/HomeScreen';
import PrayerScreen from './screens/PrayerScreen';
import QuranScreen from './screens/QuranScreen';
import WorshipScreen from './screens/WorshipScreen';
import MoreScreen from './screens/MoreScreen';

import QiblaScreen from './screens/QiblaScreen';
import CalendarScreen from './screens/CalendarScreen';
import RamadanScreen from './screens/RamadanScreen';
import TasbihScreen from './screens/TasbihScreen';
import DuasScreen from './screens/DuasScreen';
import HadithScreen from './screens/HadithScreen';
import NamesScreen from './screens/NamesScreen';
import TrackerScreen from './screens/TrackerScreen';
import ZakatScreen from './screens/ZakatScreen';
import HajjScreen from './screens/HajjScreen';
import KnowledgeScreen from './screens/KnowledgeScreen';
import MosquesScreen from './screens/MosquesScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/SettingsScreen';
import AdminScreen from './screens/AdminScreen';
import LocationScreen from './screens/LocationScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';

const TABS = [
  { key: 'home', labelKey: 'home', glyph: '\u{1F54C}' },
  { key: 'prayer', labelKey: 'prayer', glyph: '\u{1F54B}' },
  { key: 'quran', labelKey: 'quran', glyph: '\u{1F4D6}' },
  { key: 'worship', labelKey: 'worship', glyph: '\u{1F4FF}' },
  { key: 'more', labelKey: 'more', glyph: '\u2630' }
];

const SCREENS = {
  home: HomeScreen,
  prayer: PrayerScreen,
  quran: QuranScreen,
  worship: WorshipScreen,
  more: MoreScreen,
  qibla: QiblaScreen,
  calendar: CalendarScreen,
  ramadan: RamadanScreen,
  tasbih: TasbihScreen,
  duas: DuasScreen,
  hadith: HadithScreen,
  names: NamesScreen,
  tracker: TrackerScreen,
  zakat: ZakatScreen,
  hajj: HajjScreen,
  knowledge: KnowledgeScreen,
  mosques: MosquesScreen,
  settings: SettingsScreen,
  profile: ProfileScreen,
  admin: AdminScreen,
  location: LocationScreen,
  auth: AuthScreen
};

export default function Shell() {
  const { theme, nav, back, setTab, t, onboarded, rtl, prefs } = useApp();
  const c = theme.c;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = `${t('appName')} - ${t('tagline')}`;
    document.documentElement.lang = prefs.lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [prefs.lang, rtl, t]);

  if (!onboarded) return <OnboardingScreen />;

  const Screen = SCREENS[nav.screen] || HomeScreen;
  const showBack = nav.history.length > 0;
  const isTab = TABS.some((tab) => tab.key === nav.screen);

  return (
    <View style={[styles.root, { backgroundColor: c.cream, direction: rtl ? 'rtl' : 'ltr' }]}>
      {showBack && (
        <View style={[styles.topBar, { backgroundColor: c.cream, borderBottomColor: c.line, flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Pressable onPress={back} style={[styles.backBtn, { borderColor: c.line }]} accessibilityRole="button">
            <Text style={{ color: c.emerald, fontWeight: '800', fontSize: 14 }}>{rtl ? '\u2192' : '\u2190'} {t('more') === 'More' ? 'Back' : 'رجوع'}</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Screen />
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.dark ? c.sand : '#FFFFFF', borderTopColor: c.line, flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {TABS.map((tab) => {
          const active = nav.tab === tab.key && isTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setTab(tab.key)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.labelKey)}
              accessibilityState={{ selected: active }}
            >
              <Text style={{ fontSize: 19, opacity: active ? 1 : 0.55 }}>{tab.glyph}</Text>
              <Text style={{ fontSize: 10.5, marginTop: 3, fontWeight: active ? '800' : '600', color: active ? c.emerald : c.muted }}>
                {t(tab.labelKey)}
              </Text>
              <View style={{ height: 3, width: 22, borderRadius: 2, marginTop: 4, backgroundColor: active ? c.gold : 'transparent' }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    paddingTop: 8
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }
});
