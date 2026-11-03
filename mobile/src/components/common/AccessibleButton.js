import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibleButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'primaryDark' | 'outline' | 'ghost' | 'danger' | 'success'
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  icon = null,
  style,
  textStyle,
  fullWidth = true,
}) {
  const { theme } = useAccessibility();
  const { colors, typography, touchTarget, radius } = theme;

  const getBackgroundColor = () => {
    if (disabled) return '#C2C2C2';
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'primaryDark':
        return colors.primaryDark;
      case 'danger':
        return colors.danger;
      case 'success':
        return colors.success;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#494949';
    switch (variant) {
      case 'outline':
        return colors.primaryDark;
      case 'ghost':
        return colors.textPrimary;
      default:
        return colors.textOnPrimary;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: colors.primaryDark,
      };
    }
    if (theme.highContrast && variant !== 'ghost') {
      return {
        borderWidth: 2,
        borderColor: '#000000',
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.button,
        {
          minHeight: touchTarget.minHeight,
          backgroundColor: getBackgroundColor(),
          borderRadius: radius.md,
          width: fullWidth ? '100%' : undefined,
        },
        getBorderStyle(),
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text
          style={[
            typography.labelLarge,
            {
              color: getTextColor(),
              textAlign: 'center',
              fontWeight: '700',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
});

