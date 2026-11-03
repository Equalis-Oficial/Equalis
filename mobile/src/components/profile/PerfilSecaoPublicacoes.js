import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function PerfilSecaoPublicacoes({
  publicacoes = [],
  onNavigateVerPublicacoes,
  onNavigateCriarPublicacao,
  colors,
  typography,
  radius,
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            typography.titleMedium,
            { color: colors.textPrimary, fontWeight: '700' },
          ]}
          accessibilityRole="header"
        >
          Publicações ({publicacoes.length})
        </Text>
        <TouchableOpacity
          onPress={onNavigateVerPublicacoes}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ver ou editar todas as minhas publicações"
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            Ver/Editar publicações →
          </Text>
        </TouchableOpacity>
      </View>

      {publicacoes.length === 0 ? (
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
            onPress={onNavigateCriarPublicacao}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Criar primeira publicação"
            style={[styles.emptyStateBtn, { backgroundColor: colors.primaryDark }]}
          >
            <Text style={styles.emptyStateBtnText}>+ Criar Publicação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        publicacoes.map((post) => (
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
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});

