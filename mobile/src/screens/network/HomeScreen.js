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
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function HomeScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    userType,
    publicacoes,
    curtirPublicacao,
    adicionarComentario,
    republicarPublicacao,
    enviarMensagem,
    navigate,
    vagas,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [commentOpenPostId, setCommentOpenPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState('');

  const primeiroNome = candidatoPerfil?.nome
    ? candidatoPerfil.nome.split(' ')[0]
    : (userType === 'EMPRESA' ? (empresaPerfil?.nome_fantasia || 'Empresa') : 'Candidato');

  const handleVerVagas = () => {
    navigate('EMPREGO');
  };

  const handleCurtir = (postId) => {
    curtirPublicacao(postId);
  };

  const handleToggleComentar = (postId) => {
    setCommentOpenPostId((prev) => (prev === postId ? null : postId));
  };

  const handleAdicionarComentario = async (postId) => {
    if (!commentInput.trim()) return;
    const texto = commentInput.trim();
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), texto],
    }));
    setCommentInput('');
    await adicionarComentario(postId, texto);
    speak('Comentário enviado com sucesso!');
    Alert.alert('Comentário Enviado', 'Seu comentário foi registrado no Equalis e salvo com sucesso.');
  };

  const handleRepublicar = (post) => {
    Alert.alert(
      'Republicar no seu feed',
      `Deseja republicar a postagem de ${post.autor_nome} com a sua rede?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Republicar',
          onPress: async () => {
            await republicarPublicacao(post.id);
            speak('Publicação compartilhada com sucesso no seu feed!');
            Alert.alert('Sucesso', 'Publicação republicada com sucesso no seu feed!');
          },
        },
      ]
    );
  };

  const handleEnviar = (post) => {
    Alert.alert(
      'Enviar por mensagem',
      `Compartilhar o post de ${post.autor_nome} com seus contatos por mensagem direta?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar e Abrir Chat',
          onPress: () => {
            enviarMensagem(
              'Recrutamento Inclusivo',
              `Olá! Estou compartilhando o post de ${post.autor_nome}: "${post.conteudo.slice(0, 90)}..."`
            );
            speak('Mensagem compartilhada enviada para o chat.');
            navigate('MENSAGENS');
          },
        },
      ]
    );
  };

  const audioSummary = userType === 'EMPRESA'
    ? `Painel da Empresa. Olá, você está no painel de gestão de vagas e publicações inclusivas.`
    : `Tela Inicial do Equalis. Olá ${primeiroNome}, seja bem-vindo ao feed de publicações e oportunidades inclusivas.`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showSearch={true}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Feed principal do aplicativo Equalis"
      >
        {/* Banner Azul Acolhedor do Figma (#125:3790 e 11_HOME.png) com Ilustração Oficial Working-rafiki */}
        <View
          style={[
            styles.welcomeBanner,
            { backgroundColor: colors.primary, borderRadius: radius.lg },
          ]}
        >
          <View style={styles.bannerTextCol}>
            <Text
              style={[
                styles.welcomeTitle,
                { color: '#FFFFFF', fontSize: isAccessibleMode ? 28 : 22 },
              ]}
              accessibilityRole="header"
            >
              {userType === 'EMPRESA' ? `Painel ${empresaPerfil?.nome_fantasia || 'Empresa'}` : `Olá, ${primeiroNome}!`}
            </Text>
            <Text
              style={[
                styles.welcomeSubhead,
                { color: '#FFFFFF', fontSize: isAccessibleMode ? 18 : 15 },
              ]}
            >
              {userType === 'EMPRESA'
                ? 'Gestão de vagas e oportunidades inclusivas'
                : 'É bom te ver novamente dentro do equalis'}
            </Text>
            <Text
              style={[
                styles.welcomeCaption,
                { color: '#EAF4FF', fontSize: isAccessibleMode ? 14 : 12 },
              ]}
            >
              {userType === 'EMPRESA'
                ? 'Cadastre oportunidades exclusivas e avalie candidatos PcD capacitados'
                : 'Recomendamos algumas vagas enquanto você navega no aplicativo'}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (userType === 'EMPRESA') {
                  navigate('PUBLICAR_VAGA_EMPRESA');
                } else {
                  handleVerVagas();
                }
              }}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={userType === 'EMPRESA' ? 'Publicar nova vaga de emprego' : 'Ver vagas recomendadas para você'}
              accessibilityHint={userType === 'EMPRESA' ? 'Abre o formulário para cadastrar vaga' : 'Navega para a tela de busca de empregos'}
              style={[
                styles.bannerBtn,
                {
                  backgroundColor: colors.primaryDark,
                  borderColor: '#FFFFFF',
                },
              ]}
            >
              <Text style={styles.bannerBtnText}>
                {userType === 'EMPRESA' ? '+ Publicar Vaga' : 'Ver Vagas'}
              </Text>
              <Text style={styles.bannerBtnArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Ilustração Working Rafiki (#159:217 do Figma) */}
          <Image
            source={FIGMA_ASSETS.workingRafikiHome}
            style={styles.bannerRafikiImg}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Ilustração de profissional no computador"
          />
        </View>

        {/* Linha Divisória de Seção */}
        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerBeige }]} />

        {/* FEED DE POSTAGENS */}
        <View style={styles.feedContainer}>
          {publicacoes.length === 0 ? (
            <View
              style={[
                styles.emptyFeedBox,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
              accessible={true}
              accessibilityLabel="Nenhuma publicação no feed no momento"
            >
              <Text style={styles.emptyFeedEmoji}>📢</Text>
              <Text
                style={[
                  typography.titleMedium,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center', marginTop: 8 },
                ]}
              >
                Nenhuma publicação no momento
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
                ]}
              >
                Compartilhe uma oportunidade ou atualização com a sua rede no Equalis.
              </Text>
              <TouchableOpacity
                onPress={() => navigate('PUBLICAR')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Criar nova publicação no feed"
                style={[styles.emptyFeedBtn, { backgroundColor: colors.primaryDark, borderRadius: radius.md }]}
              >
                <Text style={styles.emptyFeedBtnText}>+ Criar Publicação</Text>
              </TouchableOpacity>
            </View>
          ) : (
            publicacoes.map((post) => {
            const jaCurtiu = Boolean(post.curtidoPeloUsuario);
            const comentariosLocais = commentsMap[post.id] || [];
            const totalComentarios = (post.comentarios || 0) + comentariosLocais.length;
            const isUniceplac = post.autor_tipo === 'EMPRESA';
            const postVaga = post.vaga_id ? vagas.find((v) => v.id === post.vaga_id) : null;

            return (
              <View
                key={post.id}
                style={[
                  styles.postCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: isAccessibleMode ? 2 : 1,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {/* Header do Post com Assets Oficiais do Figma */}
                <View style={styles.postHeader}>
                  {isUniceplac ? (
                    <Image
                      source={FIGMA_ASSETS.logoUniceplacQuadrada}
                      style={styles.authorLogoUniceplac}
                      accessible={true}
                      accessibilityLabel={post.autor_nome ? `Logo de ${post.autor_nome}` : 'Logo da Empresa'}
                    />
                  ) : (
                    <Image
                      source={FIGMA_ASSETS.avatarPandaRaposa}
                      style={styles.authorAvatarImg}
                      accessible={true}
                      accessibilityLabel={`Foto de perfil de ${post.autor_nome || 'Usuário'}`}
                    />
                  )}

                  <View style={styles.authorMeta}>
                    <View style={styles.authorNameRow}>
                      <Text
                        style={[
                          typography.labelLarge,
                          {
                            color: colors.textPrimary,
                            fontWeight: '700',
                            fontSize: isAccessibleMode ? 17 : 15,
                          },
                        ]}
                      >
                        {post.autor_nome}
                      </Text>
                      {isUniceplac ? (
                        <View
                          style={[
                            styles.verifiedBadge,
                            { backgroundColor: colors.uniceplacGreen },
                          ]}
                        >
                          <Text style={styles.verifiedText}>PcD Inclusivo</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textMuted, marginTop: 2 },
                      ]}
                    >
                      {post.autor_subtitulo || '20 h • Brasília, DF'}
                    </Text>
                  </View>
                </View>

                {/* Conteúdo do Post */}
                <Text
                  style={[
                    typography.bodyLarge,
                    {
                      color: colors.textPrimary,
                      marginVertical: 12,
                      lineHeight: isAccessibleMode ? 26 : 22,
                    },
                  ]}
                >
                  {post.conteudo}
                </Text>

                {/* Ilustração Business Deal Cuate e Detalhes da Vaga Vinculada (#125:3794 do Figma) */}
                {post.vaga_id ? (
                  <View
                    style={[
                      styles.vagaLinkCard,
                      {
                        backgroundColor: colors.surfaceSoft,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Image
                      source={FIGMA_ASSETS.businessDealCuate}
                      style={styles.businessDealImg}
                      resizeMode="contain"
                      accessible={true}
                      accessibilityLabel="Ilustração de oportunidade profissional inclusiva"
                    />

                    <View style={styles.vagaCardBadgeRow}>
                      <Text style={styles.vagaBagIcon}>💼</Text>
                      <Text
                        style={[
                          typography.labelLarge,
                          { color: colors.primaryDark, fontWeight: '700' },
                        ]}
                      >
                        {postVaga ? postVaga.titulo : (post.autor_nome ? `Vaga Aberta na ${post.autor_nome}` : 'Vaga Aberta')}
                      </Text>
                    </View>

                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
                      ]}
                      numberOfLines={3}
                    >
                      {postVaga
                        ? postVaga.descricao
                        : 'Ambiente com bancadas reguláveis, rampas, sinalização tátil e suporte humanizado para colaboradores PcD.'}
                    </Text>

                    {/* Botão em destaque "Clique para ver detalhes da vaga" (#148:182) */}
                    <TouchableOpacity
                      onPress={() =>
                        navigate('DETALHES_VAGA', {
                          vagaId: post.vaga_id,
                        })
                      }
                      activeOpacity={0.85}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clique para ver detalhes da vaga exclusiva PcD"
                      style={[
                        styles.vagaDetailsBtn,
                        { backgroundColor: colors.primaryDark },
                      ]}
                    >
                      <Text style={styles.vagaDetailsBtnText}>
                        Clique para ver detalhes da vaga
                      </Text>
                      <Text style={styles.vagaDetailsBtnArrow}>→</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Contadores de Engajamento */}
                <View
                  style={[
                    styles.metricsRow,
                    { borderTopColor: colors.cardBorder, borderBottomColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.likesCountWrap}>
                    <Text style={styles.heartIcon}>👍</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {post.curtidas || 0}
                    </Text>
                  </View>

                  <View style={styles.rightMetricsWrap}>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {totalComentarios} comentários
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 6 }]}>
                      •
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {post.compartilhamentos || 2} compartilhamentos
                    </Text>
                  </View>
                </View>

                {/* Barra de Ações Responsiva: Gostar, Comentar, Republicar, Enviar (R2) */}
                <View style={styles.actionsBar}>
                  <TouchableOpacity
                    onPress={() => handleCurtir(post.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={jaCurtiu ? 'Descurtir publicação' : 'Gostar da publicação'}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>{jaCurtiu ? '❤️' : '🤍'}</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.65}
                      style={[
                        styles.actionText,
                        {
                          color: jaCurtiu ? colors.danger : colors.textSecondary,
                        },
                      ]}
                    >
                      Gostar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleComentar(post.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Comentar na publicação"
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.65}
                      style={[styles.actionText, { color: colors.textSecondary }]}
                    >
                      Comentar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRepublicar(post)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Republicar este post"
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>🔄</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.65}
                      style={[styles.actionText, { color: colors.textSecondary }]}
                    >
                      Republicar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleEnviar(post)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Enviar publicação por mensagem"
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>✈️</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.65}
                      style={[styles.actionText, { color: colors.textSecondary }]}
                    >
                      Enviar
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Seção Expansível de Comentários */}
                {commentOpenPostId === post.id ? (
                  <View
                    style={[
                      styles.commentSection,
                      { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text
                      style={[
                        typography.labelLarge,
                        { color: colors.textPrimary, marginBottom: 8 },
                      ]}
                    >
                      Deixe seu comentário
                    </Text>

                    <View style={styles.commentInputRow}>
                      <View
                        style={[
                          styles.commentInputBox,
                          {
                            backgroundColor: colors.background,
                            borderColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <TextInput
                          value={commentInput}
                          onChangeText={setCommentInput}
                          placeholder="Escreva algo construtivo..."
                          placeholderTextColor={colors.textMuted}
                          style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}
                          accessible={true}
                          accessibilityLabel="Campo para escrever seu comentário"
                        />
                      </View>

                      <TouchableOpacity
                        onPress={() => handleAdicionarComentario(post.id)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Publicar comentário"
                        style={[
                          styles.sendCommentBtn,
                          { backgroundColor: colors.primaryDark },
                        ]}
                      >
                        <Text style={styles.sendCommentBtnText}>Enviar</Text>
                      </TouchableOpacity>
                    </View>

                    {comentariosLocais.map((c, i) => (
                      <View
                        key={i}
                        style={[
                          styles.singleCommentItem,
                          { backgroundColor: colors.background, borderColor: colors.cardBorder },
                        ]}
                      >
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.primaryDark, fontWeight: '700' },
                          ]}
                        >
                          Você
                        </Text>
                        <Text
                          style={[
                            typography.bodyMedium,
                            { color: colors.textPrimary, marginTop: 2 },
                          ]}
                        >
                          {c}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        </View>

        {/* Espaçamento inferior para a BottomBar */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <BottomTabBar activeTab="HOME" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  roleSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 8,
  },
  roleSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSwitchBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  welcomeTitle: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  welcomeSubhead: {
    fontWeight: '600',
    marginTop: 4,
  },
  welcomeCaption: {
    marginTop: 6,
    marginBottom: 14,
  },
  bannerRafikiImg: {
    width: 120,
    height: 110,
    resizeMode: 'contain',
    flexShrink: 0,
    marginLeft: 6,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  bannerBtnArrow: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 8,
  },
  feedContainer: {
    marginTop: 8,
  },
  emptyFeedBox: {
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  emptyFeedEmoji: {
    fontSize: 36,
  },
  emptyFeedBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyFeedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  postCard: {
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorLogoUniceplac: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  authorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  vagaLinkCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  businessDealImg: {
    width: '100%',
    height: 180,
    marginBottom: 10,
  },
  vagaCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  vagaBagIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  vagaDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    width: '100%',
  },
  vagaDetailsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  vagaDetailsBtnArrow: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  likesCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 15,
    marginRight: 5,
  },
  rightMetricsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 3,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  commentSection: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInputBox: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 8,
  },
  sendCommentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 21,
  },
  sendCommentBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  singleCommentItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
});
