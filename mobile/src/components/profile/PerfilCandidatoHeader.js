import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function PerfilCandidatoHeader({
  candidatoPerfil = {},
  onOpenSettings,
  onOpenContactModal,
  onNavigateRede,
  onAddSection,
  onEditProfile,
  isAccessibleMode = false,
  colors,
  typography,
}) {
  return (
    <View>
      {/* Banner Oficial de Arcos Coloridos do Figma */}
      <View style={styles.bannerWrapper}>
        <Image
          source={FIGMA_ASSETS.bannerPerfilArcos}
          style={styles.bannerImage}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel="Banner ilustrativo de arcos do perfil"
        />
        <TouchableOpacity
          onPress={onOpenSettings}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Configurações do perfil"
          style={styles.settingsIconBtn}
        >
          <Text style={styles.settingsIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Informações Principais do Candidato */}
      <View style={styles.profileHeaderBox}>
        {/* Avatar Oficial do Figma (Panda / Raposa da Maria Ledentsova) */}
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.primary,
            },
          ]}
        >
          <Image
            source={FIGMA_ASSETS.avatarPandaRaposa}
            style={styles.avatarImg}
            accessible={true}
            accessibilityLabel={`Foto de perfil de ${candidatoPerfil.nome}`}
          />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.success, borderColor: colors.background },
            ]}
            accessible={true}
            accessibilityLabel="Status: Perfil Ativo para Contratação"
          />
        </View>

        {/* Nome e Cargo */}
        <Text
          style={[
            typography.titleLarge,
            {
              color: colors.textPrimary,
              fontWeight: '700',
              marginTop: 8,
              fontSize: isAccessibleMode ? 26 : 22,
            },
          ]}
          accessibilityRole="header"
        >
          {candidatoPerfil.nome || 'Meu Perfil'}
        </Text>

        <Text
          style={[
            typography.labelLarge,
            { color: colors.primaryDark, marginTop: 4, fontWeight: '600' },
          ]}
        >
          {candidatoPerfil.area_atuacao || 'Profissional PcD'}
        </Text>

        <Text
          style={[
            typography.bodyMedium,
            { color: colors.textMuted, marginTop: 4 },
          ]}
        >
          {[candidatoPerfil.cidade, candidatoPerfil.estado, candidatoPerfil.pais].filter(Boolean).join(', ') || 'Brasil'}
        </Text>

        {/* Link Informações de Contato e Conexões */}
        <View style={styles.contactAndConnectionsRow}>
          <TouchableOpacity
            onPress={onOpenContactModal}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Abrir informações de contato do candidato"
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
              ]}
            >
              Informações de contato
            </Text>
          </TouchableOpacity>

          <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 8 }]}>
            •
          </Text>

          <TouchableOpacity
            onPress={onNavigateRede}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Ver conexões. ${candidatoPerfil.conexoesCount || 0} conexões`}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              {candidatoPerfil.conexoesCount || 0} conexões
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pílula "Disponível Para" */}
        <View
          style={[
            styles.disponivelPill,
            { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
          ]}
          accessible={true}
          accessibilityLabel={`Disponível para: ${candidatoPerfil.disponivelPara || 'Oportunidades Inclusivas'}`}
        >
          <Text style={styles.disponivelIcon}>✨</Text>
          <Text
            style={[
              typography.caption,
              { color: colors.primaryDark, fontWeight: '700', flex: 1 },
            ]}
          >
            Disponível para: {candidatoPerfil.disponivelPara || 'Oportunidades Inclusivas'}
          </Text>
        </View>

        {/* Botões de Ação do Perfil: "Adicionar Seção" e "Editar Perfil" */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={onAddSection}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Adicionar nova seção ao perfil"
            style={[
              styles.outlineBtn,
              { borderColor: colors.primaryDark, backgroundColor: '#FFFFFF' },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              + Adicionar Seção
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEditProfile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Editar dados do perfil"
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primaryDark },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 110,
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
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
  contactAndConnectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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
  disponivelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
