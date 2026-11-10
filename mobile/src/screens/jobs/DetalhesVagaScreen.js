import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { FIGMA_ICONS } from '../../theme/figmaAssets';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';
import DetalhesVagaBanner from '../../components/jobs/DetalhesVagaBanner';
import DetalhesVagaHeaderCard from '../../components/jobs/DetalhesVagaHeaderCard';

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
    userType,
    empresaPerfil,
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
          <Image
            source={FIGMA_ICONS.tabVagas}
            style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.7 }}
            resizeMode="contain"
          />
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
  const candidaturaExistente = (candidaturas || []).find(
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
    const d = (deficiencias || []).find((item) => item.id === id);
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
        {/* BANNER INSTITUCIONAL UNICEPLAC */}
        <DetalhesVagaBanner
          isSpeaking={isSpeaking}
          onToggleVoiceAssist={handleOuvirDetalhesVaga}
          colors={colors}
        />

        {/* CARTÃO PRINCIPAL: TÍTULO, EMPRESA E SALÁRIO DESTACADO */}
        <DetalhesVagaHeaderCard
          vaga={vaga}
          candidaturaExistente={candidaturaExistente}
          onNavigateRede={() => navigate('REDE')}
          onRequestCancelCandidatura={() =>
            setFeedbackModal({
              visible: true,
              tipo: 'CANCELAR',
              titulo: 'Cancelar Candidatura',
              mensagem: 'Tem certeza que deseja cancelar sua candidatura para esta vaga?',
            })
          }
          colors={colors}
          typography={typography}
        />

        {/* SEÇÃO DETALHES */}
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

        {/* SEÇÃO REQUERIMENTOS */}
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
                <Image
                  source={FIGMA_ICONS.check}
                  style={{ width: 14, height: 14, marginRight: 8, tintColor: '#137333' }}
                  resizeMode="contain"
                />
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
                  <Text style={styles.deficienciaPillText}>{defNome}</Text>
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
              <Text style={[styles.linkExternoText, { color: colors.primaryDark }]}>
                {vaga.link_externo}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* SEÇÃO DE BOTÕES DO RODAPÉ */}
        <View style={styles.bottomButtonsRow}>
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

          {userType === 'EMPRESA' ? (
            <TouchableOpacity
              onPress={() => navigate('MINHAS_CANDIDATURAS')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver candidatos inscritos para esta oportunidade"
              style={[
                styles.footerBtn,
                styles.candidatarBtn,
                { backgroundColor: colors.primaryDark },
              ]}
            >
              <Text style={styles.footerBtnText}>VER CANDIDATURAS</Text>
            </TouchableOpacity>
          ) : (
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
          )}
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
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: feedbackModal.tipo === 'SUCESSO' ? '#E6F4EA' : '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                alignSelf: 'center',
              }}
            >
              {feedbackModal.tipo === 'SUCESSO' ? (
                <Image
                  source={FIGMA_ICONS.check}
                  style={{ width: 26, height: 26, tintColor: '#137333' }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.danger }}>!</Text>
              )}
            </View>

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

      {/* RODAPÉ TAB BAR INTEGRADO */}
      <BottomTabBar activeTab="VAGAS" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionParagraph: {
    lineHeight: 22,
  },
  accessibilityListWrap: {
    gap: 8,
    marginTop: 6,
  },
  accessibilityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  accessCheckIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  deficienciasCompatWrap: {
    marginTop: 12,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  linkExternoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  linkExternoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  linkExternoText: {
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  footerBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  voltarBtn: {
    flex: 0.8,
  },
  candidatarBtn: {
    flex: 1.2,
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
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
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalBtnConfirmDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalActionsCol: {
    width: '100%',
    gap: 10,
  },
  modalBtnPrimary: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBtnClose: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
