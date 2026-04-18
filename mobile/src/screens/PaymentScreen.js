// ============================================
// PayFlux AI - Payment Screen
// mobile/src/screens/PaymentScreen.js
// ============================================

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { usePayment } from '../hooks/usePayment';
import { useQueue } from '../hooks/useQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import IntelligenceBanner from '../components/IntelligenceBanner';
import Button from '../components/Button';
import { COLORS, SIZES } from '../theme';

export default function PaymentScreen() {
  const { createNewOrder, isLoading } = usePayment();
  const { addPaymentToQueue } = useQueue();
  const { isConnected } = useNetworkStatus();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [intelligence, setIntelligence] = useState(null);

  async function handlePayment() {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 1) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₹1)');
      return;
    }

    const amountPaise = Math.round(amountNum * 100);

    // 1. Offline Logic
    if (!isConnected) {
      await addPaymentToQueue({
        amount: amountPaise,
        currency: 'INR',
        description: description || 'Offline Payment',
      });
      Alert.alert('Queued ✅', `Payment of ₹${amountNum} added to offline queue.`);
      setAmount('');
      setDescription('');
      return;
    }

    // 2. Web Compatibility Check
    // (Removed restriction so we can simulate order creation on web)

    // 3. Online Razorpay Flow
    try {
      const response = await createNewOrder({
        amount: amountPaise,
        description: description || 'Payment',
      });

      if (response.data?.intelligence) {
        setIntelligence(response.data.intelligence);
      }

      Alert.alert('Order Created', `Order ID: ${response.data.orderId}`);
      setAmount('');
      setDescription('');
    } catch (error) {
      Alert.alert('Payment Failed', error.message);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Offline mode — payment will be queued</Text>
        </View>
      )}

      <Text style={styles.title}>New Payment</Text>

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={COLORS.textMuted}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.descInput]}
        placeholder="What's this payment for?"
        placeholderTextColor={COLORS.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      {intelligence && <IntelligenceBanner data={intelligence} />}

      <Button
        title={isConnected ? '💳 Pay Now' : '📥 Queue Payment'}
        onPress={handlePayment}
        loading={isLoading}
        variant={isConnected ? 'primary' : 'secondary'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.lg },
  offlineBanner: { backgroundColor: COLORS.warning + '30', padding: SIZES.sm, borderRadius: SIZES.radiusSm, marginBottom: SIZES.md },
  offlineText: { color: COLORS.warning, textAlign: 'center', fontWeight: '600' },
  title: { fontSize: SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.lg },
  label: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xs, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    color: COLORS.textPrimary, fontSize: SIZES.heading, marginBottom: SIZES.md,
  },
  descInput: { fontSize: SIZES.bodyLg },
});
