import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

const STATUS_FILTERS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'ATIVAS', label: 'Ativas' },
  { id: 'ENTREVISTA', label: 'Entrevistas' },
  { id: 'APROVADA', label: 'Aprovadas' },
  { id: 'CANCELADA', label: 'Canceladas' },
];

export default function MinhasCandidaturasScreen() {
  const { theme, isAccessibleMode, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const {
    candidaturas,
    vagas,
    cancelarCandidatura,
    atualizarStatusCandidatura,
    setSelectedVagaId,
    navigate,
    goBack,
    userType,
    candidatoPerfil,
    empresaPerfil,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const isEmpresa = userType === 'EMPRESA';

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('TODAS');
  const [cancelModal, setCancelModal] = useState({ visible: false, vagaId: null, vagaTitulo: '' });

  // Lista enriquecida com os dados da vaga
  const candidaturasCompletas = useMemo(() => {
    return candidaturas.map((c) => {
      const vagaCorrespondente = vagas.find((v) => v.id === c.vaga_id) || {
        id: c.vaga_id,
        titulo: 'Vaga de Oportunidade Inclusiva',
        empresa_nome: 'Empresa Parceira',
        cidade: 'Brasília',
        estado: 'DF',
        salario: 2000,
        modalidade: 'Presencial',
        recursos_acessibilidade: ['Ambiente adaptado PcD'],
      };
      return {
        ...c,
        vaga: vagaCorrespondente,
      };
    });
  }, [candidaturas, vagas]);

  // Filtro por status
  const candidaturasFiltradas = useMemo(() => {
    return candidaturasCompletas.filter((item) => {
      if (isEmpresa) {
        if (!empresaPerfil?.id || !item.vaga?.empresa_id || item.vaga.empresa_id !== empresaPerfil.id) {
          return false;
        }
      } else {
        if (candidatoPerfil?.id && item.candidato_id && item.candidato_id !== candidatoPerfil.id) {
          return false;
        }
      }
      if (selectedStatusFilter === 'TODAS') return true;
      if (selectedStatusFilter === 'ATIVAS') {
        return item.status_processo !== 'CANCELADA';
      }
      if (selectedStatusFilter === 'ENTREVISTA') {
        return item.status_processo === 'ENTREVISTA AGENDADA';
      }
      if (selectedStatusFilter === 'APROVADA') {
        return item.status_processo === 'APROVADA';
      }
      if (selectedStatusFilter === 'CANCELADA') {
        return item.status_processo === 'CANCELADA';
      }
      return true;
    });
  }, [candidaturasCompletas, selectedStatusFilter, isEmpresa, empresaPerfil?.id, candidatoPerfil?.id]);

  // Leitura geral em voz alta
  const handleOuvirResumo = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const ativas = candidaturasFiltradas.filter((c) => c.status_processo !== 'CANCELADA').length;
      const resumo = isEmpresa
        ? `Inscrições Recebidas no Equalis. Sua empresa possui ${candidaturasFiltradas.length} inscrições registradas, sendo ${ativas} ativas.`
        : `Minhas Candidaturas no Equalis. Você possui ${candidaturasFiltradas.length} candidaturas registradas, sendo ${ativas} em andamento. Você pode ouvir os detalhes de cada processo ou cancelar qualquer inscrição a qualquer momento.`;
      speak(resumo);
    }
  };

  // Leitura individual de um card
  const handleOuvirStatusIndividual = (item) => {
    const texto = `Candidatura para ${item.vaga.titulo} na empresa ${item.vaga.empresa_nome}. Status atual do processo seletivo: ${item.status_processo}. Data de envio: ${item.created_at || 'recente'}. Modalidade: ${item.vaga.modalidade} em ${item.vaga.cidade}.`;
    speak(texto);
  };

  const handleVerVaga = (vagaId) => {
    setSelectedVagaId(vagaId);
    navigate(isAccessibleMode ? 'DETALHES_VAGA_ACESSIVEL' : 'DETALHES_VAGA', { vagaId });
  };

  const handleConfirmarCancelamento = () => {
    if (cancelModal.vagaId) {
      cancelarCandidatura(cancelModal.vagaId);
      speak(`Sua candidatura para ${cancelModal.vagaTitulo} foi cancelada.`);
    }
    setCancelModal({ visible: false, vagaId: null, vagaTitulo: '' });
  };

  const getStatusColorConfig = (status) => {
    switch (status) {
      case 'APROVADA':
        return {
          bg: '#DCFCE7',
          border: '#4ADE80',
          text: '#15803D',
          icon: '🎉',
        };
      case 'ENTREVISTA AGENDADA':
        return {
          bg: '#F3E8FF',
          border: '#C084FC',
          text: '#6B21A8',
          icon: '📅',
        };
      case 'EM ANÁLISE':
        return {
          bg: '#FEF3C7',
          border: '#FBBF24',
          text: '#B45309',
          icon: '⏳',
        };
      case 'ENVIADA':
        return {
          bg: '#E0F2FE',
          border: '#38BDF8',
          text: '#0369A1',
          icon: '📨',
        };
      case 'CANCELADA':
        return {
          bg: '#FEE2E2',
          border: '#F87171',
          text: '#B91C1C',
          icon: '✕',
        };
      default:
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#334155',
          icon: '📌',
        };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* CABEÇALHO PADRÃO ACESSÍVEL */}
      <AccessibleHeader
        title={isEmpresa ? 'Candidaturas Recebidas' : 'Minhas Candidaturas'}
        showBack={true}
        onBack={() => goBack('HOME')}
        audioSummary={
          isEmpresa
            ? `Painel da Empresa. Gerencie as candidaturas recebidas de profissionais com deficiência para suas vagas na ${empresaPerfil?.nome_fantasia || 'sua organização'}.`
            : 'Minhas Candidaturas. Visualize e gerencie o status de todos os seus processos seletivos inclusivos em andamento.'
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER INFORMATIVO */}
        <View style={[styles.infoBanner, { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder }]}>
          <Text style={styles.infoBannerEmoji}>📢</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoBannerTitle, { color: colors.primaryDark }]}>
              Acompanhamento Inclusivo em Tempo Real
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              As empresas notificam você a cada etapa. Seus laudos e preferências de acessibilidade estão vinculados às candidaturas.
            </Text>
          </View>
        </View>

        {/* FILTROS POR STATUS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFiltersTrack}
        >
          {STATUS_FILTERS.map((filtro) => {
            const isSelected = selectedStatusFilter === filtro.id;
            return (
              <TouchableOpacity
                key={filtro.id}
                onPress={() => setSelectedStatusFilter(filtro.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar candidaturas ${filtro.label}`}
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primaryDark : colors.surfaceSoft,
                    borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LISTAGEM DAS CANDIDATURAS */}
        {candidaturasFiltradas.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceSoft }]}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: 10 }]}>
              Nenhuma candidatura encontrada
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 16 },
              ]}
            >
              Você ainda não possui candidaturas com este filtro. Explore as vagas abertas preparadas para você!
            </Text>
            <TouchableOpacity
              onPress={() => navigate('EMPREGO')}
              style={[styles.emptyActionBtn, { backgroundColor: colors.primaryDark }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Explorar vagas abertas no Equalis"
            >
              <Text style={styles.emptyActionBtnText}>Explorar Vagas Abertas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          candidaturasFiltradas.map((item) => {
            const statusConfig = getStatusColorConfig(item.status_processo);
            const isCancelada = item.status_processo === 'CANCELADA';

            return (
              <View
                key={item.id}
                accessible={true}
                accessibilityLabel={`Candidatura para ${item.vaga.titulo} na ${item.vaga.empresa_nome}. Status: ${item.status_processo}.`}
                style={[
                  styles.applicationCard,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: colors.cardBorder,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                {/* Linha Superior: Nome da Empresa + Badge de Status */}
                <View style={styles.cardTopRow}>
                  <View style={styles.companyLeftCol}>
                    <Text
                      style={[
                        typography.caption,
                        styles.companyName,
                        { color: colors.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.vaga.empresa_nome}
                    </Text>
                    <Text
                      accessibilityRole="header"
                      style={[
                        typography.titleMedium,
                        styles.vagaTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.vaga.titulo}
                    </Text>
                  </View>

                  {/* Badge de Status Semântica */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusConfig.bg,
                        borderColor: statusConfig.border,
                      },
                    ]}
                  >
                    <Text style={styles.statusBadgeIcon}>{statusConfig.icon}</Text>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusConfig.text },
                      ]}
                    >
                      {item.status_processo}
                    </Text>
                  </View>
                </View>

                {/* Linha de Metadados: Localidade, Modalidade e Data */}
                <View style={styles.cardMetaRow}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    📍 {item.vaga.cidade} • 💼 {item.vaga.modalidade}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Data: {item.created_at || 'Recente'}
                  </Text>
                </View>

                {/* Recursos de Acessibilidade da Vaga */}
                <View style={styles.resourcesRow}>
                  {(item.vaga.recursos_acessibilidade || []).slice(0, 2).map((rec, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.resourcePill,
                        { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder },
                      ]}
                    >
                      <Text
                        style={[typography.caption, { color: colors.primaryDark, fontSize: 11 }]}
                        numberOfLines={1}
                      >
                        ♿ {rec}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Linha de Ações: Empresa vs Candidato */}
                {isEmpresa ? (
                  <View style={styles.empresaActionsContainer}>
                    <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 8 }]}>
                      Candidato inscrito:{' '}
                      <Text style={{ fontWeight: '700', color: colors.primaryDark }}>
                        {item.candidato?.nome || 'Candidato PcD'}
                      </Text>{' '}
                      • Laudo CID Homologado (Lei nº 8.213/91)
                    </Text>
                    <View style={styles.empresaBtnRow}>
                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'ENTREVISTA AGENDADA');
                          speak(`Entrevista agendada com o candidato ${nome}!`);
                        }}
                        style={[styles.empresaActionBtn, { backgroundColor: '#8B5CF6' }]}
                      >
                        <Text style={styles.empresaBtnText}>📅 Agendar Entrevista</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'APROVADA');
                          speak(`Candidatura de ${nome} aprovada com sucesso!`);
                        }}
                        style={[styles.empresaActionBtn, { backgroundColor: '#10B981' }]}
                      >
                        <Text style={styles.empresaBtnText}>✅ Aprovar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'CANCELADA');
                          speak(`Candidatura de ${nome} recusada.`);
                        }}
                        style={[styles.empresaActionBtn, { backgroundColor: colors.danger }]}
                      >
                        <Text style={styles.empresaBtnText}>✕ Recusar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      onPress={() => handleOuvirStatusIndividual(item)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Ouvir status da candidatura para ${item.vaga.titulo}`}
                      style={[styles.audioIndividualBtn, { borderColor: colors.primaryDark }]}
                    >
                      <Text style={styles.audioIndividualText}>🔊 Ouvir</Text>
                    </TouchableOpacity>

                    <View style={styles.actionsRightSide}>
                      {!isCancelada ? (
                        <TouchableOpacity
                          onPress={() =>
                            setCancelModal({
                              visible: true,
                              vagaId: item.vaga_id,
                              vagaTitulo: item.vaga.titulo,
                            })
                          }
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Cancelar candidatura para ${item.vaga.titulo}`}
                          style={styles.cancelarLinkBtn}
                        >
                          <Text style={[styles.cancelarLinkText, { color: colors.danger }]}>
                            Cancelar
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        onPress={() => handleVerVaga(item.vaga_id)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver detalhes da vaga ${item.vaga.titulo}`}
                        style={[styles.verVagaBtn, { backgroundColor: colors.primaryDark }]}
                      >
                        <Text style={styles.verVagaBtnText}>Ver Vaga</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
      <Modal
        visible={cancelModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModal({ visible: false, vagaId: null, vagaTitulo: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: '#FFFFFF', borderRadius: radius.lg }]}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={[typography.titleMedium, { color: colors.textPrimary, textAlign: 'center' }]}>
              Cancelar Candidatura?
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginVertical: 12 },
              ]}
            >
              Tem certeza que deseja cancelar sua candidatura para "{cancelModal.vagaTitulo}"? A empresa será notificada do cancelamento.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setCancelModal({ visible: false, vagaId: null, vagaTitulo: '' })}
                style={[styles.modalBtnCancel, { borderColor: colors.cardBorder }]}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Manter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmarCancelamento}
                style={[styles.modalBtnDanger, { backgroundColor: colors.danger }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Sim, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RODAPÉ TAB BAR INTEGRADO */}
      <BottomTabBar activeTab="NOTIFICACOES" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empresaActionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  empresaBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  empresaActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backCircleArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 24,
    marginTop: Platform.OS === 'android' ? -2 : 0,
    marginLeft: Platform.OS === 'android' ? -1 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  voiceSummaryBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  voiceSummaryIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  infoBannerEmoji: {
    fontSize: 24,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusFiltersTrack: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyActionBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  applicationCard: {
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  companyLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  companyName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  vagaTitle: {
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeIcon: {
    fontSize: 11,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  resourcePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
    paddingTop: 12,
  },
  audioIndividualBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  audioIndividualText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelarLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  cancelarLinkText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  verVagaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verVagaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalBtnCancel: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnDanger: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
