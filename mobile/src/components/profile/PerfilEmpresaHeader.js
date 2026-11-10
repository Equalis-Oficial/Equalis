import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Alert } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import { useAuthAndData } from '../../context/AuthAndDataContext';

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
  const { atualizarEmpresaPerfil } = useAuthAndData();

  const isUniceplac =
    (empresaPerfil?.nome_fantasia || '').toUpperCase().includes('UNICEPLAC');

  const companyInitials = (empresaPerfil?.nome_fantasia || 'EM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'EM';

  const handleUploadImage = (tipo) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result;
            if (tipo === 'LOGO') {
              atualizarEmpresaPerfil({ logo_url: dataUrl });
            } else {
              atualizarEmpresaPerfil({ banner_url: dataUrl });
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert(
        tipo === 'LOGO' ? 'Logo da Empresa' : 'Capa da Empresa',
        'Selecione uma imagem para o perfil da sua empresa.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Usar Imagem Demo',
            onPress: () => {
              const urlExemplo = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop';
              if (tipo === 'LOGO') {
                atualizarEmpresaPerfil({ logo_url: urlExemplo });
              } else {
                atualizarEmpresaPerfil({ banner_url: urlExemplo });
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleUploadImage('BANNER')}
        style={[styles.empresaBannerWrap, !isUniceplac && styles.genericBannerWrap]}
        accessibilityLabel="Toque para alterar a imagem de capa da empresa"
      >
        {empresaPerfil?.banner_url ? (
          <Image
            source={{ uri: empresaPerfil.banner_url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : isUniceplac ? (
          <Image
            source={FIGMA_ASSETS.logoUniceplacBranca}
            style={{ width: 140, height: 44 }}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo da UNICEPLAC"
          />
        ) : (
          <View style={styles.genericBannerContent}>
            <Image
              source={FIGMA_ASSETS.iconWork}
              style={{ width: 28, height: 28, tintColor: '#FFFFFF', marginBottom: 6 }}
              resizeMode="contain"
              accessible={false}
            />
            <Text style={styles.genericBannerText}>
              {empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}
            </Text>
            <Text style={styles.uploadHintSmall}>Toque para alterar capa</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onOpenSettings}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Configurações da empresa"
          style={styles.settingsIconBtn}
        >
          <Image
            source={FIGMA_ASSETS.iconSettingsGear}
            style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
            resizeMode="contain"
            accessible={false}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.profileHeaderBox}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleUploadImage('LOGO')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toque para enviar o logo da sua empresa"
          style={[
            styles.avatarContainer,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.primaryDark,
            },
          ]}
        >
          {empresaPerfil?.logo_url ? (
            <Image
              source={{ uri: empresaPerfil.logo_url }}
              style={styles.empresaLogoImg}
              resizeMode="cover"
            />
          ) : isUniceplac ? (
            <Image
              source={FIGMA_ASSETS.logoUniceplacQuadrada}
              style={styles.empresaLogoImg}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel="Brasão da UNICEPLAC"
            />
          ) : (
            <View style={[styles.empresaInitialsBox, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.empresaInitialsText}>{companyInitials}</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.success, borderColor: colors.background },
            ]}
            accessible={true}
            accessibilityLabel="Empresa Verificada"
          />
        </TouchableOpacity>

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
          <Image
            source={FIGMA_ASSETS.iconCheck}
            style={{ width: 14, height: 14, tintColor: '#15803D', marginRight: 6 }}
            resizeMode="contain"
            accessible={false}
          />
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
              Inscrições ({candidaturasCount})
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
    overflow: 'hidden',
  },
  genericBannerWrap: {
    backgroundColor: '#1E3A8A',
  },
  genericBannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  genericBannerIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  genericBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  uploadHintSmall: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  empresaInitialsBox: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  empresaInitialsText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 2,
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

