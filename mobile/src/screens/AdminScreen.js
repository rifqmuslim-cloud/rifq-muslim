/**
 * RIFQ Muslim - Admin console.
 * Read-only statistics and user management for accounts with the admin role. All
 * checks happen again on the server for every request.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Badge, Button, Card, Field, Loading, Notice, Pill, Screen, SectionTitle } from '../components/UI';
import { spacing } from '../theme';

export default function AdminScreen() {
  const { theme, t, isAdmin, token, navigate } = useApp();
  const c = theme.c;
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: true, error: null, busy: null });

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setState({ loading: true, error: null, busy: null });
    try {
      const [statsRes, usersRes] = await Promise.all([api.adminStats(), api.adminUsers(query)]);
      setStats(statsRes.stats || statsRes);
      setUsers(usersRes.users || usersRes.items || []);
      setState({ loading: false, error: null, busy: null });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Could not load admin data', busy: null });
    }
  }, [isAdmin, query]);

  useEffect(() => {
    load();
  }, [load]);

  if (!token) {
    return (
      <Screen>
        <SectionTitle>{t('admin')}</SectionTitle>
        <Notice tone="warn" title="Sign in required">The admin console is available to administrators only.</Notice>
        <Button label={t('signIn')} onPress={() => navigate('auth')} />
      </Screen>
    );
  }

  if (!isAdmin) {
    return (
      <Screen>
        <SectionTitle>{t('admin')}</SectionTitle>
        <Notice tone="warn" title="Administrator access only">
          This account does not have the admin role. Sign in with an administrator account to manage users.
        </Notice>
      </Screen>
    );
  }

  const confirmDelete = (user) => {
    const run = async () => {
      setState((prev) => ({ ...prev, busy: user.id }));
      try {
        await api.adminDeleteUser(user.id);
        setUsers((list) => list.filter((item) => item.id !== user.id));
      } catch (error) {
        setState((prev) => ({ ...prev, error: error.message || 'Delete failed', busy: null }));
      }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete ${user.email}?`)) run();
      return;
    }
    Alert.alert('Delete account', `Permanently delete ${user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run }
    ]);
  };

  const toggleRole = async (user) => {
    const role = user.role === 'admin' ? 'user' : 'admin';
    setState((prev) => ({ ...prev, busy: user.id }));
    try {
      await api.adminUpdateUser(user.id, { role });
      setUsers((list) => list.map((item) => (item.id === user.id ? { ...item, role } : item)));
      setState((prev) => ({ ...prev, busy: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message || 'Update failed', busy: null }));
    }
  };

  const statEntries = stats && typeof stats === 'object' ? Object.entries(stats).filter(([, value]) => typeof value !== 'object') : [];

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${users.length} users`} tone="good" />}>{t('admin')}</SectionTitle>

      {!!state.error && <Notice tone="warn" title="Request failed">{state.error}</Notice>}

      {state.loading && <Loading label="Loading admin data..." />}

      {!!statEntries.length && (
        <Card>
          <SectionTitle>Overview</SectionTitle>
          {statEntries.map(([key, value]) => (
            <View key={key} style={[styles.statRow, { borderColor: c.line }]}>
              <Text style={[styles.statKey, { color: c.muted }]}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</Text>
              <Text style={[styles.statValue, { color: c.ink }]}>{String(value)}</Text>
            </View>
          ))}
        </Card>
      )}

      <Card>
        <Field label="Search users" value={query} onChangeText={setQuery} placeholder="Email or name" onSubmitEditing={load} />
        <Button label="Search" small onPress={load} />
      </Card>

      {users.map((user) => (
        <Card key={user.id}>
          <View style={styles.head}>
            <Text style={[styles.name, { color: c.ink }]}>{user.name || 'Unnamed'}</Text>
            <Badge label={user.role === 'admin' ? 'admin' : 'user'} tone={user.role === 'admin' ? 'gold' : 'soft'} />
          </View>
          <Text style={[styles.email, { color: c.muted }]}>{user.email}</Text>
          <Text style={[styles.meta, { color: c.muted }]}>
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'unknown'}
            {user.lastLoginAt ? ` \u00b7 last seen ${new Date(user.lastLoginAt).toLocaleDateString()}` : ''}
          </Text>
          <View style={styles.actions}>
            <Pill
              label={state.busy === user.id ? 'Working...' : user.role === 'admin' ? 'Make user' : 'Make admin'}
              onPress={() => toggleRole(user)}
            />
            <Pill label="Delete" onPress={() => confirmDelete(user)} />
          </View>
        </Card>
      ))}

      {!state.loading && !users.length && <Notice tone="soft" title="No users">No account matches this search yet.</Notice>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '800' },
  email: { fontSize: 12.5, marginTop: 2 },
  meta: { fontSize: 11, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  statKey: { fontSize: 12.5, textTransform: 'capitalize' },
  statValue: { fontSize: 13, fontWeight: '800' }
});
