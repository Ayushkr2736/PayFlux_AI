// ============================================
// PayFlux AI - Button Component
// mobile/src/components/Button.js
// ============================================

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';

const VARIANTS = {
  primary: { bg: COLORS.primary, text: '#FFF' },
  secondary: { bg: COLORS.surfaceLight, text: COLORS.textPrimary },
  danger: { bg: COLORS.error + '20', text: COLORS.error },
  success: { bg: COLORS.success + '20', text: COLORS.success },
};

export default function Button({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'normal',
  disabled = false,
}) {
  const colors = VARIANTS[variant] || VARIANTS.primary;
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.bg },
        isSmall && styles.small,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: colors.text }, isSmall && styles.smallText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
  },
  small: { paddingVertical: SIZES.sm, paddingHorizontal: SIZES.md },
  disabled: { opacity: 0.6 },
  text: { fontSize: SIZES.bodyLg, fontWeight: '600' },
  smallText: { fontSize: SIZES.body },
});
