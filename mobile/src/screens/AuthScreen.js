/**
 * RIFQ Muslim - authentication.
 * Sign in, register and password reset against the shared RIFQ backend. The same
 * account works on Android, iOS and the web.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle } from '../components/UI';
import { spacing } from '../theme';

export default function AuthScreen() {
  const { theme, t, signIn, signUp, navigate, resetTo, back } = useApp();
  const c = theme.c;

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    if (mode !== 'signin' && password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim().toLowerCase(), password);
      } else if (mode === 'signup') {
        await signUp(email.trim().toLowerCase(), password, name.trim() || undefined);
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email.trim().toLowerCase());
        setInfo(res.message || 'If the account exists, a reset code has been issued.');
        setMode('reset');
      } else if (mode === 'reset') {
        await api.resetPassword(email.trim().toLowerCase(), code.trim(), password);
        await signIn(email.trim().toLowerCase(), password);
      }
      if (mode === 'signin' || mode === 'signup' || mode === 'reset') {
        resetTo('home');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'signin' ? t('signIn') : mode === 'signup' ? t('signUp') : mode === 'forgot' ? 'Reset password' : 'Enter reset code';

  return (
    <Screen>
      <SectionTitle>{title}</SectionTitle>

      <Card tone="gold">
        <Text style={[styles.brand, { color: c.emerald }]}>{'\u0631\u0650\u0641\u0652\u0642 \u0645\u0633\u0644\u0645'}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          One account for Android, iOS and web: Quran bookmarks, Tasbih counts, worship progress and preferences stay in sync.
        </Text>
      </Card>

      <Card>
        <View style={styles.pills}>
          <Pill label={t('signIn')} active={mode === 'signin'} onPress={() => { setMode('signin'); setError(null); }} />
          <Pill label={t('signUp')} active={mode === 'signup'} onPress={() => { setMode('signup'); setError(null); }} />
        </View>

        {mode === 'signup' && (
          <Field label={t('name')} value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        )}
        <Field
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {(mode === 'reset') && (
          <Field label="Reset code" value={code} onChangeText={setCode} placeholder="Code from your email" autoCapitalize="none" />
        )}
        <Field
          label={mode === 'forgot' ? t('email') : t('password')}
          value={password}
          onChangeText={setPassword}
          placeholder={mode === 'signin' ? 'Your password' : 'At least 8 characters'}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Notice tone="warn" title="Could not continue">{error}</Notice> : null}
        {info ? <Notice tone="soft" title="Check your email">{info}</Notice> : null}

        <View style={{ marginTop: spacing.md }}>
          <Button label={busy ? '...' : title} onPress={submit} loading={busy} />
        </View>

        <View style={styles.links}>
          {mode === 'signin' && (
            <Text onPress={() => { setMode('forgot'); setError(null); }} style={[styles.link, { color: c.emerald }]}>
              Forgot password?
            </Text>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <Text onPress={() => { setMode('signin'); setError(null); setInfo(null); }} style={[styles.link, { color: c.emerald }]}>
              Back to sign in
            </Text>
          )}
          <Text onPress={() => navigate('home')} style={[styles.link, { color: c.muted }]}>
            Continue as guest
          </Text>
        </View>
      </Card>

      <Notice tone="soft" title="Privacy">
        Passwords are hashed on the server with scrypt. Your location is stored only on your device; the account stores the content you
        choose to save.
      </Notice>

      <Text onPress={back} style={[styles.link, { color: c.muted, textAlign: 'center' }]}>
        {'\u2039'} Back
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: 24, textAlign: 'center', fontWeight: '800' },
  sub: { fontSize: 12.5, lineHeight: 19, marginTop: spacing.sm, textAlign: 'center' },
  pills: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  links: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'center' },
  link: { fontSize: 12.5, fontWeight: '700' }
});
