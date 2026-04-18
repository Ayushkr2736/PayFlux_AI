// ============================================
// PayFlux AI - Login Screen
// mobile/src/screens/LoginScreen.js
// ============================================

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { COLORS, SIZES } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>⚡ PayFlux AI</Text>
        <Text style={styles.subtitle}>Smart Payment Gateway</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Log In" onPress={handleLogin} loading={isLoading} />

        <Text style={styles.switchText}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Register
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: SIZES.lg },
  header: { alignItems: 'center', marginBottom: SIZES.xxl },
  logo: { fontSize: SIZES.hero, fontWeight: '700', color: COLORS.primary },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.xs },
  form: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.lg },
  title: { fontSize: SIZES.title, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.lg },
  input: {
    backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    color: COLORS.textPrimary, fontSize: SIZES.bodyLg, marginBottom: SIZES.md,
  },
  switchText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SIZES.md },
  link: { color: COLORS.primary, fontWeight: '600' },
});
