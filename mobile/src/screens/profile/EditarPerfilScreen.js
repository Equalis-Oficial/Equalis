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
import AccessibleInput from '../../components/common/AccessibleInput';
import AccessibleButton from '../../components/common/AccessibleButton';

export default function EditarPerfilScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { candidatoPerfil, atualizarCandidatoPerfil, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [nome, setNome] = useState(candidatoPerfil.nome || '');
  const [areaAtuacao, setAreaAtuacao] = useState(candidatoPerfil.area_atuacao || '');
  const [estado, setEstado] = useState(candidatoPerfil.estado || '');
  const [cidade, setCidade] = useState(candidatoPerfil.cidade || '');
  const [erroNome, setErroNome] = useState('');

  const handleSalvar = () => {
    if (!nome.trim()) {
      setErroNome('Informe o Nome e Sobrenome.');
      Alert.alert('Campo Obrigatório', 'O Nome e Sobrenome não pode ficar em branco.');
      return;
    }

    atualizarCandidatoPerfil({
      nome: nome.trim(),
      area_atuacao: areaAtuacao.trim(),
      estado: estado.trim(),
      cidade: cidade.trim(),
    });

    speak('Alterações do perfil salvas com sucesso!');
    Alert.alert('Perfil Atualizado', 'Suas alterações foram salvas com sucesso!', [
      { text: 'OK', onPress: () => goBack('PERFIL_CANDIDATO') },
    ]);
  };

  const audioSummary =
    'Tela de Edição de Perfil. Altere seu Nome e Sobrenome, Área de atuação, Estado e Cidade do perfil.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Editar Perfil"
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário para editar informações do perfil do candidato"
      >
        {/* Banner Oficial do Figma (#405:639 e 18_EDITAR_PERFIL.png) */}
        <View style={styles.bannerContainer}>
          <Image
            source={FIGMA_ASSETS.bannerPerfilArcos}
            style={styles.bannerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Banner oficial de arcos coloridos do perfil"
          />
        </View>

        {/* Foto de Perfil Oficial (Avatar Panda/Raposa) */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatarCirclePreview,
              { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
            ]}
          >
            <Image
              source={FIGMA_ASSETS.avatarPandaRaposa}
              style={styles.avatarImage}
              accessible={true}
              accessibilityLabel={`Foto oficial de perfil de ${candidatoPerfil?.nome || 'Candidato'}`}
            />
          </View>
          <View style={styles.avatarTextCol}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              Foto do Perfil
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              Foto oficial com suporte a alto contraste e audiodescrição.
            </Text>
          </View>
        </View>

        <Text
          style={[
            typography.titleLarge,
            {
              color: colors.textPrimary,
              fontWeight: '700',
              marginTop: 16,
              marginBottom: 12,
              fontSize: isAccessibleMode ? 26 : 22,
            },
          ]}
          accessibilityRole="header"
        >
          Informações Básicas
        </Text>

        <AccessibleInput
          label="Nome e Sobrenome"
          value={nome}
          onChangeText={(t) => {
            setNome(t);
            if (erroNome) setErroNome('');
          }}
          placeholder="Ex: Maria Ledentsova"
          required={true}
          error={erroNome}
        />

        <AccessibleInput
          label="Área de Atuação"
          value={areaAtuacao}
          onChangeText={setAreaAtuacao}
          placeholder="Ex: Marketing Digital e Comunicação Acessível"
        />

        <AccessibleInput
          label="Estado"
          value={estado}
          onChangeText={setEstado}
          placeholder="Ex: São Paulo"
        />

        <AccessibleInput
          label="Cidade / Município"
          value={cidade}
          onChangeText={setCidade}
          placeholder="Ex: Guarulhos"
        />

        {/* Botão Salvar (#405:594 e #405:597) */}
        <View style={styles.saveWrap}>
          <AccessibleButton
            title="Salvar"
            onPress={handleSalvar}
            variant="primaryDark"
            accessibilityLabel="Salvar alterações do perfil"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerContainer: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 110,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCirclePreview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarTextCol: {
    flex: 1,
  },
  saveWrap: {
    marginTop: 24,
  },
});
