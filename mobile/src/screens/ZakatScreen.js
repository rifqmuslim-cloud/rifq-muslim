/**
 * RIFQ Muslim - Zakat calculator.
 * Gold, silver, cash, investments, business assets and debts with a real nisab
 * threshold (85 g gold / 595 g silver at the prices the user enters) and the
 * 2.5% rate. Nothing is estimated from invented prices.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { Badge, Button, Card, Field, Notice, Pill, Row, Screen, SectionTitle } from '../components/UI';
import { spacing } from '../theme';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'SOS', 'KES', 'TRY', 'PKR', 'IDR', 'MYR', 'NGN'];

export default function ZakatScreen() {
  const { theme, t, collections, upsert, removeItem, auth } = useApp();
  const c = theme.c;

  const [currency, setCurrency] = useState('USD');
  const [basis, setBasis] = useState('gold');
  const [goldPrice, setGoldPrice] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  const [cash, setCash] = useState('');
  const [bank, setBank] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [investments, setInvestments] = useState('');
  const [business, setBusiness] = useState('');
  const [debts, setDebts] = useState('');
  const [saved, setSaved] = useState(false);

  const num = (value) => {
    const parsed = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const result = useMemo(() => {
    const goldValue = num(goldGrams) * num(goldPrice);
    const silverValue = num(silverGrams) * num(silverPrice);
    const assets = num(cash) + num(bank) + goldValue + silverValue + num(investments) + num(business);
    const net = Math.max(0, assets - num(debts));

    const nisabGold = 85 * num(goldPrice);
    const nisabSilver = 595 * num(silverPrice);
    const nisab = basis === 'gold' ? nisabGold : nisabSilver;
    const eligible = nisab > 0 && net >= nisab;
    return {
      assets,
      net,
      nisab,
      eligible,
      due: eligible ? net * 0.025 : 0,
      missingPrice: nisab === 0
    };
  }, [cash, bank, goldGrams, silverGrams, goldPrice, silverPrice, investments, business, debts, basis]);

  const records = (collections.favorites || []).filter((item) => item.type === 'zakat');

  const save = () => {
    if (!result.net) return;
    upsert('favorites', {
      id: `zakat-${Date.now()}`,
      type: 'zakat',
      currency,
      net: result.net,
      due: result.due,
      nisab: result.nisab,
      basis,
      at: new Date().toISOString()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const money = (value) => `${currency} ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <Screen>
      <SectionTitle right={<Badge label={result.eligible ? 'Zakat due' : 'Below nisab'} tone={result.eligible ? 'good' : 'soft'} />}>
        {t('zakat')}
      </SectionTitle>

      <Notice tone="soft" title="How it works">
        Enter today's gold and silver price per gram in your currency. Nisab is 85 g of gold or 595 g of silver; zakat is 2.5% of the
        net zakatable wealth held for one lunar year. RIFQ Muslim does not invent prices - use your local market rate.
      </Notice>

      <Card>
        <SectionTitle>Currency</SectionTitle>
        <View style={styles.pills}>
          {CURRENCIES.map((item) => (
            <Pill key={item} label={item} active={currency === item} onPress={() => setCurrency(item)} />
          ))}
        </View>
        <SectionTitle>Nisab basis</SectionTitle>
        <View style={styles.pills}>
          <Pill label="Gold (85 g)" active={basis === 'gold'} onPress={() => setBasis('gold')} />
          <Pill label="Silver (595 g)" active={basis === 'silver'} onPress={() => setBasis('silver')} />
        </View>
        <Field label={`Gold price per gram (${currency})`} value={goldPrice} onChangeText={setGoldPrice} keyboardType="decimal-pad" placeholder="e.g. 75" />
        <Field label={`Silver price per gram (${currency})`} value={silverPrice} onChangeText={setSilverPrice} keyboardType="decimal-pad" placeholder="e.g. 0.9" />
      </Card>

      <Card>
        <SectionTitle>Zakatable assets</SectionTitle>
        <Field label={`Cash in hand (${currency})`} value={cash} onChangeText={setCash} keyboardType="decimal-pad" placeholder="0" />
        <Field label={`Bank & savings (${currency})`} value={bank} onChangeText={setBank} keyboardType="decimal-pad" placeholder="0" />
        <Field label="Gold owned (grams)" value={goldGrams} onChangeText={setGoldGrams} keyboardType="decimal-pad" placeholder="0" />
        <Field label="Silver owned (grams)" value={silverGrams} onChangeText={setSilverGrams} keyboardType="decimal-pad" placeholder="0" />
        <Field label={`Shares & investments (${currency})`} value={investments} onChangeText={setInvestments} keyboardType="decimal-pad" placeholder="0" />
        <Field label={`Business stock & receivables (${currency})`} value={business} onChangeText={setBusiness} keyboardType="decimal-pad" placeholder="0" />
        <Field label={`Debts you owe (${currency})`} value={debts} onChangeText={setDebts} keyboardType="decimal-pad" placeholder="0" />
      </Card>

      <Card tone="gold">
        <SectionTitle>Result</SectionTitle>
        <Row label="Total assets" value={money(result.assets)} mono />
        <Row label="Debts" value={money(num(debts))} mono />
        <Row label="Net zakatable wealth" value={money(result.net)} mono />
        <Row label={`Nisab (${basis})`} value={result.nisab ? money(result.nisab) : 'Enter a metal price'} mono />
        <Text style={[styles.due, { color: c.emerald }]}>{money(result.due)}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          {result.missingPrice
            ? 'Add the current gold or silver price to determine the nisab threshold.'
            : result.eligible
              ? 'Your wealth exceeds the nisab, so 2.5% is due.'
              : 'Your wealth is below the nisab, so no zakat is due.'}
        </Text>
        <View style={styles.row}>
          <Button label={saved ? 'Saved \u2713' : t('save')} small onPress={save} disabled={!result.net} />
          <Button label="Clear" small variant="ghost" onPress={() => {
            setCash(''); setBank(''); setGoldGrams(''); setSilverGrams(''); setInvestments(''); setBusiness(''); setDebts('');
          }} />
        </View>
      </Card>

      {!!records.length && (
        <Card>
          <SectionTitle>Saved calculations</SectionTitle>
          {records.slice(0, 10).map((item) => (
            <Row
              key={item.id}
              label={`${item.currency} ${Number(item.net).toLocaleString()} net`}
              value={`${item.currency} ${Number(item.due).toLocaleString()} \u00B7 ${new Date(item.at).toLocaleDateString()}`}
              onPress={() => removeItem('favorites', item.id)}
            />
          ))}
          <Text style={[styles.sub, { color: c.muted }]}>Tap a record to delete it.</Text>
        </Card>
      )}

      {!auth.token && (
        <Notice tone="warn" title="Saved locally">
          Sign in to keep your zakat records and preferences on every device.
        </Notice>
      )}

      <Text style={[styles.sub, { color: c.muted, textAlign: 'center' }]}>
        Zakat is an obligation on wealth held for a full lunar year. Consult a scholar for complex assets.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  due: { fontSize: 32, fontWeight: '800', marginTop: spacing.md },
  sub: { fontSize: 12, lineHeight: 18, marginTop: 6 }
});
