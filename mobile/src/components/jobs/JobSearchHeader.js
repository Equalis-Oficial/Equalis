import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

export default function JobSearchHeader({
  onBack,
  title = 'Vagas Inclusivas',
  isSpeaking = false,
  onToggleVoiceAssist,
  onOpenA11yModal,
  locationFilter = '',
  onChangeLocationFilter,
  keywordFilter = '',
  onChangeKeywordFilter,
  colors,
}) {
  return (
    <View style={[styles.bannerHeader, { backgroundColor: '#104169' }]}>
      {/* Camada decorativa de ondas orgânicas */}
      <View style={styles.waveOverlay} />

      {/* Linha de Ações do Topo */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={onBack}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.backCircleBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.backCircleArrow}>←</Text>
        </TouchableOpacity>

        <Text
          accessibilityRole="header"
          style={[styles.headerBrandTitle, { color: '#FFFFFF' }]}
        >
          {title}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={onToggleVoiceAssist}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isSpeaking
                ? 'Parar leitura em voz alta da tela de vagas'
                : 'Ouvir resumo em áudio das vagas disponíveis'
            }
            style={[
              styles.voiceAssistBtn,
              { backgroundColor: isSpeaking ? colors.danger : colors.surfaceTint },
            ]}
          >
            <Text style={styles.voiceAssistIcon}>{isSpeaking ? '⏹️' : '♿'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenA11yModal}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Configurações de acessibilidade, contraste e tamanho de texto"
            style={[styles.a11ySettingsBtn, { backgroundColor: colors.surfaceTint }]}
          >
            <Text style={styles.a11ySettingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CÁPSULA DE BUSCA DUPLA DO FIGMA (LOCALIDADE + CARGO) */}
      <View
        style={[
          styles.searchCapsuleContainer,
          { borderColor: colors.primary, backgroundColor: '#007ADE' },
        ]}
      >
        {/* Campo 1: Localidade */}
        <View style={[styles.capsulePill, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.capsuleIcon}>📍</Text>
          <TextInput
            value={locationFilter}
            onChangeText={onChangeLocationFilter}
            placeholder="Brasília"
            placeholderTextColor="#7C8691"
            accessible={true}
            accessibilityLabel="Filtrar por cidade ou estado. Padrão: Brasília"
            style={[styles.capsuleInput, { color: colors.textPrimary }]}
          />
          {locationFilter.length > 0 ? (
            <TouchableOpacity
              onPress={() => onChangeLocationFilter('')}
              accessibilityLabel="Limpar filtro de localidade"
            >
              <Text style={styles.clearSmallIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Campo 2: Cargo / Palavra-chave */}
        <View style={[styles.capsulePill, styles.capsulePillRight, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.capsuleIcon}>🔍</Text>
          <TextInput
            value={keywordFilter}
            onChangeText={onChangeKeywordFilter}
            placeholder="Buscar cargo..."
            placeholderTextColor="#7C8691"
            accessible={true}
            accessibilityLabel="Buscar por cargo, habilidade ou nome da empresa"
            style={[styles.capsuleInput, { color: colors.textPrimary }]}
          />
          {keywordFilter.length > 0 ? (
            <TouchableOpacity
              onPress={() => onChangeKeywordFilter('')}
              accessibilityLabel="Limpar filtro de busca de cargo"
            >
              <Text style={styles.clearSmallIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerHeader: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  waveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
    backgroundColor: '#00B2FF',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backCircleArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 24,
    marginTop: Platform.OS === 'android' ? -2 : 0,
    marginLeft: Platform.OS === 'android' ? -1 : 0,
  },
  headerBrandTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAssistBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  voiceAssistIcon: {
    fontSize: 20,
  },
  a11ySettingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  a11ySettingsIcon: {
    fontSize: 18,
  },
  searchCapsuleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: 40,
    padding: 4,
    gap: 6,
  },
  capsulePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  capsulePillRight: {
    flex: 1.35,
  },
  capsuleIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  capsuleInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearSmallIcon: {
    color: '#8A92A6',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});

