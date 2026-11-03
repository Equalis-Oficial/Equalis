import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleButton from '../../components/common/AccessibleButton';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function VerPublicacoesScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    publicacoes,
    candidatoPerfil,
    empresaPerfil,
    userType,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const isEmpresa = userType === 'EMPRESA';
  const minhasPublicacoes = publicacoes.filter((p) =>
    isEmpresa
      ? p.autor_tipo === 'EMPRESA' && ((Boolean(empresaPerfil?.id) && p.autor_id === empresaPerfil.id) || (Boolean(empresaPerfil?.nome_fantasia) && p.autor_nome === empresaPerfil.nome_fantasia))
      : p.autor_tipo === 'CANDIDATO' && ((Boolean(candidatoPerfil?.id) && p.autor_id === candidatoPerfil.id) || (Boolean(candidatoPerfil?.nome) && p.autor_nome === candidatoPerfil.nome))
  );

  const handleOpenOpcoes = (post) => {
    navigate('OPCOES_PUBLICACAO', { postId: post.id });
  };

  const handleOpenEditar = (post) => {
    navigate('EDITAR_PUBLICACAO', { postId: post.id });
  };

  const handleOpenConfirmarExclusao = (post) => {
    navigate('CONFIRMAR_EXCLUSAO', { postId: post.id });
  };

  const audioSummary = `Tela de visualização de publicações. Você possui ${minhasPublicacoes.length} publicações ativas.`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Ver Publicações"
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Lista de todas as suas publicações"
      >
        <View style={styles.topActionsRow}>
          <Text
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                fontSize: isAccessibleMode ? 24 : 20,
              },
            ]}
            accessibilityRole="header"
          >
            Publicações ({minhasPublicacoes.length})
          </Text>

          <TouchableOpacity
            onPress={() => navigate('CRIAR_PUBLICACAO')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Criar nova publicação"
            style={[
              styles.createBtn,
              { backgroundColor: colors.primaryDark },
            ]}
          >
            <Text style={styles.createBtnText}>+ Criar</Text>
          </TouchableOpacity>
        </View>

        {minhasPublicacoes.length === 0 ? (
          <View
            style={[
              styles.emptyStateBox,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Image
              source={isEmpresa ? FIGMA_ASSETS.logoUniceplacQuadrada : FIGMA_ASSETS.avatarPandaRaposa}
              style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 12 }}
              accessible={true}
              accessibilityLabel={isEmpresa ? 'Logo da empresa' : 'Avatar do usuário'}
            />
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              Você ainda não publicou nada
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 16 },
              ]}
            >
              Compartilhe suas ideias, conquistas ou projetos inclusivos com sua rede de contatos.
            </Text>
            <AccessibleButton
              title="Criar Publicação"
              onPress={() => navigate('CRIAR_PUBLICACAO')}
              variant="primary"
            />
          </View>
        ) : (
          minhasPublicacoes.map((post) => {
            const isUniceplac = post.autor_tipo === 'EMPRESA';
            return (
              <View
                key={post.id}
                style={[
                  styles.postCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderRadius: radius.md,
                    borderWidth: isAccessibleMode ? 2 : 1,
                  },
                ]}
              >
                {/* Header do Post com Foto Oficial do Figma (#22_VER_PUBLICACOES.png) */}
                <View style={styles.postCardHeader}>
                  {isUniceplac ? (
                    <Image
                      source={FIGMA_ASSETS.logoUniceplacQuadrada}
                      style={styles.logoUniceplac}
                      accessible={true}
                      accessibilityLabel={post.autor_nome ? `Logo de ${post.autor_nome}` : 'Logo da Empresa'}
                    />
                  ) : (
                    <Image
                      source={FIGMA_ASSETS.avatarPandaRaposa}
                      style={styles.avatarPanda}
                      accessible={true}
                      accessibilityLabel={`Foto de perfil de ${post.autor_nome}`}
                    />
                  )}

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        typography.labelLarge,
                        { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {post.autor_nome}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {post.autor_subtitulo || 'Marketing'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleOpenOpcoes(post)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir opções da publicação"
                    style={styles.moreOptionsBtn}
                  >
                    <Text style={[styles.moreDotsText, { color: colors.textSecondary }]}>•••</Text>
                  </TouchableOpacity>
                </View>

                {/* Conteúdo */}
                <Text
                  style={[
                    typography.bodyLarge,
                    { color: colors.textPrimary, marginVertical: 12, lineHeight: 22 },
                  ]}
                >
                  {post.conteudo}
                </Text>

                {/* Métricas */}
                <View
                  style={[
                    styles.metricsLine,
                    { borderTopColor: colors.cardBorder, borderBottomColor: colors.cardBorder },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    👍 {post.curtidas || 0} curtidas • 💬 {post.comentarios || 0} comentários
                  </Text>
                </View>

                {/* Ações Rápidas */}
                <View style={styles.postActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenEditar(post)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Editar texto da publicação"
                    style={[
                      styles.postActionBtn,
                      { borderColor: colors.primary, backgroundColor: colors.surfaceTint },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.primaryDark, fontWeight: '700' },
                      ]}
                    >
                      ✏️ Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenConfirmarExclusao(post)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Excluir esta publicação"
                    style={[
                      styles.postActionBtn,
                      { borderColor: colors.danger, backgroundColor: '#FFF5F5' },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.danger, fontWeight: '700' },
                      ]}
                    >
                      🗑️ Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
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
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  createBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyStateBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  postCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPanda: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  logoUniceplac: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  moreOptionsBtn: {
    padding: 6,
  },
  moreDotsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  metricsLine: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 6,
  },
  postActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  postActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
});
