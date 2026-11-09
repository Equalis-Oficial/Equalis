/**
 * PublicarPostAcessivelScreen — Equalis Mobile
 * Fiel aos frames "PUBLICAR acessível" (#371:561 e #371:532) do Figma (`publicar_acessivel_2.png` e `publicar_acessivel_1.png`).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

const FORMATOS_PERMITIDOS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

export function validarPublicacaoAcessivel({ conteudo, midia_url, midia_tipo } = {}) {
  const textoLimpo = String(conteudo || '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
  const urlLimpa = String(midia_url || '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
  const temTexto = textoLimpo.length > 0;
  const temMidia = urlLimpa.length > 0;

  if (!temTexto && !temMidia) {
    return {
      valida: false,
      erro: 'MSG-015',
      mensagem: 'A publicação não pode estar vazia. Digite um texto ou anexe uma mídia.',
    };
  }

  if (textoLimpo.length > 2600) {
    return {
      valida: false,
      erro: 'RN-014',
      mensagem: 'O texto excede o limite de 2.600 caracteres.',
    };
  }

  if (temMidia) {
    const ext = (midia_tipo || urlLimpa.split('.').pop() || '').toLowerCase().trim();
    if (!FORMATOS_PERMITIDOS.includes(ext)) {
      return {
        valida: false,
        erro: 'MSG-016',
        mensagem: 'Formato de mídia inválido. Use JPEG, PNG, WEBP ou PDF.',
      };
    }
  }

  return { valida: true, erro: null };
}

export default function PublicarPostAcessivelScreen() {
  const { theme, speak, highContrast } = useAccessibility();
  const {
    candidatoPerfil,
    empresaPerfil,
    userType,
    criarPublicacao,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography } = theme;

  // Modo 'HUB' (#371:561 - publicar_acessivel_2.png) ou 'EDITOR' (#371:532 - publicar_acessivel_1.png)
  const [modo, setModo] = useState('HUB');
  const [conteudo, setConteudo] = useState('');
  const [midiaNome, setMidiaNome] = useState('');
  const [erro, setErro] = useState('');

  const isEmpresa = userType === 'EMPRESA';
  const autorNome = isEmpresa
    ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
    : candidatoPerfil?.nome || 'Candidato';

  const handleAnexarMidia = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.jpg,.jpeg,.png,.webp,.pdf';
      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        if (file) {
          setMidiaNome(file.name);
          setErro('');
          speak(`Anexo ${file.name} adicionado.`);
        }
      };
      input.click();
    } else {
      setMidiaNome('imagem_acessivel.png');
      setErro('');
      speak('Imagem adicionada à publicação.');
    }
  };

  const handlePublicar = async () => {
    const validacao = validarPublicacaoAcessivel({
      conteudo,
      midia_url: midiaNome || null,
      midia_tipo: midiaNome ? midiaNome.split('.').pop() : null,
    });

    if (!validacao.valida) {
      setErro(validacao.mensagem);
      speak(validacao.mensagem);
      return;
    }

    await criarPublicacao({
      conteudo: conteudo.trim() || `[Mídia: ${midiaNome}]`,
      midia_url: midiaNome || null,
    });
    speak('Publicação enviada com sucesso!');
    setConteudo('');
    setMidiaNome('');
    navigate('VER_PUBLICACOES');
  };

  if (modo === 'HUB') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AccessibleHeader
          title="Equalis"
          showBack={true}
          onBack={() => goBack('TELA_ACESSIVEL')}
          audioSummary="Publicações no modo acessível. Escolha entre Publicar uma nova ideia ou Ver e Editar suas publicações."
        />

        <View style={styles.hubBody}>
          <Text style={[styles.hubQuestion, { color: colors.textPrimary }]}>
            O que deseja alterar para sua rede?
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              speak('Abrindo editor para publicar nova ideia.');
              setModo('EDITOR');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Publicar nova postagem para a sua rede"
            style={[
              styles.hubPrimaryBtn,
              highContrast && { backgroundColor: '#000000', borderColor: '#FFFF00', borderWidth: 2 },
            ]}
          >
            <Text style={[styles.hubBtnText, highContrast && { color: '#FFFF00' }]}>
              Publicar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              speak('Abrindo lista para ver ou editar publicações.');
              navigate('VER_PUBLICACOES');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ver ou editar publicações existentes"
            style={[
              styles.hubSecondaryBtn,
              highContrast && { backgroundColor: '#000000', borderColor: '#FFFF00', borderWidth: 2 },
            ]}
          >
            <Text style={[styles.hubBtnText, highContrast && { color: '#FFFF00' }]}>
              Ver/Editar publicações
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Modo EDITOR (#371:532 - publicar_acessivel_1.png)
  const podePublicar = conteudo.trim().length > 0 || Boolean(midiaNome);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.editorTopBar, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => setModo('HUB')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Fechar editor e voltar"
          style={styles.closeBtn}
        >
          <Text style={[styles.closeIcon, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>

        <View style={styles.visibilityRow}>
          <Image
            source={FIGMA_ASSETS.avatarPandaRaposa}
            style={styles.avatarImg}
            resizeMode="cover"
          />
          <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
            Qualquer pessoa
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePublicar}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Publicar agora"
          style={[
            styles.publishPillBtn,
            { backgroundColor: podePublicar ? '#007ADE' : '#D9D9D9' },
          ]}
        >
          <Text
            style={[
              styles.publishPillText,
              { color: podePublicar ? '#FFFFFF' : '#666666' },
            ]}
          >
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.editorContent}>
        <TextInput
          value={conteudo}
          onChangeText={(t) => {
            setConteudo(t);
            if (erro) setErro('');
          }}
          placeholder="Compartilhe suas ideias..."
          placeholderTextColor={colors.textMuted || '#666666'}
          multiline
          maxLength={2600}
          accessible={true}
          accessibilityLabel={`Campo de texto da publicação de ${autorNome}`}
          style={[styles.textInput, { color: colors.textPrimary }]}
        />

        {midiaNome ? (
          <View style={[styles.mediaTag, { backgroundColor: colors.surfaceTint }]}>
            <Text style={{ color: colors.primaryDark, fontWeight: '600' }}>
              📎 {midiaNome}
            </Text>
            <TouchableOpacity onPress={() => setMidiaNome('')}>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {erro ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>{erro}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.editorFooter}>
        <TouchableOpacity
          onPress={handleAnexarMidia}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Anexar imagem ou documento à publicação"
          style={styles.mediaCircleBtn}
        >
          <Text style={styles.mediaCircleIcon}>🖼️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hubBody: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    alignItems: 'center',
  },
  hubQuestion: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 42,
  },
  hubPrimaryBtn: {
    width: '100%',
    minHeight: 56,
    backgroundColor: '#11389F',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  hubSecondaryBtn: {
    width: '100%',
    minHeight: 56,
    backgroundColor: '#0068C9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  hubBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  editorTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  publishPillBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  publishPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editorContent: {
    flexGrow: 1,
    padding: 20,
  },
  textInput: {
    fontSize: 20,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  mediaTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  editorFooter: {
    padding: 20,
    alignItems: 'flex-end',
  },
  mediaCircleBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#8C8C8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaCircleIcon: {
    fontSize: 24,
  },
});
