// ============================================
// PayFlux AI - Intelligence Banner
// mobile/src/components/IntelligenceBanner.js
// ============================================
// Displays risk/intent analysis after order creation.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RISK_LEVELS } from '../utils/constants';
import { COLORS, SIZES } from '../theme';

export default function IntelligenceBanner({ data }) {
  if (!data) return null;

  const riskInfo = RISK_LEVELS[data.riskLevel] || RISK_LEVELS.low;

  return (
    <View style={[styles.container, { borderLeftColor: riskInfo.color }]}>
      <Text style={styles.title}>🧠 Payment Intelligence</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Risk Level:</Text>
        <Text style={[styles.value, { color: riskInfo.color }]}>{riskInfo.label}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Action:</Text>
        <Text style={styles.value}>{data.suggestedAction?.replace('_', ' ')}</Text>
      </View>

      {data.flags?.length > 0 && (
        <View style={styles.flagsSection}>
          <Text style={styles.flagsTitle}>Flags:</Text>
          {data.flags.map((flag, i) => (
            <Text key={i} style={styles.flag}>• {flag.message}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderLeftWidth: 4,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  title: { fontSize: SIZES.bodyLg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  label: { fontSize: SIZES.body, color: COLORS.textSecondary },
  value: { fontSize: SIZES.body, fontWeight: '600', color: COLORS.textPrimary },
  flagsSection: { marginTop: SIZES.sm, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight },
  flagsTitle: { fontSize: SIZES.body, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SIZES.xs },
  flag: { fontSize: SIZES.caption, color: COLORS.warning, marginBottom: 2 },
});
