/**
 * RIFQ Muslim - Mosques nearby.
 * Real OpenStreetMap / Overpass results for the detected coordinates through the
 * shared backend, sorted by distance with the Qibla bearing to each one.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Badge, Button, Card, Empty, Loading, Notice, Pill, Screen, SectionTitle } from '../components/UI';
import { qiblaBearing, distanceBetween } from '../lib/location';
import { spacing } from '../theme';

const RADII = [2000, 5000, 15000, 50000];

export default function MosquesScreen() {
  const { theme, t, location, navigate } = useApp();
  const c = theme.c;
  const [radius, setRadius] = useState(5000);
  const [state, setState] = useState({ loading: false, error: null, items: [], source: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    if (!location) {
      setState({ loading: false, error: 'location', items: [], source: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.mosques(location.latitude, location.longitude, radius);
      const raw = res.mosques || res.places || res.results || res.items || [];
      const items = raw
        .map((item, index) => {
          const lat = Number(item.latitude ?? item.lat);
          const lon = Number(item.longitude ?? item.lon ?? item.lng);
          const distance =
            Number.isFinite(lat) && Number.isFinite(lon)
              ? item.distance ?? Math.round(distanceBetween(location.latitude, location.longitude, lat, lon) * 1000)
              : item.distance;
          return {
            id: item.id || `${index}-${item.name || 'mosque'}`,
            name: item.name || item.tags?.name || 'Mosque',
            address: item.address || [item.city, item.country].filter(Boolean).join(', '),
            lat,
            lon,
            distance,
            bearing: Number.isFinite(lat) && Number.isFinite(lon) ? qiblaBearing(lat, lon) : null
          };
        })
        .filter((item) => item.name)
        .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
      setState({ loading: false, error: null, items, source: res.source || 'OpenStreetMap' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Could not load mosques', items: [], source: null });
    }
  }, [location, radius]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const openInMaps = (item) => {
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lon)) return;
    const label = encodeURIComponent(item.name);
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${label}&ll=${item.lat},${item.lon}`
        : `geo:${item.lat},${item.lon}?q=${item.lat},${item.lon}(${label})`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=17/${item.lat}/${item.lon}`));
  };

  return (
    <Screen>
      <SectionTitle right={<Badge label={state.source || 'OpenStreetMap'} tone="good" />}>{t('mosques')}</SectionTitle>

      {!location && (
        <Notice tone="warn" title="Location required">
          Mosques are searched around your real coordinates. Set your location to continue.
        </Notice>
      )}

      <Card>
        <Text style={[styles.label, { color: c.muted }]}>Search radius</Text>
        <View style={styles.pills}>
          {RADII.map((value) => (
            <Pill key={value} label={value >= 1000 ? `${value / 1000} km` : `${value} m`} active={radius === value} onPress={() => setRadius(value)} />
          ))}
        </View>
        <Button label={state.loading ? 'Searching...' : 'Refresh'} onPress={() => setRefreshKey((n) => n + 1)} loading={state.loading} small />
      </Card>

      {state.error === 'location' && <Button label="Set my location" onPress={() => navigate('location')} />}

      {state.loading && <Loading label="Searching mosques near you..." />}

      {!!state.error && state.error !== 'location' && <Notice tone="warn" title="Search failed">{state.error}</Notice>}

      {!state.loading && !state.error && !state.items.length && (
        <Empty title="No mosque found nearby" hint="Try a wider radius. Rural areas often have no mapped mosque yet." />
      )}

      {state.items.map((item) => (
        <Card key={item.id}>
          <View style={styles.head}>
            <Text style={[styles.name, { color: c.ink }]}>{item.name}</Text>
            {Number.isFinite(item.distance) && <Badge label={item.distance >= 1000 ? `${(item.distance / 1000).toFixed(1)} km` : `${Math.round(item.distance)} m`} tone="soft" />}
          </View>
          {!!item.address && <Text style={[styles.address, { color: c.muted }]}>{item.address}</Text>}
          <View style={styles.meta}>
            {Number.isFinite(item.bearing) && <Text style={[styles.metaText, { color: c.emerald }]}>Qibla {Math.round(item.bearing)}\u00b0</Text>}
            {Number.isFinite(item.lat) && (
              <Text style={[styles.metaText, { color: c.muted }]}>
                {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
              </Text>
            )}
          </View>
          <View style={styles.actions}>
            <Pill label="Open in maps" onPress={() => openInMaps(item)} />
            <Pill label="Qibla" onPress={() => navigate('qibla')} />
          </View>
        </Card>
      ))}

      <Text style={[styles.foot, { color: c.muted }]}>
        Mosque data comes from OpenStreetMap contributors through the RIFQ backend. Coverage depends on local mapping.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 15, fontWeight: '800', flex: 1 },
  address: { fontSize: 12, marginTop: 4 },
  meta: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  metaText: { fontSize: 11.5, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  foot: { fontSize: 11, lineHeight: 17, marginTop: spacing.md, textAlign: 'center' }
});
