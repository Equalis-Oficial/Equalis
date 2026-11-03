/**
 * TelaAcessivelScreen — Equalis Mobile
 * Baseado nos frames "TELA ACESSÍVEL" (#358:378 e #374:834) do Figma (`12_TELA_ACESSIVEL_1.png` e `13_TELA_ACESSIVEL_2.png`).
 *
 * Características:
 * - Blocos grandes azuis oficiais (`#1F41BB`) com imagem decorativa `FIGMA_ASSETS.cardAcessivelPuzzle` alinhada à direita.
 * - Suporte a 2 páginas acessíveis fiéis ao protótipo do Figma:
 *     Página 1: PROCURAR VAGAS, CONFIGURAR PERFIL, NOVAS CONEXÕES, PUBLICAÇÕES.
 *     Página 2: MENSAGENS, PUBLICAÇÕES, AJUDA & LIBRAS.
 * - Indicadores visuais de paginação e alternância acessível.
 * - Botão inferior para voltar ao Modo Padrão ("Voltar para a Interface Padrão").
 * - Controles de tamanho de fonte e alto contraste integrados.
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

export default function TelaAcessivelScreen() {
  const [paginaAcessivel, setPaginaAcessivel] = useState(1);
  const {
    theme,
    speak,
    setIsAccessibleMode,
    fontScale,
    cycleFontScale,
    highContrast,
    setHighContrast,
  } = useAccessibility();
  const { navigate, mensagens, userType, alternarPapel, candidatoPerfil, empresaPerfil } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const isEmpresa = userType === 'EMPRESA';
  const mensagensNaoLidas = mensagens.filter((m) => m.nao_lida).length;

  const audioSummary = isEmpresa
    ? paginaAcessivel === 1
      ? `Tela Acessível Simplificada do Equalis, Modo Empresa. 4 blocos amplos: Vagas Publicadas, Inscrições Recebidas, Publicar Nova Vaga e Perfil da Empresa ${empresaPerfil?.nome_fantasia || 'Inclusiva'}.`
      : 'Tela Acessível Simplificada do Equalis, Modo Empresa. Bloco de Mensagens com candidatos e Publicações institucionais.'
    : paginaAcessivel === 1
      ? 'Tela Acessível Simplificada do Equalis, Página 1. Menu em 4 blocos amplos: Procurar Vagas, Configurar Perfil, Novas Conexões e Publicações. Use os botões abaixo para alternar para a página 2 com mensagens ou voltar ao modo padrão.'
      : 'Tela Acessível Simplificada do Equalis, Página 2. Bloco de Mensagens com conversas pendentes, Publicações e Suporte Acessível.';

  const handleNavegar = (destino, nomeBloco) => {
    speak(`Abrindo ${nomeBloco}.`);
    navigate(destino);
  };

  const handleAlternarInterfacePadrao = () => {
    setIsAccessibleMode(false);
    speak('Alternando para o modo de interface padrão.');
    navigate('HOME');
  };

  const handleMudarPagina = (novaPagina) => {
    setPaginaAcessivel(novaPagina);
    speak(
      novaPagina === 1
        ? isEmpresa
          ? 'Página 1 da Tela Acessível Empresa: Vagas, Inscrições, Publicar e Perfil.'
          : 'Página 1 da Tela Acessível: Vagas, Perfil, Conexões e Publicações.'
        : 'Página 2 da Tela Acessível: Mensagens e Publicações.'
    );
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
        {/* Banner Informativo Superior da Tela Acessível com Alternador de Papel */}
        <View
          style={[
            styles.a11yBannerTop,
            { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.a11yBannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.a11yBannerBadge}>
                {isEmpresa ? `🏢 EMPRESA (${empresaPerfil?.nome_fantasia || 'INCLUSIVA'})` : `♿ CANDIDATO (${candidatoPerfil?.nome ? candidatoPerfil.nome.split(' ')[0] : 'PCD'})`} • PÁG. {paginaAcessivel}/2
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                alternarPapel();
                speak(
                  isEmpresa
                    ? `Alternado para o papel de Candidato: ${candidatoPerfil?.nome || 'Candidato PcD'}`
                    : `Alternado para o papel de Empresa: ${empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}`
                );
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Alternar papel para ${isEmpresa ? 'Candidato' : 'Empresa'}`}
              style={[styles.roleSwitchA11yBtn, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={styles.roleSwitchA11yBtnText}>
                {isEmpresa ? 'Candidato ⇄' : 'Empresa ⇄'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => speak(audioSummary)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ouvir instruções desta tela em voz alta"
              style={[styles.ttsSpeakerBtn, { backgroundColor: colors.primary, marginLeft: 6 }]}
            >
              <Text style={styles.ttsSpeakerText}>🔊 Ouvir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Indicadores de Paginação do Figma (#358:382 e #374:815) */}
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => handleMudarPagina(1)}
            style={[
              styles.pageIndicatorPill,
              paginaAcessivel === 1
                ? { backgroundColor: '#1F41BB', width: 44 }
                : { backgroundColor: '#D4DBE5', width: 22 },
            ]}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: paginaAcessivel === 1 }}
            accessibilityLabel="Página 1 da Tela Acessível"
          />
          <TouchableOpacity
            onPress={() => handleMudarPagina(2)}
            style={[
              styles.pageIndicatorPill,
              paginaAcessivel === 2
                ? { backgroundColor: '#1F41BB', width: 44 }
                : { backgroundColor: '#D4DBE5', width: 22 },
            ]}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: paginaAcessivel === 2 }}
            accessibilityLabel="Página 2 da Tela Acessível com Mensagens"
          />
        </View>

        {paginaAcessivel === 1 ? (
          /* ================= PÁGINA 1: 4 BLOCOS GRANDES AZUIS (Figma 12_TELA_ACESSIVEL_1.png) ================= */
          <View style={styles.gridContainer}>
            {isEmpresa ? (
              /* BLOCOS PARA EMPRESA INCLUSIVA (UNICEPLAC) */
              <>
                {/* BLOCO 1 EMPRESA: VAGAS PUBLICADAS */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('EMPREGO', 'Vagas Publicadas')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Bloco 1: Vagas publicadas da ${empresaPerfil?.nome_fantasia || 'Empresa'}`}
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>💼</Text>
                    </View>
                    <Text style={styles.blockTitle}>VAGAS PUBLICADAS</Text>
                    <Text style={styles.blockSubtitle}>Gerencie suas oportunidades</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 2 EMPRESA: INSCRIÇÕES RECEBIDAS */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('MINHAS_CANDIDATURAS', 'Inscrições Recebidas')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 2: Inscrições e candidaturas recebidas"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>📋</Text>
                    </View>
                    <Text style={styles.blockTitle}>INSCRIÇÕES PCD</Text>
                    <Text style={styles.blockSubtitle}>Avalie candidatos e laudos</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 3 EMPRESA: PUBLICAR NOVA VAGA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('PUBLICAR_VAGA_EMPRESA', 'Publicar Nova Vaga')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 3: Publicar nova vaga inclusiva"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>➕</Text>
                    </View>
                    <Text style={styles.blockTitle}>CADASTRAR VAGA</Text>
                    <Text style={styles.blockSubtitle}>Vaga com recursos e cotas</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 4 EMPRESA: PERFIL INSTITUCIONAL */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('PERFIL_CANDIDATO', 'Perfil da Empresa')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Bloco 4: Perfil institucional ${empresaPerfil?.nome_fantasia || 'da Empresa'}`}
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>🏢</Text>
                    </View>
                    <Text style={styles.blockTitle}>PERFIL EMPRESA</Text>
                    <Text style={styles.blockSubtitle}>{empresaPerfil?.nome_fantasia || 'Empresa'} e métricas PcD</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>
              </>
            ) : (
              /* BLOCOS PARA CANDIDATO PCD */
              <>
                {/* BLOCO 1: PROCURAR VAGAS */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('EMPREGO', 'Procurar Vagas')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 1: Procurar Vagas inclusivas e adaptadas"
                  accessibilityHint="Toque duas vezes para listar oportunidades de emprego filtradas para o seu perfil"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>💼</Text>
                    </View>
                    <Text style={styles.blockTitle}>PROCURAR VAGAS</Text>
                    <Text style={styles.blockSubtitle}>Vagas com adaptações comprovadas</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 2: CONFIGURAR PERFIL */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('PERFIL_CANDIDATO', 'Configurar Perfil')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 2: Configurar Perfil e laudos"
                  accessibilityHint="Toque duas vezes para editar seu histórico, competências e laudo médico"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>👤</Text>
                    </View>
                    <Text style={styles.blockTitle}>CONFIGURAR PERFIL</Text>
                    <Text style={styles.blockSubtitle}>Dados, formação e laudo CID</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 3: NOVAS CONEXÕES */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('REDE', 'Novas Conexões')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 3: Novas Conexões e rede inclusiva"
                  accessibilityHint="Toque duas vezes para interagir com recrutadores e colegas de trabalho"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>👥</Text>
                    </View>
                    <Text style={styles.blockTitle}>NOVAS CONEXÕES</Text>
                    <Text style={styles.blockSubtitle}>Conecte-se com recrutadores</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>

                {/* BLOCO 4: PUBLICAÇÕES */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNavegar('VER_PUBLICACOES', 'Publicações')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Bloco 4: Ver Publicações da comunidade Equalis"
                  accessibilityHint="Toque duas vezes para ver notícias, posts e comunicados da comunidade"
                  style={[styles.gridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
                >
                  <View style={styles.blockContentLeft}>
                    <View style={styles.blockIconCircle}>
                      <Text style={styles.blockEmoji}>📰</Text>
                    </View>
                    <Text style={styles.blockTitle}>PUBLICAÇÕES</Text>
                    <Text style={styles.blockSubtitle}>Notícias e histórias de inclusão</Text>
                  </View>
                  <Image
                    source={FIGMA_ASSETS.cardAcessivelPuzzle}
                    style={styles.blockPuzzleImage}
                    resizeMode="contain"
                    accessible={false}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          /* ================= PÁGINA 2: MENSAGENS E FEED (Figma 13_TELA_ACESSIVEL_2.png) ================= */
          <View style={styles.page2Container}>
            {/* BLOCO GRANDE AZUL: MENSAGENS (#374:847) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleNavegar('MENSAGENS', 'Mensagens')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Bloco de Mensagens. Você possui ${mensagensNaoLidas} novas mensagens.`}
              style={[styles.fullGridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
            >
              <View style={styles.blockContentLeft}>
                <View style={styles.blockIconCircle}>
                  <Text style={styles.blockEmoji}>💬</Text>
                </View>
                <Text style={styles.fullBlockTitle}>MENSAGENS</Text>
                <Text style={styles.blockSubtitle}>
                  {mensagensNaoLidas} conversas ativas com recrutadores e empresas
                </Text>
                <View style={styles.unreadBadgePill}>
                  <Text style={styles.unreadBadgeText}>
                    {mensagensNaoLidas} Novas Mensagens
                  </Text>
                </View>
              </View>
              <Image
                source={FIGMA_ASSETS.cardAcessivelPuzzle}
                style={styles.fullBlockPuzzleImage}
                resizeMode="contain"
                accessible={false}
              />
            </TouchableOpacity>

            {/* BLOCO GRANDE AZUL: PUBLICAÇÕES (Página 2) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleNavegar('VER_PUBLICACOES', 'Publicações')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Bloco de Publicações da comunidade"
              style={[styles.fullGridBlock, { backgroundColor: '#1F41BB', borderRadius: radius.lg }]}
            >
              <View style={styles.blockContentLeft}>
                <View style={styles.blockIconCircle}>
                  <Text style={styles.blockEmoji}>📢</Text>
                </View>
                <Text style={styles.fullBlockTitle}>PUBLICAÇÕES</Text>
                <Text style={styles.blockSubtitle}>
                  Acompanhe depoimentos, eventos e atualizações das empresas
                </Text>
              </View>
              <Image
                source={FIGMA_ASSETS.cardAcessivelPuzzle}
                style={styles.fullBlockPuzzleImage}
                resizeMode="contain"
                accessible={false}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Botão de Atalho para Alternar Página */}
        <TouchableOpacity
          onPress={() => handleMudarPagina(paginaAcessivel === 1 ? 2 : 1)}
          style={[styles.togglePageBtn, { backgroundColor: colors.surfaceTint, borderColor: colors.primaryDark }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Ir para a página ${paginaAcessivel === 1 ? '2 com Mensagens' : '1 com Vagas'}`}
        >
          <Text style={[typography.bodyMedium, { color: colors.primaryDark, fontWeight: '800' }]}>
            {paginaAcessivel === 1 ? '👉 Ver Mensagens (Página 2)' : '👈 Voltar para Vagas (Página 1)'}
          </Text>
        </TouchableOpacity>

        {/* Barra de Ajustes Rápidos de Acessibilidade */}
        <View
          style={[
            styles.quickControlsCard,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, fontWeight: '700', marginBottom: 10 },
            ]}
          >
            ⚙️ Ajustes Rápidos de Acessibilidade
          </Text>

          <View style={styles.controlsRow}>
            {/* Ajuste de Fonte */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={cycleFontScale}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Tamanho da fonte atual: ${Math.round(fontScale * 100)}%. Toque para alterar.`}
              style={[
                styles.controlBtn,
                { backgroundColor: colors.surfaceTint, borderColor: colors.primaryDark },
              ]}
            >
              <Text style={[styles.controlBtnText, { color: colors.primaryDark }]}>
                🔠 Fonte ({Math.round(fontScale * 100)}%)
              </Text>
            </TouchableOpacity>

            {/* Alternar Alto Contraste */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const novo = !highContrast;
                setHighContrast(novo);
                speak(
                  novo
                    ? 'Modo de alto contraste ativado'
                    : 'Modo de alto contraste desativado'
                );
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Alto contraste está ${highContrast ? 'ativado' : 'desativado'}`}
              style={[
                styles.controlBtn,
                {
                  backgroundColor: highContrast ? '#000000' : colors.surfaceTint,
                  borderColor: '#000000',
                },
              ]}
            >
              <Text
                style={[
                  styles.controlBtnText,
                  { color: highContrast ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                🌓 Contraste {highContrast ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão Inferior de Retorno ao Modo Padrão Fiel ao Figma */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAlternarInterfacePadrao}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a interface de navegação padrão"
            style={styles.switchModeLink}
          >
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.primaryDark, fontWeight: '800', textAlign: 'center', textDecorationLine: 'underline' },
              ]}
            >
              🔄 Voltar para a Interface Padrão Completa
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
  },
  scrollContent: {
    paddingBottom: 36,
  },
  a11yBannerTop: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  a11yBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  a11yBannerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#102A56',
  },
  roleSwitchA11yBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleSwitchA11yBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ttsSpeakerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ttsSpeakerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  pageIndicatorPill: {
    height: 8,
    borderRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  gridBlock: {
    width: '48%',
    minHeight: 185,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#0B2265',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  page2Container: {
    gap: 14,
    marginBottom: 14,
  },
  fullGridBlock: {
    width: '100%',
    minHeight: 150,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#0B2265',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  blockContentLeft: {
    zIndex: 2,
    maxWidth: '75%',
  },
  blockIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  blockEmoji: {
    fontSize: 20,
  },
  blockTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  fullBlockTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  blockSubtitle: {
    color: '#E0E7FF',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  blockPuzzleImage: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 68,
    height: 68,
    opacity: 0.9,
    zIndex: 1,
  },
  fullBlockPuzzleImage: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 90,
    height: 90,
    opacity: 0.85,
    zIndex: 1,
  },
  unreadBadgePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  unreadBadgeText: {
    color: '#1F41BB',
    fontWeight: '800',
    fontSize: 12,
  },
  togglePageBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  quickControlsCard: {
    padding: 14,
    borderWidth: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    minHeight: 46,
  },
  controlBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  switchModeLink: {
    paddingVertical: 6,
    alignItems: 'center',
  },
});
