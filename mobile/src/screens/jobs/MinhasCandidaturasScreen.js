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
  Image,
} from 'react-native';
import { FIGMA_ICONS } from '../../theme/figmaAssets';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

const STATUS_FILTERS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'ATIVAS', label: 'Ativas' },
  { id: 'EM_ANALISE', label: 'Em Análise' },
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
  const [laudoModal, setLaudoModal] = useState({
    visible: false,
    candidatoNome: '',
    cid: '',
    deficiencia: '',
    laudoUrl: '',
    resumo: '',
  });

  // Lista enriquecida com os dados da vaga e do candidato PcD com laudo CID
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
      const candData = c.candidato || {
        id: c.candidato_id || 1,
        nome: c.candidato_nome || 'Maria Ledentsova',
        email: c.candidato_email || 'maria@equalis.com.br',
        cid: c.cid || 'H54.0',
        deficiencia_nome: c.deficiencia_nome || 'Deficiência Visual',
        laudo_medico_url: c.laudo_medico_url || 'laudo_cid_homologado.pdf',
        resumo_profissional:
          c.resumo_profissional ||
          'Profissional de Marketing Digital e Comunicação Acessível com foco em campanhas inclusivas, gestão de mídias sociais e atendimento humanizado.',
        url_curriculo: c.url_curriculo || 'curriculo_maria.pdf',
      };
      return {
        ...c,
        vaga: vagaCorrespondente,
        candidato: candData,
        cid: c.cid || candData.cid,
        deficiencia_nome: c.deficiencia_nome || candData.deficiencia_nome,
        laudo_medico_url: c.laudo_medico_url || candData.laudo_medico_url,
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
      if (selectedStatusFilter === 'EM_ANALISE') {
        return item.status_processo === 'EM ANÁLISE' || item.status_processo === 'ENVIADA';
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

  const handleConsultarLaudo = (item) => {
    const cand = item.candidato || {};
    const nome = cand.nome || item.candidato_nome || 'Maria Ledentsova';
    const cidCod = cand.cid || item.cid || 'H54.0';
    const def = cand.deficiencia_nome || item.deficiencia_nome || 'Deficiência Visual';
    const url = cand.laudo_medico_url || item.laudo_medico_url || 'laudo_cid_homologado.pdf';
    const resumo = cand.resumo_profissional || item.resumo_profissional || '';

    setLaudoModal({
      visible: true,
      candidatoNome: nome,
      cid: cidCod,
      deficiencia: def,
      laudoUrl: url,
      resumo: resumo,
    });
    speak(
      `Laudo médico pericial homologado da Lei de Cotas número 8.213/91 para o candidato ${nome}, código CID-10 ${cidCod}, deficiência ${def}.`
    );
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
          dot: '#16A34A',
        };
      case 'ENTREVISTA AGENDADA':
        return {
          bg: '#F3E8FF',
          border: '#C084FC',
          text: '#6B21A8',
          dot: '#9333EA',
        };
      case 'EM ANÁLISE':
        return {
          bg: '#FEF3C7',
          border: '#FBBF24',
          text: '#B45309',
          dot: '#D97706',
        };
      case 'ENVIADA':
        return {
          bg: '#E0F2FE',
          border: '#38BDF8',
          text: '#0369A1',
          dot: '#0284C7',
        };
      case 'CANCELADA':
        return {
          bg: '#FEE2E2',
          border: '#F87171',
          text: '#B91C1C',
          dot: '#DC2626',
        };
      default:
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#334155',
          dot: '#64748B',
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
          <Image
            source={FIGMA_ICONS.jobDocument}
            style={{ width: 22, height: 22, marginRight: 8 }}
            resizeMode="contain"
          />
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
            <Image
              source={FIGMA_ICONS.jobDocument}
              style={{ width: 44, height: 44, opacity: 0.6, marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: 4 }]}>
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
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: statusConfig.dot,
                        marginRight: 5,
                      }}
                    />
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
                <View style={[styles.cardMetaRow, { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }]}>
                  <Image
                    source={FIGMA_ICONS.location}
                    style={{ width: 12, height: 12 }}
                    resizeMode="contain"
                  />
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {item.vaga.cidade} • {item.vaga.modalidade}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 8 }]}>
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
                        {rec}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Linha de Ações: Empresa vs Candidato */}
                {isEmpresa ? (
                  <View style={styles.empresaActionsContainer}>
                    {/* Header do Candidato com Selo Oficial da Lei nº 8.213/91 */}
                    <View style={styles.candidatoHeaderRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[typography.titleSmall, { color: colors.textPrimary, fontWeight: '700' }]}>
                          {item.candidato?.nome || 'Candidato PcD'}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          {item.candidato?.email || 'contato@candidato.com.br'}
                        </Text>
                      </View>
                      <View style={[styles.seloCotaBadge, { backgroundColor: '#DCFCE7', borderColor: '#16A34A' }]}>
                        <Text style={[typography.caption, { color: '#15803D', fontWeight: '700', fontSize: 11 }]}>
                          Lei nº 8.213/91 (Laudo Homologado)
                        </Text>
                      </View>
                    </View>

                    {/* Dados Médicos com CID-10 e Categoria PcD */}
                    <View style={[styles.dadosMedicosBox, { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder }]}>
                      <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                        CID-10: <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>{item.candidato?.cid || item.cid || 'H54.0'}</Text>
                        {'   '}•{'   '}
                        Deficiência: <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>{item.candidato?.deficiencia_nome || item.deficiencia_nome || 'Deficiência Visual'}</Text>
                      </Text>

                      {item.candidato?.resumo_profissional ? (
                        <Text
                          style={[typography.caption, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]}
                          numberOfLines={2}
                        >
                          {item.candidato.resumo_profissional}
                        </Text>
                      ) : null}

                      {/* Botão para Consulta do Laudo Pericial Homologado */}
                      <TouchableOpacity
                        onPress={() => handleConsultarLaudo(item)}
                        style={[styles.consultarLaudoBtn, { borderColor: colors.primaryDark }]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Consultar laudo médico pericial de ${item.candidato?.nome || 'Candidato'}`}
                        accessibilityHint="Toque duas vezes para visualizar o laudo homologado para a cota de PcD"
                      >
                        <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '700' }]}>
                          Consultar Laudo Médico Homologado
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Máquina de Estados com os 4 Status Canônicos */}
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4, marginBottom: 6, fontWeight: '600' }]}>
                      Atualizar Status do Processo Seletivo:
                    </Text>
                    <View style={styles.empresaBtnRow}>
                      {/* 1. EM ANÁLISE */}
                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'EM ANÁLISE');
                          speak(`Candidatura de ${nome} colocada Em Análise.`);
                        }}
                        style={[
                          styles.empresaActionBtn,
                          {
                            backgroundColor: '#F59E0B',
                            borderWidth: item.status_processo === 'EM ANÁLISE' || item.status_processo === 'ENVIADA' ? 2 : 0,
                            borderColor: '#78350F',
                          },
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Colocar candidatura em análise"
                      >
                        <Text style={styles.empresaBtnText}>
                          Em Análise {item.status_processo === 'EM ANÁLISE' || item.status_processo === 'ENVIADA' ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>

                      {/* 2. ENTREVISTA AGENDADA */}
                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'ENTREVISTA AGENDADA');
                          speak(`Entrevista agendada com o candidato ${nome}!`);
                        }}
                        style={[
                          styles.empresaActionBtn,
                          {
                            backgroundColor: '#8B5CF6',
                            borderWidth: item.status_processo === 'ENTREVISTA AGENDADA' ? 2 : 0,
                            borderColor: '#4C1D95',
                          },
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Agendar entrevista com o candidato"
                      >
                        <Text style={styles.empresaBtnText}>
                          Entrevista {item.status_processo === 'ENTREVISTA AGENDADA' ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>

                      {/* 3. APROVADA */}
                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'APROVADA');
                          speak(`Candidatura de ${nome} aprovada com sucesso!`);
                        }}
                        style={[
                          styles.empresaActionBtn,
                          {
                            backgroundColor: '#10B981',
                            borderWidth: item.status_processo === 'APROVADA' ? 2 : 0,
                            borderColor: '#064E3B',
                          },
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Aprovar candidato no processo seletivo"
                      >
                        <Text style={styles.empresaBtnText}>
                          Aprovar {item.status_processo === 'APROVADA' ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>

                      {/* 4. CANCELADA */}
                      <TouchableOpacity
                        onPress={() => {
                          const nome = item.candidato?.nome || 'Candidato PcD';
                          atualizarStatusCandidatura(item.id, 'CANCELADA');
                          speak(`Candidatura de ${nome} cancelada.`);
                        }}
                        style={[
                          styles.empresaActionBtn,
                          {
                            backgroundColor: colors.danger || '#EF4444',
                            borderWidth: item.status_processo === 'CANCELADA' ? 2 : 0,
                            borderColor: '#7F1D1D',
                          },
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Recusar ou cancelar candidatura"
                      >
                        <Text style={styles.empresaBtnText}>
                          Cancelar {item.status_processo === 'CANCELADA' ? '✓' : ''}
                        </Text>
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
                      <Text style={styles.audioIndividualText}>Ouvir</Text>
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
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.danger }}>!</Text>
            </View>
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

      {/* MODAL DE CONSULTA DE LAUDO MÉDICO HOMOLOGADO (LEI Nº 8.213/91) */}
      <Modal
        visible={laudoModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setLaudoModal({ visible: false, candidatoNome: '', cid: '', deficiencia: '', laudoUrl: '', resumo: '' })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: '#FFFFFF', borderRadius: radius.lg, maxWidth: 380 }]}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#DCFCE7',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: 12,
              }}
            >
              <Image
                source={FIGMA_ICONS.jobDocument}
                style={{ width: 26, height: 26, tintColor: '#15803D' }}
                resizeMode="contain"
              />
            </View>
            <Text style={[typography.titleMedium, { color: colors.textPrimary, textAlign: 'center', fontWeight: '700' }]}>
              Laudo Médico Pericial Homologado
            </Text>
            <Text style={[typography.caption, { color: '#15803D', textAlign: 'center', fontWeight: '700', marginTop: 2, marginBottom: 12 }]}>
              Selo Oficial • Lei Federal nº 8.213/91 (Lei de Cotas)
            </Text>

            <View style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginBottom: 6 }]}>
                <Text style={{ fontWeight: '700' }}>Candidato:</Text> {laudoModal.candidatoNome}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginBottom: 6 }]}>
                <Text style={{ fontWeight: '700' }}>Código CID-10:</Text> {laudoModal.cid}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginBottom: 6 }]}>
                <Text style={{ fontWeight: '700' }}>Deficiência:</Text> {laudoModal.deficiencia}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginBottom: 6 }]}>
                <Text style={{ fontWeight: '700' }}>Documento Anexo:</Text> {laudoModal.laudoUrl}
              </Text>
              {laudoModal.resumo ? (
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
                  "{laudoModal.resumo}"
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() =>
                setLaudoModal({ visible: false, candidatoNome: '', cid: '', deficiencia: '', laudoUrl: '', resumo: '' })
              }
              style={[styles.modalBtnCancel, { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark, width: '100%' }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de laudo médico"
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>Fechar Consulta</Text>
            </TouchableOpacity>
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
  candidatoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  seloCotaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  dadosMedicosBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  consultarLaudoBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
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
