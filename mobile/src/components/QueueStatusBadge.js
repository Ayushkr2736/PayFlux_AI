// ============================================
// PayFlux AI - Queue Status Badge
// mobile/src/components/QueueStatusBadge.js
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QUEUE_STATUS } from '../utils/constants';
import { SIZES } from '../theme';

export default function QueueStatusBadge({ status }) {
  const info = QUEUE_STATUS[status] || QUEUE_STATUS.queued;

  return (
    <View style={[styles.badge, { backgroundColor: info.color + '20' }]}>
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
  },
  text: { fontSize: SIZES.caption, fontWeight: '600' },
});
