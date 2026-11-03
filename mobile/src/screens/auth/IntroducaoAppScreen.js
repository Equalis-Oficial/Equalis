/**
 * IntroducaoAppScreen — Equalis Mobile
 * Baseado nos 3 frames "INTRODUÇÃO AO APP" (#232:788, #235:332, #235:334) do Figma + WCAG 2.2 AAA.
 *
 * Características:
 * - Ilustrações oficiais do Figma: `introSlide1`, `introSlide2` e `introSlide3`.
 * - Títulos oficiais: "Bem-vindo ao Equalis!", "Conecte-se com Empresas Inclusivas", "Apoio em Todas as Etapas".
 * - Botão "Continuar" para avanço contínuo.
 * - Leitura via TTS e suporte a TalkBack / VoiceOver.
 */
import React, { useState } from 'react';
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
import AccessibleButton from '../../components/common/AccessibleButton';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

const PASSOS = [
  {
    id: 1,
    titulo: 'Bem-vindo ao Equalis!',
    descricao:
      'Torne sua experiência de busca mais fácil e eficaz com filtros focados em recursos de acessibilidade e adaptações necessárias.',
    imagem: FIGMA_ASSETS.introSlide1,
    tag: 'Busca Inclusiva',
  },
  {
    id: 2,
    titulo: 'Conecte-se com Empresas Inclusivas',
    descricao:
      'O Equalis permite que você se candidate de onde estiver, conectando-se diretamente a organizações comprometidas com a inclusão PcD.',
    imagem: FIGMA_ASSETS.introSlide2,
    tag: 'Mobilidade & Autonomia',
  },
  {
    id: 3,
    titulo: 'Apoio em Todas as Etapas',
    descricao:
      'O Equalis conecta você à vaga ideal para suas habilidades, respeitando suas preferências ergonômicas e recursos de acessibilidade.',
    imagem: FIGMA_ASSETS.introSlide3,
    tag: 'Oportunidades Reais',
  },
];

export default function IntroducaoAppScreen() {
  const [passoAtual, setPassoAtual] = useState(0);
  const { theme, speak } = useAccessibility();
  const { navigate, goBack } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const passo = PASSOS[passoAtual];
  const ehUltimo = passoAtual === PASSOS.length - 1;

  const handleNext = () => {
    if (ehUltimo) {
      navigate('OPCOES_CADASTRO');
    } else {
      const proximo = passoAtual + 1;
      setPassoAtual(proximo);
      speak(`${PASSOS[proximo].titulo}. ${PASSOS[proximo].descricao}`);
    }
  };

  const handlePrev = () => {
    if (passoAtual > 0) {
      const anterior = passoAtual - 1;
      setPassoAtual(anterior);
      speak(`${PASSOS[anterior].titulo}. ${PASSOS[anterior].descricao}`);
    } else {
      goBack('TELA_INICIAL');
    }
  };

  const handleSkip = () => {
    navigate('OPCOES_CADASTRO');
  };

  const audioSummary = `Introdução ao Equalis. Passo ${passoAtual + 1} de 3: ${passo.titulo}. ${passo.descricao}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showBack={true}
        onBack={handlePrev}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra superior de progresso e botão pular */}
        <View style={styles.topRow}>
          <Text
            accessibilityRole="text"
            style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}
          >
            PASSO {passoAtual + 1} DE {PASSOS.length}
          </Text>

          <TouchableOpacity
            onPress={handleSkip}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Pular introdução e ir para o cadastro"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700', textDecorationLine: 'underline' },
              ]}
            >
              Pular Introdução
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Ilustrativo com a Imagem Oficial do Figma */}
        <View
          style={[
            styles.cardVisual,
            {
              backgroundColor: colors.surfaceTint,
              borderColor: colors.cardBorder,
              borderRadius: radius.lg,
            },
          ]}
        >
          <View
            style={[styles.badge, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.badgeText}>{passo.tag}</Text>
          </View>

          <Image
            source={passo.imagem}
            style={styles.slideImage}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Ilustração oficial do passo ${passoAtual + 1}: ${passo.titulo}`}
          />
        </View>

        {/* Título e Descrição do Passo */}
        <View style={styles.textContainer}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                textAlign: 'center',
                fontWeight: '800',
                marginBottom: spacing.xs,
              },
            ]}
          >
            {passo.titulo}
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
            {passo.descricao}
          </Text>
        </View>

        {/* Indicadores de Paginação do Figma (#272:924-926) */}
        <View
          accessible={true}
          accessibilityLabel={`Indicador de paginação: tela ${passoAtual + 1} de ${PASSOS.length}`}
          style={styles.dotsRow}
        >
          {PASSOS.map((_, index) => {
            const isActive = index === passoAtual;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? colors.primary : '#D4DBE5',
                    width: isActive ? 34 : 14,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Botão de Ação: "Continuar" */}
        <View style={styles.actionsContainer}>
          <AccessibleButton
            title={ehUltimo ? 'Continuar' : 'Continuar'}
            variant="primary"
            onPress={handleNext}
            accessibilityHint={
              ehUltimo
                ? 'Conclui a introdução e avança para a escolha do modo de tela'
                : `Avança para o passo ${passoAtual + 2}`
            }
          />

          {passoAtual > 0 ? (
            <AccessibleButton
              title="Voltar ao passo anterior"
              variant="ghost"
              onPress={handlePrev}
              accessibilityHint="Retorna ao slide anterior"
              style={{ marginTop: 6 }}
            />
          ) : null}
        </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardVisual: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 260,
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  slideImage: {
    width: '100%',
    height: 220,
  },
  textContainer: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    marginTop: 4,
  },
});
