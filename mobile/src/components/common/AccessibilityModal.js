/**
 * Central de Acessibilidade Simplificada — Equalis
 * Focada em clareza cognitiva, alto contraste e controles diretos:
 * 1. Tamanho do Texto (Normal, Grande, Extra)
 * 2. Alto Contraste (Alternância direta)
 * 3. Modo Simplificado de Blocos (Figma)
 * 4. Voz Assistiva (TTS)
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';

export default function AccessibilityModal() {
  const {
    theme,
    isAccessibleMode,
    setIsAccessibleMode,
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    voiceEnabled,
    setVoiceEnabled,
    speak,
    stopSpeaking,
    isSpeaking,
    isA11yModalOpen,
    setIsA11yModalOpen,
  } = useAccessibility();

  const { navigate, sessionToken } = useAuthAndData();
  const { colors, typography } = theme;

  if (!isA11yModalOpen) return null;

  const handleToggleAccessibleMode = (val) => {
    setIsAccessibleMode(val);
    setIsA11yModalOpen(false);
    if (val) {
      speak('Modo simplificado ativado.');
      if (sessionToken) {
        navigate('TELA_ACESSIVEL');
      }
    } else {
      speak('Modo padrão ativado.');
      if (sessionToken) {
        navigate('HOME');
      }
    }
  };

  const handleToggleContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    speak(nextVal ? 'Alto contraste ativado.' : 'Contraste padrão ativado.');
  };

  const handleToggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    if (!nextVal) {
      stopSpeaking();
    } else {
      speak('Leitor de tela e voz assistiva ativados.', true);
    }
  };

  return (
    <Modal
      visible={isA11yModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsA11yModalOpen(false)}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal={true}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.primaryDark,
            },
          ]}
        >
          {/* Cabeçalho Limpo */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerIcon}>♿</Text>
              <Text
                style={[
                  typography.titleLarge,
                  { color: colors.primaryDark, fontWeight: '800' },
                ]}
              >
                Acessibilidade
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsA11yModalOpen(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar painel de acessibilidade"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceTint }]}
            >
              <Text style={[styles.closeBtnText, { color: colors.primaryDark }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 1. Tamanho do Texto */}
          <View style={styles.sectionCard}>
            <Text
              style={[
                typography.labelLarge,
                { color: colors.textPrimary, fontWeight: '700', marginBottom: 8 },
              ]}
            >
              🔠 Tamanho da Fonte
            </Text>
            <View style={styles.fontScaleRow}>
              {[
                { label: 'Normal', scale: 1.0, sub: '100%' },
                { label: 'Grande', scale: 1.2, sub: '120%' },
                { label: 'Extra', scale: 1.4, sub: '140%' },
              ].map((item) => {
                const isSelected = Math.abs(fontScale - item.scale) < 0.05;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => {
                      setFontScale(item.scale);
                      speak(`Fonte ${item.label}`);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Fonte ${item.label}`}
                    style={[
                      styles.fontPill,
                      {
                        backgroundColor: isSelected ? colors.primaryDark : colors.surfaceSoft,
                        borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fontPillTitle,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontSize: item.scale === 1.4 ? 16 : item.scale === 1.2 ? 14 : 13,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.fontPillSub,
                        { color: isSelected ? '#EAF4FF' : colors.textMuted },
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Alto Contraste */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleContrast}
            accessible={true}
            accessibilityRole="switch"
            accessibilityState={{ checked: highContrast }}
            accessibilityLabel={`Alto contraste está ${highContrast ? 'ativado' : 'desativado'}`}
            style={[
              styles.actionRowCard,
              {
                backgroundColor: highContrast ? '#002868' : colors.surfaceSoft,
                borderColor: highContrast ? '#000000' : colors.cardBorder,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: highContrast ? '#FFFFFF' : colors.textPrimary, fontWeight: '700' },
                ]}
              >
                🌓 Alto Contraste
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: highContrast ? '#EAF4FF' : colors.textMuted, marginTop: 2 },
                ]}
              >
                Cores com máximo realce
              </Text>
            </View>
            <View
              style={[
                styles.togglePill,
                {
                  backgroundColor: highContrast ? '#22C55E' : colors.cardBorder,
                },
              ]}
            >
              <Text style={styles.togglePillText}>
                {highContrast ? 'LIGADO' : 'DESLIGADO'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 3. Modo Simplificado */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleToggleAccessibleMode(!isAccessibleMode)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Modo simplificado está ${isAccessibleMode ? 'ativo' : 'inativo'}`}
            style={[
              styles.actionRowCard,
              {
                backgroundColor: isAccessibleMode ? colors.surfaceTint : colors.surfaceSoft,
                borderColor: isAccessibleMode ? colors.primaryDark : colors.cardBorder,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                ♿ Tela com Blocos Grandes
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, marginTop: 2 },
                ]}
              >
                Interface com botões amplos
              </Text>
            </View>
            <View
              style={[
                styles.togglePill,
                {
                  backgroundColor: isAccessibleMode ? colors.primaryDark : colors.cardBorder,
                },
              ]}
            >
              <Text style={styles.togglePillText}>
                {isAccessibleMode ? 'ATIVO' : 'PADRÃO'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 4. Leitor em Voz Alta */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleVoice}
            accessible={true}
            accessibilityRole="switch"
            accessibilityState={{ checked: voiceEnabled }}
            accessibilityLabel={`Voz assistiva está ${voiceEnabled ? 'ligada' : 'desligada'}`}
            style={[
              styles.actionRowCard,
              {
                backgroundColor: voiceEnabled ? colors.surfaceTint : colors.surfaceSoft,
                borderColor: voiceEnabled ? colors.primaryDark : colors.cardBorder,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                🔊 Leitura em Voz Alta (Voz Assistiva)
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, marginTop: 2 },
                ]}
              >
                {voiceEnabled ? (isSpeaking ? 'Falando agora (toque para silenciar)' : 'Voz ativada') : 'Totalmente silenciada'}
              </Text>
            </View>
            <View
              style={[
                styles.togglePill,
                {
                  backgroundColor: voiceEnabled ? '#22C55E' : colors.cardBorder,
                },
              ]}
            >
              <Text style={styles.togglePillText}>
                {voiceEnabled ? 'LIGADO' : 'DESLIGADO'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botão Concluir */}
          <TouchableOpacity
            onPress={() => setIsA11yModalOpen(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Concluir e fechar painel"
            style={[styles.doneBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.doneBtnText}>Concluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 2,
    padding: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fontScaleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontPill: {
    flex: 1,
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  fontPillTitle: {
    fontWeight: '700',
  },
  fontPillSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  actionRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 56,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doneBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
