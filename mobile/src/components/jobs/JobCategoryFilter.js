import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function JobCategoryFilter({
  categories = [],
  selectedCategory = 'TODAS',
  onSelectCategory,
  colors,
  typography,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderWrap}>
        <Text
          accessibilityRole="header"
          style={[
            typography.titleLarge,
            styles.sectionTitle,
            { color: colors.textPrimary },
          ]}
        >
          Categoria de empregos
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Selecione uma área de atuação
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollTrack}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Categoria ${cat.label}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: isSelected ? colors.primary : '#FFFFFF',
                  borderColor: isSelected ? colors.primaryDark : '#E2E8F0',
                },
              ]}
            >
              <View
                style={[
                  styles.categoryIconCircle,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : colors.surfaceTint,
                  },
                ]}
              >
                <Text style={styles.categoryIconEmoji}>{cat.icon}</Text>
              </View>
              <Text
                style={[
                  typography.caption,
                  styles.categoryCardLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeaderWrap: {
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  categoriesScrollTrack: {
    paddingVertical: 6,
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    width: 96,
    height: 104,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconEmoji: {
    fontSize: 22,
  },
  categoryCardLabel: {
    textAlign: 'center',
  },
});
