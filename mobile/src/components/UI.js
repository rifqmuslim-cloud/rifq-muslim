/** RIFQ Muslim - shared UI primitives (phone + tablet responsive). */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import { useApp } from '../store/AppContext';
import { radius, spacing } from '../theme';

export function useLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return { width, isTablet, columns: isTablet ? 2 : 1, pad: isTablet ? spacing.xl : spacing.lg };
}

export function Screen({ children, scroll = true, style, contentStyle }) {
  const { theme } = useApp();
  const { pad, width } = useLayout();
  const body = (
    <View style={[{ padding: pad, width: '100%', maxWidth: 960, alignSelf: 'center' }, contentStyle]}>{children}</View>
  );
  if (!scroll) return <View style={[theme.screen, style]}>{body}</View>;
  return (
    <ScrollView
      style={[theme.screen, style]}
      contentContainerStyle={{ paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  );
}

export function Card({ children, style, tone }) {
  const { theme } = useApp();
  const c = theme.c;
  const tones = {
    emerald: { backgroundColor: c.emerald, borderColor: c.emeraldDeep },
    gold: { backgroundColor: c.goldSoft, borderColor: c.gold },
    danger: { backgroundColor: c.dangerSoft, borderColor: c.danger }
  };
  return <View style={[theme.card, tones[tone] || null, style]}>{children}</View>;
}

export function Title({ children, sub, right }) {
  const { theme } = useApp();
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Text style={theme.h1}>{children}</Text>
        {!!sub && <Text style={[theme.small, { marginTop: 2 }]}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  const { theme } = useApp();
  return (
    <View style={[styles.titleRow, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
      <Text style={theme.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style, small }) {
  const { theme } = useApp();
  const c = theme.c;
  const variants = {
    primary: { backgroundColor: c.emerald, borderColor: c.emeraldDeep, text: '#FFFFFF' },
    gold: { backgroundColor: c.gold, borderColor: c.gold, text: '#241C00' },
    outline: { backgroundColor: 'transparent', borderColor: c.emerald, text: c.emerald },
    ghost: { backgroundColor: 'transparent', borderColor: c.line, text: c.inkSoft },
    danger: { backgroundColor: c.danger, borderColor: c.danger, text: '#FFFFFF' }
  };
  const v = variants[variant] || variants.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.backgroundColor, borderColor: v.borderColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.buttonText, small && { fontSize: 13 }, { color: v.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Pill({ label, active, onPress, tone }) {
  const { theme } = useApp();
  const c = theme.c;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? c.emerald : tone === 'gold' ? c.goldSoft : 'transparent',
          borderColor: active ? c.emerald : c.line,
          opacity: pressed ? 0.8 : 1
        }
      ]}
    >
      <Text style={{ color: active ? '#FFFFFF' : c.inkSoft, fontSize: 12.5, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'soft' }) {
  const { theme } = useApp();
  const c = theme.c;
  const tones = {
    soft: { bg: c.emeraldSoft, fg: c.emerald },
    gold: { bg: c.goldSoft, fg: '#7A5C00' },
    danger: { bg: c.dangerSoft, fg: c.danger },
    muted: { bg: c.sand, fg: c.muted }
  };
  const t = tones[tone] || tones.soft;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.fg, fontSize: 11.5, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Row({ label, value, mono, onPress, right }) {
  const { theme } = useApp();
  const content = (
    <>
      <Text style={[theme.small, { flex: 1, paddingRight: 8 }]}>{label}</Text>
      {right}
      {value != null && (
        <Text
          style={{
            color: theme.c.ink,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'right',
            flexShrink: 1,
            ...(mono ? { fontVariant: ['tabular-nums'] } : {})
          }}
        >
          {value}
        </Text>
      )}
    </>
  );
  if (onPress)
    return (
      <Pressable onPress={onPress} style={styles.row} accessibilityRole="button">
        {content}
      </Pressable>
    );
  return <View style={styles.row}>{content}</View>;
}

export function Divider() {
  const { theme } = useApp();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.c.line, marginVertical: spacing.sm }} />;
}

export function Toggle({ label, value, onChange, hint }) {
  const { theme } = useApp();
  const c = theme.c;
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow} accessibilityRole="switch">
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: c.ink, fontSize: 14.5, fontWeight: '600' }}>{label}</Text>
        {!!hint && <Text style={[theme.small, { marginTop: 2 }]}>{hint}</Text>}
      </View>
      <View style={[styles.track, { backgroundColor: value ? c.emerald : c.line }]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start', backgroundColor: '#FFFFFF' }]} />
      </View>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, multiline }) {
  const { theme } = useApp();
  const c = theme.c;
  return (
    <View style={{ marginBottom: spacing.md }}>
      {!!label && <Text style={[theme.small, { marginBottom: 6, fontWeight: '700' }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
        multiline={multiline}
        style={{
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: theme.dark ? c.sand : '#FFFFFF',
          borderRadius: radius.sm,
          paddingHorizontal: 12,
          paddingVertical: 11,
          color: c.ink,
          fontSize: 15,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? 'top' : 'center'
        }}
      />
    </View>
  );
}

export function Empty({ title, hint, action }) {
  const { theme } = useApp();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <Text style={[theme.h3, { marginBottom: 6, textAlign: 'center' }]}>{title}</Text>
      {!!hint && <Text style={[theme.small, { textAlign: 'center', maxWidth: 320 }]}>{hint}</Text>}
      {action ? <View style={{ marginTop: spacing.md }}>{action}</View> : null}
    </View>
  );
}

export function Loading({ label }) {
  const { theme } = useApp();
  return (
    <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
      <ActivityIndicator color={theme.c.emerald} />
      {!!label && <Text style={[theme.small, { marginTop: 10 }]}>{label}</Text>}
    </View>
  );
}

export function Notice({ tone = 'soft', title, children }) {
  const { theme } = useApp();
  const c = theme.c;
  const map = {
    soft: { bg: c.emeraldSoft, border: c.emerald, fg: c.emerald },
    gold: { bg: c.goldSoft, border: c.gold, fg: '#6B5100' },
    danger: { bg: c.dangerSoft, border: c.danger, fg: c.danger }
  };
  const m = map[tone] || map.soft;
  return (
    <View style={{ backgroundColor: m.bg, borderColor: m.border, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md }}>
      {!!title && <Text style={{ color: m.fg, fontWeight: '800', marginBottom: 4, fontSize: 13.5 }}>{title}</Text>}
      {typeof children === 'string' ? <Text style={{ color: c.inkSoft, fontSize: 13, lineHeight: 19 }}>{children}</Text> : children}
    </View>
  );
}

export function Stat({ label, value, hint }) {
  const { theme } = useApp();
  const c = theme.c;
  return (
    <View style={{ flex: 1, minWidth: 96, backgroundColor: theme.dark ? c.sand : '#FFFFFF', borderWidth: 1, borderColor: c.line, borderRadius: radius.sm, padding: spacing.md }}>
      <Text style={{ fontSize: 11, color: c.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: c.ink, marginTop: 4 }}>{value}</Text>
      {!!hint && <Text style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{hint}</Text>}
    </View>
  );
}

export function Grid({ children, gap = spacing.md }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, marginBottom: spacing.md }}>{children}</View>;
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  button: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  buttonText: { fontSize: 14.5, fontWeight: '700' },
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, marginRight: 6, marginBottom: 6 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  track: { width: 46, height: 27, borderRadius: 999, padding: 3, justifyContent: 'center' },
  knob: { width: 21, height: 21, borderRadius: 999 }
});
