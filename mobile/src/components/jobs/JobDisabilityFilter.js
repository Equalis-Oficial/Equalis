import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const DISABILITY_ICONS = {
  1: '🦽',
  2: '👁️',
  3: '🧏',
  4: '🧠',
  5: '🧩',
};

export default function JobDisabilityFilter({
  deficiencias = [],
  selectedDisabilityId = null,
  onSelectDisability,
  hasActiveFilters = false,
  onClearFilters,
  colors,
  typography,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderWrap}>
        <View style={styles.rowBetween}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleMedium,
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Compatibilidade PcD
          </Text>
          {hasActiveFilters ? (
            <TouchableOpacity
              onPress={onClearFilters}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Limpar todos os filtros ativos"
            >
              <Text style={[styles.clearFiltersLink, { color: colors.primary }]}>
                Limpar Filtros
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Filtre por recursos adaptados à sua necessidade
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pcdChipsTrack}
      >
        {/* Chip Meu Perfil */}
        <TouchableOpacity
          onPress={() =>
            onSelectDisability(selectedDisabilityId === 'MEU_PERFIL' ? null : 'MEU_PERFIL')
          }
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Filtrar vagas compatíveis com meu perfil cadastrado"
          accessibilityState={{ selected: selectedDisabilityId === 'MEU_PERFIL' }}
          style={[
            styles.pcdChip,
            {
              backgroundColor:
                selectedDisabilityId === 'MEU_PERFIL'
                  ? colors.accessibleNavy
                  : colors.surfaceSoft,
              borderColor:
                selectedDisabilityId === 'MEU_PERFIL'
                  ? colors.primaryDark
                  : colors.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.pcdChipText,
              {
                color:
                  selectedDisabilityId === 'MEU_PERFIL'
                    ? '#FFFFFF'
                    : colors.textPrimary,
                fontWeight: selectedDisabilityId === 'MEU_PERFIL' ? '700' : '500',
              },
            ]}
          >
            ⭐ Meu Perfil
          </Text>
        </TouchableOpacity>

        {/* Chips das Deficiências */}
        {deficiencias.map((def) => {
          const isSelected = selectedDisabilityId === def.id;
          const shortName = def.categoria.replace('Deficiência ', '');
          const icon = DISABILITY_ICONS[def.id] || '♿';

          return (
            <TouchableOpacity
              key={def.id}
              onPress={() =>
                onSelectDisability(isSelected ? null : def.id)
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Filtro para ${def.categoria}`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.pcdChip,
                {
                  backgroundColor: isSelected
                    ? colors.primaryDark
                    : colors.surfaceSoft,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.pcdChipText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {icon} {shortName}
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  clearFiltersLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pcdChipsTrack: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 16,
  },
  pcdChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pcdChipText: {
    fontSize: 13,
  },
});
