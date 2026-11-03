import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function DetalhesVagaAcessivelScreen() {
  const { theme, speak, stopSpeaking, isSpeaking } = useAccessibility();
  const {
    vagas,
    selectedVaga,
    candidaturas,
    aplicarParaVaga,
    cancelarCandidatura,
    goBack,
    navigate,
    deficiencias,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const vaga = selectedVaga || (vagas && vagas.length > 0 ? vagas[0] : null);

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    tipo: '',
    titulo: '',
    mensagem: '',
  });

  if (!vaga) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AccessibleHeader
          showBack={true}
          onBack={() => goBack('EMPREGO')}
          title="Vaga Acessível"
          audioSummary="Nenhuma vaga selecionada no momento."
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>♿</Text>
          <Text style={[typography.titleLarge, { color: colors.textPrimary, textAlign: 'center', fontSize: 24 }]}>
            Nenhuma vaga selecionada
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24, fontSize: 16 }]}>
            Toque abaixo para abrir a lista de vagas e selecionar uma oportunidade adaptada.
          </Text>
          <TouchableOpacity
            onPress={() => navigate('EMPREGO')}
            style={{ backgroundColor: colors.primaryDark, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>
              Ver Vagas Inclusivas
            </Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar activeTab="VAGAS" />
      </View>
    );
  }

  const candidaturaExistente = candidaturas.find(
    (c) => c.vaga_id === vaga.id && c.status_processo !== 'CANCELADA'
  );

  const formatCurrency = (val) => {
    if (typeof val === 'number') {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `R$ ${val || '1.621'}`;
  };

  // Leitura em Voz Alta Completa do Modo Tela Acessível
  const handleVozAssistente = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const speechText = `Modo Acessível. Detalhes da Vaga aberta para ${vaga.titulo} no ${vaga.empresa_nome}. Salário destacado de ${formatCurrency(vaga.salario)}. Carga horária de ${vaga.carga_horaria}, modalidade ${vaga.modalidade} em ${vaga.cidade}. Descrição da oportunidade: ${vaga.descricao}. Requerimentos: ${vaga.requerimentos}. Recursos inclusivos oferecidos: ${(vaga.recursos_acessibilidade || []).join(', ')}. ${candidaturaExistente ? `Você já está inscrito nesta oportunidade com status ${candidaturaExistente.status_processo}.` : 'Toque no botão grande azul no fim da tela para se candidatar à vaga agora mesmo.'}`;
      speak(speechText);
    }
  };

  const handleCandidatarAcessivel = () => {
    if (candidaturaExistente) {
      setConfirmModal({
        visible: true,
        tipo: 'CANCELAR',
        titulo: 'Candidatura em Andamento',
        mensagem: `Você já está participando desta seleção. Status atual: ${candidaturaExistente.status_processo}. Deseja cancelar sua inscrição?`,
      });
      return;
    }

    const res = aplicarParaVaga(vaga.id);
    if (res.sucesso) {
      speak(`Parabéns! Sua candidatura foi enviada com sucesso para a empresa ${vaga?.empresa_nome || 'contratante'}. Seu perfil inclusivo já está disponível para o recrutador.`);
      setConfirmModal({
        visible: true,
        tipo: 'SUCESSO',
        titulo: 'Candidatura Enviada!',
        mensagem: 'Suas informações de acessibilidade foram compartilhadas com sucesso.',
      });
    }
  };

  const handleConfirmarCancelamento = () => {
    cancelarCandidatura(vaga.id);
    setConfirmModal({ visible: false, tipo: '', titulo: '', mensagem: '' });
    speak('Sua candidatura foi cancelada.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* CABEÇALHO PADRÃO ACESSÍVEL */}
      <AccessibleHeader
        title="Detalhes da Vaga"
        showBack={true}
        onBack={() => goBack('EMPREGO')}
        audioSummary={`Detalhes acessíveis da vaga de ${vaga.titulo} na empresa ${vaga.empresa_nome}.`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER INSTITUCIONAL VERDE RICO COM LOGO UNICEPLAC BRANCA E FOTOS DOS ATENDENTES */}
        <View style={styles.bannerCardAcessivel}>
          <View style={styles.bannerContentRowAcessivel}>
            {/* Lado Esquerdo: Identidade Institucional UNICEPLAC */}
            <View style={styles.bannerLeftColAcessivel}>
              <Image
                source={FIGMA_ASSETS.logoUniceplacBranca}
                style={{ width: 120, height: 40, marginBottom: 8 }}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Logo Branca UNICEPLAC Centro Universitário"
              />
              <Text accessibilityRole="header" style={styles.bannerTitleAcessivel}>
                Vagas Abertas
              </Text>
              <Text style={styles.bannerSubtitleAcessivel}>
                Junte-se à nossa equipe!
              </Text>
              <Text style={styles.bannerEnvieCurriculoAcessivel}>
                Envie seu currículo para:
              </Text>
              <View style={styles.orangeBadgeAcessivel}>
                <Text style={styles.orangeBadgeTextAcessivel}>www.uniceplac.edu.br</Text>
              </View>
            </View>

            {/* Lado Direito: Fotos dos 3 atendentes com headset */}
            <View style={styles.bannerRightColAcessivel}>
              <View style={styles.atendentesClusterAcessivel}>
                <Image
                  source={FIGMA_ASSETS.atendente1}
                  style={[styles.atendenteCircleAcessivel, { zIndex: 3 }]}
                  resizeMode="cover"
                  accessible={true}
                  accessibilityLabel="Foto da atendente inclusiva"
                />
                <Image
                  source={FIGMA_ASSETS.atendente2}
                  style={[styles.atendenteCircleAcessivel, { marginLeft: -18, zIndex: 2 }]}
                  resizeMode="cover"
                  accessible={true}
                  accessibilityLabel="Foto do atendente inclusivo"
                />
                <Image
                  source={FIGMA_ASSETS.atendente3}
                  style={[styles.atendenteCircleAcessivel, { marginLeft: -18, zIndex: 1 }]}
                  resizeMode="cover"
                  accessible={true}
                  accessibilityLabel="Foto da colaboradora acadêmica"
                />
              </View>
            </View>
          </View>
        </View>

        {/* CARD AZUL #1F41BB COM CARGO, EMPRESA E SALÁRIO */}
        <View style={styles.blueMainCard}>
          <Text
            accessibilityRole="header"
            style={styles.blueCardJobTitle}
          >
            {vaga.titulo}
          </Text>

          <Text style={styles.blueCardCompany}>
            {vaga.empresa_nome}
          </Text>

          <View style={styles.blueCardMetaRow}>
            <Text style={styles.blueCardMetaBadge}>📍 {vaga.cidade}</Text>
            <Text style={styles.blueCardMetaBadge}>💼 {vaga.carga_horaria}</Text>
            <Text style={styles.blueCardMetaBadge}>🏢 {vaga.modalidade}</Text>
          </View>

          <View style={styles.blueCardSalaryBox}>
            <Text style={styles.blueCardSalaryLabel}>SALÁRIO MENSAL:</Text>
            <Text style={styles.blueCardSalaryValue}>
              {formatCurrency(vaga.salario)}
            </Text>
          </View>
        </View>

        {/* STATUS DA CANDIDATURA SE JÁ ESTIVER INSCRITO */}
        {candidaturaExistente ? (
          <View
            style={[
              styles.candidaturaAtivaBox,
              { backgroundColor: '#E0F2FE', borderColor: colors.primaryDark },
            ]}
          >
            <Text style={styles.candidaturaAtivaIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.candidaturaAtivaTitle}>
                VOCÊ JÁ ESTÁ CANDIDATADO A ESTA VAGA
              </Text>
              <Text style={styles.candidaturaAtivaStatus}>
                Status Atual:{' '}
                <Text style={{ fontWeight: '900', color: colors.primaryDark }}>
                  {candidaturaExistente.status_processo}
                </Text>
              </Text>
            </View>
          </View>
        ) : null}

        {/* BLOCO 2: RECURSOS DE ACESSIBILIDADE DISPONÍVEIS */}
        <View
          style={[
            styles.bigInfoCard,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.primary,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeaderBig, { color: colors.primaryDark }]}
          >
            ♿ Recursos de Acessibilidade Disponíveis:
          </Text>

          <View style={styles.accessibilityListAcessivel}>
            {(vaga.recursos_acessibilidade || []).map((rec, i) => (
              <View key={i} style={styles.accessRowAcessivel}>
                <Text style={styles.accessCheckIcon}>✅</Text>
                <Text style={[styles.accessTextAcessivel, { color: colors.textPrimary }]}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* BLOCO 3: DESCRIÇÃO DA VAGA */}
        <View
          style={[
            styles.bigInfoCard,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.cardBorder,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeaderBig, { color: colors.primaryDark }]}
          >
            Descrição da vaga:
          </Text>
          <Text style={[styles.paragraphBig, { color: colors.textPrimary }]}>
            {vaga.descricao}
          </Text>
        </View>

        {/* BLOCO 4: REQUERIMENTOS */}
        <View
          style={[
            styles.bigInfoCard,
            {
              backgroundColor: '#FFFFFF',
              borderColor: colors.cardBorder,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeaderBig, { color: colors.primaryDark }]}
          >
            Requerimentos:
          </Text>
          <Text style={[styles.paragraphBig, { color: colors.textPrimary }]}>
            {vaga.requerimentos}
          </Text>
        </View>

        {/* BLOCO 5: LINK EXTERNO PARA A VAGA */}
        {vaga.link_externo ? (
          <View
            style={[
              styles.bigInfoCard,
              {
                backgroundColor: '#FFFFFF',
                borderColor: colors.cardBorder,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.sectionHeaderBig, { color: colors.primaryDark }]}
            >
              Link externo para vaga:
            </Text>
            <TouchableOpacity
              onPress={() => speak(`Link externo da vaga: ${vaga.link_externo}`)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Link externo da vaga: ${vaga.link_externo}`}
              style={styles.linkExternoAcessivelBox}
            >
              <Text style={styles.linkExternoAcessivelIcon}>🔗</Text>
              <Text style={styles.linkExternoAcessivelText}>
                {vaga.link_externo}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* BOTÃO PARA OUVIR DETALHES COMPLETOS EM ÁUDIO */}
        <TouchableOpacity
          onPress={handleVozAssistente}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ouvir toda esta vaga em voz alta"
          style={[styles.listenAllButton, { backgroundColor: colors.surfaceTint, borderColor: colors.primaryDark }]}
        >
          <Text style={styles.listenAllIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
          <Text style={[styles.listenAllText, { color: colors.primaryDark }]}>
            {isSpeaking ? 'PARAR LEITURA EM VOZ ALTA' : 'OUVIR VAGA COMPLETA EM VOZ ALTA'}
          </Text>
        </TouchableOpacity>

        {/* BLOCO DE BOTÕES GIGANTES NO RODAPÉ (FIGMA #405:535 & #405:536) */}
        <View style={styles.giantButtonsRow}>
          {/* Botão VOLTAR Gigante */}
          <TouchableOpacity
            onPress={() => goBack('EMPREGO')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
            style={[
              styles.giantBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.giantBtnText}>VOLTAR</Text>
          </TouchableOpacity>

          {/* Botão CANDIDATAR-SE NESTA VAGA Gigante */}
          <TouchableOpacity
            onPress={handleCandidatarAcessivel}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              candidaturaExistente
                ? `Candidatura ativa. Status ${candidaturaExistente.status_processo}. Toque para cancelar`
                : 'Candidatar-se nesta vaga agora mesmo'
            }
            style={[
              styles.giantBtn,
              {
                backgroundColor: candidaturaExistente
                  ? colors.danger
                  : colors.primaryDark,
              },
            ]}
          >
            <Text style={styles.giantBtnText}>
              {candidaturaExistente ? 'CANCELAR CANDIDATURA' : 'CANDIDATAR-SE NESTA VAGA'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE CONFIRMAÇÃO ACESSÍVEL */}
      <Modal
        visible={confirmModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setConfirmModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBoxAcessivel,
              { backgroundColor: '#FFFFFF', borderColor: colors.primaryDark },
            ]}
          >
            <Text style={styles.modalEmojiBig}>
              {confirmModal.tipo === 'SUCESSO' ? '🎉' : '⚠️'}
            </Text>

            <Text style={styles.modalTitleBig}>{confirmModal.titulo}</Text>

            <Text style={styles.modalMsgBig}>{confirmModal.mensagem}</Text>

            {confirmModal.tipo === 'CANCELAR' ? (
              <View style={styles.modalButtonsStack}>
                <TouchableOpacity
                  onPress={handleConfirmarCancelamento}
                  style={[styles.modalBtnBig, { backgroundColor: colors.danger }]}
                >
                  <Text style={styles.modalBtnBigText}>SIM, CANCELAR CANDIDATURA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setConfirmModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
                  }
                  style={[styles.modalBtnBig, { backgroundColor: colors.surfaceTint }]}
                >
                  <Text style={[styles.modalBtnBigText, { color: colors.textPrimary }]}>
                    MANTER MINHA CANDIDATURA
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalButtonsStack}>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmModal({ visible: false, tipo: '', titulo: '', mensagem: '' });
                    navigate('MINHAS_CANDIDATURAS');
                  }}
                  style={[styles.modalBtnBig, { backgroundColor: colors.primaryDark }]}
                >
                  <Text style={styles.modalBtnBigText}>VER MINHAS CANDIDATURAS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setConfirmModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
                  }
                  style={[styles.modalBtnBig, { backgroundColor: colors.surfaceTint }]}
                >
                  <Text style={[styles.modalBtnBigText, { color: colors.textPrimary }]}>
                    FECHAR
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* BARRA INFERIOR COM BOTÃO AO MENU ACESSÍVEL */}
      <BottomTabBar activeTab="VAGAS" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accessibleTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  bigCircleBackBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  bigCircleBackArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: -2,
  },
  appBrandText: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  voiceAssistantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 26,
    borderWidth: 2,
    gap: 6,
  },
  voiceAssistantIcon: {
    fontSize: 22,
  },
  voiceNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  bannerCardAcessivel: {
    backgroundColor: '#067451',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#0BDA98',
  },
  bannerContentRowAcessivel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeftColAcessivel: {
    flex: 1.2,
    minWidth: 0,
    paddingRight: 8,
  },
  bannerTitleAcessivel: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bannerSubtitleAcessivel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerEnvieCurriculoAcessivel: {
    color: '#E8F5E9',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  orangeBadgeAcessivel: {
    backgroundColor: '#FF6F00',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orangeBadgeTextAcessivel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerRightColAcessivel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atendentesClusterAcessivel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atendenteCircleAcessivel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  blueMainCard: {
    backgroundColor: '#1F41BB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#007ADE',
  },
  blueCardJobTitle: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  blueCardCompany: {
    fontSize: 20,
    fontWeight: '800',
    color: '#93C5FD',
    marginBottom: 12,
  },
  blueCardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  blueCardMetaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  blueCardSalaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blueCardSalaryLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E0F2FE',
    marginBottom: 4,
  },
  blueCardSalaryValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  linkExternoAcessivelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    gap: 10,
    marginTop: 6,
  },
  linkExternoAcessivelIcon: {
    fontSize: 22,
  },
  linkExternoAcessivelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007ADE',
    textDecorationLine: 'underline',
    flex: 1,
  },
  bigInfoCard: {
    borderWidth: 2,
    padding: 18,
  },
  jobTitleBig: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 4,
  },
  companyNameBig: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  metaRowAcessivel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaBadgeAcessivel: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  salaryHighlightBox: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  salaryLabelAcessivel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  salaryValueBig: {
    fontSize: 30,
    fontWeight: '900',
  },
  candidaturaAtivaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  candidaturaAtivaIcon: {
    fontSize: 30,
  },
  candidaturaAtivaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  candidaturaAtivaStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionHeaderBig: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  accessibilityListAcessivel: {
    gap: 10,
  },
  accessRowAcessivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accessCheckIcon: {
    fontSize: 20,
  },
  accessTextAcessivel: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  paragraphBig: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
  },
  listenAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    gap: 10,
  },
  listenAllIcon: {
    fontSize: 24,
  },
  listenAllText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  giantButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  giantBtn: {
    flex: 1,
    minHeight: 60,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  giantBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBoxAcessivel: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
  },
  modalEmojiBig: {
    fontSize: 54,
    marginBottom: 12,
  },
  modalTitleBig: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  modalMsgBig: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    color: '#333333',
    marginBottom: 24,
  },
  modalButtonsStack: {
    width: '100%',
    gap: 12,
  },
  modalBtnBig: {
    minHeight: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBtnBigText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
