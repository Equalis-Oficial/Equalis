import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PerfilSecaoSobre({
  resumoProfissional = '',
  competencias = [],
  onNavigateSobre,
  colors,
  typography,
  radius,
}) {
  const hasContent = Boolean(resumoProfissional && resumoProfissional.trim());

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
          Sobre
        </Text>
        <TouchableOpacity
          onPress={onNavigateSobre}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={hasContent ? 'Editar seção sobre' : 'Adicionar resumo sobre você'}
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            {hasContent ? 'Editar ✏️' : '+ Adicionar'}
          </Text>
        </TouchableOpacity>
      </View>

      {hasContent ? (
        <>
          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textSecondary, marginTop: 8, lineHeight: 22 },
            ]}
          >
            {resumoProfissional}
          </Text>

          {competencias && competencias.length > 0 ? (
            <View style={styles.chipsWrap}>
              {competencias.map((comp, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.skillChip,
                    { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.primaryDark, fontWeight: '600' },
                    ]}
                  >
                    ✓ {comp}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : (
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
          <Text style={styles.emptyStateEmoji}>✍️</Text>
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
            ]}
          >
            Apresente-se aos recrutadores
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
            Escreva um breve resumo sobre suas habilidades, trajetória e necessidades de acessibilidade no ambiente de trabalho.
          </Text>
          <TouchableOpacity
            onPress={onNavigateSobre}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Adicionar resumo profissional"
            style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.emptyStateBtnText}>+ Escrever Resumo Profissional</Text>
          </TouchableOpacity>
        </View>
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
});

