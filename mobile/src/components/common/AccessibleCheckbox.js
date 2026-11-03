import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibleCheckbox({
  label,
  description,
  checked = false,
  onToggle,
  accessibilityHint,
  style,
}) {
  const { theme } = useAccessibility();
  const { colors, typography, radius, touchTarget } = theme;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onToggle}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityLabel={description ? `${label}. ${description}` : label}
      accessibilityHint={
        accessibilityHint || 'Toque duas vezes para marcar ou desmarcar esta opção'
      }
      accessibilityState={{ checked }}
      style={[
        styles.row,
        {
          minHeight: touchTarget.minHeight,
          backgroundColor: checked ? colors.surfaceTint : 'transparent',
          borderRadius: radius.sm,
          borderColor: checked ? colors.primary : 'transparent',
          borderWidth: checked ? 1.5 : 0,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : '#DFE4E9',
            borderColor: checked ? colors.primaryDark : '#707070',
            borderRadius: 6,
          },
        ]}
      >
        {checked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>

      <View style={styles.textCol}>
        <Text
          style={[
            typography.bodyLarge,
            {
              color: colors.textPrimary,
              fontWeight: checked ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  box: {
    width: 34,
    height: 34,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  textCol: {
    flex: 1,
  },
});

