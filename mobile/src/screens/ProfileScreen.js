// ============================================
// PayFlux AI - Profile Screen
// mobile/src/screens/ProfileScreen.js
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { formatCurrency } from '../utils/formatters';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { RISK_LEVELS } from '../utils/constants';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const meta = user?.metadata || {};
  const riskInfo = RISK_LEVELS[meta.riskProfile] || RISK_LEVELS.low;

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      {/* Payment Stats */}
      <Text style={styles.sectionTitle}>Payment Intelligence</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{meta.totalTransactions || 0}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(meta.totalAmountSpent || 0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(meta.avgTransactionAmount || 0)}</Text>
          <Text style={styles.statLabel}>Avg Transaction</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: riskInfo.color }]}>{riskInfo.label}</Text>
          <Text style={styles.statLabel}>Risk Profile</Text>
        </View>
      </View>

      {/* Logout */}
      <Button title="🚪 Logout" onPress={handleLogout} variant="danger" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.lg },
  profileCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.xl, marginBottom: SIZES.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  avatarText: { fontSize: SIZES.hero, fontWeight: '700', color: '#FFF' },
  name: { fontSize: SIZES.heading, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.xs },
  sectionTitle: { fontSize: SIZES.bodyLg, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SIZES.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.xl },
  statItem: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, ...SHADOWS.small },
  statValue: { fontSize: SIZES.bodyLg, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: SIZES.xs },
});
