import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function AccessibleHeader({
  title = 'Equalis',
  showBack = false,
  onBack,
  showSearch = false,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showCreateVaga = false,
  audioSummary = '',
}) {
  const {
    theme,
    isAccessibleMode,
    speak,
    isSpeaking,
    stopSpeaking,
    speechBannerText,
    setIsA11yModalOpen,
  } = useAccessibility();
  const {
    navigate,
    goBack,
    mensagens,
    userType,
    candidatoPerfil,
    empresaPerfil,
    searchTerm,
    executarBusca,
  } = useAuthAndData();
  const { colors, typography } = theme;

  const [localSearch, setLocalSearch] = useState(searchValue !== undefined ? searchValue : (searchTerm || ''));

  useEffect(() => {
    if (searchValue !== undefined) {
      setLocalSearch(searchValue);
    }
  }, [searchValue]);

  const handleSearchChange = (text) => {
    setLocalSearch(text);
    if (onSearchChange) onSearchChange(text);
  };

  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      executarBusca(localSearch);
    }
  };

  const unreadCount = (mensagens || []).filter((m) => m.nao_lida).length;

  const isEmpresa = userType === 'EMPRESA';
  const isUniceplac = isEmpresa && ((empresaPerfil?.nome_fantasia || '').toUpperCase().includes('UNICEPLAC'));
  const isMaria = !isEmpresa && ((candidatoPerfil?.id === 1) || ((candidatoPerfil?.nome || candidatoPerfil?.nome_completo || '').toUpperCase().includes('MARIA')));
  const headerAvatarUri = isEmpresa ? empresaPerfil?.logo_url : candidatoPerfil?.avatar_url;
  const headerInitials = isEmpresa
    ? (empresaPerfil?.nome_fantasia || 'E').slice(0, 2).toUpperCase()
    : (candidatoPerfil?.nome || candidatoPerfil?.nome_completo || 'C').slice(0, 2).toUpperCase();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack(isAccessibleMode ? 'TELA_ACESSIVEL' : 'HOME');
    }
  };

  const handleA11yPress = () => {
    if (audioSummary) {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speak(audioSummary, true);
      }
    } else {
      setIsA11yModalOpen(true);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      {showSearch && !isAccessibleMode ? (
        <View style={styles.searchHeaderRow}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a tela anterior"
              style={[styles.backCircle, { backgroundColor: colors.primary }]}
            >
              <Image
                source={FIGMA_ASSETS.iconArrowBack}
                style={{ width: 16, height: 12, tintColor: '#FFFFFF' }}
                resizeMode="contain"
                accessible={false}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigate(userType === 'EMPRESA' ? 'PERFIL_EMPRESA' : 'PERFIL_CANDIDATO')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={userType === 'EMPRESA' ? `Abrir perfil de ${empresaPerfil?.nome_fantasia || 'Empresa'}` : `Abrir meu perfil de candidato`}
              style={[
                styles.avatarCircle,
                { borderColor: colors.primary },
                !headerAvatarUri && !isUniceplac && !isMaria && { backgroundColor: colors.primaryDark },
              ]}
            >
              {headerAvatarUri ? (
                <Image
                  source={{ uri: headerAvatarUri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : isUniceplac ? (
                <Image
                  source={FIGMA_ASSETS.logoUniceplacQuadrada}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : isMaria ? (
                <Image
                  source={FIGMA_ASSETS.avatarPandaRaposa}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                  {headerInitials}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.searchBox,
              { borderColor: colors.textSecondary, backgroundColor: '#FFFFFF' },
            ]}
          >
            <Image
              source={FIGMA_ASSETS.iconSearch}
              style={{ width: 15, height: 15, marginRight: 8, tintColor: colors.primary }}
              resizeMode="contain"
              accessible={false}
            />
            <TextInput
              value={localSearch}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              placeholder={userType === 'EMPRESA' ? 'Buscar candidatos ou vagas...' : 'Pesquisar vagas...'}
              placeholderTextColor={colors.textMuted}
              accessible={true}
              accessibilityLabel="Campo de pesquisa de vagas e empresas"
              style={[styles.searchInput, { color: colors.textPrimary }]}
              returnKeyType="search"
            />
          </View>

          {showCreateVaga ? (
            <TouchableOpacity
              onPress={() => navigate('PUBLICAR_VAGA_EMPRESA')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Criar nova vaga de emprego"
              style={[styles.createPill, { borderColor: colors.textSecondary, backgroundColor: '#FFFFFF' }]}
            >
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                + Criar
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => navigate('MENSAGENS')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Abrir mensagens. ${unreadCount} mensagens não lidas`
                : 'Abrir mensagens'
            }
            style={[styles.iconButton, { borderColor: colors.primary, backgroundColor: '#FFFFFF' }]}
          >
            <Image
              source={FIGMA_ASSETS.iconChatBubble}
              style={{ width: 18, height: 18, tintColor: colors.primary }}
              resizeMode="contain"
              accessible={false}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsA11yModalOpen(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu de acessibilidade, leitura em voz alta e tamanho de fonte"
            style={[
              styles.a11yBadgeBtn,
              { backgroundColor: colors.surfaceTint, borderColor: colors.primaryDark },
            ]}
          >
            <Image
              source={FIGMA_ASSETS.iconePcdAzul}
              style={styles.pcdSmallIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.standardRow}>
          {/* Lado Esquerdo: Botão Voltar ou Espaçador Simétrico (SEM logo duplicada!) */}
          <View style={styles.leftCol}>
            {showBack ? (
              <TouchableOpacity
                onPress={handleBack}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Voltar para a tela anterior"
                style={[styles.backCircle, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySpacer} />
            )}
          </View>

          {/* Centro: Logo Equalis Única ou Título da Tela */}
          <View style={styles.centerCol}>
            {title === 'Equalis' ? (
              <Image
                source={FIGMA_ASSETS.logoEqualis}
                style={styles.brandLogoCenter}
                resizeMode="contain"
                accessibilityRole="header"
                accessibilityLabel="Equalis"
              />
            ) : (
              <Text
                accessibilityRole="header"
                style={[
                  styles.headerTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.titleMedium.fontSize,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.75}
              >
                {title}
              </Text>
            )}
          </View>

          {/* Lado Direito: Áudio TTS e Menu Acessível */}
          <View style={styles.rightCol}>
            {audioSummary ? (
              <TouchableOpacity
                onPress={handleA11yPress}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={
                  isSpeaking
                    ? 'Parar leitura em voz alta da tela'
                    : 'Ouvir leitura em voz alta desta tela'
                }
                style={[
                  styles.a11ySpeakerBtn,
                  {
                    backgroundColor: isSpeaking ? colors.primaryDark : colors.surfaceTint,
                    borderColor: colors.primaryDark,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{isSpeaking ? '⏹' : '🔊'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => setIsA11yModalOpen(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Opções de acessibilidade: Tamanho da fonte e alto contraste"
              style={[
                styles.a11yMenuTrigger,
                { borderColor: colors.primaryDark, backgroundColor: colors.surfaceTint },
              ]}
            >
              <Text style={[typography.labelMedium, { color: colors.primaryDark, fontWeight: '800' }]}>
                A+
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isSpeaking && speechBannerText ? (
        <View
          accessibilityLiveRegion="assertive"
          style={[styles.speechBanner, { backgroundColor: colors.primaryDark }]}
        >
          <Text style={styles.speechBannerText} numberOfLines={2}>
            Lendo: "{speechBannerText}"
          </Text>
          <View style={styles.bannerActionsRow}>
            <TouchableOpacity
              onPress={stopSpeaking}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Parar áudio"
              style={styles.stopAudioBtn}
            >
              <Text style={styles.stopAudioText}>Parar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={stopSpeaking}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar aviso de voz"
              style={styles.closeAudioBtn}
            >
              <Text style={styles.closeAudioText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E5DF',
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFD180',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  createPill: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chatEmoji: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  a11yBadgeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pcdSmallIcon: {
    width: 24,
    height: 24,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  leftCol: {
    minWidth: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  emptySpacer: {
    width: 42,
    height: 42,
  },
  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: Platform.OS === 'android' ? 22 : 20,
    marginTop: Platform.OS === 'android' ? -2 : 0,
    marginLeft: Platform.OS === 'android' ? -1 : 0,
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  brandLogoCenter: {
    width: 140,
    height: 40,
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  a11ySpeakerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  a11yIconText: {
    fontSize: 20,
  },
  a11yNumberBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  a11yNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  a11yMenuTrigger: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBanner: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speechBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  stopAudioBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stopAudioText: {
    color: '#1F41BB',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeAudioBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeAudioText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
