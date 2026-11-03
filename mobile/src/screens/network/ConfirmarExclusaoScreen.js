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
import AccessibleButton from '../../components/common/AccessibleButton';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function ConfirmarExclusaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    publicacoes,
    excluirPublicacao,
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

  const handleExcluir = () => {
    if (targetPost) {
      excluirPublicacao(targetPost.id);
    }
    speak('Publicação excluída com sucesso.');
    Alert.alert('Excluída', 'Sua publicação foi removida do feed.', [
      { text: 'OK', onPress: () => goBack('VER_PUBLICACOES') },
    ]);
  };

  const audioSummary =
    'Atenção: Confirmação de Exclusão. Deseja realmente excluir esta publicação? Esta ação é definitiva e não pode ser revertida.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Confirmar Exclusão"
        showBack={true}
        onBack={() => goBack('VER_PUBLICACOES')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Tela de confirmação para excluir publicação"
      >
        {/* Card de Aviso de Exclusão (#24_CONFIRMAR_EXCLUSAO.png) */}
        <View
          style={[
            styles.warningCard,
            { backgroundColor: '#FFF5F5', borderColor: colors.danger },
          ]}
        >
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text
            style={[
              typography.titleLarge,
              { color: colors.danger, fontWeight: '700', textAlign: 'center', marginTop: 8 },
            ]}
            accessibilityRole="header"
          >
            Deseja excluir esta publicação?
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 22 },
            ]}
          >
            Esta ação não pode ser desfeita. A publicação será permanentemente removida da sua linha do tempo e do feed da rede Equalis.
          </Text>
        </View>

        {/* Prévia da Publicação */}
        <View
          style={[
            styles.postPreviewCard,
            { backgroundColor: colors.background, borderColor: colors.cardBorder },
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
              { color: colors.textPrimary, marginTop: 12, lineHeight: 22 },
            ]}
          >
            {targetPost?.conteudo}
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.buttonsColumn}>
          <TouchableOpacity
            onPress={handleExcluir}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Confirmar e excluir publicação definitivamente"
            style={[styles.dangerBtn, { backgroundColor: colors.danger }]}
          >
            <Text style={styles.dangerBtnText}>Excluir Definitivamente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => goBack('VER_PUBLICACOES')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancelar e manter publicação"
            style={[
              styles.cancelBtn,
              { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSoft },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.textPrimary }]}>
              Cancelar e Voltar
            </Text>
          </TouchableOpacity>
        </View>

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
  warningCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  warningEmoji: {
    fontSize: 42,
  },
  postPreviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
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
  buttonsColumn: {
    marginTop: 8,
  },
  dangerBtn: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dangerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
