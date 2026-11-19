/**
 * RIFQ Muslim - Location.
 * Automatic GPS detection with the real device coordinates, reverse geocoding,
 * country capital and IANA timezone, plus a fully manual fallback (country, city,
 * timezone) that is clearly labelled as manual.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { api } from '../api';
import { Badge, Button, Card, Field, Notice, Pill, Row, Screen, SectionTitle } from '../components/UI';
import { MODES, QUICK_CITIES, SOMALI_CITIES, countryByIso, manualCityOption, manualLocation } from '../lib/location';
import { spacing } from '../theme';
import countriesData from '../data/countries.json';

const COUNTRIES = (Array.isArray(countriesData) ? countriesData : countriesData.countries || [])
  .map((item) => ({
    iso2: item.iso2 || item.cca2 || item.code,
    name: item.name || (item.name && item.name.common) || item.country,
    capital: item.capital || null,
    flag: item.flag || null,
    region: item.region || null,
    timezones: item.timezones || [],
    latlng: item.latlng || null
  }))
  .filter((item) => item.iso2 && item.name);

const modeLabel = (mode) =>
  mode === MODES.GPS ? 'GPS detected' : mode === MODES.MANUAL ? 'Manually selected' : 'Location unavailable';

export default function LocationScreen() {
  const { theme, t, location, locStatus, locError, refreshLocation, manualLocation: applyManual, clearLocation, prefs, setPref, timezone, localTime, formatTime, navigate } = useApp();
  const c = theme.c;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES.slice(0, 24);
    return COUNTRIES.filter((item) => item.name.toLowerCase().includes(q) || (item.capital || '').toLowerCase().includes(q) || item.iso2.toLowerCase() === q).slice(0, 30);
  }, [query]);

  const quick = useMemo(() => {
    const list = [...(SOMALI_CITIES || []), ...(QUICK_CITIES || [])];
    const seen = new Set();
    return list.filter((item) => {
      const key = `${item.name}-${item.iso2 || item.country}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  }, []);

  const searchPlaces = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await api.searchPlaces(q, prefs.lang);
      const raw = res.results || res.places || res.items || [];
      setResults(
        raw
          .map((item, index) => {
            const lat = Number(item.latitude ?? item.lat);
            const lon = Number(item.longitude ?? item.lon ?? item.lng);
            const countryCode = item.countryCode || item.country_code || item.iso2 || null;
            return {
              id: item.id || `${index}-${item.name}`,
              name: item.name || item.city || item.displayName,
              region: item.region || item.admin1 || item.state || null,
              country: item.country || item.countryName || null,
              countryCode,
              lat,
              lon
            };
          })
          .filter((item) => item.name && Number.isFinite(item.lat) && Number.isFinite(item.lon))
      );
    } catch (error) {
      setSearchError(error.message || 'Place search failed');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickCountry = (country) => {
    applyManual(
      manualLocation({
        countryCode: country.iso2,
        country: country.name,
        city: country.capital || null,
        latitude: country.latlng?.[0],
        longitude: country.latlng?.[1],
        timezone: country.timezones?.[0]
      })
    );
  };

  const pickCity = (city) => {
    applyManual(manualCityOption({ name: city.name, region: city.region, country: city.country, iso2: city.iso2 || city.countryCode, lat: city.lat, lon: city.lon }));
  };

  const pickPlace = (place) => {
    applyManual(
      manualLocation({
        city: place.name,
        region: place.region,
        country: place.country,
        countryCode: place.countryCode,
        latitude: place.lat,
        longitude: place.lon
      })
    );
  };

  const country = location?.countryCode ? countryByIso(location.countryCode) : null;

  return (
    <Screen>
      <SectionTitle right={<Badge label={modeLabel(location?.mode)} tone={location?.mode === MODES.GPS ? 'good' : location ? 'gold' : 'warn'} />}>
        {t('location')}
      </SectionTitle>

      <Card tone={location ? 'plain' : 'warn'}>
        {location ? (
          <>
            <Text style={[styles.city, { color: c.ink }]}>
              {location.flag ? `${location.flag} ` : ''}
              {location.city || location.region || location.country || 'Detected location'}
            </Text>
            <Row label="Region / district" value={location.region || location.district || '\u2014'} />
            <Row label="Country" value={location.country || '\u2014'} />
            <Row label="Country ISO code" value={location.countryCode || '\u2014'} />
            <Row label="Country capital" value={location.capital || country?.capital || '\u2014'} />
            <Row label="Latitude" value={Number.isFinite(location.latitude) ? location.latitude.toFixed(6) : '\u2014'} />
            <Row label="Longitude" value={Number.isFinite(location.longitude) ? location.longitude.toFixed(6) : '\u2014'} />
            <Row label="GPS accuracy" value={location.accuracy ? `\u00b1${Math.round(location.accuracy)} m` : 'not reported'} />
            <Row label="IANA timezone" value={location.timezone || timezone || '\u2014'} />
            <Row label="Local date" value={new Date().toLocaleDateString('en-GB', { timeZone: timezone || 'UTC', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} />
            <Row label="Local time" value={formatTime(new Date(), { second: '2-digit' })} />
            <Row label="Detected by" value={location.provider || '\u2014'} />
            {!!location.note && <Text style={[styles.note, { color: c.muted }]}>{location.note}</Text>}
          </>
        ) : (
          <>
            <Text style={[styles.city, { color: c.ink }]}>Location unavailable</Text>
            <Text style={[styles.note, { color: c.muted }]}>
              Allow location access or choose your country and city manually below. RIFQ Muslim never invents a location.
            </Text>
          </>
        )}
        {!!locError && <Notice tone="warn" title="Location message">{locError}</Notice>}
        {locStatus === 'loading' && <Text style={[styles.note, { color: c.muted }]}>Requesting your GPS position...</Text>}
      </Card>

      <Card>
        <Button label={locStatus === 'loading' ? 'Detecting...' : 'Use my GPS location'} loading={locStatus === 'loading'} onPress={() => refreshLocation()} />
        <View style={{ height: spacing.sm }} />
        <Button
          label={prefs.autoLocation ? 'Automatic detection: on' : 'Automatic detection: off'}
          variant={prefs.autoLocation ? 'ghost' : 'secondary'}
          onPress={() => setPref('autoLocation', !prefs.autoLocation)}
        />
        {!!location && (
          <>
            <View style={{ height: spacing.sm }} />
            <Button label="Clear saved location" variant="ghost" onPress={() => clearLocation()} />
          </>
        )}
        <Text style={[styles.note, { color: c.muted }]}>
          Location is used on this device to compute prayer times, Qibla and the Hijri calendar. Your coordinates are not published
          and are only sent to the geocoding service to resolve your city and country.
        </Text>
      </Card>

      <Card>
        <SectionTitle>Quick cities</SectionTitle>
        <View style={styles.pills}>
          {quick.map((city) => (
            <Pill
              key={`${city.name}-${city.iso2 || city.country}`}
              label={city.name}
              active={location?.city === city.name}
              onPress={() => pickCity(city)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Search any city worldwide</SectionTitle>
        <Field label="City or place" value={query} onChangeText={setQuery} placeholder="e.g. Hargeisa, Cairo, Jakarta" onSubmitEditing={searchPlaces} />
        <Button label={searching ? 'Searching...' : 'Search places'} small loading={searching} onPress={searchPlaces} />
        {!!searchError && <Notice tone="warn" title="Search failed">{searchError}</Notice>}
        {results.map((place) => (
          <Pressable key={place.id} onPress={() => pickPlace(place)} accessibilityRole="button" style={[styles.result, { borderColor: c.line }]}>
            <Text style={[styles.resultName, { color: c.ink }]}>{place.name}</Text>
            <Text style={[styles.resultMeta, { color: c.muted }]}>
              {[place.region, place.country].filter(Boolean).join(', ') || `${place.lat.toFixed(3)}, ${place.lon.toFixed(3)}`}
            </Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <SectionTitle>Select a country</SectionTitle>
        <Field label="Country" value={query} onChangeText={setQuery} placeholder="Type a country or capital" />
        {filteredCountries.map((item) => (
          <Pressable
            key={item.iso2}
            onPress={() => pickCountry(item)}
            accessibilityRole="button"
            style={[styles.result, { borderColor: c.line }]}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.resultName, { color: c.ink }]}>
                {item.flag ? `${item.flag} ` : ''}
                {item.name}
              </Text>
              <Text style={[styles.resultMeta, { color: c.muted }]}>{item.iso2}</Text>
            </View>
            <Text style={[styles.resultMeta, { color: c.muted }]}>
              Capital: {item.capital || '\u2014'} \u00b7 {item.timezones?.[0] || 'timezone from coordinates'}
            </Text>
          </Pressable>
        ))}
        <Text style={[styles.note, { color: c.muted }]}>
          Selecting a country uses that country's capital coordinates and timezone. Choose a city above for exact prayer times.
        </Text>
      </Card>

      <Button label="Prayer settings" variant="ghost" onPress={() => navigate('prayer')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  city: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
  note: { fontSize: 11.5, lineHeight: 17, marginTop: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  result: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.sm },
  resultName: { fontSize: 13.5, fontWeight: '700' },
  resultMeta: { fontSize: 11, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
