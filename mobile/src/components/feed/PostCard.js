import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function PostCard({
  post,
  vaga,
  jaCurtiu = false,
  isCommentOpen = false,
  commentInput = '',
  onChangeCommentInput,
  commentsList = [],
  onCurtir,
  onToggleComentar,
  onSubmitComentario,
  onRepublicar,
  onEnviar,
  onNavigateVaga,
  isAccessibleMode = false,
  colors,
  typography,
  radius,
}) {
  const isUniceplac = post.autor_tipo === 'EMPRESA';
  const totalComentarios = (post.comentarios || 0) + (commentsList || []).length;

  return (
    <View
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

      {/* Ilustração Business Deal Cuate e Detalhes da Vaga Vinculada */}
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
              {vaga ? vaga.titulo : (post.autor_nome ? `Vaga Aberta na ${post.autor_nome}` : 'Vaga Aberta')}
            </Text>
          </View>

          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
            ]}
            numberOfLines={3}
          >
            {vaga
              ? vaga.descricao
              : 'Ambiente com bancadas reguláveis, rampas, sinalização tátil e suporte humanizado para colaboradores PcD.'}
          </Text>

          {/* Botão em destaque "Clique para ver detalhes da vaga" */}
          <TouchableOpacity
            onPress={() => onNavigateVaga(post.vaga_id)}
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
          <View style={styles.likeBadgeCircle}>
            <Text style={styles.likeThumbIcon}>👍</Text>
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6, fontWeight: '600' }]}>
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

      {/* Barra de Ações Responsiva: Gostar, Comentar, Republicar, Enviar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          onPress={() => onCurtir(post.id)}
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
          onPress={() => onToggleComentar(post.id)}
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
          onPress={() => onRepublicar(post)}
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
          onPress={() => onEnviar(post)}
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
      {isCommentOpen ? (
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
                onChangeText={onChangeCommentInput}
                placeholder="Escreva algo construtivo..."
                placeholderTextColor={colors.textMuted}
                style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}
                accessible={true}
                accessibilityLabel="Campo para escrever seu comentário"
              />
            </View>

            <TouchableOpacity
              onPress={() => onSubmitComentario(post.id)}
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

          {commentsList.map((c, i) => (
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
}

const styles = StyleSheet.create({
  postCard: {
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorLogoUniceplac: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  authorAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorMeta: {
    marginLeft: 12,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  vagaLinkCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
  },
  businessDealImg: {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  vagaCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vagaBagIcon: {
    fontSize: 16,
  },
  vagaDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  vagaDetailsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  vagaDetailsBtnArrow: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 4,
  },
  likesCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeBadgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#007ADE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeThumbIcon: {
    fontSize: 11,
  },
  heartIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rightMetricsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  commentSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  commentInputBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sendCommentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendCommentBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  singleCommentItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
});

