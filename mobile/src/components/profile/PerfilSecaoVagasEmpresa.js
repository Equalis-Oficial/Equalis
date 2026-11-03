import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PerfilSecaoVagasEmpresa({
  vagas = [],
  onPublishVaga,
  onViewVaga,
  onViewCandidatos,
  onEncerrarVaga,
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
          Oportunidades Cadastradas ({vagas.length})
        </Text>
        <TouchableOpacity
          onPress={onPublishVaga}
          accessible={true}
          accessibilityRole="button"
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            + Nova Vaga
          </Text>
        </TouchableOpacity>
      </View>

      {vagas.length === 0 ? (
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
          <Text style={styles.emptyStateEmoji}>💼</Text>
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
            ]}
          >
            Nenhuma vaga cadastrada
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
            Cadastre sua primeira oportunidade inclusiva para divulgar aos profissionais PcD e receber candidaturas com laudo.
          </Text>
          <TouchableOpacity
            onPress={onPublishVaga}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Publicar primeira vaga inclusiva"
            style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.emptyStateBtnText}>+ Publicar Nova Vaga</Text>
          </TouchableOpacity>
        </View>
      ) : (
        vagas.map((v) => (
          <View
            key={v.id}
            style={[
              styles.cardItem,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.cardItemHeader}>
              <Text style={styles.cardItemIcon}>💼</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.labelLarge,
                    { color: colors.textPrimary, fontWeight: '800' },
                  ]}
                >
                  {v.titulo}
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.primaryDark, fontWeight: '600', marginTop: 2 },
                  ]}
                >
                  {v.modalidade} • {v.cidade} - {v.estado}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.success, fontWeight: '700', marginTop: 2 },
                  ]}
                >
                  R$ {typeof v.salario === 'number' ? v.salario.toLocaleString('pt-BR') : v.salario} • {v.carga_horaria}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => onViewVaga(v)}
                style={[
                  styles.empresaMiniBtn,
                  { backgroundColor: colors.primaryDark },
                ]}
              >
                <Text style={styles.empresaMiniBtnText}>Ver Vaga</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onViewCandidatos}
                style={[
                  styles.empresaMiniBtn,
                  { backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.primaryDark },
                ]}
              >
                <Text style={[styles.empresaMiniBtnText, { color: colors.primaryDark }]}>
                  Ver Candidatos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onEncerrarVaga(v)}
                style={[
                  styles.empresaMiniBtn,
                  { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: colors.danger },
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Encerrar e excluir vaga de ${v.titulo}`}
              >
                <Text style={[styles.empresaMiniBtnText, { color: colors.danger }]}>
                  🗑️ Encerrar
                </Text>
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
  empresaMiniBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaMiniBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
