/**
 * OpcoesCadastroScreen — Equalis Mobile
 * Fiel ao frame "OPÇÕES DE CADASTRO" (#266:337) do Figma + Recursos WCAG 2.2 AAA.
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

export default function OpcoesCadastroScreen() {
  const { theme, speak } = useAccessibility();
  const { navigate, goBack, setUserType } = useAuthAndData();
  const { colors, typography, spacing } = theme;

  const audioSummary =
    'Tela de Opções de Cadastro. Escolha registrar como Candidato para buscar vagas inclusivas, ou como Empresa para divulgar vagas exclusivas para pessoas com deficiência.';

  const handleSelectCandidato = () => {
    setUserType('CANDIDATO');
    speak('Selecionado registro como Candidato.');
    navigate('REGISTRO_CANDIDATO');
  };

  const handleSelectEmpresa = () => {
    setUserType('EMPRESA');
    speak('Selecionado registro como Empresa.');
    navigate('REGISTRO_EMPRESA');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.decorBottomLeft} pointerEvents="none" />

      <AccessibleHeader
        title="Equalis"
        showBack={true}
        onBack={() => goBack('TELA_INICIAL')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título Principal Fiel ao Figma */}
        <View style={styles.headerBlock}>
          <Text
            accessibilityRole="header"
            style={[
              typography.displayLarge,
              {
                color: colors.primary,
                fontWeight: '800',
                textAlign: 'center',
                marginTop: spacing.xl,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Registrar como:
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            Selecione seu perfil de acesso na plataforma Equalis
          </Text>
        </View>

        {/* Botões Lado a Lado Originais do Figma: CANDIDATO | EMPRESA */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSelectCandidato}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Registrar como Candidato"
            accessibilityHint="Abre o formulário de cadastro para candidato com deficiência"
            style={[styles.figmaRoleBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[typography.labelLarge, styles.figmaRoleBtnText]}>
              CANDIDATO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSelectEmpresa}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Registrar como Empresa"
            accessibilityHint="Abre o formulário de cadastro para empresa parceira"
            style={[styles.figmaRoleBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[typography.labelLarge, styles.figmaRoleBtnText]}>
              EMPRESA
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ilustração Oficial do Figma: Resume-amico (#266:349) */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={FIGMA_ASSETS.resumeAmico}
            style={styles.illustrationImage}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ilustração de avaliação de currículo e seleção profissional inclusiva"
          />
        </View>

        {/* Rodapé de Apoio Acessível */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            onPress={() => navigate('LOGIN')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Já possuo uma conta, ir para a tela de login"
            style={styles.loginLinkButton}
          >
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              Já possui uma conta? <Text style={{ textDecorationLine: 'underline' }}>Entrar</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  headerBlock: {
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginVertical: 24,
  },
  figmaRoleBtn: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007ADE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 10,
  },
  figmaRoleBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  illustrationImage: {
    width: '100%',
    height: 280,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginLinkButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
