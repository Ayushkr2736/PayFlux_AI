// ============================================
// PayFlux AI - Payment Card Component
// mobile/src/components/PaymentCard.js
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { PAYMENT_STATUS } from '../utils/constants';
import { COLORS, SIZES, SHADOWS } from '../theme';

export default function PaymentCard({ payment }) {
  const statusInfo = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.created;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.description}>{payment.description || 'Payment'}</Text>
          <Text style={styles.time}>{formatRelativeTime(payment.createdAt)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
          <View style={[styles.badge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
      </View>

      {/* Intelligence info if available */}
      {payment.intelligence?.riskLevel && payment.intelligence.riskLevel !== 'low' && (
        <View style={styles.intelligenceRow}>
          <Text style={styles.intelligenceText}>
            ⚠️ {payment.intelligence.riskLevel.toUpperCase()} risk • Score: {payment.intelligence.riskScore}
          </Text>
        </View>
      )}

      {payment.syncedFromOffline && (
        <Text style={styles.syncedTag}>📥 Synced from offline queue</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.small },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1 },
  right: { alignItems: 'flex-end' },
  description: { fontSize: SIZES.body, fontWeight: '500', color: COLORS.textPrimary },
  time: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  amount: { fontSize: SIZES.bodyLg, fontWeight: '700', color: COLORS.accent },
  badge: { borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.sm, paddingVertical: 2, marginTop: SIZES.xs },
  badgeText: { fontSize: SIZES.caption, fontWeight: '600' },
  intelligenceRow: { marginTop: SIZES.sm, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.surfaceLight },
  intelligenceText: { fontSize: SIZES.caption, color: COLORS.warning },
  syncedTag: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: SIZES.xs },
});
