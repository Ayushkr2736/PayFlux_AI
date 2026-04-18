// ============================================
// PayFlux AI - History Screen
// mobile/src/screens/HistoryScreen.js
// ============================================

import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePayment } from '../hooks/usePayment';
import PaymentCard from '../components/PaymentCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SIZES } from '../theme';

export default function HistoryScreen() {
  const { payments, isLoading, pagination, fetchHistory } = usePayment();

  useEffect(() => {
    fetchHistory();
  }, []);

  function loadMore() {
    if (pagination.page < pagination.totalPages) {
      fetchHistory(pagination.page + 1);
    }
  }

  if (isLoading && payments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PaymentCard payment={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No payments found" icon="📋" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          pagination.page < pagination.totalPages ? (
            <Text style={styles.loadMore}>Loading more...</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.md },
  loadMore: { color: COLORS.textMuted, textAlign: 'center', padding: SIZES.md },
});
