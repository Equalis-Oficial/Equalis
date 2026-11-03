import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function PerfilCandidatoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    vagas,
    candidaturas,
    formacoes,
    experiencias,
    publicacoes,
    navigate,
    goBack,
    userType,
    setSelectedVagaId,
    excluirExperiencia,
    excluirFormacao,
    excluirVaga,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [contactModalVisible, setContactModalVisible] = useState(false);

  const isEmpresa = userType === 'EMPRESA';

  const handleDeleteExperiencia = (exp) => {
    Alert.alert(
      'Excluir Experiência',
      `Deseja realmente remover o cargo "${exp.cargo}" de seu perfil?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirExperiencia(exp.id);
            speak('Experiência removida com sucesso.');
          },
        },
      ]
    );
  };

  const handleDeleteFormacao = (form) => {
    Alert.alert(
      'Excluir Formação',
      `Deseja realmente remover a formação "${form.diploma} em ${form.instituicao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirFormacao(form.id);
            speak('Formação acadêmica removida com sucesso.');
          },
        },
      ]
    );
  };

  const handleEncerrarVaga = (vaga) => {
    Alert.alert(
      'Encerrar Vaga',
      `Deseja encerrar e remover a vaga "${vaga.titulo}" do mural público?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar Vaga',
          style: 'destructive',
          onPress: async () => {
            await excluirVaga(vaga.id);
            speak('Vaga encerrada com sucesso.');
          },
        },
      ]
    );
  };

  const vagasDaEmpresa = (vagas || []).filter((v) => {
    if (empresaPerfil?.id) {
      return v.empresa_id === empresaPerfil.id;
    }
    if (empresaPerfil?.nome_fantasia) {
      return v.empresa_nome === empresaPerfil.nome_fantasia;
    }
    return false;
  });

  const candidaturasDaEmpresa = (candidaturas || []).filter((c) =>
    vagasDaEmpresa.some((v) => v.id === c.vaga_id)
  );

  const audioSummary = isEmpresa
    ? `Perfil Institucional de ${empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}. CNPJ: ${empresaPerfil?.cnpj || 'Não informado'}. A instituição possui ${vagasDaEmpresa.length} vagas ativas cadastradas e está comprometida com a inclusão de profissionais PcD.`
    : `Perfil de ${candidatoPerfil.nome || 'Candidato'}, atuando na área de ${candidatoPerfil.area_atuacao || 'Geral'}${candidatoPerfil.cidade ? ` em ${candidatoPerfil.cidade}, ${candidatoPerfil.estado}` : ''}. Possui ${candidatoPerfil.conexoesCount || 0} conexões. Veja abaixo suas formações acadêmicas, experiências profissionais e publicações.`;

  const postsDoUsuario = (publicacoes || []).filter((p) =>
    isEmpresa
      ? p.autor_tipo === 'EMPRESA' && ((Boolean(empresaPerfil?.id) && p.autor_id === empresaPerfil.id) || (Boolean(empresaPerfil?.nome_fantasia) && p.autor_nome === empresaPerfil.nome_fantasia))
      : p.autor_tipo === 'CANDIDATO' && ((Boolean(candidatoPerfil?.id) && p.autor_id === candidatoPerfil.id) || (Boolean(candidatoPerfil?.nome) && p.autor_nome === candidatoPerfil.nome))
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title={isEmpresa ? 'Perfil da Empresa' : 'Perfil do Candidato'}
        showBack={true}
        onBack={() => goBack('HOME')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={
          isEmpresa ? `Perfil institucional de ${empresaPerfil?.nome_fantasia || 'Empresa'}` : 'Perfil completo do candidato'
        }
      >
        {isEmpresa ? (
          /* =================== VISÃO EMPRESA =================== */
          <View>
            <View style={styles.empresaBannerWrap}>
              <Image
                source={FIGMA_ASSETS.logoUniceplacBranca}
                style={{ width: 140, height: 44 }}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel={empresaPerfil?.nome_fantasia ? `Logo de ${empresaPerfil.nome_fantasia}` : 'Logo da Empresa'}
              />
              <TouchableOpacity
                onPress={() => navigate('CONFIGURACOES_PERFIL')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Configurações da empresa"
                style={styles.settingsIconBtn}
              >
                <Text style={styles.settingsIconText}>⚙️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeaderBox}>
              <View
                style={[
                  styles.avatarContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: colors.primaryDark,
                  },
                ]}
              >
                <Image
                  source={FIGMA_ASSETS.logoUniceplacQuadrada}
                  style={styles.empresaLogoImg}
                  resizeMode="cover"
                  accessible={true}
                  accessibilityLabel={empresaPerfil?.nome_fantasia ? `Brasão de ${empresaPerfil.nome_fantasia}` : 'Brasão da Empresa'}
                />
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.success, borderColor: colors.background },
                  ]}
                  accessible={true}
                  accessibilityLabel="Empresa Verificada"
                />
              </View>

              <Text
                style={[
                  typography.titleLarge,
                  {
                    color: colors.textPrimary,
                    fontWeight: '800',
                    marginTop: 8,
                    fontSize: isAccessibleMode ? 26 : 22,
                  },
                ]}
                accessibilityRole="header"
              >
                {empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}
              </Text>

              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.primaryDark, marginTop: 4, fontWeight: '700' },
                ]}
              >
                Empregador Inclusivo PcD
              </Text>

              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textMuted, marginTop: 4 },
                ]}
              >
                {empresaPerfil?.cidade ? `${empresaPerfil.cidade}, ${empresaPerfil.estado || 'DF'} • ` : ''}CNPJ: {empresaPerfil?.cnpj || 'Não informado'}
              </Text>

              <View
                style={[
                  styles.disponivelPill,
                  { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🛡️</Text>
                <Text
                  style={[
                    typography.caption,
                    { color: '#15803D', fontWeight: '800', flex: 1 },
                  ]}
                >
                  Conformidade Lei nº 8.213/91 (Cotas PcD Ativas)
                </Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  onPress={() => navigate('PUBLICAR_VAGA_EMPRESA')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cadastrar e publicar nova vaga inclusiva"
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.primaryDark, flex: 1 },
                  ]}
                >
                  <Text style={[typography.labelLarge, { color: '#FFFFFF', fontWeight: '700' }]}>
                    + Publicar Nova Vaga
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigate('MINHAS_CANDIDATURAS')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Visualizar inscrições e laudos de candidatos recebidos"
                  style={[
                    styles.outlineBtn,
                    { borderColor: colors.primaryDark, backgroundColor: '#FFFFFF', flex: 1 },
                  ]}
                >
                  <Text style={[typography.labelLarge, { color: colors.primaryDark, fontWeight: '700' }]}>
                    📋 Inscrições ({candidaturasDaEmpresa.length})
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.empresaMetricsRow}>
                <View style={[styles.metricCard, { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder }]}>
                  <Text style={[typography.titleLarge, { color: colors.primaryDark, fontWeight: '800' }]}>
                    {vagasDaEmpresa.length}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                    Vagas Ativas
                  </Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: '#F3E8FF', borderColor: '#C084FC' }]}>
                  <Text style={[typography.titleLarge, { color: '#6B21A8', fontWeight: '800' }]}>
                    {candidaturasDaEmpresa.length}
                  </Text>
                  <Text style={[typography.caption, { color: '#6B21A8', textAlign: 'center' }]}>
                    Candidatos PcD
                  </Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' }]}>
                  <Text style={[typography.titleLarge, { color: '#15803D', fontWeight: '800' }]}>
                    100%
                  </Text>
                  <Text style={[typography.caption, { color: '#15803D', textAlign: 'center' }]}>
                    Laudos CID Ok
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            <View style={styles.sectionContainer}>
              <Text
                style={[
                  typography.titleMedium,
                  { color: colors.textPrimary, fontWeight: '700', marginBottom: 8 },
                ]}
                accessibilityRole="header"
              >
                Sobre {empresaPerfil?.nome_fantasia || 'a Organização'}
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, lineHeight: 22 },
                ]}
              >
                {empresaPerfil?.descricao ||
                  'Empresa inclusiva comprometida com a acessibilidade e a contratação afirmativa de profissionais PcD sob a Lei nº 8.213/91.'}
              </Text>

              <View style={{ marginTop: 14, gap: 8 }}>
                <View style={styles.empresaA11yResource}>
                  <Text style={{ fontSize: 16 }}>♿</Text>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                    Rampas, banheiros acessíveis e elevadores em todos os blocos
                  </Text>
                </View>
                <View style={styles.empresaA11yResource}>
                  <Text style={{ fontSize: 16 }}>🤟</Text>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                    Intérprete de Libras no campus e suporte ao colaborador
                  </Text>
                </View>
                <View style={styles.empresaA11yResource}>
                  <Text style={{ fontSize: 16 }}>💻</Text>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                    Mobiliário regulável, piso tátil e tecnologias assistivas
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    typography.titleMedium,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                  accessibilityRole="header"
                >
                  Oportunidades Cadastradas ({vagasDaEmpresa.length})
                </Text>
                <TouchableOpacity
                  onPress={() => navigate('PUBLICAR_VAGA_EMPRESA')}
                  accessible={true}
                  accessibilityRole="button"
                >
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                    + Nova Vaga
                  </Text>
                </TouchableOpacity>
              </View>

              {vagasDaEmpresa.length === 0 ? (
                <View
                  style={[
                    styles.emptyStateCard,
                    {
                      backgroundColor: colors.surfaceSoft,
                      borderColor: colors.cardBorder,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text style={styles.emptyStateEmoji}>💼</Text>
                  <Text
                    style={[
                      typography.labelLarge,
                      { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                    ]}
                  >
                    Nenhuma vaga cadastrada
                  </Text>
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginTop: 4,
                        marginBottom: 12,
                        lineHeight: 20,
                      },
                    ]}
                  >
                    Cadastre sua primeira oportunidade inclusiva para divulgar aos profissionais PcD e receber candidaturas com laudo.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigate('PUBLICAR_VAGA_EMPRESA')}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Publicar primeira vaga inclusiva"
                    style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
                  >
                    <Text style={styles.emptyStateBtnText}>+ Publicar Nova Vaga</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                vagasDaEmpresa.map((v) => (
                <View
                  key={v.id}
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.cardItemHeader}>
                    <Text style={styles.cardItemIcon}>💼</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          typography.labelLarge,
                          { color: colors.textPrimary, fontWeight: '800' },
                        ]}
                      >
                        {v.titulo}
                      </Text>
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: colors.primaryDark, fontWeight: '600', marginTop: 2 },
                        ]}
                      >
                        {v.modalidade} • {v.cidade} - {v.estado}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.success, fontWeight: '700', marginTop: 2 },
                        ]}
                      >
                        R$ {typeof v.salario === 'number' ? v.salario.toLocaleString('pt-BR') : v.salario} • {v.carga_horaria}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedVagaId(v.id);
                        navigate('DETALHES_VAGA', { vagaId: v.id });
                      }}
                      style={[
                        styles.empresaMiniBtn,
                        { backgroundColor: colors.primaryDark },
                      ]}
                    >
                      <Text style={styles.empresaMiniBtnText}>Ver Vaga</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigate('MINHAS_CANDIDATURAS')}
                      style={[
                        styles.empresaMiniBtn,
                        { backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.primaryDark },
                      ]}
                    >
                      <Text style={[styles.empresaMiniBtnText, { color: colors.primaryDark }]}>
                        Ver Candidatos
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleEncerrarVaga(v)}
                      style={[
                        styles.empresaMiniBtn,
                        { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: colors.danger },
                      ]}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Encerrar e excluir vaga de ${v.titulo}`}
                    >
                      <Text style={[styles.empresaMiniBtnText, { color: colors.danger }]}>
                        🗑️ Encerrar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )))}
            </View>
          </View>
        ) : (
          /* =================== VISÃO CANDIDATO (MARIA LEDENTSOVA) =================== */
          <View>
            {/* Banner Oficial de Arcos Coloridos do Figma (#126:4101 e 17_PERFIL_CANDIDATO.png) */}
            <View style={styles.bannerWrapper}>
          <Image
            source={FIGMA_ASSETS.bannerPerfilArcos}
            style={styles.bannerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Banner ilustrativo de arcos do perfil"
          />
          <TouchableOpacity
            onPress={() => navigate('CONFIGURACOES_PERFIL')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Configurações do perfil"
            style={styles.settingsIconBtn}
          >
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Informações Principais do Candidato */}
        <View style={styles.profileHeaderBox}>
          {/* Avatar Oficial do Figma (Panda / Raposa da Maria Ledentsova) */}
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.primary,
              },
            ]}
          >
            <Image
              source={FIGMA_ASSETS.avatarPandaRaposa}
              style={styles.avatarImg}
              accessible={true}
              accessibilityLabel={`Foto de perfil de ${candidatoPerfil.nome}`}
            />
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.success, borderColor: colors.background },
              ]}
              accessible={true}
              accessibilityLabel="Status: Perfil Ativo para Contratação"
            />
          </View>

          {/* Nome e Cargo */}
          <Text
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                marginTop: 8,
                fontSize: isAccessibleMode ? 26 : 22,
              },
            ]}
            accessibilityRole="header"
          >
            {candidatoPerfil.nome || 'Meu Perfil'}
          </Text>

          <Text
            style={[
              typography.labelLarge,
              { color: colors.primaryDark, marginTop: 4, fontWeight: '600' },
            ]}
          >
            {candidatoPerfil.area_atuacao || 'Profissional PcD'}
          </Text>

          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textMuted, marginTop: 4 },
            ]}
          >
            {[candidatoPerfil.cidade, candidatoPerfil.estado, candidatoPerfil.pais].filter(Boolean).join(', ') || 'Brasil'}
          </Text>

          {/* Link Informações de Contato e Conexões */}
          <View style={styles.contactAndConnectionsRow}>
            <TouchableOpacity
              onPress={() => setContactModalVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Abrir informações de contato do candidato"
            >
              <Text
                style={[
                  typography.caption,
                  { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
                ]}
              >
                Informações de contato
              </Text>
            </TouchableOpacity>

            <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 8 }]}>
              •
            </Text>

            <TouchableOpacity
              onPress={() => navigate('REDE')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Ver conexões. ${candidatoPerfil.conexoesCount || 0} conexões`}
            >
              <Text
                style={[
                  typography.caption,
                  { color: colors.primaryDark, fontWeight: '700' },
                ]}
              >
                {candidatoPerfil.conexoesCount || 0} conexões
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pílula "Disponível Para" */}
          <View
            style={[
              styles.disponivelPill,
              { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
            ]}
            accessible={true}
            accessibilityLabel={`Disponível para: ${candidatoPerfil.disponivelPara || 'Oportunidades Inclusivas'}`}
          >
            <Text style={styles.disponivelIcon}>✨</Text>
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700', flex: 1 },
              ]}
            >
              Disponível para: {candidatoPerfil.disponivelPara || 'Oportunidades Inclusivas'}
            </Text>
          </View>

          {/* Botões de Ação do Perfil: "Adicionar Seção" e "Editar Perfil" */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => navigate('ADICIONAR_SECAO')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar nova seção ao perfil"
              style={[
                styles.outlineBtn,
                { borderColor: colors.primaryDark, backgroundColor: '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.primaryDark, fontWeight: '700' },
                ]}
              >
                + Adicionar Seção
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate('EDITAR_PERFIL')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Editar dados do perfil"
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primaryDark },
              ]}
            >
              <Text
                style={[
                  typography.labelLarge,
                  { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                Editar Perfil
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

        {/* SEÇÃO SOBRE (R4) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Sobre
            </Text>
            <TouchableOpacity
              onPress={() => navigate('SECAO_SOBRE')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={candidatoPerfil.resumo_profissional ? "Editar seção sobre" : "Adicionar resumo sobre você"}
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                {candidatoPerfil.resumo_profissional ? 'Editar ✏️' : '+ Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>

          {candidatoPerfil.resumo_profissional && candidatoPerfil.resumo_profissional.trim() ? (
            <>
              <Text
                style={[
                  typography.bodyLarge,
                  { color: colors.textSecondary, marginTop: 8, lineHeight: 22 },
                ]}
              >
                {candidatoPerfil.resumo_profissional}
              </Text>

              {/* Competências em destaque */}
              {candidatoPerfil.competencias && candidatoPerfil.competencias.length > 0 ? (
                <View style={styles.chipsWrap}>
                  {candidatoPerfil.competencias.map((comp, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.skillChip,
                        { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.primaryDark, fontWeight: '600' },
                        ]}
                      >
                        ✓ {comp}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={styles.emptyStateEmoji}>✍️</Text>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                Apresente-se aos recrutadores
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4,
                    marginBottom: 12,
                    lineHeight: 20,
                  },
                ]}
              >
                Escreva um breve resumo sobre suas habilidades, trajetória e necessidades de acessibilidade no ambiente de trabalho.
              </Text>
              <TouchableOpacity
                onPress={() => navigate('SECAO_SOBRE')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Adicionar resumo profissional"
                style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.emptyStateBtnText}>+ Escrever Resumo Profissional</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

        {/* SEÇÃO SERVIÇOS (Apenas exibido se houver serviços cadastrados) */}
        {candidatoPerfil.servicos && candidatoPerfil.servicos.length > 0 ? (
          <>
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  typography.titleMedium,
                  { color: colors.textPrimary, fontWeight: '700', marginBottom: 8 },
                ]}
                accessibilityRole="header"
              >
                Serviços Prestados
              </Text>

              <View style={styles.chipsWrap}>
                {candidatoPerfil.servicos.map((serv, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.servicoBadge,
                      { backgroundColor: '#F0F7FF', borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text style={styles.servicoBadgeIcon}>💼</Text>
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.textPrimary, fontWeight: '500' },
                      ]}
                    >
                      {serv}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />
          </>
        ) : null}

        {/* SEÇÃO EXPERIÊNCIAS / CARGO */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Experiências Profissionais
            </Text>
            <TouchableOpacity
              onPress={() => navigate('ADICIONAR_CARGO')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar nova experiência profissional"
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                + Adicionar cargo
              </Text>
            </TouchableOpacity>
          </View>

          {experiencias.length === 0 ? (
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={styles.emptyStateEmoji}>💼</Text>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                Nenhuma experiência adicionada
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4,
                    marginBottom: 12,
                    lineHeight: 20,
                  },
                ]}
              >
                Adicione suas experiências anteriores, estágios ou trabalhos voluntários para destacar sua trajetória profissional.
              </Text>
              <TouchableOpacity
                onPress={() => navigate('ADICIONAR_CARGO')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Adicionar primeiro cargo ou experiência profissional"
                style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.emptyStateBtnText}>+ Adicionar Experiência</Text>
              </TouchableOpacity>
            </View>
          ) : (
            experiencias.map((exp) => (
              <View
                key={exp.id}
                style={[
                  styles.cardItem,
                  { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.cardItemHeader}>
                  <Text style={styles.cardItemIcon}>🏢</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.labelLarge,
                        { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {exp.cargo}
                    </Text>
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.primaryDark, fontWeight: '600' },
                      ]}
                    >
                      {exp.organizacao} • {exp.tipo_emprego || 'Meio período'}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textMuted, marginTop: 2 },
                      ]}
                    >
                      Início em {exp.mes_inicio || 'Março'}/{exp.ano_inicio || '2024'} •{' '}
                      {exp.tipo_localidade || 'Híbrido'}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textMuted, marginTop: 1 },
                      ]}
                    >
                      {exp.localidade}
                    </Text>
                  </View>
                </View>

                {exp.descricao ? (
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.textSecondary, marginTop: 8 },
                    ]}
                  >
                    {exp.descricao}
                  </Text>
                ) : null}

                {exp.competencias && exp.competencias.length > 0 ? (
                  <View style={[styles.chipsWrap, { marginTop: 6 }]}>
                    {exp.competencias.map((c, i) => (
                      <View
                        key={i}
                        style={[
                          styles.skillChip,
                          { backgroundColor: colors.background, borderColor: colors.cardBorder },
                        ]}
                      >
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          {c}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.cardItemActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleDeleteExperiencia(exp)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir experiência de ${exp.cargo} na ${exp.organizacao}`}
                    style={styles.cardActionDeleteBtn}
                  >
                    <Text style={styles.cardActionDeleteBtnText}>🗑️ Excluir cargo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

        {/* SEÇÃO FORMAÇÃO ACADÊMICA */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Formação Acadêmica
            </Text>
            <TouchableOpacity
              onPress={() => navigate('ADICIONAR_FORMACAO')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar nova formação acadêmica"
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                + Adicionar formação
              </Text>
            </TouchableOpacity>
          </View>

          {formacoes.length === 0 ? (
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={styles.emptyStateEmoji}>🎓</Text>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                Nenhuma formação cadastrada
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4,
                    marginBottom: 12,
                    lineHeight: 20,
                  },
                ]}
              >
                Inclua suas graduações, cursos técnicos, profissionalizantes ou certificações para enriquecer seu currículo no Equalis.
              </Text>
              <TouchableOpacity
                onPress={() => navigate('ADICIONAR_FORMACAO')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Adicionar primeira formação acadêmica"
                style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.emptyStateBtnText}>+ Adicionar Formação</Text>
              </TouchableOpacity>
            </View>
          ) : (
            formacoes.map((form) => (
              <View
                key={form.id}
                style={[
                  styles.cardItem,
                  { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.cardItemHeader}>
                  <Text style={styles.cardItemIcon}>🎓</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.labelLarge,
                        { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {form.instituicao}
                    </Text>
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.primaryDark, fontWeight: '600' },
                      ]}
                    >
                      {form.diploma} - {form.area_estudo}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textMuted, marginTop: 2 },
                      ]}
                    >
                      {form.mes_inicio}/{form.ano_inicio} - {form.mes_termino}/{form.ano_termino}
                    </Text>
                  </View>
                </View>

                {form.atividades_grupos ? (
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.textSecondary, marginTop: 8 },
                    ]}
                  >
                    Atividades: {form.atividades_grupos}
                  </Text>
                ) : null}

                {form.descricao ? (
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.textMuted, marginTop: 4 },
                    ]}
                  >
                    {form.descricao}
                  </Text>
                ) : null}

                <View style={styles.cardItemActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleDeleteFormacao(form)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir formação acadêmica de ${form.diploma} em ${form.instituicao}`}
                    style={styles.cardActionDeleteBtn}
                  >
                    <Text style={styles.cardActionDeleteBtnText}>🗑️ Excluir formação</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

        {/* SEÇÃO PUBLICAÇÕES DO USUÁRIO */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Publicações ({postsDoUsuario.length})
            </Text>
            <TouchableOpacity
              onPress={() => navigate('VER_PUBLICACOES')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver ou editar todas as minhas publicações"
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                Ver/Editar publicações →
              </Text>
            </TouchableOpacity>
          </View>

          {postsDoUsuario.length === 0 ? (
            <View
              style={[
                styles.emptyStateCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={styles.emptyStateEmoji}>📢</Text>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                Nenhuma publicação ainda
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4,
                    marginBottom: 12,
                    lineHeight: 20,
                  },
                ]}
              >
                Compartilhe suas ideias, atualizações profissionais ou projetos com sua rede no Equalis.
              </Text>
              <TouchableOpacity
                onPress={() => navigate('CRIAR_PUBLICACAO')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Criar primeira publicação"
                style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.emptyStateBtnText}>+ Criar Publicação</Text>
              </TouchableOpacity>
            </View>
          ) : (
            postsDoUsuario.map((post) => (
              <View
                key={post.id}
                style={[
                  styles.userPostPreview,
                  { backgroundColor: colors.background, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.postAuthorMiniRow}>
                  <Image
                    source={FIGMA_ASSETS.avatarPandaRaposa}
                    style={styles.postAvatarMini}
                    accessible={true}
                    accessibilityLabel={`Foto de perfil de ${post.autor_nome || 'Usuário'}`}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[typography.labelLarge, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {post.autor_nome}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {post.autor_subtitulo || 'Equalis'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    typography.bodyLarge,
                    { color: colors.textPrimary, lineHeight: 22, marginTop: 8 },
                  ]}
                >
                  {post.conteudo}
                </Text>
                <View style={styles.userPostMetrics}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    ❤️ {post.curtidas || 0} curtidas • 💬 {post.comentarios || 0} comentários
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    )}

        {/* Espaço inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE INFORMAÇÕES DE CONTATO */}
      <Modal
        visible={contactModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.contactModalCard,
              { backgroundColor: colors.background, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700', marginBottom: 16 },
              ]}
              accessibilityRole="header"
            >
              Informações de Contato
            </Text>

            <View style={styles.contactItemRow}>
              <Text style={styles.contactIcon}>📧</Text>
              <View>
                <Text style={[typography.caption, { color: colors.textMuted }]}>E-mail</Text>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {candidatoPerfil.email}
                </Text>
              </View>
            </View>

            <View style={styles.contactItemRow}>
              <Text style={styles.contactIcon}>📍</Text>
              <View>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Localização</Text>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {candidatoPerfil.cidade
                    ? `${candidatoPerfil.cidade}, ${candidatoPerfil.estado || 'DF'} - ${candidatoPerfil.pais || 'Brasil'}`
                    : 'Não informado'}
                </Text>
              </View>
            </View>

            <View style={styles.contactItemRow}>
              <Text style={styles.contactIcon}>📄</Text>
              <View>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Currículo Anexo</Text>
                <Text style={[typography.bodyLarge, { color: colors.primaryDark, fontWeight: '600' }]}>
                  {candidatoPerfil.url_curriculo || 'Nenhum currículo anexado'}
                </Text>
              </View>
            </View>

            <View style={styles.contactItemRow}>
              <Text style={styles.contactIcon}>♿</Text>
              <View>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Laudo Médico PcD</Text>
                <Text style={[typography.bodyLarge, { color: colors.success, fontWeight: '600' }]}>
                  {candidatoPerfil.url_laudo_medico ? 'Laudo Verificado ✓' : 'Pendente'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setContactModalVisible(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de informações de contato"
              style={[
                styles.modalCloseBtn,
                { backgroundColor: colors.primaryDark, marginTop: 16 },
              ]}
            >
              <Text style={styles.modalCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegação Inferior */}
      <BottomTabBar activeTab={isEmpresa ? 'PERFIL' : 'HOME'} />
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
  bannerWrapper: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 110,
  },
  settingsIconBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconText: {
    fontSize: 18,
  },
  profileHeaderBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginTop: -38,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  contactAndConnectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  disponivelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  disponivelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionDivider: {
    height: 8,
    marginVertical: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  servicoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  servicoBadgeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardItemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  userPostPreview: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  postAuthorMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userPostMetrics: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contactModalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    elevation: 5,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  contactIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  modalCloseBtn: {
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  empresaBannerWrap: {
    width: '100%',
    height: 120,
    backgroundColor: '#067451',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  empresaLogoImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  empresaMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaA11yResource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  empresaMiniBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaMiniBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyStateCard: {
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyStateEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyStateBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cardItemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cardActionDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cardActionDeleteBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
});
