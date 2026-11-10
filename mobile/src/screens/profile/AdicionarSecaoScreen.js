import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function AdicionarSecaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { navigate, goBack, userType } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const isEmpresa = userType === 'EMPRESA';

  const audioSummary = isEmpresa
    ? 'Menu de seções institucionais da empresa. Escolha entre Adicionar informações da empresa, Adicionar seção sobre a empresa ou Editar Perfil.'
    : 'Menu de adição de seções ao perfil. Escolha entre Adicionar Seção Sobre, Adicionar formação acadêmica, Adicionar cargo ou Editar Perfil.';

  const CANDIDATO_OPTIONS = [
    {
      id: 'SOBRE',
      title: 'Adicionar seção sobre',
      subtitle: 'Apresente sua trajetória, competências e objetivos inclusivos.',
      iconAsset: FIGMA_ASSETS.iconJobDocument,
      target: 'SECAO_SOBRE',
    },
    {
      id: 'FORMACAO',
      title: 'Adicionar formação acadêmica',
      subtitle: 'Graduação, cursos técnicos ou certificações.',
      iconAsset: FIGMA_ASSETS.iconJobStar,
      target: 'ADICIONAR_FORMACAO',
    },
    {
      id: 'CARGO',
      title: 'Adicionar cargo',
      subtitle: 'Experiências de trabalho, voluntariado ou estágio.',
      iconAsset: FIGMA_ASSETS.iconWork,
      target: 'ADICIONAR_CARGO',
    },
    {
      id: 'EDITAR',
      title: 'Editar Perfil',
      subtitle: 'Atualize nome, área de atuação e dados de localização.',
      iconAsset: FIGMA_ASSETS.iconSettingsGear,
      target: 'EDITAR_PERFIL',
    },
  ];

  const EMPRESA_OPTIONS = [
    {
      id: 'INFO_EMPRESA',
      title: 'Adicionar informações da empresa',
      subtitle: 'Setor de atuação, localização, site e canais de contato corporativo.',
      iconAsset: FIGMA_ASSETS.iconWork,
      target: 'INFORMACOES_EMPRESA',
    },
    {
      id: 'SOBRE_EMPRESA',
      title: 'Adicionar seção sobre a empresa',
      subtitle: 'Apresente a missão inclusiva, cultura e iniciativas corporativas.',
      iconAsset: FIGMA_ASSETS.iconJobDocument,
      target: 'SECAO_SOBRE',
    },
    {
      id: 'EDITAR_PERFIL_EMPRESA',
      title: 'Editar Perfil',
      subtitle: 'Configurações corporativas, preferências de vagas e privacidade.',
      iconAsset: FIGMA_ASSETS.iconSettingsGear,
      target: 'CONFIGURACOES_PERFIL',
    },
  ];

  const OPTIONS = isEmpresa ? EMPRESA_OPTIONS : CANDIDATO_OPTIONS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title={isEmpresa ? 'Adicionar à Empresa' : 'Adicionar ao Perfil'}
        showBack={true}
        onBack={() => goBack(isEmpresa ? 'CONFIGURACOES_PERFIL' : 'PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={
          isEmpresa
            ? 'Lista de opções para adicionar seções institucionais à sua empresa'
            : 'Lista de opções de seções para adicionar ao seu perfil'
        }
      >
        <View style={styles.headerBlock}>
          <Text
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                fontSize: isAccessibleMode ? 26 : 22,
              },
            ]}
            accessibilityRole="header"
          >
            {isEmpresa ? 'Configurando a sua empresa' : 'Configurando o seu perfil'}
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textMuted, marginTop: 4 },
            ]}
          >
            {isEmpresa
              ? 'Selecione uma categoria abaixo para enriquecer o perfil institucional da sua organização e atrair talentos PcD no Equalis.'
              : 'Selecione uma categoria abaixo para enriquecer seu currículo e aumentar suas oportunidades no Equalis.'}
          </Text>
        </View>

        {/* Lista de Seções do Figma (#189:223 e #365:468) */}
        <View style={styles.optionsList}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => navigate(opt.target)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${opt.title}. ${opt.subtitle}`}
              accessibilityHint="Toque duas vezes para abrir esta seção"
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                  borderWidth: isAccessibleMode ? 2 : 1.5,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                ]}
              >
                <Image
                  source={opt.iconAsset}
                  style={{ width: 22, height: 22, tintColor: colors.primaryDark }}
                  resizeMode="contain"
                  accessible={false}
                />
              </View>

              <View style={styles.optMeta}>
                <Text
                  style={[
                    typography.labelLarge,
                    {
                      color: colors.textPrimary,
                      fontWeight: '700',
                      fontSize: isAccessibleMode ? 18 : 16,
                    },
                  ]}
                >
                  {opt.title}
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
                  ]}
                >
                  {opt.subtitle}
                </Text>
              </View>

              <Text style={[styles.arrowIcon, { color: colors.primaryDark }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ilustração Oficial do Figma: Resume Bro (#201:551, 19_ADICIONAR_SECAO.png e 31_ADICIONAR_SECAO_ACESSIVEL.png) */}
        <View style={styles.illustrationWrap}>
          <Image
            source={FIGMA_ASSETS.resumeBroSecao}
            style={styles.resumeBroImg}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Ilustração de profissional organizando seu currículo inclusivo"
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomTabBar activeTab="HOME" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerBlock: {
    marginBottom: 16,
  },
  optionsList: {
    marginTop: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optIcon: {
    fontSize: 22,
  },
  optMeta: {
    flex: 1,
  },
  arrowIcon: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8,
  },
  illustrationWrap: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  resumeBroImg: {
    width: '100%',
    height: 220,
  },
});
