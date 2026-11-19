/**
 * RIFQ Muslim - Qibla compass.
 * Bearing to the Kaaba computed from the real coordinates; device heading from
 * the magnetometer on Android/iOS (browser builds show the bearing only, since
 * most browsers do not expose a compass).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Notice, Row, Screen, SectionTitle } from '../components/UI';
import { qiblaBearing } from '../lib/prayer';
import { spacing } from '../theme';

const SIZE = 260;

export default function QiblaScreen() {
  const { theme, t, location, navigate } = useApp();
  const c = theme.c;
  const [heading, setHeading] = useState(null);
  const [supported, setSupported] = useState(true);
  const subRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setSupported(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const { Magnetometer } = require('expo-sensors');
        const available = await Magnetometer.isAvailableAsync();
        if (!available) {
          setSupported(false);
          return;
        }
        Magnetometer.setUpdateInterval(120);
        subRef.current = Magnetometer.addListener(({ x, y }) => {
          if (cancelled) return;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = (angle + 360) % 360;
          setHeading(Math.round(angle));
        });
      } catch {
        setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
      subRef.current?.remove?.();
    };
  }, []);

  if (!location) {
    return (
      <Screen>
        <SectionTitle>{t('qibla')}</SectionTitle>
        <Notice tone="warn" title={t('unavailable')}>
          The Qibla direction needs your real coordinates. Detect your location or select it manually.
        </Notice>
        <Button label={t('location')} onPress={() => navigate('location')} />
      </Screen>
    );
  }

  const bearing = qiblaBearing(location.latitude, location.longitude);
  const rotation = heading == null ? 0 : (bearing - heading + 360) % 360;
  const aligned = heading != null && Math.abs(((bearing - heading + 540) % 360) - 180) < 4;

  const polar = (deg, r) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: SIZE / 2 + r * Math.cos(rad), y: SIZE / 2 + r * Math.sin(rad) };
  };

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${bearing.toFixed(1)}\u00B0`} tone="good" />}>{t('qibla')}</SectionTitle>

      <Card>
        <View style={{ alignItems: 'center' }}>
          <Svg width={SIZE} height={SIZE}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 6} fill={c.emeraldSoft} stroke={c.emerald} strokeWidth={2} />
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 34} fill="none" stroke={c.line} strokeWidth={1} />
            {Array.from({ length: 12 }).map((_, index) => {
              const deg = index * 30;
              const outer = polar(deg, SIZE / 2 - 8);
              const inner = polar(deg, SIZE / 2 - 22);
              return <Line key={deg} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={c.emerald} strokeWidth={2} />;
            })}
            {['N', 'E', 'S', 'W'].map((label, index) => {
              const pos = polar(index * 90, SIZE / 2 - 44);
              return (
                <SvgText key={label} x={pos.x} y={pos.y + 5} fontSize={14} fontWeight="800" fill={c.emerald} textAnchor="middle">
                  {label}
                </SvgText>
              );
            })}

            {/* Kaaba needle */}
            <Path
              d={`M ${SIZE / 2} ${SIZE / 2 - 92} L ${SIZE / 2 - 12} ${SIZE / 2 + 8} L ${SIZE / 2 + 12} ${SIZE / 2 + 8} Z`}
              fill={aligned ? c.success : c.gold}
              transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
            />
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={9} fill={c.emeraldDeep} />
            <SvgText x={SIZE / 2} y={SIZE / 2 + 46} fontSize={11} fill={c.inkSoft} textAnchor="middle" fontWeight="700">
              KAABA
            </SvgText>
          </Svg>
          <Text style={[styles.hint, { color: aligned ? c.success : c.muted }]}>
            {heading == null
              ? 'Hold the phone flat and turn slowly.'
              : aligned
                ? 'You are facing the Qibla.'
                : `Turn ${Math.round(((bearing - heading + 360) % 360))}\u00B0 to face the Qibla.`}
          </Text>
        </View>
      </Card>

      {!supported && (
        <Notice tone="soft" title="Compass sensor">
          {Platform.OS === 'web'
            ? 'This browser build shows the calculated bearing. The Android and iOS apps read the device compass live.'
            : 'This device did not report a magnetometer, so only the calculated bearing is shown.'}
        </Notice>
      )}

      <Card>
        <Row label="Qibla bearing" value={`${bearing.toFixed(2)}\u00B0 from true north`} mono />
        <Row label="Device heading" value={heading == null ? 'Not available' : `${heading}\u00B0`} mono />
        <Row label="From" value={`${location.city || '-'}, ${location.country || '-'}`} />
        <Row label={t('coordinates')} value={`${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`} mono />
        <Row label="Destination" value="Kaaba, Makkah (21.4225, 39.8262)" mono />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 12.5, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 }
});
