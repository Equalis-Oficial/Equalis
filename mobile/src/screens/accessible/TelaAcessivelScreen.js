/**
 * TelaAcessivelScreen — Equalis Mobile
 * Fiel aos frames "TELA ACESSÍVEL" (#358:378 e #374:834) do Figma (`tela_acessivel_1.png` e `tela_acessivel_2.png`).
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
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

const CANDIDATO_PAGE_1 = [
  {
    id: 'VAGAS',
    title: 'PROCURAR VAGAS',
    bg: '#007ADE',
    image: FIGMA_ASSETS.cardAcessivel1,
    target: 'EMPREGO',
    label: 'Procurar Vagas inclusivas e adaptadas',
  },
  {
    id: 'PERFIL',
    title: 'CONFIGURAR PERFIL',
    bg: '#1F41BB',
    image: FIGMA_ASSETS.cardAcessivel2,
    target: 'PERFIL_CANDIDATO',
    label: 'Configurar Perfil, formação e laudo CID',
  },
  {
    id: 'CONEXOES',
    title: 'NOVAS CONEXÕES',
    bg: '#0266B8',
    image: FIGMA_ASSETS.cardAcessivel3,
    target: 'REDE',
    label: 'Novas Conexões com recrutadores e profissionais',
  },
  {
    id: 'PUBLICACOES',
    title: 'PUBLICAÇÕES',
    bg: '#263B6A',
    image: FIGMA_ASSETS.cardAcessivel4,
    target: 'PUBLICAR_POST_ACESSIVEL',
    label: 'Publicações: publicar ou ver postagens da rede',
  },
];

const EMPRESA_PAGE_1 = [
  {
    id: 'VAGAS',
    title: 'VAGAS PUBLICADAS',
    bg: '#007ADE',
    image: FIGMA_ASSETS.cardAcessivel1,
    target: 'EMPREGO',
    label: 'Vagas publicadas pela empresa',
  },
  {
    id: 'INSCRICOES',
    title: 'INSCRIÇÕES PCD',
    bg: '#1F41BB',
    image: FIGMA_ASSETS.cardAcessivel2,
    target: 'MINHAS_CANDIDATURAS',
    label: 'Inscrições e candidaturas recebidas',
  },
  {
    id: 'NOVA_VAGA',
    title: 'CADASTRAR VAGA',
    bg: '#0266B8',
    image: FIGMA_ASSETS.cardAcessivel3,
    target: 'PUBLICAR_VAGA_EMPRESA',
    label: 'Cadastrar nova vaga inclusiva',
  },
  {
    id: 'PERFIL_EMPRESA',
    title: 'PERFIL EMPRESA',
    bg: '#263B6A',
    image: FIGMA_ASSETS.cardAcessivel4,
    target: 'PERFIL_CANDIDATO',
    label: 'Perfil institucional da empresa',
  },
];

const PAGE_2_CARDS = [
  {
    id: 'MENSAGENS',
    title: 'MENSAGENS',
    bg: '#007ADE',
    image: FIGMA_ASSETS.cardAcessivel1,
    target: 'MENSAGENS',
    label: 'Mensagens e conversas diretas',
  },
  {
    id: 'NOTIFICACOES',
    title: 'NOTIFICAÇÕES',
    bg: '#1F41BB',
    image: FIGMA_ASSETS.cardAcessivel2,
    target: 'NOTIFICACOES',
    label: 'Central de notificações e alertas',
  },
];

export default function TelaAcessivelScreen() {
  const [paginaAcessivel, setPaginaAcessivel] = useState(1);
  const { theme, speak, setIsAccessibleMode, highContrast } = useAccessibility();
  const { navigate, userType } = useAuthAndData();
  const { colors, spacing } = theme;

  const isEmpresa = userType === 'EMPRESA';
  const cardsPagina1 = isEmpresa ? EMPRESA_PAGE_1 : CANDIDATO_PAGE_1;
  const activeCards = paginaAcessivel === 1 ? cardsPagina1 : PAGE_2_CARDS;

  const audioSummary =
    paginaAcessivel === 1
      ? 'Tela Acessível Simplificada do Equalis, Página 1. Escolha entre Procurar Vagas, Configurar Perfil, Novas Conexões ou Publicações.'
      : 'Tela Acessível Simplificada do Equalis, Página 2. Escolha entre Mensagens ou Notificações.';

  const handleNavegar = (card) => {
    speak(`Abrindo ${card.title.toLowerCase()}.`);
    navigate(card.target);
  };

  const handleMudarPagina = (novaPagina) => {
    setPaginaAcessivel(novaPagina);
    speak(
      novaPagina === 1
        ? 'Página 1: Vagas, Perfil, Conexões e Publicações.'
        : 'Página 2: Mensagens e Notificações.'
    );
  };

  const handleAlternarInterfacePadrao = () => {
    setIsAccessibleMode(false);
    speak('Alternando para a interface padrão.');
    navigate('HOME');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showBack={false}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Grade 2x2 fiel ao Figma (tela_acessivel_1.png e tela_acessivel_2.png) */}
        <View style={styles.gridContainer}>
          {activeCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              onPress={() => handleNavegar(card)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={card.label}
              style={[
                styles.gridBlock,
                {
                  backgroundColor: highContrast ? '#000000' : card.bg,
                  borderColor: highContrast ? '#FFFF00' : 'transparent',
                  borderWidth: highContrast ? 2 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.blockTitle,
                  highContrast && { color: '#FFFF00' },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {card.title}
              </Text>
              <Image
                source={card.image}
                style={styles.blockIllustration}
                resizeMode="contain"
                accessible={false}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Indicadores de Paginação do Figma (#358:382 e #374:815) */}
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => handleMudarPagina(1)}
            style={styles.paginationTouch}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: paginaAcessivel === 1 }}
            accessibilityLabel="Página 1 da Tela Acessível"
          >
            <View
              style={[
                styles.pageIndicatorPill,
                { backgroundColor: paginaAcessivel === 1 ? '#007ADE' : '#666666' },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleMudarPagina(2)}
            style={styles.paginationTouch}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: paginaAcessivel === 2 }}
            accessibilityLabel="Página 2 da Tela Acessível (Mensagens e Notificações)"
          >
            <View
              style={[
                styles.pageIndicatorPill,
                { backgroundColor: paginaAcessivel === 2 ? '#007ADE' : '#666666' },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Link limpo para voltar ao modo padrão */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAlternarInterfacePadrao}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a interface de navegação padrão"
          style={styles.switchModeLink}
        >
          <Text style={[styles.switchModeText, { color: colors.primaryDark }]}>
            Voltar para a Interface Padrão
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridBlock: {
    width: '48%',
    height: 185,
    borderRadius: 14,
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  blockTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  blockIllustration: {
    width: '100%',
    height: 122,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 36,
    marginBottom: 20,
  },
  paginationTouch: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pageIndicatorPill: {
    width: 48,
    height: 8,
    borderRadius: 3,
  },
  switchModeLink: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
