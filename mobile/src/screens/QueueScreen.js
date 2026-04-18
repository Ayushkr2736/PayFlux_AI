// ============================================
// PayFlux AI - Queue Screen
// mobile/src/screens/QueueScreen.js
// ============================================

import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useQueue } from '../hooks/useQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import QueueStatusBadge from '../components/QueueStatusBadge';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { COLORS, SIZES } from '../theme';

export default function QueueScreen() {
  const { queueItems, pendingCount, isSyncing, triggerSync } = useQueue();
  const { isConnected } = useNetworkStatus();

  async function handleSync() {
    if (!isConnected) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
      return;
    }

    const result = await triggerSync();
    Alert.alert('Sync Complete', `✅ Synced: ${result.synced}\n❌ Failed: ${result.failed}`);
  }

  return (
    <View style={styles.container}>
      {/* Sync Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Offline Queue</Text>
          <Text style={styles.subtitle}>{pendingCount} pending • {queueItems.length} total</Text>
        </View>
        {pendingCount > 0 && (
          <Button
            title={isSyncing ? 'Syncing...' : '🔄 Sync Now'}
            onPress={handleSync}
            loading={isSyncing}
            size="small"
          />
        )}
      </View>

      {/* Queue Items */}
      <FlatList
        data={queueItems}
        keyExtractor={(item) => item.localId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="Queue is empty" icon="📥" />}
        renderItem={({ item }) => (
          <View style={styles.queueCard}>
            <View style={styles.queueTop}>
              <Text style={styles.queueAmount}>{formatCurrency(item.amount)}</Text>
              <QueueStatusBadge status={item.status} />
            </View>
            <Text style={styles.queueDesc}>{item.description || 'Payment'}</Text>
            <Text style={styles.queueTime}>Created {formatRelativeTime(item.createdOfflineAt)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, paddingBottom: SIZES.sm },
  title: { fontSize: SIZES.heading, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  list: { padding: SIZES.md },
  queueCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.sm },
  queueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  queueAmount: { fontSize: SIZES.bodyLg, fontWeight: '700', color: COLORS.textPrimary },
  queueDesc: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.xs },
  queueTime: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: SIZES.xs },
});
