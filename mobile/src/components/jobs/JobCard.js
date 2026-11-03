import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

const formatCurrency = (val) => {
  if (typeof val === 'number') {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `R$ ${val || '1.621'}`;
};

export default function JobCard({
  vaga,
  onPressDetails,
  colors,
  typography,
  radius,
}) {
  const isPresencial = vaga.modalidade?.toLowerCase().includes('presencial');

  return (
    <View
      accessible={true}
      accessibilityLabel={`Vaga de ${vaga.titulo} na empresa ${vaga.empresa_nome}. Salário ${formatCurrency(vaga.salario)}. Localidade ${vaga.cidade}.`}
      style={[
        styles.jobCard,
        {
          backgroundColor: '#FFFFFF',
          borderColor: colors.cardBorder,
          borderRadius: radius.lg,
        },
      ]}
    >
      {/* Linha 1: Logo da Empresa + Nome + Badges */}
      <View style={styles.cardHeaderRow}>
        {vaga.empresa_nome?.includes('UNICEPLAC') || vaga.empresa_id === 1 ? (
          <Image
            source={FIGMA_ASSETS.logoUniceplacQuadrada}
            style={styles.companyLogoImg}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel={`Logo da empresa ${vaga.empresa_nome}`}
          />
        ) : (
          <View style={[styles.companyLogoBox, { backgroundColor: colors.primary }]}>
            <Text style={styles.companyLogoInitial}>
              {(vaga.empresa_nome || 'E').substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.cardHeaderInfo}>
          <View style={styles.companyNameBadgeRow}>
            <Text
              style={[
                typography.labelLarge,
                styles.companyNameText,
                { color: colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {vaga.empresa_nome}
            </Text>
            {/* Selo oficial de inclusão PcD */}
            <View style={[styles.verifiedTag, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.verifiedTagText}>✓ PcD Inclusivo</Text>
            </View>
          </View>

          {/* Localidade */}
          <View style={styles.locationRow}>
            <Text style={styles.locationPinEmoji}>📍</Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {vaga.cidade} • {vaga.estado}
            </Text>
          </View>
        </View>
      </View>

      {/* Linha 2: Cargo em Destaque */}
      <Text
        style={[
          typography.titleMedium,
          styles.jobTitleText,
          { color: colors.textPrimary },
        ]}
      >
        {vaga.titulo}
      </Text>

      {/* Linha 3: Metadados (Carga horária + Avaliação + Tempo + Salário) */}
      <View style={styles.cardMetaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>💼</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {vaga.carga_horaria || '6 horas'}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⭐</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
            {vaga.avaliacao_empresa || '4.9'}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🕒</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {vaga.tempo_publicacao || 'Recente'}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text
            style={[
              typography.caption,
              styles.salaryHighlight,
              { color: colors.success },
            ]}
          >
            {formatCurrency(vaga.salario)}
          </Text>
        </View>
      </View>

      {/* Linha 4: Tags de Recursos de Acessibilidade */}
      <View style={styles.accessibilityTagsWrap}>
        <View
          style={[
            styles.modalidadeChip,
            {
              backgroundColor: isPresencial ? '#E6F4EA' : '#E8F0FE',
              borderColor: isPresencial ? '#34A853' : '#1A73E8',
            },
          ]}
        >
          <Text
            style={[
              styles.modalidadeChipText,
              { color: isPresencial ? '#137333' : '#174EA6' },
            ]}
          >
            {vaga.modalidade || 'Presencial'}
          </Text>
        </View>

        {(vaga.recursos_acessibilidade || []).slice(0, 2).map((rec, i) => (
          <View
            key={i}
            style={[
              styles.accessChip,
              { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder },
            ]}
          >
            <Text
              style={[typography.caption, { color: colors.primaryDark, fontSize: 12 }]}
              numberOfLines={1}
            >
              ✓ {rec}
            </Text>
          </View>
        ))}
      </View>

      {/* Linha 5: Botão Detalhes vaga alinhado à direita */}
      <View style={styles.cardActionRow}>
        <TouchableOpacity
          onPress={() => onPressDetails(vaga)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes da vaga de ${vaga.titulo} na ${vaga.empresa_nome}`}
          style={[
            styles.detalhesVagaBtn,
            { backgroundColor: colors.primaryDark },
          ]}
        >
          <Text style={styles.detalhesVagaBtnText}>Detalhes vaga</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogoImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  companyLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  cardHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  companyNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  companyNameText: {
    fontWeight: '700',
    maxWidth: '65%',
  },
  verifiedTag: {
    backgroundColor: '#0966C2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPinEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  jobTitleText: {
    fontWeight: '700',
    marginBottom: 10,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
  },
  salaryHighlight: {
    fontWeight: '700',
  },
  accessibilityTagsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  modalidadeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalidadeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  accessChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
    paddingTop: 12,
  },
  detalhesVagaBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#1F41BB',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  detalhesVagaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

