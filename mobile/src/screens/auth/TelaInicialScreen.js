/**
 * TelaInicialScreen — Equalis Mobile
 * Fiel ao frame "TELA INICIAL" (#25:8) do Figma + Recursos de Acessibilidade WCAG 2.2 AAA.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function TelaInicialScreen() {
  const { theme, speak, setIsAccessibleMode } = useAccessibility();
  const { navigate } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const audioSummary =
    'Tela Inicial do aplicativo Equalis. Encontre o emprego que combina com você e oportunidades que valorizam suas habilidades e potencial. Toque em Entrar, Registrar ou ativar a Tela Acessível Simplificada.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Formas geométricas decorativas originais do Figma */}
      <View style={styles.decorBottomLeft} pointerEvents="none" />
      <View style={styles.decorBottomLeftInner} pointerEvents="none" />

      <AccessibleHeader
        title="Equalis"
        showBack={false}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ilustração Oficial do Figma: TELA INICIAL (#25:8) */}
        <View style={styles.heroImageContainer}>
          <Image
            source={FIGMA_ASSETS.heroTelaInicial}
            style={styles.heroImage}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ilustração oficial do Equalis: pessoa com deficiência em cadeira de rodas no ambiente de trabalho em frente ao computador"
          />
        </View>

        {/* Título e Subtítulo fiéis ao Figma */}
        <View style={styles.textSection}>
          <Text
            accessibilityRole="header"
            style={[
              typography.displayLarge,
              {
                color: colors.primary,
                textAlign: 'center',
                fontWeight: '800',
                lineHeight: 38,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Encontre o emprego que combina com você.
          </Text>

          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textPrimary,
                textAlign: 'center',
                lineHeight: 22,
                paddingHorizontal: 12,
              },
            ]}
          >
            Encontre oportunidades que valorizam suas habilidades e potencial.
          </Text>
        </View>

        {/* Botões Lado a Lado originais do Figma: ENTRAR | REGISTRAR */}
        <View style={styles.figmaButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigate('LOGIN')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Entrar na sua conta"
            accessibilityHint="Abre a tela de login para candidatos e empresas"
            style={[
              styles.entrarBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[typography.labelLarge, styles.entrarBtnText]}>
              ENTRAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigate('OPCOES_CADASTRO')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Registrar nova conta"
            accessibilityHint="Abre a tela para escolher cadastro como Candidato PcD ou Empresa"
            style={[
              styles.registrarBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                styles.registrarBtnText,
                { color: colors.textPrimary },
              ]}
            >
              REGISTRAR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barra Integrada de Acessibilidade e Introdução (Complemento WCAG) */}
        <View style={[styles.assistiveSection, { borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setIsAccessibleMode(true);
              speak('Modo Tela Acessível ativado. Por favor, entre na sua conta para continuar.');
              navigate('LOGIN');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ativar Modo Tela Acessível Simplificada"
            accessibilityHint="Alterna para a interface em blocos grandes de alto contraste do Equalis e direciona para o login"
            style={[
              styles.accessibleModeCard,
              {
                backgroundColor: colors.surfaceTint,
                borderColor: colors.primary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Image
              source={FIGMA_ASSETS.iconePcdAzul}
              style={styles.pcdIcon}
              resizeMode="contain"
            />
            <View style={styles.accessibleModeTextCol}>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.primaryDark, fontWeight: '800' },
                ]}
              >
                Ativar Modo Tela Acessível
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary },
                ]}
              >
                Navegação simplificada em blocos grandes e leitura por voz
              </Text>
            </View>
            <Text style={[styles.arrowIcon, { color: colors.primaryDark }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigate('INTRODUCAO_APP')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Conhecer a introdução do aplicativo Equalis"
            style={styles.tourLink}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
              ]}
            >
              Conhecer os 3 passos de inclusão do Equalis →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -90,
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#E1ECFA',
    transform: [{ rotate: '28deg' }],
  },
  decorBottomLeftInner: {
    position: 'absolute',
    bottom: -60,
    left: -110,
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: '#EBF3FC',
    transform: [{ rotate: '12deg' }],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 36,
  },
  heroImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  figmaButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 18,
    marginBottom: 18,
  },
  entrarBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007ADE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  entrarBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  registrarBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registrarBtnText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  assistiveSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  accessibleModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  pcdIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  accessibleModeTextCol: {
    flex: 1,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  tourLink: {
    paddingVertical: 6,
    alignItems: 'center',
  },
});
