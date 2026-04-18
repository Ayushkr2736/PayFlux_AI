// ============================================
// PayFlux AI - Home Screen (Dashboard)
// mobile/src/screens/HomeScreen.js
// ============================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePayment } from '../hooks/usePayment';
import { useQueue } from '../hooks/useQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { formatCurrency } from '../utils/formatters';
import { COLORS, SIZES, SHADOWS } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { payments, fetchHistory } = usePayment();
  const { pendingCount } = useQueue();
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    fetchHistory(1, 5); // Load last 5 payments for preview
  }, []);

  const totalSpent = user?.metadata?.totalAmountSpent || 0;
  const totalTx = user?.metadata?.totalTransactions || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Network Status Banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Offline — payments will be queued</Text>
        </View>
      )}

      {/* Greeting */}
      <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary + '20' }]}>
          <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.accent + '20' }]}>
          <Text style={styles.statValue}>{totalTx}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Payment')}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionLabel}>New Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('History')}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Queue')}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionLabel}>Queue ({pendingCount})</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Payments */}
      <Text style={styles.sectionTitle}>Recent Payments</Text>
      {payments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No payments yet. Start your first transaction!</Text>
        </View>
      ) : (
        payments.slice(0, 5).map((payment) => (
          <View key={payment._id} style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentDesc}>{payment.description || 'Payment'}</Text>
              <Text style={styles.paymentStatus}>{payment.status}</Text>
            </View>
            <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.lg },
  offlineBanner: { backgroundColor: COLORS.warning + '30', padding: SIZES.sm, borderRadius: SIZES.radiusSm, marginBottom: SIZES.md },
  offlineText: { color: COLORS.warning, textAlign: 'center', fontWeight: '600', fontSize: SIZES.body },
  greeting: { fontSize: SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.lg },
  statsRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.lg },
  statCard: { flex: 1, padding: SIZES.md, borderRadius: SIZES.radiusMd, ...SHADOWS.small },
  statValue: { fontSize: SIZES.heading, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: SIZES.xs },
  sectionTitle: { fontSize: SIZES.bodyLg, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SIZES.md, marginTop: SIZES.md },
  actionsRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.lg },
  actionBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, alignItems: 'center', ...SHADOWS.small },
  actionIcon: { fontSize: 28, marginBottom: SIZES.xs },
  actionLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontWeight: '500' },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.lg, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: SIZES.body },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.sm },
  paymentDesc: { fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: '500' },
  paymentStatus: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  paymentAmount: { fontSize: SIZES.bodyLg, fontWeight: '700', color: COLORS.accent },
});
