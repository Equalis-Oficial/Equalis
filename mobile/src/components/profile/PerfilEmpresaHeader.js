import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function PerfilEmpresaHeader({
  empresaPerfil = {},
  vagasCount = 0,
  candidaturasCount = 0,
  onOpenSettings,
  onPublishVaga,
  onViewCandidaturas,
  isAccessibleMode = false,
  colors,
  typography,
}) {
  return (
    <View>
      <View style={styles.empresaBannerWrap}>
        <Image
          source={FIGMA_ASSETS.logoUniceplacBranca}
          style={{ width: 140, height: 44 }}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={empresaPerfil?.nome_fantasia ? `Logo de ${empresaPerfil.nome_fantasia}` : 'Logo da Empresa'}
        />
        <TouchableOpacity
          onPress={onOpenSettings}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Configurações da empresa"
          style={styles.settingsIconBtn}
        >
          <Text style={styles.settingsIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeaderBox}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.primaryDark,
            },
          ]}
        >
          <Image
            source={FIGMA_ASSETS.logoUniceplacQuadrada}
            style={styles.empresaLogoImg}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel={empresaPerfil?.nome_fantasia ? `Brasão de ${empresaPerfil.nome_fantasia}` : 'Brasão da Empresa'}
          />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.success, borderColor: colors.background },
            ]}
            accessible={true}
            accessibilityLabel="Empresa Verificada"
          />
        </View>

        <Text
          style={[
            typography.titleLarge,
            {
              color: colors.textPrimary,
              fontWeight: '800',
              marginTop: 8,
              fontSize: isAccessibleMode ? 26 : 22,
            },
          ]}
          accessibilityRole="header"
        >
          {empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}
        </Text>

        <Text
          style={[
            typography.labelLarge,
            { color: colors.primaryDark, marginTop: 4, fontWeight: '700' },
          ]}
        >
          Empregador Inclusivo PcD
        </Text>

        <Text
          style={[
            typography.bodyMedium,
            { color: colors.textMuted, marginTop: 4 },
          ]}
        >
          {empresaPerfil?.cidade ? `${empresaPerfil.cidade}, ${empresaPerfil.estado || 'DF'} • ` : ''}CNPJ: {empresaPerfil?.cnpj || 'Não informado'}
        </Text>

        <View
          style={[
            styles.disponivelPill,
            { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' },
          ]}
        >
          <Text style={{ fontSize: 16 }}>🛡️</Text>
          <Text
            style={[
              typography.caption,
              { color: '#15803D', fontWeight: '800', flex: 1 },
            ]}
          >
            Conformidade Lei nº 8.213/91 (Cotas PcD Ativas)
          </Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={onPublishVaga}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cadastrar e publicar nova vaga inclusiva"
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primaryDark, flex: 1 },
            ]}
          >
            <Text style={[typography.labelLarge, { color: '#FFFFFF', fontWeight: '700' }]}>
              + Publicar Nova Vaga
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onViewCandidaturas}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Visualizar inscrições e laudos de candidatos recebidos"
            style={[
              styles.outlineBtn,
              { borderColor: colors.primaryDark, backgroundColor: '#FFFFFF', flex: 1 },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.primaryDark, fontWeight: '700' }]}>
              📋 Inscrições ({candidaturasCount})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.empresaMetricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder }]}>
            <Text style={[typography.titleLarge, { color: colors.primaryDark, fontWeight: '800' }]}>
              {vagasCount}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
              Vagas Ativas
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#F3E8FF', borderColor: '#C084FC' }]}>
            <Text style={[typography.titleLarge, { color: '#6B21A8', fontWeight: '800' }]}>
              {candidaturasCount}
            </Text>
            <Text style={[typography.caption, { color: '#6B21A8', textAlign: 'center' }]}>
              Candidatos PcD
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' }]}>
            <Text style={[typography.titleLarge, { color: '#15803D', fontWeight: '800' }]}>
              100%
            </Text>
            <Text style={[typography.caption, { color: '#15803D', textAlign: 'center' }]}>
              Laudos CID Ok
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empresaBannerWrap: {
    width: '100%',
    height: 120,
    backgroundColor: '#067451',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  settingsIconBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconText: {
    fontSize: 18,
  },
  profileHeaderBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginTop: -38,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  empresaLogoImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  disponivelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

