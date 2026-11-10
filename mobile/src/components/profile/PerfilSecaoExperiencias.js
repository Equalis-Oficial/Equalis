import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ICONS } from '../../theme/figmaAssets';

export default function PerfilSecaoExperiencias({
  experiencias = [],
  onAddCargo,
  onDeleteExperiencia,
  colors,
  typography,
  radius,
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            typography.titleMedium,
            { color: colors.textPrimary, fontWeight: '700' },
          ]}
          accessibilityRole="header"
        >
          Experiências Profissionais
        </Text>
        <TouchableOpacity
          onPress={onAddCargo}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Adicionar nova experiência profissional"
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            + Adicionar cargo
          </Text>
        </TouchableOpacity>
      </View>

      {experiencias.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
              borderRadius: radius.md,
            },
          ]}
        >
          <Image
            source={FIGMA_ICONS.work}
            style={{ width: 36, height: 36, marginBottom: 8, opacity: 0.6 }}
            resizeMode="contain"
          />
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
            ]}
          >
            Nenhuma experiência adicionada
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
                marginBottom: 12,
                lineHeight: 20,
              },
            ]}
          >
            Adicione suas experiências anteriores, estágios ou trabalhos voluntários para destacar sua trajetória profissional.
          </Text>
          <TouchableOpacity
            onPress={onAddCargo}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Adicionar primeiro cargo ou experiência profissional"
            style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.emptyStateBtnText}>+ Adicionar Experiência</Text>
          </TouchableOpacity>
        </View>
      ) : (
        experiencias.map((exp) => (
          <View
            key={exp.id}
            style={[
              styles.cardItem,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.cardItemHeader}>
              <Image
                source={FIGMA_ICONS.work}
                style={{ width: 18, height: 18, marginRight: 8, marginTop: 2 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.labelLarge,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {exp.cargo}
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.primaryDark, fontWeight: '600' },
                  ]}
                >
                  {exp.organizacao} • {exp.tipo_emprego || 'Meio período'}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textMuted, marginTop: 2 },
                  ]}
                >
                  Início em {exp.mes_inicio || 'Março'}/{exp.ano_inicio || '2024'} •{' '}
                  {exp.tipo_localidade || 'Híbrido'}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textMuted, marginTop: 1 },
                  ]}
                >
                  {exp.localidade}
                </Text>
              </View>
            </View>

            {exp.descricao ? (
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, marginTop: 8 },
                ]}
              >
                {exp.descricao}
              </Text>
            ) : null}

            {exp.competencias && exp.competencias.length > 0 ? (
              <View style={[styles.chipsWrap, { marginTop: 6 }]}>
                {exp.competencias.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.skillChip,
                      { backgroundColor: colors.background, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {c}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.cardItemActionsRow}>
              <TouchableOpacity
                onPress={() => onDeleteExperiencia(exp)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Excluir experiência de ${exp.cargo} na ${exp.organizacao}`}
                style={styles.cardActionDeleteBtn}
              >
                <Text style={styles.cardActionDeleteBtnText}>Excluir cargo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  emptyStateCard: {
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyStateEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyStateBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cardItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardItemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardItemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cardActionDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cardActionDeleteBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
});

