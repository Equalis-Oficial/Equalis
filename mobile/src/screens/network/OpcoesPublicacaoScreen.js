import React from 'react';
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
import BottomTabBar from '../../components/common/BottomTabBar';

export default function OpcoesPublicacaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    publicacoes,
    screenParams,
    candidatoPerfil,
    empresaPerfil,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const targetPost =
    publicacoes.find((p) => p.id === screenParams?.postId) || publicacoes[0];

  const isUniceplac = targetPost?.autor_tipo === 'EMPRESA';

  const audioSummary =
    'Menu de Opções da Publicação. Você pode editar o conteúdo, configurar quem pode comentar ou excluir a postagem.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Opções da Publicação"
        showBack={true}
        onBack={() => goBack('VER_PUBLICACOES')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Menu de opções da publicação selecionada"
      >
        {/* Prévia do Post Selecionado (#23_OPCOES_PUBLICACAO.png) */}
        <View
          style={[
            styles.previewPostCard,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.postCardHeader}>
            {isUniceplac ? (
              <Image
                source={FIGMA_ASSETS.logoUniceplacQuadrada}
                style={styles.logoUniceplac}
                accessible={true}
                accessibilityLabel={targetPost?.autor_nome ? `Logo de ${targetPost.autor_nome}` : 'Logo da Empresa'}
              />
            ) : (
              <Image
                source={FIGMA_ASSETS.avatarPandaRaposa}
                style={styles.avatarPanda}
                accessible={true}
                accessibilityLabel={`Foto de perfil de ${targetPost?.autor_nome || 'Usuário'}`}
              />
            )}

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                {targetPost?.autor_nome || (targetPost?.autor_tipo === 'EMPRESA' ? (empresaPerfil?.nome_fantasia || 'Empresa Inclusiva') : (candidatoPerfil?.nome || 'Usuário'))}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {targetPost?.autor_subtitulo || 'Marketing'}
              </Text>
            </View>
          </View>

          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textPrimary, marginTop: 10, lineHeight: 22 },
            ]}
          >
            {targetPost?.conteudo}
          </Text>
        </View>

        {/* Lista de Opções da Publicação */}
        <View style={styles.optionsList}>
          <TouchableOpacity
            onPress={() => navigate('EDITAR_PUBLICACAO', { postId: targetPost?.id })}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Editar texto desta publicação"
            style={[
              styles.optionItem,
              {
                backgroundColor: colors.background,
                borderColor: colors.cardBorder,
                borderRadius: radius.md,
                borderWidth: isAccessibleMode ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.optionIcon}>✏️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Editar publicação
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Corrija ou adicione novas informações ao seu texto
              </Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.primaryDark }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('CONFIRMAR_EXCLUSAO', { postId: targetPost?.id })}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Excluir esta publicação"
            style={[
              styles.optionItem,
              {
                backgroundColor: '#FFF8F8',
                borderColor: colors.danger,
                borderRadius: radius.md,
                borderWidth: 1.5,
              },
            ]}
          >
            <Text style={styles.optionIcon}>🗑️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.danger, fontWeight: '700' },
                ]}
              >
                Excluir publicação
              </Text>
              <Text style={[typography.caption, { color: colors.danger }]}>
                Remover esta postagem permanentemente do feed
              </Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.danger }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Comentários', 'Configurações de comentários atualizadas.');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Configurar quem pode comentar"
            style={[
              styles.optionItem,
              {
                backgroundColor: colors.background,
                borderColor: colors.cardBorder,
                borderRadius: radius.md,
                borderWidth: isAccessibleMode ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.optionIcon}>💬</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Quem pode comentar?
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Qualquer pessoa da rede Equalis
              </Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.primaryDark }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Link copiado', 'O link da publicação foi copiado para sua área de transferência!');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Copiar link da publicação"
            style={[
              styles.optionItem,
              {
                backgroundColor: colors.background,
                borderColor: colors.cardBorder,
                borderRadius: radius.md,
                borderWidth: isAccessibleMode ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.optionIcon}>🔗</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  typography.labelLarge,
                  { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Copiar link da publicação
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Compartilhe o post fora do aplicativo
              </Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.primaryDark }]}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => goBack('VER_PUBLICACOES')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a lista de publicações"
          style={[
            styles.backBtn,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>
            Voltar
          </Text>
        </TouchableOpacity>

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
  previewPostCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
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
  optionsList: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 22,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
});
