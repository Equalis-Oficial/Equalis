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

export default function DetalhesVagaScreen() {
  const { theme, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const {
    vagas,
    selectedVaga,
    candidaturas,
    aplicarParaVaga,
    cancelarCandidatura,
    navigate,
    goBack,
    deficiencias,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const vaga = selectedVaga || (vagas && vagas.length > 0 ? vagas[0] : null);

  // Modal de confirmação / feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    tipo: 'SUCESSO', // 'SUCESSO' | 'CANCELAR'
    titulo: '',
    mensagem: '',
  });

  if (!vaga) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AccessibleHeader
          showBack={true}
          onBack={() => goBack('EMPREGO')}
          title="Detalhes da Vaga"
          audioSummary="Nenhuma vaga selecionada no momento."
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>💼</Text>
          <Text style={[typography.titleLarge, { color: colors.textPrimary, textAlign: 'center' }]}>
            Nenhuma Vaga Selecionada
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 20 }]}>
            Escolha uma vaga no mural de oportunidades para visualizar todos os detalhes e recursos de acessibilidade.
          </Text>
          <TouchableOpacity
            onPress={() => navigate('EMPREGO')}
            style={{ backgroundColor: colors.primaryDark, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              Ver Vagas Disponíveis
            </Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar activeTab="VAGAS" />
      </View>
    );
  }

  // Verifica se o usuário já tem candidatura ativa
  const candidaturaExistente = candidaturas.find(
    (c) => c.vaga_id === vaga.id && c.status_processo !== 'CANCELADA'
  );

  const formatCurrency = (val) => {
    if (typeof val === 'number') {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `R$ ${val || '1.621'}`;
  };

  // Síntese de Voz completa da Vaga
  const handleOuvirDetalhesVaga = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textoVoz = `Vaga aberta para ${vaga.titulo} na empresa ${vaga.empresa_nome}. Salário de ${formatCurrency(vaga.salario)}. Modalidade ${vaga.modalidade}, carga de ${vaga.carga_horaria}. Local: ${vaga.cidade}. Descrição: ${vaga.descricao}. Requerimentos: ${vaga.requerimentos}. Recursos de acessibilidade inclusos: ${(vaga.recursos_acessibilidade || []).join(', ')}. ${candidaturaExistente ? `Você já possui uma candidatura com status ${candidaturaExistente.status_processo}.` : 'Toque no botão Candidatar-se para enviar seu perfil.'}`;
      speak(textoVoz);
    }
  };

  const handleCandidatar = () => {
    if (candidaturaExistente) {
      setFeedbackModal({
        visible: true,
        tipo: 'CANCELAR',
        titulo: 'Candidatura Ativa',
        mensagem: `Você já está concorrendo a esta vaga. Status atual: ${candidaturaExistente.status_processo}. Deseja cancelar sua candidatura?`,
      });
      return;
    }

    const res = aplicarParaVaga(vaga.id);
    if (res.sucesso) {
      speak('Candidatura enviada com sucesso! A empresa já recebeu suas informações e necessidades de acessibilidade.');
      setFeedbackModal({
        visible: true,
        tipo: 'SUCESSO',
        titulo: 'Sucesso na Candidatura!',
        mensagem:
          'Seu currículo e laudo de acessibilidade foram enviados diretamente para o RH inclusivo da empresa.',
      });
    }
  };

  const handleConfirmarCancelamento = () => {
    cancelarCandidatura(vaga.id);
    setFeedbackModal({ visible: false, tipo: '', titulo: '', mensagem: '' });
    speak('Sua candidatura foi cancelada com sucesso.');
  };

  // Mapeamento das deficiências atendidas por esta vaga
  const deficienciasAtendidas = (vaga.acessibilidades_ids || []).map((id) => {
    const d = deficiencias.find((item) => item.id === id);
    return d ? d.categoria : `Acessibilidade #${id}`;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER PADRÃO COM BUSCA E ACESSIBILIDADE */}
      <AccessibleHeader
        showBack={true}
        onBack={() => goBack('EMPREGO')}
        showSearch={true}
        showCreateVaga={true}
        audioSummary={`Detalhes da vaga de ${vaga.titulo} na empresa ${vaga.empresa_nome}.`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER VERDE INSTITUCIONAL UNICEPLAC (#067451) FIEL AO FIGMA (16_DETALHES_VAGA_PADRAO.png) */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerGradientBg}>
            <View style={styles.bannerContentRow}>
              {/* Lado Esquerdo: Textos institucionais + Logo Branca UNICEPLAC */}
              <View style={styles.bannerLeftCol}>
                <Image
                  source={FIGMA_ASSETS.logoUniceplacBranca}
                  style={{ width: 110, height: 36, marginBottom: 8 }}
                  resizeMode="contain"
                  accessible={true}
                  accessibilityLabel="Logo Branca UNICEPLAC Centro Universitário"
                />
                <Text accessibilityRole="header" style={styles.bannerVagasAbertasTitle}>
                  Vagas Abertas
                </Text>
                <Text style={styles.bannerSubtitle}>
                  Junte-se à nossa equipe!
                </Text>
                <Text style={styles.bannerEnvieCurriculo}>
                  Envie seu currículo para:
                </Text>
                <View style={styles.orangeBadge}>
                  <Text style={styles.orangeBadgeText}>www.uniceplac.edu.br</Text>
                </View>
              </View>

              {/* Lado Direito: Fotos Circulares Reais dos Atendentes com Headsets */}
              <View style={styles.bannerRightCol}>
                <View style={styles.atendentesCluster}>
                  <Image
                    source={FIGMA_ASSETS.atendente1}
                    style={[styles.atendenteCircle, styles.atendenteCircle1]}
                    resizeMode="cover"
                    accessible={true}
                    accessibilityLabel="Foto da colaboradora atendente"
                  />
                  <Image
                    source={FIGMA_ASSETS.atendente2}
                    style={[styles.atendenteCircle, styles.atendenteCircle2]}
                    resizeMode="cover"
                    accessible={true}
                    accessibilityLabel="Foto do colaborador de atendimento"
                  />
                  <Image
                    source={FIGMA_ASSETS.atendente3}
                    style={[styles.atendenteCircle, styles.atendenteCircle3]}
                    resizeMode="cover"
                    accessible={true}
                    accessibilityLabel="Foto da colaboradora de relacionamento acadêmico"
                  />
                </View>

                {/* Botão de Ouvir Vaga em Áudio */}
                <TouchableOpacity
                  onPress={handleOuvirDetalhesVaga}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSpeaking
                      ? 'Parar áudio explicativo da vaga'
                      : 'Ouvir toda a descrição e requisitos da vaga em voz alta'
                  }
                  style={[
                    styles.audioSpeakerButton,
                    { backgroundColor: isSpeaking ? colors.danger : 'rgba(255, 255, 255, 0.95)' },
                  ]}
                >
                  <Text style={styles.audioSpeakerIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
                  <Text
                    style={[
                      styles.audioSpeakerText,
                      { color: isSpeaking ? '#FFFFFF' : colors.primaryDark },
                    ]}
                  >
                    {isSpeaking ? 'Parar' : 'Ouvir Vaga'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* CARTÃO PRINCIPAL: TÍTULO, EMPRESA E SALÁRIO DESTACADO */}
        <View style={styles.jobTitleCard}>
          <View style={styles.jobHeaderLeft}>
            <Text
              accessibilityRole="header"
              style={[typography.titleLarge, styles.boldTitle, { color: colors.textPrimary }]}
            >
              {vaga.titulo}
            </Text>
            <TouchableOpacity
              onPress={() => navigate('REDE')}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Ver empresa ${vaga.empresa_nome}`}
            >
              <Text style={[styles.companyLink, { color: colors.primary }]}>
                {vaga.empresa_nome}
              </Text>
            </TouchableOpacity>

            <View style={styles.metaRow}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                📍 {vaga.cidade} • {vaga.modalidade} • 💼 {vaga.carga_horaria}
              </Text>
            </View>
          </View>

          {/* Salário Destacado em Azul (Figma EL-d3a9146d) */}
          <View style={styles.salaryContainer}>
            <Text style={[styles.salaryAmount, { color: colors.primary }]}>
              {formatCurrency(vaga.salario)}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Mensal + Benefícios
            </Text>
          </View>
        </View>

        {/* STATUS DA CANDIDATURA SE JÁ ESTIVER INSCRITO */}
        {candidaturaExistente ? (
          <View
            style={[
              styles.applicationStatusBox,
              { backgroundColor: '#E8F0FE', borderColor: colors.primary },
            ]}
          >
            <Text style={styles.statusBoxIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBoxTitle, { color: colors.primaryDark }]}>
                Sua Candidatura está em andamento
              </Text>
              <Text style={[typography.caption, { color: colors.textPrimary }]}>
                Status Atual:{' '}
                <Text style={{ fontWeight: '800', color: colors.primaryDark }}>
                  {candidaturaExistente.status_processo}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setFeedbackModal({
                  visible: true,
                  tipo: 'CANCELAR',
                  titulo: 'Cancelar Candidatura',
                  mensagem: 'Tem certeza que deseja cancelar sua candidatura para esta vaga?',
                })
              }
              style={[styles.cancelAppSmallBtn, { backgroundColor: '#FEE2E2' }]}
            >
              <Text style={styles.cancelAppSmallBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* SEÇÃO DETALHES (Figma EL-1fef7a13 & EL-b36d9ae3) */}
        <View style={styles.sectionBlock}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeading, { color: colors.primary }]}
          >
            Detalhes:
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              styles.sectionParagraph,
              { color: colors.textPrimary },
            ]}
          >
            {vaga.descricao}
          </Text>
        </View>

        {/* SEÇÃO REQUERIMENTOS (Figma EL-c69e7014 & EL-0ca3bea1) */}
        <View style={styles.sectionBlock}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeading, { color: colors.primary }]}
          >
            Requerimentos
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              styles.sectionParagraph,
              { color: colors.textPrimary },
            ]}
          >
            {vaga.requerimentos}
          </Text>
        </View>

        {/* SEÇÃO RECURSOS DE ACESSIBILIDADE DISPONÍVEIS */}
        <View style={styles.sectionBlock}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionHeading, { color: colors.primary }]}
          >
            Recursos de Acessibilidade Disponíveis
          </Text>

          {/* Cards de Recursos */}
          <View style={styles.accessibilityListWrap}>
            {(vaga.recursos_acessibilidade || []).map((rec, idx) => (
              <View
                key={idx}
                style={[
                  styles.accessibilityItemCard,
                  { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={styles.accessCheckIcon}>✅</Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.textPrimary, fontWeight: '600', flex: 1 },
                  ]}
                >
                  {rec}
                </Text>
              </View>
            ))}
          </View>

          {/* Compatibilidade por Deficiência */}
          <View style={styles.deficienciasCompatWrap}>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 8 }]}>
              Deficiências atendidas prioritariamente:
            </Text>
            <View style={styles.chipsRow}>
              {deficienciasAtendidas.map((defNome, index) => (
                <View
                  key={index}
                  style={[
                    styles.deficienciaPill,
                    { backgroundColor: '#E8F5E9', borderColor: '#81C784' },
                  ]}
                >
                  <Text style={styles.deficienciaPillText}>♿ {defNome}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SEÇÃO LINK EXTERNO PARA A VAGA */}
        {vaga.link_externo ? (
          <View style={styles.sectionBlock}>
            <Text
              accessibilityRole="header"
              style={[styles.sectionHeading, { color: colors.primary }]}
            >
              Link externo para vaga:
            </Text>
            <TouchableOpacity
              onPress={() => speak(`Link externo: ${vaga.link_externo}`)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Link externo da vaga: ${vaga.link_externo}`}
              style={[
                styles.linkExternoBox,
                { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={styles.linkExternoIcon}>🔗</Text>
              <Text style={[styles.linkExternoText, { color: colors.primaryDark }]}>
                {vaga.link_externo}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* SEÇÃO DE BOTÕES DO RODAPÉ (Figma EL-dc0c5460 e EL-7e3e6ef6) */}
        <View style={styles.bottomButtonsRow}>
          {/* Botão VOLTAR (Figma EL-6888e150) */}
          <TouchableOpacity
            onPress={() => goBack('EMPREGO')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a lista de empregos"
            style={[
              styles.footerBtn,
              styles.voltarBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.footerBtnText}>VOLTAR</Text>
          </TouchableOpacity>

          {/* Botão CANDIDATAR-SE AGORA / CANCELAR CANDIDATURA */}
          <TouchableOpacity
            onPress={handleCandidatar}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              candidaturaExistente
                ? `Candidatura ativa. Status ${candidaturaExistente.status_processo}. Toque para cancelar candidatura`
                : 'Candidatar-se agora a esta vaga de emprego'
            }
            style={[
              styles.footerBtn,
              styles.candidatarBtn,
              {
                backgroundColor: candidaturaExistente
                  ? colors.danger
                  : colors.primaryDark,
              },
            ]}
          >
            <Text style={styles.footerBtnText}>
              {candidaturaExistente ? 'CANCELAR CANDIDATURA' : 'CANDIDATAR-SE AGORA'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE FEEDBACK ACESSÍVEL */}
      <Modal
        visible={feedbackModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setFeedbackModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
        }
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: '#FFFFFF', borderRadius: radius.lg },
            ]}
          >
            <Text style={styles.modalEmoji}>
              {feedbackModal.tipo === 'SUCESSO' ? '🎉' : '⚠️'}
            </Text>

            <Text
              accessibilityRole="header"
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, textAlign: 'center', marginBottom: 10 },
              ]}
            >
              {feedbackModal.titulo}
            </Text>

            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
              ]}
            >
              {feedbackModal.mensagem}
            </Text>

            {feedbackModal.tipo === 'CANCELAR' ? (
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  onPress={() =>
                    setFeedbackModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
                  }
                  style={[styles.modalBtnCancel, { borderColor: colors.cardBorder }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    Manter
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmarCancelamento}
                  style={[styles.modalBtnConfirmDanger, { backgroundColor: colors.danger }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Sim, Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalActionsCol}>
                <TouchableOpacity
                  onPress={() => {
                    setFeedbackModal({ visible: false, tipo: '', titulo: '', mensagem: '' });
                    navigate('MINHAS_CANDIDATURAS');
                  }}
                  style={[styles.modalBtnPrimary, { backgroundColor: colors.primaryDark }]}
                >
                  <Text style={styles.modalBtnPrimaryText}>Ver Minhas Candidaturas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setFeedbackModal({ visible: false, tipo: '', titulo: '', mensagem: '' })
                  }
                  style={styles.modalBtnClose}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>
                    Continuar Explorando
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* TAB BAR INFERIOR */}
      <BottomTabBar activeTab="VAGAS" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  bannerContainer: {
    marginBottom: 16,
  },
  bannerGradientBg: {
    backgroundColor: '#067451',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeftCol: {
    flex: 1.25,
    minWidth: 0,
    paddingRight: 8,
  },
  bannerVagasAbertasTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerEnvieCurriculo: {
    color: '#E8F5E9',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  orangeBadge: {
    backgroundColor: '#FF6F00',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orangeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bannerRightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atendentesCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  atendenteCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  atendenteCircle1: {
    zIndex: 3,
  },
  atendenteCircle2: {
    marginLeft: -16,
    zIndex: 2,
  },
  atendenteCircle3: {
    marginLeft: -16,
    zIndex: 1,
  },
  linkExternoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 6,
    gap: 8,
  },
  linkExternoIcon: {
    fontSize: 18,
  },
  linkExternoText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
    flex: 1,
  },
  audioSpeakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  audioSpeakerIcon: {
    fontSize: 15,
  },
  audioSpeakerText: {
    fontWeight: '700',
    fontSize: 12,
  },
  bannerMainTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  teamIllustrationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  teamIllustrationContent: {
    alignItems: 'center',
  },
  teamAvatarsRow: {
    fontSize: 32,
    letterSpacing: 4,
    marginBottom: 6,
  },
  teamSubCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  jobTitleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  boldTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  companyLink: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  applicationStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  statusBoxIcon: {
    fontSize: 24,
  },
  statusBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  cancelAppSmallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelAppSmallBtnText: {
    color: '#D93025',
    fontWeight: '700',
    fontSize: 11,
  },
  sectionBlock: {
    paddingHorizontal: 18,
    marginTop: 18,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionParagraph: {
    lineHeight: 24,
  },
  accessibilityListWrap: {
    gap: 8,
    marginTop: 6,
  },
  accessibilityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  accessCheckIcon: {
    fontSize: 16,
  },
  deficienciasCompatWrap: {
    marginTop: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deficienciaPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  deficienciaPillText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 32,
    gap: 14,
  },
  footerBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  voltarBtn: {},
  candidatarBtn: {},
  footerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnConfirmDanger: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionsCol: {
    width: '100%',
    gap: 10,
  },
  modalBtnPrimary: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalBtnClose: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
