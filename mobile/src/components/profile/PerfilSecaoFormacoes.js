import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ICONS } from '../../theme/figmaAssets';

export default function PerfilSecaoFormacoes({
  formacoes = [],
  onAddFormacao,
  onDeleteFormacao,
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
          Formação Acadêmica
        </Text>
        <TouchableOpacity
          onPress={onAddFormacao}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Adicionar nova formação acadêmica"
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            + Adicionar formação
          </Text>
        </TouchableOpacity>
      </View>

      {formacoes.length === 0 ? (
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
            source={FIGMA_ICONS.jobDocument}
            style={{ width: 36, height: 36, marginBottom: 8, opacity: 0.6 }}
            resizeMode="contain"
          />
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
            ]}
          >
            Nenhuma formação cadastrada
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
            Inclua suas graduações, cursos técnicos, profissionalizantes ou certificações para enriquecer seu currículo no Equalis.
          </Text>
          <TouchableOpacity
            onPress={onAddFormacao}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Adicionar primeira formação acadêmica"
            style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.emptyStateBtnText}>+ Adicionar Formação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        formacoes.map((form) => (
          <View
            key={form.id}
            style={[
              styles.cardItem,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.cardItemHeader}>
              <Image
                source={FIGMA_ICONS.jobDocument}
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
                  {form.instituicao}
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.primaryDark, fontWeight: '600' },
                  ]}
                >
                  {form.diploma} - {form.area_estudo}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textMuted, marginTop: 2 },
                  ]}
                >
                  {form.mes_inicio}/{form.ano_inicio} - {form.mes_termino}/{form.ano_termino}
                </Text>
              </View>
            </View>

            {form.atividades_grupos ? (
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, marginTop: 8 },
                ]}
              >
                Atividades: {form.atividades_grupos}
              </Text>
            ) : null}

            {form.descricao ? (
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textMuted, marginTop: 4 },
                ]}
              >
                {form.descricao}
              </Text>
            ) : null}

            <View style={styles.cardItemActionsRow}>
              <TouchableOpacity
                onPress={() => onDeleteFormacao(form)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Excluir formação acadêmica de ${form.diploma} em ${form.instituicao}`}
                style={styles.cardActionDeleteBtn}
              >
                <Text style={styles.cardActionDeleteBtnText}>Excluir formação</Text>
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

