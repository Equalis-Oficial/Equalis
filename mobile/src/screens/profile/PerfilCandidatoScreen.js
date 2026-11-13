import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';
import PerfilCandidatoHeader from '../../components/profile/PerfilCandidatoHeader';
import PerfilEmpresaHeader from '../../components/profile/PerfilEmpresaHeader';
import PerfilSecaoSobre from '../../components/profile/PerfilSecaoSobre';
import PerfilSecaoExperiencias from '../../components/profile/PerfilSecaoExperiencias';
import PerfilSecaoFormacoes from '../../components/profile/PerfilSecaoFormacoes';
import PerfilSecaoVagasEmpresa from '../../components/profile/PerfilSecaoVagasEmpresa';
import PerfilSecaoPublicacoes from '../../components/profile/PerfilSecaoPublicacoes';
import ModalContatoCandidato from '../../components/profile/ModalContatoCandidato';

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
    : `Perfil de ${candidatoPerfil?.nome || 'Candidato'}, atuando na área de ${candidatoPerfil?.area_atuacao || 'Geral'}${candidatoPerfil?.cidade ? ` em ${candidatoPerfil.cidade}, ${candidatoPerfil?.estado || 'DF'}` : ''}. Possui ${candidatoPerfil?.conexoesCount || 0} conexões. Veja abaixo suas formações acadêmicas, experiências profissionais e publicações.`;

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
            <PerfilEmpresaHeader
              empresaPerfil={empresaPerfil}
              vagasCount={vagasDaEmpresa.length}
              candidaturasCount={candidaturasDaEmpresa.length}
              onOpenSettings={() => navigate('CONFIGURACOES_PERFIL')}
              onPublishVaga={() => navigate('PUBLICAR_VAGA_EMPRESA')}
              onViewCandidaturas={() => navigate('MINHAS_CANDIDATURAS')}
              isAccessibleMode={isAccessibleMode}
              colors={colors}
              typography={typography}
            />

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* SEÇÃO SOBRE DA EMPRESA */}
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

              {((empresaPerfil?.nome_fantasia || '').toUpperCase().includes('UNICEPLAC') || empresaPerfil?.id === 1) ? (
                <View style={{ marginTop: 14, gap: 8 }}>
                  <View style={styles.empresaA11yResource}>
                    <Image source={FIGMA_ASSETS.iconePcdAzul} style={{ width: 16, height: 16, marginRight: 8 }} resizeMode="contain" />
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                      Rampas, banheiros acessíveis e elevadores em todos os blocos
                    </Text>
                  </View>
                  <View style={styles.empresaA11yResource}>
                    <Image source={FIGMA_ASSETS.iconChatBubble} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                      Intérprete de Libras no campus e suporte ao colaborador
                    </Text>
                  </View>
                  <View style={styles.empresaA11yResource}>
                    <Image source={FIGMA_ASSETS.iconWork} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                      Mobiliário regulável, piso tátil e tecnologias assistivas
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 14, gap: 8 }}>
                  {empresaPerfil?.setor ? (
                    <View style={styles.empresaA11yResource}>
                      <Image source={FIGMA_ASSETS.iconWork} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                        Setor: {empresaPerfil.setor}
                      </Text>
                    </View>
                  ) : null}
                  {empresaPerfil?.localizacao ? (
                    <View style={styles.empresaA11yResource}>
                      <Image source={FIGMA_ASSETS.iconLocation} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                        Localização: {empresaPerfil.localizacao}
                      </Text>
                    </View>
                  ) : null}
                  {empresaPerfil?.site ? (
                    <View style={styles.empresaA11yResource}>
                      <Image source={FIGMA_ASSETS.iconJobDocument} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                        Site: {empresaPerfil.site}
                      </Text>
                    </View>
                  ) : null}
                  {empresaPerfil?.telefone ? (
                    <View style={styles.empresaA11yResource}>
                      <Image source={FIGMA_ASSETS.iconChatBubble} style={{ width: 16, height: 16, marginRight: 8, tintColor: colors.primary }} resizeMode="contain" />
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                        Contato: {empresaPerfil.telefone}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* OPORTUNIDADES DA EMPRESA */}
            <PerfilSecaoVagasEmpresa
              vagas={vagasDaEmpresa}
              onPublishVaga={() => navigate('PUBLICAR_VAGA_EMPRESA')}
              onViewVaga={(v) => {
                setSelectedVagaId(v.id);
                navigate('DETALHES_VAGA', { vagaId: v.id });
              }}
              onViewCandidatos={() => navigate('MINHAS_CANDIDATURAS')}
              onEncerrarVaga={handleEncerrarVaga}
              colors={colors}
              typography={typography}
              radius={radius}
            />
          </View>
        ) : (
          /* =================== VISÃO CANDIDATO =================== */
          <View>
            <PerfilCandidatoHeader
              candidatoPerfil={candidatoPerfil}
              onOpenSettings={() => navigate('CONFIGURACOES_PERFIL')}
              onOpenContactModal={() => setContactModalVisible(true)}
              onNavigateRede={() => navigate('REDE')}
              onAddSection={() => navigate('ADICIONAR_SECAO')}
              onEditProfile={() => navigate('EDITAR_PERFIL')}
              isAccessibleMode={isAccessibleMode}
              colors={colors}
              typography={typography}
            />

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* SEÇÃO SOBRE */}
            <PerfilSecaoSobre
              resumoProfissional={candidatoPerfil?.resumo_profissional || ''}
              competencias={candidatoPerfil?.competencias || []}
              onNavigateSobre={() => navigate('SECAO_SOBRE')}
              colors={colors}
              typography={typography}
              radius={radius}
            />

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* SEÇÃO SERVIÇOS (Se houver) */}
            {candidatoPerfil?.servicos && candidatoPerfil.servicos.length > 0 ? (
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
                    {(candidatoPerfil?.servicos || []).map((serv, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.servicoBadge,
                          { backgroundColor: '#F0F7FF', borderColor: colors.cardBorder },
                        ]}
                      >
                        <Text style={{ fontSize: 16, marginRight: 8 }}>💼</Text>
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

            {/* SEÇÃO EXPERIÊNCIAS */}
            <PerfilSecaoExperiencias
              experiencias={experiencias}
              onAddCargo={() => navigate('ADICIONAR_CARGO')}
              onDeleteExperiencia={handleDeleteExperiencia}
              colors={colors}
              typography={typography}
              radius={radius}
            />

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* SEÇÃO FORMAÇÃO ACADÊMICA */}
            <PerfilSecaoFormacoes
              formacoes={formacoes}
              onAddFormacao={() => navigate('ADICIONAR_FORMACAO')}
              onDeleteFormacao={handleDeleteFormacao}
              colors={colors}
              typography={typography}
              radius={radius}
            />

            <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

            {/* SEÇÃO PUBLICAÇÕES DO USUÁRIO */}
            <PerfilSecaoPublicacoes
              publicacoes={postsDoUsuario}
              onNavigateVerPublicacoes={() => navigate('VER_PUBLICACOES')}
              onNavigateCriarPublicacao={() => navigate('CRIAR_PUBLICACAO')}
              colors={colors}
              typography={typography}
              radius={radius}
            />
          </View>
        )}

        {/* Espaço inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE INFORMAÇÕES DE CONTATO */}
      <ModalContatoCandidato
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        candidatoPerfil={candidatoPerfil}
        colors={colors}
        typography={typography}
        radius={radius}
      />

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
  sectionDivider: {
    height: 8,
    marginVertical: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  empresaA11yResource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
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
});
