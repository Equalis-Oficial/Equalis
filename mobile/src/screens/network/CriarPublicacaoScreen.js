import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleButton from '../../components/common/AccessibleButton';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function CriarPublicacaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    userType,
    criarPublicacao,
    vagas,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [conteudo, setConteudo] = useState('');
  const [visibilidade, setVisibilidade] = useState('Qualquer pessoa');
  const [vagaVinculadaId, setVagaVinculadaId] = useState(null);
  const [imagemAnexa, setImagemAnexa] = useState(false);
  const [nomeMidia, setNomeMidia] = useState('');
  const [descricaoAcessivel, setDescricaoAcessivel] = useState('');
  const [erroConteudo, setErroConteudo] = useState('');

  const isEmpresa = userType === 'EMPRESA';
  const autorNome = isEmpresa
    ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
    : candidatoPerfil?.nome || 'Candidato PcD';

  const handleAnexarMidia = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        if (file) {
          setNomeMidia(file.name);
          setImagemAnexa(true);
          speak(`Imagem ${file.name} anexada com sucesso. Preencha a audiodescrição acessível.`);
        }
      };
      input.click();
    } else {
      const imgPadrao = 'foto_inclusao_equalis.jpg';
      setNomeMidia(imgPadrao);
      setImagemAnexa(true);
      speak(`Imagem ${imgPadrao} anexada com suporte a audiodescrição.`);
    }
  };

  const handleRemoverMidia = () => {
    setImagemAnexa(false);
    setNomeMidia('');
    setDescricaoAcessivel('');
    speak('Mídia removida da publicação.');
  };

  const handlePublicar = () => {
    if (!conteudo.trim()) {
      setErroConteudo('Por favor, escreva o texto da sua publicação.');
      Alert.alert('Publicação vazia', 'Escreva uma mensagem antes de publicar.');
      return;
    }

    let textoFinal = conteudo.trim();
    if (imagemAnexa && descricaoAcessivel.trim()) {
      textoFinal += `\n\n[#PraCegoVer: ${descricaoAcessivel.trim()}]`;
    }

    criarPublicacao(textoFinal, vagaVinculadaId);
    speak('Publicação realizada com sucesso no feed do Equalis!');
    Alert.alert('Sucesso!', 'Sua publicação foi compartilhada com a rede.', [
      {
        text: 'Ver Publicações',
        onPress: () => navigate('VER_PUBLICACOES'),
      },
      {
        text: 'Ir para Início',
        onPress: () => navigate('HOME'),
      },
    ]);
  };

  const audioSummary =
    'Tela de Criação de Publicação. Escreva sua mensagem, anexe mídias acessíveis ou vincule vagas para compartilhar com seus contatos.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Criar Publicação"
        showBack={true}
        onBack={() => goBack('HOME')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Tela de criação de nova publicação"
      >
        {/* MODO ACESSÍVEL (#371:561 e 34_CRIAR_PUBLICACAO_ACESSIVEL.png) */}
        {isAccessibleMode ? (
          <View style={styles.accessibleWrapper}>
            <View style={styles.authorBadgeRow}>
              <Image
                source={isEmpresa ? FIGMA_ASSETS.logoUniceplacQuadrada : FIGMA_ASSETS.avatarPandaRaposa}
                style={styles.authorAvatarImg}
                accessible={true}
                accessibilityLabel={`Foto de ${autorNome}`}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {autorNome}
                </Text>
                <Text style={[typography.caption, { color: colors.primaryDark }]}>
                  Modo Tela Acessível Ativo
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.accessiblePromptCard,
                { backgroundColor: colors.surfaceSoft, borderColor: colors.primaryDark },
              ]}
            >
              <Text
                style={[
                  typography.titleLarge,
                  { color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
                ]}
                accessibilityRole="header"
              >
                O que deseja alterar para sua rede?
              </Text>
              <Text
                style={[
                  typography.bodyLarge,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
                ]}
              >
                O que deseja fazer para as pessoas verem?
              </Text>
            </View>

            {/* Campo Amplo de Texto Acessível */}
            <View
              style={[
                styles.accessibleTextAreaWrap,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: erroConteudo ? colors.danger : colors.primaryDark,
                },
              ]}
            >
              <TextInput
                value={conteudo}
                onChangeText={(t) => {
                  setConteudo(t);
                  if (erroConteudo) setErroConteudo('');
                }}
                placeholder="Compartilhe suas ideias, conquistas ou projetos acessíveis com a rede..."
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={6}
                style={[
                  styles.accessibleInputText,
                  { color: colors.textPrimary, fontSize: 18, lineHeight: 28 },
                ]}
                accessible={true}
                accessibilityLabel="Campo de texto para sua publicação acessível"
              />
            </View>

            {/* Botões Grandes do Modo Acessível (#371:608 e #371:603) */}
            <TouchableOpacity
              onPress={handlePublicar}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publicar agora no feed"
              style={[styles.accessiblePublishBigBtn, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={styles.accessiblePublishBigBtnText}>Publicar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate('VER_PUBLICACOES')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver e editar publicações anteriores"
              style={[
                styles.accessibleViewPubsBtn,
                { backgroundColor: colors.primary, borderColor: colors.primaryDark },
              ]}
            >
              <Text style={styles.accessibleViewPubsBtnText}>
                Ver/Editar publicações
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* MODO PADRÃO COMPLETO (#272:959 do Figma) */
          <View style={styles.standardWrapper}>
            {/* Header do Autor com Imagem Oficial */}
            <View style={styles.authorRow}>
              {isEmpresa ? (
                <Image
                  source={FIGMA_ASSETS.logoUniceplacQuadrada}
                  style={styles.authorAvatarImg}
                  accessible={true}
                  accessibilityLabel={empresaPerfil?.nome_fantasia ? `Logo de ${empresaPerfil.nome_fantasia}` : 'Logo da Empresa'}
                />
              ) : (
                <Image
                  source={FIGMA_ASSETS.avatarPandaRaposa}
                  style={styles.authorAvatarImg}
                  accessible={true}
                  accessibilityLabel={`Foto de perfil de ${autorNome}`}
                />
              )}

              <View style={styles.authorCol}>
                <Text
                  style={[
                    typography.labelLarge,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {autorNome}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setVisibilidade(
                      visibilidade === 'Qualquer pessoa'
                        ? 'Somente Conexões'
                        : 'Qualquer pessoa'
                    )
                  }
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Visibilidade: ${visibilidade}. Toque para alternar`}
                  style={[
                    styles.visibilityPill,
                    { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                  ]}
                >
                  <Text style={styles.globeIcon}>🌐</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {visibilidade}
                  </Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo de Texto Principal */}
            <View
              style={[
                styles.editorWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: erroConteudo ? colors.danger : colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <TextInput
                value={conteudo}
                onChangeText={(t) => {
                  setConteudo(t);
                  if (erroConteudo) setErroConteudo('');
                }}
                placeholder="Compartilhe suas ideias, novidades profissionais ou projetos inclusivos..."
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={8}
                style={[
                  styles.editorInput,
                  typography.bodyLarge,
                  { color: colors.textPrimary, textAlignVertical: 'top' },
                ]}
                accessible={true}
                accessibilityLabel="Texto da publicação"
              />

              {imagemAnexa ? (
                <View
                  style={[
                    styles.attachedMediaPreview,
                    { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                  ]}
                >
                  <Text style={styles.attachedMediaIcon}>🖼️</Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.primaryDark, fontWeight: '700', flex: 1 },
                    ]}
                  >
                    Imagem com Audiodescrição (#PraCegoVer) anexada
                  </Text>
                  <TouchableOpacity
                    onPress={() => setImagemAnexa(false)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Remover imagem anexada"
                  >
                    <Text style={{ color: colors.danger, fontWeight: '700' }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {erroConteudo ? (
              <Text style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>
                {erroConteudo}
              </Text>
            ) : null}

            {/* Card de Mídia Anexada com #PraCegoVer */}
            {imagemAnexa && (
              <View
                style={{
                  backgroundColor: colors.surfaceTint,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  borderRadius: radius.md,
                  padding: 12,
                  marginTop: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[typography.bodyMedium, { color: colors.primaryDark, fontWeight: '700' }]}>
                    📷 {nomeMidia || 'foto_anexa.jpg'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRemoverMidia}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Remover imagem anexada"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6, marginBottom: 4 }]}>
                  Descrição Acessível obrigatória (#PraCegoVer para pessoas com deficiência visual):
                </Text>
                <TextInput
                  value={descricaoAcessivel}
                  onChangeText={setDescricaoAcessivel}
                  placeholder="Ex: Foto de bancada com rampa de acesso e intérprete de Libras"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    borderRadius: radius.sm,
                    padding: 8,
                    fontSize: 13,
                    color: colors.textPrimary,
                  }}
                  accessibilityLabel="Descrição acessível da imagem para deficientes visuais"
                />
              </View>
            )}

            {/* Barra de Ferramentas / Anexos */}
            <View
              style={[
                styles.attachmentBar,
                { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
              ]}
            >
              <TouchableOpacity
                onPress={handleAnexarMidia}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Anexar imagem com audiodescrição"
                style={styles.toolBtn}
              >
                <Text style={styles.toolIcon}>🖼️</Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary, marginLeft: 6, fontWeight: '600' },
                  ]}
                >
                  {imagemAnexa ? 'Alterar Mídia' : 'Adicionar Mídia'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const proxima = vagaVinculadaId ? null : (vagas[0]?.id || 1);
                  setVagaVinculadaId(proxima);
                  Alert.alert(
                    'Vincular Vaga',
                    proxima
                      ? `Vaga vinculada: ${vagas[0]?.titulo || 'Atendimento ao Cliente'}`
                      : 'Nenhuma vaga vinculada ao post.'
                  );
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Vincular vaga ao post"
                style={styles.toolBtn}
              >
                <Text style={styles.toolIcon}>💼</Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: vagaVinculadaId ? colors.primaryDark : colors.textSecondary,
                      marginLeft: 6,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {vagaVinculadaId ? 'Vaga Vinculada ✓' : 'Vincular Vaga'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botão de Publicar Principal */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => navigate('VER_PUBLICACOES')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ver minhas publicações anteriores"
                style={[
                  styles.historyBtn,
                  { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSoft },
                ]}
              >
                <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
                  Minhas Publicações
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePublicar}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Publicar post no feed"
                style={[
                  styles.publishBtn,
                  { backgroundColor: colors.primaryDark },
                ]}
              >
                <Text style={styles.publishBtnText}>Publicar Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomTabBar activeTab="PUBLICAR" />
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
  standardWrapper: {
    paddingTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  authorAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorCol: {
    flex: 1,
  },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  globeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  editorWrapper: {
    minHeight: 180,
    borderWidth: 1.5,
    padding: 12,
  },
  editorInput: {
    flex: 1,
    minHeight: 140,
  },
  attachedMediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  attachedMediaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolIcon: {
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  historyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  publishBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  accessibleWrapper: {
    paddingTop: 8,
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accessiblePromptCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  accessibleTextAreaWrap: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    marginBottom: 20,
  },
  accessibleInputText: {
    flex: 1,
    minHeight: 150,
  },
  accessiblePublishBigBtn: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 3,
  },
  accessiblePublishBigBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  accessibleViewPubsBtn: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  accessibleViewPubsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
