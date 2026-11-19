/**
 * RIFQ Muslim - Hajj and Umrah.
 * Step-by-step rites with the talbiyah and duas, plus a checklist that is saved
 * to the account so a pilgrim can track progress on any device.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Card, Notice, Row, Screen, SectionTitle } from '../components/UI';
import { HAJJ_STEPS } from '../data/content';
import { spacing, radius } from '../theme';

export default function HajjScreen() {
  const { theme, t, collections, upsert, removeItem } = useApp();
  const c = theme.c;
  const [openId, setOpenId] = useState(HAJJ_STEPS[0]?.id || null);
  const [mode, setMode] = useState('hajj');

  const completed = (collections.favorites || []).filter((item) => item.type === 'hajj-step').map((item) => item.stepId);
  const steps = mode === 'hajj' ? HAJJ_STEPS : HAJJ_STEPS.filter((step) => !/Arafah|Muzdalifah|Jamarat|Tawaf al-Ifadah/i.test(step.title));
  const percent = steps.length ? Math.round((steps.filter((step) => completed.includes(step.id)).length / steps.length) * 100) : 0;

  return (
    <Screen>
      <SectionTitle right={<Badge label={`${percent}% complete`} tone={percent === 100 ? 'good' : 'soft'} />}>{t('hajj')}</SectionTitle>

      <Card>
        <View style={styles.row}>
          <Pressable
            onPress={() => setMode('hajj')}
            style={[styles.tab, { borderColor: mode === 'hajj' ? c.emerald : c.line, backgroundColor: mode === 'hajj' ? c.emeraldSoft : 'transparent' }]}
          >
            <Text style={{ color: mode === 'hajj' ? c.emerald : c.inkSoft, fontWeight: '800', fontSize: 12.5 }}>Hajj</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('umrah')}
            style={[styles.tab, { borderColor: mode === 'umrah' ? c.emerald : c.line, backgroundColor: mode === 'umrah' ? c.emeraldSoft : 'transparent' }]}
          >
            <Text style={{ color: mode === 'umrah' ? c.emerald : c.inkSoft, fontWeight: '800', fontSize: 12.5 }}>Umrah</Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>
          {mode === 'hajj'
            ? 'The complete rites from ihram to the farewell tawaf, in order.'
            : 'The shorter pilgrimage: ihram, tawaf, sa\u2019i and trimming.'}
        </Text>
      </Card>

      {steps.map((step) => {
        const open = openId === step.id;
        const done = completed.includes(step.id);
        return (
          <Card key={step.id}>
            <Pressable onPress={() => setOpenId(open ? null : step.id)} accessibilityRole="button">
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: c.ink }]}>{step.title}</Text>
                </View>
                <Text style={{ color: done ? c.success : c.muted, fontWeight: '800' }}>{done ? '\u2713' : open ? '\u2212' : '+'}</Text>
              </View>
            </Pressable>

            {open && (
              <>
                <Text style={[styles.detail, { color: c.inkSoft }]}>{step.detail}</Text>
                {step.dua ? <Text style={[styles.dua, { color: c.emerald }]}>{step.dua}</Text> : null}
                <Pressable
                  onPress={() =>
                    done
                      ? removeItem('favorites', `hajj-${step.id}`)
                      : upsert('favorites', { id: `hajj-${step.id}`, type: 'hajj-step', stepId: step.id, title: step.title, at: new Date().toISOString() })
                  }
                  style={[styles.check, { borderColor: done ? c.success : c.line, backgroundColor: done ? c.emeraldSoft : 'transparent' }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: done }}
                >
                  <Text style={{ color: done ? c.success : c.inkSoft, fontWeight: '700', fontSize: 12.5 }}>
                    {done ? 'Completed \u2713' : 'Mark as completed'}
                  </Text>
                </Pressable>
              </>
            )}
          </Card>
        );
      })}

      <Notice tone="soft" title="Before you travel">
        Confirm your visa, vaccination requirements and the official Saudi Hajj portal for your country. RIFQ Muslim provides
        guidance only; follow your group's scholar and official authorities on site.
      </Notice>

      <Card>
        <SectionTitle>Essentials</SectionTitle>
        <Row label="Miqat" value="Ihram boundary before Makkah" />
        <Row label="Tawaf" value="7 circuits of the Kaaba" />
        <Row label="Sa'i" value="7 trips between Safa and Marwa" />
        <Row label="Arafah" value="9 Dhul Hijjah, the essential rite" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tab: { flex: 1, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 9, alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14.5, fontWeight: '800' },
  detail: { fontSize: 13, lineHeight: 21, marginTop: spacing.md },
  dua: { fontSize: 19, lineHeight: 34, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md },
  check: { borderWidth: 1.5, borderRadius: radius.pill, paddingVertical: 9, alignItems: 'center', marginTop: spacing.md },
  hint: { fontSize: 12, lineHeight: 18, marginTop: spacing.sm }
});
