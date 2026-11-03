import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibleInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  required = false,
  error = '',
  helperText = '',
  accessibilityHint,
  style,
}) {
  const { theme } = useAccessibility();
  const { colors, typography, radius, touchTarget } = theme;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = Boolean(secureTextEntry);
  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.primaryDark
    : colors.primary;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, marginBottom: 6 },
            ]}
          >
            {label}
            {required ? (
              <Text style={{ color: colors.danger }}> *</Text>
            ) : null}
          </Text>
          {maxLength && multiline ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {(value || '').length} de {maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor,
            borderWidth: isFocused || error || theme.highContrast ? 2 : 1.5,
            borderRadius: radius.md,
            minHeight: multiline
              ? Math.max(100, numberOfLines * 26)
              : touchTarget.minHeight,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={
            required ? `${label || placeholder}, obrigatório` : label || placeholder
          }
          accessibilityHint={accessibilityHint || helperText}
          style={[
            styles.input,
            typography.bodyLarge,
            {
              color: colors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Ocultar senha digitada' : 'Mostrar senha digitada'
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.toggleBtn}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            typography.caption,
            { color: colors.danger, marginTop: 4, fontWeight: '600' },
          ]}
        >
          ⚠ {error}
        </Text>
      ) : helperText ? (
        <Text
          style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 6,
  },
  toggleBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});

