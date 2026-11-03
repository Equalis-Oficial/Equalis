import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const formatCurrency = (val) => {
  if (typeof val === 'number') {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `R$ ${val || '1.621'}`;
};

export default function DetalhesVagaHeaderCard({
  vaga,
  candidaturaExistente,
  onNavigateRede,
  onRequestCancelCandidatura,
  colors,
  typography,
}) {
  return (
    <View>
      {/* CARTÃO PRINCIPAL: TÍTULO, EMPRESA E SALÁRIO DESTACADO */}
      <View style={styles.jobTitleCard}>
        <View style={styles.jobHeaderLeft}>
          <Text
            accessibilityRole="header"
            style={[typography.titleLarge, styles.boldTitle, { color: colors.textPrimary }]}
          >
            {vaga.titulo}
          </Text>
          <TouchableOpacity
            onPress={onNavigateRede}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel={`Ver empresa ${vaga.empresa_nome}`}
          >
            <Text style={[styles.companyLink, { color: colors.primary }]}>
              {vaga.empresa_nome}
            </Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              📍 {vaga.cidade} • {vaga.modalidade} • 💼 {vaga.carga_horaria}
            </Text>
          </View>
        </View>

        {/* Salário Destacado em Azul (Figma EL-d3a9146d) */}
        <View style={styles.salaryContainer}>
          <Text style={[styles.salaryAmount, { color: colors.primary }]}>
            {formatCurrency(vaga.salario)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Mensal + Benefícios
          </Text>
        </View>
      </View>

      {/* STATUS DA CANDIDATURA SE JÁ ESTIVER INSCRITO */}
      {candidaturaExistente ? (
        <View
          style={[
            styles.applicationStatusBox,
            { backgroundColor: '#E8F0FE', borderColor: colors.primary },
          ]}
        >
          <Text style={styles.statusBoxIcon}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusBoxTitle, { color: colors.primaryDark }]}>
              Sua Candidatura está em andamento
            </Text>
            <Text style={[typography.caption, { color: colors.textPrimary }]}>
              Status Atual:{' '}
              <Text style={{ fontWeight: '800', color: colors.primaryDark }}>
                {candidaturaExistente.status_processo}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRequestCancelCandidatura}
            style={[styles.cancelAppSmallBtn, { backgroundColor: '#FEE2E2' }]}
          >
            <Text style={styles.cancelAppSmallBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  jobTitleCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  boldTitle: {
    fontWeight: '800',
    fontSize: 20,
  },
  companyLink: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  applicationStatusBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBoxIcon: {
    fontSize: 24,
  },
  statusBoxTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  cancelAppSmallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelAppSmallBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
});

