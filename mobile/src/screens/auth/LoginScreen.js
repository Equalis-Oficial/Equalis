/**
 * LoginScreen — Equalis Mobile
 * Baseado no frame "ENTRAR" (#124:346) do Figma (`03_LOGIN.png`) + WCAG 2.2 AAA.
 *
 * Características:
 * - Ilustração oficial do Figma `FIGMA_ASSETS.jobHuntRafiki` na parte inferior.
 * - Inputs acessíveis com labels fixos, foco visual e alternador mostrar/ocultar senha.
 * - Botão "Entrar" com cor oficial #007ADE.
 * - Botões de acesso rápido Demo para testes facilitados (Candidato Maria / Empresa UNICEPLAC).
 * - Link "Criar uma nova conta".
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleInput from '../../components/common/AccessibleInput';
import AccessibleButton from '../../components/common/AccessibleButton';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import { validarEmail } from '../../utils/validators';

export default function LoginScreen() {
  const { theme, speak, isAccessibleMode } = useAccessibility();
  const {
    navigate,
    goBack,
    userType,
    setUserType,
    login,
    loginSSO,
    solicitarRecuperacaoSenha,
  } = useAuthAndData();
  const { colors, typography, spacing, radius } = theme;

  const [perfilSelecionado, setPerfilSelecionado] = useState(userType || 'CANDIDATO');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [carregando, setCarregando] = useState(false);

  const audioSummary =
    'Tela de login do Equalis. Digite seu e-mail e senha cadastrados para entrar na sua conta como Candidato PcD ou Empresa Inclusiva.';

  const handleMudarPerfil = (tipo) => {
    setPerfilSelecionado(tipo);
    setUserType(tipo);
    setErros({});
    setFeedbackMsg('');
    speak(tipo === 'CANDIDATO' ? 'Perfil alterado para Candidato PcD' : 'Perfil alterado para Empresa Inclusiva');
  };

  const handleLogin = async () => {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = 'Informe seu e-mail de acesso.';
    } else if (!validarEmail(email)) {
      novosErros.email = 'Digite um e-mail válido (ex: usuario@dominio.com).';
    }

    if (!senha.trim()) {
      novosErros.senha = 'Informe sua senha de acesso.';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter no mínimo 6 caracteres.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      const primeiroErro = Object.values(novosErros)[0];
      setFeedbackMsg(primeiroErro);
      speak(`Atenção: ${primeiroErro}`);
      return;
    }

    setErros({});
    setFeedbackMsg('');
    setCarregando(true);
    speak('Autenticando credenciais no servidor...');

    try {
      await login(email.trim(), senha, perfilSelecionado);
      speak('Login realizado com sucesso. Acessando a página principal do Equalis.');

      if (isAccessibleMode) {
        navigate('TELA_ACESSIVEL');
      } else {
        navigate('HOME');
      }
    } catch (err) {
      const msg = err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.';
      setErros({ geral: msg });
      setFeedbackMsg(msg);
      speak(`Atenção: ${msg}`);
      Alert.alert('Falha na Autenticação', msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleSocialLogin = async (provedor) => {
    speak(`Autenticando via ${provedor}...`);
    setCarregando(true);
    try {
      await loginSSO(provedor, perfilSelecionado);
      speak(`Autenticação oficial via ${provedor} concluída com sucesso! Redirecionando.`);
      if (isAccessibleMode) {
        navigate('TELA_ACESSIVEL');
      } else {
        navigate('HOME');
      }
    } catch (err) {
      const msg = err.message || 'Falha ao autenticar com o provedor.';
      Alert.alert(`Erro ${provedor}`, msg);
      speak(`Erro: ${msg}`);
    } finally {
      setCarregando(false);
    }
  };

  const handleEsqueciSenha = async () => {
    if (!email.trim() || !validarEmail(email)) {
      const aviso = 'Informe seu e-mail cadastrado no campo acima para solicitar a recuperação de senha.';
      speak(aviso);
      Alert.alert('E-mail Necessário', aviso);
      return;
    }
    speak('Enviando solicitação de recuperação de senha...');
    setCarregando(true);
    try {
      const res = await solicitarRecuperacaoSenha(email.trim());
      const msg = res.mensagem || 'Instruções e código de recuperação enviados para seu e-mail.';
      speak(msg);
      Alert.alert('Recuperação de Senha', msg);
    } catch (err) {
      const msg = err.message || 'Não foi possível recuperar a senha.';
      speak(`Aviso: ${msg}`);
      Alert.alert('Aviso de Recuperação', msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showBack={true}
        onBack={() => goBack('TELA_INICIAL')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho de Título Fiel ao Figma */}
        <View style={styles.titleBlock}>
          <Text
            accessibilityRole="header"
            style={[
              typography.displayLarge,
              {
                color: colors.primary,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: spacing.xs,
              },
            ]}
          >
            Entre na sua conta
          </Text>

          <Text
            style={[
              typography.bodyLarge,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              },
            ]}
          >
            Entre na sua conta e explore novas oportunidades
          </Text>
        </View>

        {/* Seletor de Perfil (Tabs Acessíveis) */}
        <View
          accessible={true}
          accessibilityRole="tablist"
          accessibilityLabel="Selecionar tipo de perfil para login"
          style={[styles.tabsRow, { backgroundColor: colors.surfaceTint, borderRadius: radius.md }]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleMudarPerfil('CANDIDATO')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: perfilSelecionado === 'CANDIDATO' }}
            accessibilityLabel="Perfil Candidato PcD"
            style={[
              styles.tabButton,
              perfilSelecionado === 'CANDIDATO' && {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                {
                  color:
                    perfilSelecionado === 'CANDIDATO'
                      ? '#FFFFFF'
                      : colors.textPrimary,
                  fontWeight: '700',
                },
              ]}
            >
              Candidato PcD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleMudarPerfil('EMPRESA')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: perfilSelecionado === 'EMPRESA' }}
            accessibilityLabel="Perfil Empresa Inclusiva"
            style={[
              styles.tabButton,
              perfilSelecionado === 'EMPRESA' && {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text
              style={[
                typography.labelLarge,
                {
                  color:
                    perfilSelecionado === 'EMPRESA'
                      ? '#FFFFFF'
                      : colors.textPrimary,
                  fontWeight: '700',
                },
              ]}
            >
              Empresa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensagem de Feedback de Erro Geral */}
        {feedbackMsg ? (
          <View
            accessible={true}
            accessibilityLiveRegion="assertive"
            style={[
              styles.errorBanner,
              { backgroundColor: '#FDE8E8', borderColor: colors.danger },
            ]}
          >
            <Text style={[typography.bodyMedium, { color: colors.danger, fontWeight: '700' }]}>
              {feedbackMsg}
            </Text>
          </View>
        ) : null}

        {/* Formulário de Login */}
        <View style={styles.formSection}>
          <AccessibleInput
            label="E-mail"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (erros.email) setErros((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="ex: seuemail@dominio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required={true}
            error={erros.email}
            accessibilityHint="Digite o e-mail cadastrado na plataforma"
          />

          <AccessibleInput
            label="Senha"
            value={senha}
            onChangeText={(txt) => {
              setSenha(txt);
              if (erros.senha) setErros((prev) => ({ ...prev, senha: '' }));
            }}
            placeholder="Digite sua senha"
            secureTextEntry={true}
            required={true}
            error={erros.senha}
            accessibilityHint="Digite sua senha de acesso"
          />

          {/* Esqueci a Senha */}
          <TouchableOpacity
            onPress={handleEsqueciSenha}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Esqueceu a senha? Solicitar recuperação real"
            style={styles.forgotPasswordWrap}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primaryDark, fontWeight: '700', textAlign: 'right' },
              ]}
            >
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>

          {/* Botão ENTRAR (#007ADE) */}
          <AccessibleButton
            title={carregando ? 'AUTENTICANDO...' : 'ENTRAR'}
            variant="primary"
            onPress={handleLogin}
            disabled={carregando}
            accessibilityHint="Valida os dados e acessa o aplicativo Equalis"
            style={{ marginTop: 4, backgroundColor: colors.primary }}
          />

          {/* Botão Criar uma nova conta */}
          <TouchableOpacity
            onPress={() => navigate('OPCOES_CADASTRO')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Criar uma nova conta"
            style={styles.createAccountBtn}
          >
            <Text
              style={[
                typography.labelLarge,
                { color: colors.primaryDark, fontWeight: '800', textAlign: 'center' },
              ]}
            >
              Criar uma nova conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divisor "ou entre com" do Figma */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 12 }]}>
            ou entre com
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
        </View>

        {/* Botões de Login Social (Figma: Google, Apple, Gov.br) */}
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('Google')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Entrar com conta Google"
            style={[
              styles.socialButton,
              { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSoft },
            ]}
          >
            <Text style={[typography.caption, { fontWeight: '700', color: colors.textPrimary }]}>
              Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('Apple')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Entrar com conta Apple"
            style={[
              styles.socialButton,
              { borderColor: colors.cardBorder, backgroundColor: colors.surfaceSoft },
            ]}
          >
            <Text style={[typography.caption, { fontWeight: '700', color: colors.textPrimary }]}>
              Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('Gov.br')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Entrar com conta Gov.br (Identidade Digital Cidadã)"
            style={[
              styles.socialButton,
              { borderColor: colors.primaryDark, backgroundColor: colors.surfaceTint },
            ]}
          >
            <Text style={[typography.caption, { fontWeight: '700', color: colors.primaryDark }]}>
              Gov.br
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ilustração Oficial do Figma na parte inferior: Job hunt-rafiki 1 (#124:376) */}
        <View style={styles.illustrationContainer}>
          <Image
            source={FIGMA_ASSETS.jobHuntRafiki}
            style={{ width: '100%', height: 190 }}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ilustração oficial do Equalis mostrando busca de vagas e oportunidades profissionais inclusivas"
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
    flexGrow: 1,
    paddingBottom: 48,
  },
  titleBlock: {
    marginVertical: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 12,
  },
  formSection: {
    gap: 4,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginBottom: 8,
  },
  createAccountBtn: {
    paddingVertical: 12,
    marginTop: 6,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 10,
    gap: 6,
    minHeight: 46,
  },
  socialEmoji: {
    fontSize: 18,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
});
