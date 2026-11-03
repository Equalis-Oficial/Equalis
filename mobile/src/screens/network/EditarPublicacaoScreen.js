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
import AccessibleButton from '../../components/common/AccessibleButton';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function EditarPublicacaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const {
    publicacoes,
    editarPublicacao,
    screenParams,
    candidatoPerfil,
    empresaPerfil,
    userType,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const targetPost =
    publicacoes.find((p) => p.id === screenParams?.postId) || publicacoes[0];

  const [conteudo, setConteudo] = useState(targetPost?.conteudo || '');
  const [erroConteudo, setErroConteudo] = useState('');

  const isEmpresa = targetPost?.autor_tipo === 'EMPRESA';
  const autorNome =
    targetPost?.autor_nome ||
    (isEmpresa
      ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
      : candidatoPerfil?.nome || 'Candidato PcD');

  const handleSalvar = () => {
    if (!conteudo.trim()) {
      setErroConteudo('O conteúdo da publicação não pode ficar vazio.');
      Alert.alert('Aviso', 'Escreva algo antes de salvar.');
      return;
    }

    if (targetPost) {
      editarPublicacao(targetPost.id, conteudo.trim());
    }

    speak('Publicação atualizada com sucesso!');
    Alert.alert('Sucesso', 'Publicação atualizada com sucesso!', [
      { text: 'OK', onPress: () => goBack('VER_PUBLICACOES') },
    ]);
  };

  const audioSummary =
    'Tela de Edição de Publicação. Modifique o texto da sua postagem e confirme as alterações.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Editar Publicação"
        showBack={true}
        onBack={() => goBack('VER_PUBLICACOES')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário para editar publicação"
      >
        {/* Cabeçalho do Autor com Imagem Oficial (#35_EDITAR_PUBLICACAO_ACESSIVEL.png) */}
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
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Editando publicação existente
            </Text>
          </View>
        </View>

        <Text
          style={[
            typography.titleLarge,
            {
              color: colors.textPrimary,
              fontWeight: '700',
              marginTop: 12,
              marginBottom: 8,
              fontSize: isAccessibleMode ? 24 : 20,
            },
          ]}
          accessibilityRole="header"
        >
          O que deseja alterar em sua publicação?
        </Text>

        {/* Editor de Texto */}
        <View
          style={[
            styles.textAreaWrapper,
            {
              backgroundColor: colors.inputBg,
              borderColor: erroConteudo ? colors.danger : colors.primaryDark,
              borderWidth: isAccessibleMode ? 2 : 1.5,
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
            placeholder="Edite o conteúdo da sua publicação..."
            placeholderTextColor={colors.textMuted}
            multiline={true}
            numberOfLines={8}
            style={[
              styles.textAreaInput,
              typography.bodyLarge,
              { color: colors.textPrimary, fontSize: isAccessibleMode ? 18 : 16 },
            ]}
            accessible={true}
            accessibilityLabel="Campo de edição do texto da publicação"
          />
        </View>

        {erroConteudo ? (
          <Text style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>
            {erroConteudo}
          </Text>
        ) : null}

        {/* Botões de Ação */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={() => goBack('VER_PUBLICACOES')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Descartar alterações e voltar"
            style={[
              styles.cancelBtn,
              { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSoft },
            ]}
          >
            <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>
              Descartar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSalvar}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Salvar alterações na publicação"
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primaryDark },
            ]}
          >
            <Text style={styles.saveBtnText}>Salvar Alterações</Text>
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
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textAreaWrapper: {
    minHeight: 180,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  textAreaInput: {
    flex: 1,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 10,
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
