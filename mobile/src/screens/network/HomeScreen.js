import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import BottomTabBar from '../../components/common/BottomTabBar';
import HomeWelcomeBanner from '../../components/feed/HomeWelcomeBanner';
import PostCard from '../../components/feed/PostCard';

export default function HomeScreen() {
  const { theme, isAccessibleMode, speak, isSpeaking, stopSpeaking } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    userType,
    publicacoes,
    curtirPublicacao,
    adicionarComentario,
    republicarPublicacao,
    enviarMensagem,
    mensagens,
    navigate,
    vagas,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;
  const unreadMessagesCount = (mensagens || []).filter((m) => Boolean(m.nao_lida)).length;

  const [feedSearch, setFeedSearch] = useState('');
  const [commentOpenPostId, setCommentOpenPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState('');

  const primeiroNome = candidatoPerfil?.nome
    ? candidatoPerfil.nome.split(' ')[0]
    : (userType === 'EMPRESA' ? (empresaPerfil?.nome_fantasia || 'Empresa') : 'Candidato');

  const filteredPublicacoes = useMemo(() => {
    if (!feedSearch.trim()) return publicacoes;
    const term = feedSearch.trim().toLowerCase();
    return (publicacoes || []).filter((p) => {
      const matchText = (p.conteudo || '').toLowerCase().includes(term);
      const matchAuthor = (p.autor_nome || '').toLowerCase().includes(term);
      const vagaVinculada = p.vaga_id ? (vagas || []).find((v) => v.id === p.vaga_id) : null;
      const matchVaga = vagaVinculada ? (vagaVinculada.titulo || '').toLowerCase().includes(term) : false;
      return matchText || matchAuthor || matchVaga;
    });
  }, [publicacoes, feedSearch, vagas]);

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

  const handleToggleAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(audioSummary);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#007ADE' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#007ADE" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Feed principal do aplicativo Equalis"
      >
        {/* Banner Azul Integrado do Figma (#125:3790 e 11_HOME.png) */}
        <HomeWelcomeBanner
          userType={userType}
          primeiroNome={primeiroNome}
          empresaNome={empresaPerfil?.nome_fantasia || 'Empresa'}
          onAvatarPress={() => {
            navigate(userType === 'EMPRESA' ? 'PERFIL_EMPRESA' : 'PERFIL_CANDIDATO');
          }}
          searchValue={feedSearch}
          onSearchChange={setFeedSearch}
          onSearchSubmit={() => {
            if (feedSearch.trim()) {
              speak(`Filtrando publicações por ${feedSearch}`);
            }
          }}
          onMessagesPress={() => navigate('MENSAGENS')}
          unreadMessagesCount={unreadMessagesCount}
          onActionPress={() => {
            if (userType === 'EMPRESA') {
              navigate('PUBLICAR_VAGA_EMPRESA');
            } else {
              navigate('EMPREGO');
            }
          }}
          onA11yPress={handleToggleAudio}
          isSpeaking={isSpeaking}
          isAccessibleMode={isAccessibleMode}
          colors={colors}
          radius={radius}
        />

        {/* FEED DE POSTAGENS EM CONTÊINER BRANCO ARREDONDADO (FIGMA #125:3790) */}
        <View style={[styles.feedContainer, { backgroundColor: colors.background }]}>
          {filteredPublicacoes.length === 0 ? (
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
                Nenhuma publicação encontrada
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
                ]}
              >
                {feedSearch.trim()
                  ? `Nenhum resultado para "${feedSearch}". Tente outro termo.`
                  : 'Compartilhe uma oportunidade ou atualização com a sua rede no Equalis.'}
              </Text>
              {feedSearch.trim() ? (
                <TouchableOpacity
                  onPress={() => setFeedSearch('')}
                  style={[styles.emptyFeedBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
                >
                  <Text style={styles.emptyFeedBtnText}>Limpar Busca</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigate('PUBLICAR')}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Criar nova publicação no feed"
                  style={[styles.emptyFeedBtn, { backgroundColor: colors.primaryDark, borderRadius: radius.md }]}
                >
                  <Text style={styles.emptyFeedBtnText}>+ Criar Publicação</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPublicacoes.map((post) => {
              const postVaga = post.vaga_id ? (vagas || []).find((v) => v.id === post.vaga_id) : null;
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  vaga={postVaga}
                  jaCurtiu={Boolean(post.curtidoPeloUsuario)}
                  isCommentOpen={commentOpenPostId === post.id}
                  commentInput={commentInput}
                  onChangeCommentInput={setCommentInput}
                  commentsList={commentsMap[post.id] || []}
                  onCurtir={handleCurtir}
                  onToggleComentar={handleToggleComentar}
                  onSubmitComentario={handleAdicionarComentario}
                  onRepublicar={handleRepublicar}
                  onEnviar={handleEnviar}
                  onNavigateVaga={(vagaId) => navigate('DETALHES_VAGA', { vagaId })}
                  isAccessibleMode={isAccessibleMode}
                  colors={colors}
                  typography={typography}
                  radius={radius}
                />
              );
            })
          )}

          {/* Espaçamento inferior para a BottomBar */}
          <View style={{ height: 60 }} />
        </View>
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
    paddingBottom: 0,
  },
  feedContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    minHeight: 500,
  },
  emptyFeedBox: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyFeedEmoji: {
    fontSize: 40,
  },
  emptyFeedBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyFeedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
