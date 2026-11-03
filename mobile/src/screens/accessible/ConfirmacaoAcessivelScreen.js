/**
 * ConfirmacaoAcessivelScreen — Equalis Mobile
 * Baseado no frame "CONFIRMAÇÃO TELA ACESSÍVEL" (#358:364) do Figma (`11_CONFIRMACAO_ACESSIVEL.png`) + WCAG 2.2 AAA.
 *
 * Características:
 * - Pré-visualização oficial do Figma `FIGMA_ASSETS.previewTelaAcessivel` no centro do card.
 * - Título oficial: "Deseja usar o aplicativo com uma tela acessível?".
 * - Botões objetivos "Sim" (ativa modo acessível) e "Não" (usa modo padrão).
 * - Suporte a leitores de tela e leitura por voz (TTS).
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleButton from '../../components/common/AccessibleButton';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function ConfirmacaoAcessivelScreen() {
  const { theme, speak, setIsAccessibleMode } = useAccessibility();
  const { navigate, goBack } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const audioSummary =
    'Deseja usar o aplicativo com uma tela acessível? Uma tela acessível para facilitar o acesso do usuário que possui qualquer tipo de diagnóstico para deficiência. Selecione Sim para a interface simplificada em blocos grandes, ou Não para utilizar a interface padrão.';

  const handleEscolherModoAcessivel = () => {
    setIsAccessibleMode(true);
    speak('Modo Tela Acessível ativado com sucesso! Carregando menu de blocos ampliados.');
    navigate('TELA_ACESSIVEL');
  };

  const handleEscolherModoPadrao = () => {
    setIsAccessibleMode(false);
    speak('Modo Padrão selecionado. Acessando a página inicial completa.');
    navigate('HOME');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showBack={true}
        onBack={() => goBack('ESCOLHA_DEFICIENCIA')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título Principal Oficial do Figma (#358:375 / 11_CONFIRMACAO_ACESSIVEL.png) */}
        <View style={styles.textSection}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleLarge,
              {
                color: colors.primary,
                textAlign: 'center',
                fontWeight: '800',
                marginBottom: spacing.xs,
              },
            ]}
          >
            Deseja usar o aplicativo com uma tela acessível?
          </Text>

          <Text
            style={[
              typography.bodyLarge,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              },
            ]}
          >
            Uma tela acessível para facilitar o acesso do usuário que possui qualquer tipo de diagnóstico para deficiência.
          </Text>
        </View>

        {/* Card Central com a Pré-Visualização Oficial do Figma (#358:417) */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surfaceTint,
              borderColor: colors.cardBorder,
              borderRadius: radius.lg,
            },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.badgeText}>♿ Pré-Visualização da Tela Acessível</Text>
          </View>

          <Image
            source={FIGMA_ASSETS.previewTelaAcessivel}
            style={styles.previewImage}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Pré-visualização oficial da tela acessível simplificada com blocos grandes de alto contraste"
          />
        </View>

        {/* Botões Objetivos do Figma: "Sim" e "Não" */}
        <View style={styles.buttonsGroup}>
          <AccessibleButton
            title="Sim"
            variant="primary"
            onPress={handleEscolherModoAcessivel}
            accessibilityLabel="Sim, desejo começar com a tela acessível"
            accessibilityHint="Ativa a interface simplificada em blocos grandes de alto contraste"
          />

          <AccessibleButton
            title="Não"
            variant="outline"
            onPress={handleEscolherModoPadrao}
            accessibilityLabel="Não, desejo usar a interface padrão"
            accessibilityHint="Continua para o layout padrão completo com feed social e busca avançada"
            style={{ marginTop: 10 }}
          />
        </View>

        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, textAlign: 'center', marginTop: 14 },
          ]}
        >
          Você poderá alternar entre os modos a qualquer momento através do menu superior ♿.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  textSection: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  previewCard: {
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 250,
  },
  buttonsGroup: {
    marginTop: 8,
  },
});
