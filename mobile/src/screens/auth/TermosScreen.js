/**
 * TermosScreen — Equalis Mobile
 * Baseado no frame "TERMOS" (#94:23) do Figma (`07_TERMOS.png`) + WCAG 2.2 AAA.
 *
 * Características:
 * - Banner oficial do Figma (`FIGMA_ASSETS.termosBanner`) com sobreposição de `FIGMA_ASSETS.termosLogoBranca`.
 * - Cláusulas reais de conformidade com LGPD (Art. 11 - Dados Sensíveis de Saúde) e Lei nº 8.213/91 (Cotas PcD).
 * - Componente `AccessibleCheckbox` ("Li e aceito os termos").
 * - Botão oficial "Acessar" que avança para a Confirmação de Tela Acessível.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleButton from '../../components/common/AccessibleButton';
import AccessibleCheckbox from '../../components/common/AccessibleCheckbox';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function TermosScreen() {
  const { theme, speak } = useAccessibility();
  const { navigate, goBack, userType } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const [aceito, setAceito] = useState(true);

  const audioSummary =
    'Termos de Uso, Política de Privacidade e LGPD para Dados de Saúde no Equalis. Os seus laudos médicos e CID são protegidos com estrito sigilo e compartilhados apenas para garantir adaptações no ambiente de trabalho e cumprimento da Lei de Cotas.';

  const handleConfirmar = () => {
    speak('Leitura dos termos concluída.');
    goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Termos de Uso"
        showBack={true}
        onBack={() => goBack()}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={true}
      >
        {/* Banner Oficial do Figma com Logo Branca Sobreposta (#94:25 e #94:27 / 07_TERMOS.png) */}
        <View style={[styles.bannerContainer, { borderRadius: radius.lg }]}>
          <Image
            source={FIGMA_ASSETS.termosBanner}
            style={styles.bannerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Banner institucional de termos de uso do Equalis"
          />
          <View style={styles.bannerOverlay}>
            <Image
              source={FIGMA_ASSETS.termosLogoBranca}
              style={styles.bannerLogo}
              resizeMode="contain"
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel="Logo branca Equalis sobre o banner"
            />
          </View>
        </View>

        {/* Título Oficial "TERMOS" fiel ao Figma */}
        <View style={styles.headerBlock}>
          <Text
            accessibilityRole="header"
            style={[
              typography.displayLarge,
              {
                color: colors.primary,
                fontWeight: '900',
                fontSize: 32,
                textAlign: 'center',
                letterSpacing: 1.5,
              },
            ]}
          >
            TERMOS
          </Text>

          <Text
            style={[
              typography.titleMedium,
              {
                color: colors.primaryDark,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 4,
              },
            ]}
          >
            Termos de Uso e Política de Privacidade & LGPD (Dados de Saúde / PcD)
          </Text>
        </View>

        {/* Card Informativo com Destaque de Segurança */}
        <View
          style={[
            styles.securityCard,
            {
              backgroundColor: colors.surfaceTint,
              borderColor: colors.cardBorder,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityTextWrap}>
            <Text
              style={[
                typography.labelLarge,
                { color: colors.primaryDark, fontWeight: '700' },
              ]}
            >
              Compromisso com a Privacidade PcD
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
              ]}
            >
              Seus dados médicos e laudos (CID) são armazenados sob criptografia de ponta a ponta e nunca serão vendidos ou compartilhados para fins comerciais.
            </Text>
          </View>
        </View>

        {/* Corpo do Texto Estruturado */}
        <View
          style={[
            styles.legalContainer,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={[typography.titleMedium, styles.clauseTitle, { color: colors.textPrimary }]}>
            1. Consentimento e Dados Sensíveis (Art. 11 da LGPD)
          </Text>
          <Text style={[typography.bodyMedium, styles.clauseText, { color: colors.textSecondary }]}>
            Ao utilizar o Equalis, você consente expressamente que as informações relativas ao seu diagnóstico de deficiência, laudo médico, CID e necessidades de adaptação ergonômica sejam processadas com a finalidade exclusiva de intermediar contratações inclusivas.
          </Text>

          <Text style={[typography.titleMedium, styles.clauseTitle, { color: colors.textPrimary }]}>
            2. Finalidade e Lei de Cotas (Lei nº 8.213/91)
          </Text>
          <Text style={[typography.bodyMedium, styles.clauseText, { color: colors.textSecondary }]}>
            As informações fornecidas destinam-se a viabilizar o preenchimento de vagas exclusivas e reservadas por lei, garantindo que as empresas parceiras preparem o ambiente físico, tecnológico e atitudinal antes da sua integração.
          </Text>

          <Text style={[typography.titleMedium, styles.clauseTitle, { color: colors.textPrimary }]}>
            3. Sigilo e Confidencialidade Médica
          </Text>
          <Text style={[typography.bodyMedium, styles.clauseText, { color: colors.textSecondary }]}>
            O laudo anexado é visível unicamente pelo médico do trabalho ou setor responsável de recursos humanos da organização contratante. Detalhes clínicos sensíveis que não interfiram na ergonomia ou acessibilidade do posto de trabalho permanecem confidenciais.
          </Text>

          <Text style={[typography.titleMedium, styles.clauseTitle, { color: colors.textPrimary }]}>
            4. Princípio da Não Discriminação
          </Text>
          <Text style={[typography.bodyMedium, styles.clauseText, { color: colors.textSecondary }]}>
            Em estrita observância ao Estatuto da Pessoa com Deficiência (Lei Federal nº 13.146/2015), é expressamente vedada qualquer forma de distinção, exclusão ou restrição baseada na deficiência com o propósito de prejudicar direitos trabalhistas.
          </Text>

          <Text style={[typography.titleMedium, styles.clauseTitle, { color: colors.textPrimary }]}>
            5. Revogação e Exclusão a Qualquer Momento
          </Text>
          <Text style={[typography.bodyMedium, styles.clauseText, { color: colors.textSecondary }]}>
            Você possui o direito inalienável de solicitar a anonimização, exclusão de laudos ou eliminação definitiva do seu perfil no Equalis mediante simples solicitação nas configurações do seu perfil.
          </Text>
        </View>

        {/* Checkbox de Aceite do Figma (#113:5) */}
        <View style={styles.checkboxContainer}>
          <AccessibleCheckbox
            label="Li e aceito os termos"
            description="Confirmo a leitura integral dos Termos de Uso e da Política de Privacidade de Saúde."
            checked={aceito}
            onToggle={() => setAceito((prev) => !prev)}
            accessibilityHint="Toque para concordar ou discordar dos termos"
          />
        </View>

        {/* Botão Concluir Leitura (#189:216 / 07_TERMOS.png) */}
        <AccessibleButton
          title="Concluir Leitura e Voltar"
          variant="primary"
          onPress={handleConfirmar}
          accessibilityHint="Conclui a leitura dos termos e retorna à tela anterior"
          style={{ marginTop: 4, marginBottom: 24 }}
        />
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
    paddingBottom: 36,
  },
  bannerContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: '#0966C2',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogo: {
    width: 140,
    height: 70,
  },
  headerBlock: {
    marginVertical: 10,
  },
  securityCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  securityIcon: {
    fontSize: 26,
  },
  securityTextWrap: {
    flex: 1,
  },
  legalContainer: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  clauseTitle: {
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  clauseText: {
    lineHeight: 22,
    marginBottom: 8,
  },
  checkboxContainer: {
    marginBottom: 12,
  },
});
