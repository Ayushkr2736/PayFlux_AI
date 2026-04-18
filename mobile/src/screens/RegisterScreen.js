// ============================================
// PayFlux AI - Register Screen
// mobile/src/screens/RegisterScreen.js
// ============================================

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { COLORS, SIZES } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Name, email, and password are required');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email.trim().toLowerCase(), phone, password);
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>⚡ PayFlux AI</Text>

        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Phone (optional)" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

          <Button title="Register" onPress={handleRegister} loading={isLoading} />

          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Log In</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.lg },
  logo: { fontSize: SIZES.hero, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: SIZES.xl },
  form: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.lg },
  title: { fontSize: SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.lg },
  input: {
    backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    color: COLORS.textPrimary, fontSize: SIZES.bodyLg, marginBottom: SIZES.md,
  },
  switchText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SIZES.md },
  link: { color: COLORS.primary, fontWeight: '600' },
});
