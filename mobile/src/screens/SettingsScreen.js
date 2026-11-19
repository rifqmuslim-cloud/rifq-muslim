/**
 * RIFQ Muslim - Settings and Profile.
 * Language and RTL, appearance, prayer calculation, notifications, location mode,
 * synchronization and account management.
 */
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Badge, Button, Card, Field, Notice, Pill, Row, Screen, SectionTitle, Toggle } from '../components/UI';
import { LANGUAGES } from '../i18n';
import { CALC_METHODS } from '../lib/prayer';
import { spacing } from '../theme';

const MADHABS = [
  { id: 'shafi', label: 'Shafi\u2019i / Maliki / Hanbali' },
  { id: 'hanafi', label: 'Hanafi' }
];

const HIGH_LATITUDE = [
  { id: 'middle', label: 'Middle of the night' },
  { id: 'seventh', label: 'One seventh' },
  { id: 'angle', label: 'Angle based' },
  { id: 'none', label: 'None' }
];

const PRE_MINUTES = [0, 5, 10, 15, 20, 30];

function confirm(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm }
  ]);
}

export default function SettingsScreen() {
  const {
    theme,
    t,
    prefs,
    setPref,
    setNotificationPref,
    lang,
    dark,
    location,
    locStatus,
    navigate,
    token,
    user,
    isAdmin,
    signOut,
    syncState,
    syncNow,
    notifState,
    clearAll,
    setOnboarded,
    timezone,
    formatTime
  } = useApp();
  const c = theme.c;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const doSync = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await syncNow();
      setMessage({ tone: 'soft', text: 'Synchronized with your account.' });
    } catch (error) {
      setMessage({ tone: 'danger', text: error.message || 'Sync failed' });
    } finally {
      setBusy(false);
    }
  };

  const resetLocal = () =>
    confirm('Reset local data', 'This clears settings and cached content on this device. Your account data stays on the server.', async () => {
      await clearAll();
      setOnboarded(false);
    });

  return (
    <Screen>
      <SectionTitle right={<Badge label="v1.0.0" tone="gold" />}>{t('settings')}</SectionTitle>

      {!!message && <Notice tone={message.tone} title="RIFQ Muslim">{message.text}</Notice>}

      <Card>
        <SectionTitle>Account</SectionTitle>
        {token ? (
          <>
            <Row label="Signed in as" value={user?.name || user?.email || 'member'} />
            <Row label="Email" value={user?.email || '\u2014'} />
            <Row label="Role" value={user?.role || 'user'} />
            <View style={{ height: spacing.sm }} />
            <Button label="Open profile" variant="outline" onPress={() => navigate('profile')} />
            <View style={{ height: spacing.sm }} />
            <Button label={t('signOut')} variant="ghost" onPress={() => signOut()} />
          </>
        ) : (
          <>
            <Text style={[styles.hint, { color: c.muted }]}>
              Sign in to keep your Quran bookmarks, tasbih counts, worship log and preferences in sync between Android, iOS and the web.
            </Text>
            <Button label={t('signIn')} onPress={() => navigate('auth')} />
          </>
        )}
        {isAdmin && (
          <>
            <View style={{ height: spacing.sm }} />
            <Button label="Admin console" variant="gold" onPress={() => navigate('admin')} />
          </>
        )}
      </Card>

      <Card>
        <SectionTitle>Location</SectionTitle>
        <Row label="Status" value={location ? (location.mode === 'gps' ? 'GPS detected' : 'Manually selected') : locStatus === 'loading' ? 'Detecting...' : 'Unavailable'} />
        <Row label="City" value={location?.city || '\u2014'} />
        <Row label="Country" value={location?.country || '\u2014'} />
        <Row label="Capital" value={location?.capital || '\u2014'} />
        <Row label="Timezone" value={timezone || '\u2014'} />
        <Row label="Local time" value={formatTime(new Date(), { second: '2-digit' })} />
        <Toggle label="Automatic GPS detection" value={!!prefs.autoLocation} onChange={(value) => setPref('autoLocation', value)} hint="Re-detect the location whenever the app opens or you travel." />
        <Button label="Manage location" variant="outline" onPress={() => navigate('location')} />
      </Card>

      <Card>
        <SectionTitle>Language</SectionTitle>
        <View style={styles.pills}>
          {LANGUAGES.map((item) => (
            <Pill key={item.code} label={item.native || item.label} active={lang === item.code} onPress={() => setPref('lang', item.code)} />
          ))}
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>Arabic switches the interface to right-to-left layout.</Text>
      </Card>

      <Card>
        <SectionTitle>Appearance & reading</SectionTitle>
        <Toggle label="Dark mode" value={!!dark} onChange={(value) => setPref('dark', value)} />
        <Toggle label="24-hour clock" value={!prefs.hour12} onChange={(value) => setPref('hour12', !value)} />
        <Toggle label="Show transliteration" value={!!prefs.showTransliteration} onChange={(value) => setPref('showTransliteration', value)} />
        <Toggle label="Show translation" value={!!prefs.showTranslation} onChange={(value) => setPref('showTranslation', value)} />
      </Card>

      <Card>
        <SectionTitle>Prayer calculation</SectionTitle>
        <Text style={[styles.hint, { color: c.muted }]}>Calculation method</Text>
        <View style={styles.pills}>
          {CALC_METHODS.map((method) => (
            <Pill key={method.id} label={method.label} active={prefs.calcMethod === method.id} onPress={() => setPref('calcMethod', method.id)} />
          ))}
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>Asr madhab</Text>
        <View style={styles.pills}>
          {MADHABS.map((item) => (
            <Pill key={item.id} label={item.label} active={prefs.madhab === item.id} onPress={() => setPref('madhab', item.id)} />
          ))}
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>High latitude adjustment</Text>
        <View style={styles.pills}>
          {HIGH_LATITUDE.map((item) => (
            <Pill key={item.id} label={item.label} active={prefs.highLatitude === item.id} onPress={() => setPref('highLatitude', item.id)} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Athan & reminders</SectionTitle>
        <Toggle
          label="Prayer notifications"
          value={!!prefs.notifications?.enabled}
          onChange={(value) => setNotificationPref('enabled', value)}
          hint={notifState?.supported ? `${notifState.scheduled || 0} notifications scheduled` : 'Notifications are not available in this build'}
        />
        {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((key) => (
          <Toggle
            key={key}
            label={t(key)}
            value={!!prefs.notifications?.[key]}
            onChange={(value) => setNotificationPref(key, value)}
          />
        ))}
        <Text style={[styles.hint, { color: c.muted }]}>Remind me before the athan</Text>
        <View style={styles.pills}>
          {PRE_MINUTES.map((minutes) => (
            <Pill
              key={minutes}
              label={minutes === 0 ? 'At athan' : `${minutes} min`}
              active={Number(prefs.notifications?.preMinutes || 0) === minutes}
              onPress={() => setNotificationPref('preMinutes', minutes)}
            />
          ))}
        </View>
        {!!notifState?.error && <Notice tone="danger" title="Notification problem">{notifState.error}</Notice>}
      </Card>

      <Card>
        <SectionTitle>Synchronization</SectionTitle>
        <Row label="Status" value={syncState?.status || 'idle'} />
        <Row label="Last sync" value={syncState?.at ? new Date(syncState.at).toLocaleString() : '\u2014'} />
        {!!syncState?.error && <Notice tone="danger" title="Sync error">{syncState.error}</Notice>}
        <Button label={busy ? 'Synchronizing...' : 'Sync now'} loading={busy} disabled={!token} onPress={doSync} />
        {!token && <Text style={[styles.hint, { color: c.muted }]}>Sign in to synchronize between devices.</Text>}
      </Card>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <Row label="Reset local data" value="clear cache" onPress={resetLocal} />
        <Row label="Privacy" value="location stays on device" />
      </Card>

      <Card>
        <SectionTitle>About</SectionTitle>
        <Row label="Application" value="RIFQ Muslim \u2013 \u0631\u0650\u0641\u0652\u0642 \u0645\u0633\u0644\u0645" />
        <Row label="Slogan" value="Your Faith, Your Daily Companion" />
        <Row label="Developer" value="Eng Mohamud Yusuf" />
        <Row label="Version" value="1.0.0 (1)" />
        <Text style={[styles.hint, { color: c.muted }]}>
          Quran text and translations are served by the RIFQ backend; prayer times are computed locally from your coordinates and
          timezone. Location lookup uses a reverse-geocoding service with an offline fallback.
        </Text>
      </Card>
    </Screen>
  );
}

export function ProfileScreen() {
  const { theme, t, user, token, navigate, refreshUser, signOut, collections, syncState } = useApp();
  const c = theme.c;
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [state, setState] = useState({ busy: null, error: null, ok: null });

  if (!token) {
    return (
      <Screen>
        <SectionTitle>{t('profile')}</SectionTitle>
        <Notice tone="soft" title="Not signed in">
          Sign in or create an account to synchronize your worship records across Android, iOS and the web.
        </Notice>
        <Button label={t('signIn')} onPress={() => navigate('auth')} />
      </Screen>
    );
  }

  const saveName = async () => {
    setState({ busy: 'name', error: null, ok: null });
    try {
      await api.updateProfile({ name: name.trim() });
      await refreshUser();
      setState({ busy: null, error: null, ok: 'Profile updated.' });
    } catch (error) {
      setState({ busy: null, error: error.message || 'Update failed', ok: null });
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      setState({ busy: null, error: 'The new password must be at least 8 characters.', ok: null });
      return;
    }
    setState({ busy: 'password', error: null, ok: null });
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setState({ busy: null, error: null, ok: 'Password changed.' });
    } catch (error) {
      setState({ busy: null, error: error.message || 'Could not change the password', ok: null });
    }
  };

  const removeAccount = () =>
    confirm('Delete account', 'This permanently deletes your account and all synchronized data.', async () => {
      try {
        await api.deleteAccount();
        await signOut();
      } catch (error) {
        setState({ busy: null, error: error.message || 'Delete failed', ok: null });
      }
    });

  const favourites = (collections.favorites || []).length;
  const bookmarks = (collections.bookmarks || []).length;
  const tasbih = (collections.tasbih || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const worshipDays = (collections.worship || []).length;

  return (
    <Screen>
      <SectionTitle right={<Badge label={user?.role === 'admin' ? 'administrator' : 'member'} tone="gold" />}>{t('profile')}</SectionTitle>

      {!!state.error && <Notice tone="danger" title="Request failed">{state.error}</Notice>}
      {!!state.ok && <Notice tone="soft" title="Saved">{state.ok}</Notice>}

      <Card>
        <Row label="Email" value={user?.email || '\u2014'} />
        <Row label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '\u2014'} />
        <Row label="Last sync" value={syncState?.at ? new Date(syncState.at).toLocaleString() : '\u2014'} />
        <Field label="Display name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        <Button label={state.busy === 'name' ? 'Saving...' : 'Save profile'} loading={state.busy === 'name'} onPress={saveName} />
      </Card>

      <Card>
        <SectionTitle>Your records</SectionTitle>
        <Row label="Quran bookmarks" value={String(bookmarks)} />
        <Row label="Saved duas, hadith and names" value={String(favourites)} />
        <Row label="Tasbih count" value={String(tasbih)} />
        <Row label="Worship days logged" value={String(worshipDays)} />
      </Card>

      <Card>
        <SectionTitle>Security</SectionTitle>
        <Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
        <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" />
        <Button label={state.busy === 'password' ? 'Updating...' : 'Change password'} loading={state.busy === 'password'} onPress={changePassword} />
      </Card>

      <Card>
        <SectionTitle>Session</SectionTitle>
        <Button label={t('signOut')} variant="ghost" onPress={() => signOut()} />
        <View style={{ height: spacing.sm }} />
        <Button label="Delete my account" variant="danger" onPress={removeAccount} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  hint: { fontSize: 11.5, lineHeight: 17, marginTop: spacing.sm }
});
