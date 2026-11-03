import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function ConfiguracoesPerfilScreen() {
  const { theme, isAccessibleMode, setIsA11yModalOpen, speak } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    userType,
    navigate,
    goBack,
    logout,
    atualizarEmpresaPerfil,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const isEmpresa = userType === 'EMPRESA';

  const [modalEmpresaVisible, setModalEmpresaVisible] = useState(false);
  const [empresaNome, setEmpresaNome] = useState(empresaPerfil?.nome_fantasia || '');
  const [empresaDescricao, setEmpresaDescricao] = useState(empresaPerfil?.descricao || '');

  const handleSalvarEmpresa = () => {
    if (!empresaNome.trim()) {
      Alert.alert('Atenção', 'Informe a razão ou nome fantasia da empresa.');
      return;
    }
    atualizarEmpresaPerfil({
      nome_fantasia: empresaNome.trim(),
      descricao: empresaDescricao.trim(),
    });
    setModalEmpresaVisible(false);
    speak('Dados institucionais da empresa atualizados com sucesso no sistema.');
    Alert.alert('Sucesso', 'Perfil da empresa atualizado com sucesso no MySQL!');
  };

  const audioSummary = isEmpresa
    ? `Tela de Configurações da Empresa ${empresaPerfil?.nome_fantasia || 'Inclusiva'}. Gerencie publicações de vagas, candidaturas recebidas e encerramento de sessão.`
    : 'Tela de Configurações do Perfil. Gerencie dados pessoais, seções do currículo, preferências de acessibilidade e privacidade.';

  const handleLogoutAction = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Deseja realmente encerrar a sessão?')) {
        logout();
      }
      return;
    }
    Alert.alert('Sair da Conta', 'Deseja realmente encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const SETTINGS_ITEMS = isEmpresa
    ? [
        {
          id: 'EDITAR_EMPRESA',
          title: 'Editar Perfil Institucional',
          description: 'Nome fantasia, descrição institucional e dados no MySQL',
          icon: '🏢',
          action: () => {
            setEmpresaNome(empresaPerfil?.nome_fantasia || '');
            setEmpresaDescricao(empresaPerfil?.descricao || '');
            setModalEmpresaVisible(true);
          },
        },
        {
          id: 'PUBLICAR',
          title: 'Publicar Nova Vaga',
          description: 'Cadastrar nova oportunidade de emprego exclusiva PcD',
          icon: '➕',
          action: () => navigate('PUBLICAR_VAGA_EMPRESA'),
        },
        {
          id: 'INSCRICOES',
          title: 'Gerenciar Inscrições',
          description: 'Visualizar candidatos e laudos homologados recebidos',
          icon: '📋',
          action: () => navigate('MINHAS_CANDIDATURAS'),
        },
        {
          id: 'AC11Y',
          title: 'Preferências de Acessibilidade',
          description: 'Voz alta (TTS), tamanho de fonte e alto contraste',
          icon: '♿',
          action: () => setIsA11yModalOpen(true),
        },
        {
          id: 'PRIVACIDADE',
          title: 'Privacidade e Conformidade PcD',
          description: 'Conformidade com a Lei de Cotas nº 8.213/91 e LGPD',
          icon: '🔒',
          action: () =>
            Alert.alert(
              'Privacidade e Conformidade PcD',
              'Os dados e laudos dos candidatos são confidenciais e restritos aos processos seletivos e inclusão institucional de sua empresa.'
            ),
        },
        {
          id: 'SAIR',
          title: 'Sair da Conta',
          description: 'Encerrar sessão corporativa com segurança',
          icon: '🚪',
          action: handleLogoutAction,
        },
      ]
    : [
        {
          id: 'EDITAR',
          title: 'Editar Perfil',
          description: 'Nome, área de atuação, cidade, estado e foto',
          icon: '👤',
          action: () => navigate('EDITAR_PERFIL'),
        },
        {
          id: 'SECOES',
          title: 'Adicionar Seções ao Perfil',
          description: 'Formação acadêmica, cargos, sobre e competências',
          icon: '➕',
          action: () => navigate('ADICIONAR_SECAO'),
        },
        {
          id: 'AC11Y',
          title: 'Preferências de Acessibilidade',
          description: 'Voz alta (TTS), tamanho de fonte e alto contraste',
          icon: '♿',
          action: () => setIsA11yModalOpen(true),
        },
        {
          id: 'PRIVACIDADE',
          title: 'Privacidade e Laudo PcD',
          description: 'Gerenciar visibilidade do laudo médico para recrutadores',
          icon: '🔒',
          action: () =>
            Alert.alert(
              'Privacidade do Laudo PcD',
              'Seu laudo médico e deficiências informadas estão visíveis apenas para empresas com processos seletivos ativos nos quais você se candidatou.'
            ),
        },
        {
          id: 'SAIR',
          title: 'Sair da Conta',
          description: 'Encerrar sessão com segurança',
          icon: '🚪',
          action: handleLogoutAction,
        },
      ];

  const profileName = isEmpresa
    ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
    : candidatoPerfil?.nome || 'Meu Perfil';

  const profileSubtitle = isEmpresa
    ? (empresaPerfil?.cidade ? `${empresaPerfil.cidade}, ${empresaPerfil.estado || 'DF'}` : 'Empregador Inclusivo PcD')
    : (candidatoPerfil?.area_atuacao || 'Profissional PcD');

  const profileEmail = isEmpresa
    ? empresaPerfil?.email || 'Conta Corporativa Equalis'
    : candidatoPerfil?.email || 'Conta Equalis';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title={isEmpresa ? 'Configurações da Empresa' : 'Configurações do Perfil'}
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Menu de configurações do perfil"
      >
        {/* Banner Oficial do Figma (#126:4101) */}
        <View style={styles.bannerWrapper}>
          <Image
            source={FIGMA_ASSETS.bannerPerfilArcos}
            style={styles.bannerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Banner de arcos coloridos"
          />
        </View>

        {/* Card do Perfil */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: isEmpresa ? '#FFFFFF' : colors.surfaceTint, borderColor: colors.primary },
            ]}
          >
            <Image
              source={isEmpresa ? FIGMA_ASSETS.logoUniceplacQuadrada : FIGMA_ASSETS.avatarPandaRaposa}
              style={styles.avatarImg}
              accessible={true}
              accessibilityLabel={isEmpresa ? `Logo de ${profileName}` : `Avatar de ${profileName}`}
            />
          </View>
          <View style={styles.profileMeta}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              {profileName}
            </Text>
            <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '600' }]}>
              {profileSubtitle}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {profileEmail}
            </Text>
          </View>
        </View>

        {/* Lista de Configurações */}
        <View style={styles.settingsList}>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.action}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.description}`}
              style={[
                styles.settingCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                  borderWidth: isAccessibleMode ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                ]}
              >
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>

              <View style={styles.settingTextCol}>
                <Text
                  style={[
                    typography.labelLarge,
                    {
                      color: item.id === 'SAIR' ? colors.danger : colors.textPrimary,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {item.description}
                </Text>
              </View>

              <Text style={[styles.arrowIcon, { color: colors.primaryDark }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomTabBar activeTab={isEmpresa ? 'PERFIL' : 'HOME'} />

      {/* Modal de Edição do Perfil Institucional da Empresa */}
      <Modal
        visible={modalEmpresaVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalEmpresaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '800', marginBottom: 12 }]}>
              Editar Dados da Empresa
            </Text>

            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>
              Nome Fantasia da Empresa
            </Text>
            <TextInput
              value={empresaNome}
              onChangeText={setEmpresaNome}
              placeholder="Nome Fantasia"
              style={[styles.modalInput, { borderColor: colors.cardBorder, color: colors.textPrimary }]}
            />

            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 12, marginBottom: 4 }]}>
              Descrição Institucional & Acessibilidade
            </Text>
            <TextInput
              value={empresaDescricao}
              onChangeText={setEmpresaDescricao}
              placeholder="Descreva as iniciativas de acessibilidade da empresa..."
              multiline
              numberOfLines={4}
              style={[styles.modalTextarea, { borderColor: colors.cardBorder, color: colors.textPrimary }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setModalEmpresaVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder, borderWidth: 1 }]}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSalvarEmpresa}
                style={[styles.modalBtn, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Salvar no Banco</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  bannerWrapper: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bannerImage: {
    width: '100%',
    height: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileMeta: {
    flex: 1,
  },
  settingsList: {
    marginTop: 4,
  },
  settingCard: {
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
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 22,
  },
  settingTextCol: {
    flex: 1,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalTextarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
