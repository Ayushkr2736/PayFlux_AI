// ============================================
// PayFlux AI - Empty State Component
// mobile/src/components/EmptyState.js
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';

export default function EmptyState({ message = 'Nothing here yet', icon = '📭' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: SIZES.xxl },
  icon: { fontSize: 48, marginBottom: SIZES.md },
  message: { fontSize: SIZES.bodyLg, color: COLORS.textMuted, textAlign: 'center' },
});
