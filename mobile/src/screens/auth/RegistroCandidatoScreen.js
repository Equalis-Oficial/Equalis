/**
 * RegistroCandidatoScreen — Equalis Mobile
 * Baseado no frame "REGISTRO CANDIDATO" (#77:83) do Figma (`04_REGISTRO_CANDIDATO.png`) + WCAG 2.2 AAA.
 *
 * Características:
 * - Ilustração oficial do Figma `FIGMA_ASSETS.jobHuntRafiki` na base da tela.
 * - Labels fixos e visíveis acima de cada campo (WCAG 3.3.2).
 * - Máscara e validação algorítmica de CPF (11 dígitos, verificação real de dígitos verificadores).
 * - Validação de formato de e-mail e correspondência de senhas.
 * - Integração com `registrarCandidato({ nome, email, cpf, area_atuacao, senha })` persistindo no MySQL.
 * - Link destacado "ACESSE OS TERMOS AQUI".
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleInput from '../../components/common/AccessibleInput';
import AccessibleButton from '../../components/common/AccessibleButton';
import AccessibleCheckbox from '../../components/common/AccessibleCheckbox';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import {
  formatarCPF,
  validarCPF,
  validarEmail,
} from '../../utils/validators';

export default function RegistroCandidatoScreen() {
  const { theme, speak } = useAccessibility();
  const {
    navigate,
    goBack,
    registrarCandidato,
  } = useAuthAndData();
  const { colors, typography, spacing } = theme;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [erros, setErros] = useState({});
  const [feedbackGeral, setFeedbackGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  const audioSummary =
    'Cadastro de Candidato no Equalis. Preencha seu nome completo, e-mail, CPF, área de atuação e senha para criar sua conta inclusiva.';

  const handleCpfChange = (texto) => {
    const mascarado = formatarCPF(texto);
    setCpf(mascarado);
    if (erros.cpf) setErros((prev) => ({ ...prev, cpf: '' }));
  };

  const handleRegistrar = async () => {
    const novosErros = {};

    if (!nome.trim() || nome.trim().length < 3) {
      novosErros.nome = 'Digite seu nome completo (mínimo de 3 letras).';
    }

    if (!email.trim()) {
      novosErros.email = 'Informe seu e-mail.';
    } else if (!validarEmail(email)) {
      novosErros.email = 'E-mail inválido. Utilize o formato seuemail@dominio.com.';
    }

    if (!cpf.trim()) {
      novosErros.cpf = 'Informe seu CPF.';
    } else if (!validarCPF(cpf)) {
      novosErros.cpf = 'CPF inválido. Verifique os números digitados.';
    }

    if (!senha.trim()) {
      novosErros.senha = 'Crie uma senha de acesso.';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve conter no mínimo 6 caracteres.';
    }

    if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas digitadas não coincidem.';
    }

    if (!aceitouTermos) {
      novosErros.termos = 'Você deve ler e aceitar os Termos de Uso e LGPD para continuar.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      const primeiroErro = Object.values(novosErros)[0];
      setFeedbackGeral(primeiroErro);
      speak(`Atenção: ${primeiroErro}`);
      return;
    }

    setErros({});
    setFeedbackGeral('');
    setCarregando(true);
    speak('Gravando cadastro no servidor...');

    try {
      await registrarCandidato({
        nome: nome.trim(),
        email: email.trim(),
        cpf: cpf.trim(),
        area_atuacao: areaAtuacao.trim() || 'Geral',
        senha,
      });

      speak('Cadastro inicial gravado com sucesso! Agora, selecione sua deficiência.');
      navigate('ESCOLHA_DEFICIENCIA');
    } catch (err) {
      const msg = err.message || 'Falha ao salvar no servidor. Verifique a conexão.';
      setFeedbackGeral(msg);
      speak(`Atenção: ${msg}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Equalis"
        showBack={true}
        onBack={() => goBack('OPCOES_CADASTRO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
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
            Crie sua conta
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
            Preencha todos os campos para criar sua conta de Candidato PcD
          </Text>
        </View>

        {feedbackGeral ? (
          <View
            accessible={true}
            accessibilityLiveRegion="assertive"
            style={[
              styles.errorBanner,
              { backgroundColor: '#FDE8E8', borderColor: colors.danger },
            ]}
          >
            <Text style={[typography.bodyMedium, { color: colors.danger, fontWeight: '700' }]}>
              ⚠️ {feedbackGeral}
            </Text>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <AccessibleInput
            label="Nome completo"
            value={nome}
            onChangeText={(txt) => {
              setNome(txt);
              if (erros.nome) setErros((prev) => ({ ...prev, nome: '' }));
            }}
            placeholder="Digite seu nome completo"
            autoCapitalize="words"
            required={true}
            error={erros.nome}
            accessibilityHint="Digite seu nome e sobrenome"
          />

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
            accessibilityHint="Digite um e-mail válido para contato e login"
          />

          <AccessibleInput
            label="CPF"
            value={cpf}
            onChangeText={handleCpfChange}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
            required={true}
            error={erros.cpf}
            accessibilityHint="Digite os 11 dígitos do seu CPF"
          />

          <AccessibleInput
            label="Área de Atuação ou Interesse"
            value={areaAtuacao}
            onChangeText={setAreaAtuacao}
            placeholder="ex: Administrativo, Atendimento, TI, Marketing"
            accessibilityHint="Área profissional principal em que deseja atuar"
          />

          <AccessibleInput
            label="Senha"
            value={senha}
            onChangeText={(txt) => {
              setSenha(txt);
              if (erros.senha) setErros((prev) => ({ ...prev, senha: '' }));
            }}
            placeholder="Crie sua senha (mínimo 6 dígitos)"
            secureTextEntry={true}
            required={true}
            error={erros.senha}
            accessibilityHint="Crie uma senha de no mínimo 6 caracteres"
          />

          <AccessibleInput
            label="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={(txt) => {
              setConfirmarSenha(txt);
              if (erros.confirmarSenha) {
                setErros((prev) => ({ ...prev, confirmarSenha: '' }));
              }
            }}
            placeholder="Repita sua senha"
            secureTextEntry={true}
            required={true}
            error={erros.confirmarSenha}
            accessibilityHint="Repita a mesma senha digitada no campo anterior"
          />

          {/* Link do Figma: ACESSE OS TERMOS AQUI (#483:298) */}
          <TouchableOpacity
            onPress={() => navigate('TERMOS')}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Acesse os Termos de Uso e Política de Privacidade de Saúde e LGPD aqui"
            style={styles.termsLinkWrap}
          >
            <Text
              style={[
                typography.labelLarge,
                {
                  color: colors.danger,
                  fontWeight: '800',
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                },
              ]}
            >
              ACESSE OS TERMOS AQUI
            </Text>
          </TouchableOpacity>

          {/* Checkbox de Aceite dos Termos */}
          <AccessibleCheckbox
            label="Li e concordo com os Termos de Uso e a Política de Privacidade PcD"
            checked={aceitouTermos}
            onToggle={() => {
              const novo = !aceitouTermos;
              setAceitouTermos(novo);
              if (novo && erros.termos) {
                setErros((prev) => ({ ...prev, termos: '' }));
              }
            }}
            accessibilityHint="Marque esta caixa para confirmar que concorda com os termos"
          />
          {erros.termos ? (
            <Text style={[typography.caption, { color: colors.danger, marginLeft: 8 }]}>
              {erros.termos}
            </Text>
          ) : null}

          {/* Botão REGISTRAR */}
          <AccessibleButton
            title={carregando ? 'GRAVANDO...' : 'REGISTRAR'}
            variant="primary"
            onPress={handleRegistrar}
            disabled={carregando}
            accessibilityHint="Conclui os dados básicos e avança para a seleção de deficiência"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Rodapé: Já possui conta */}
        <View style={styles.footerRow}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Já tem uma conta cadastrada?
          </Text>
          <TouchableOpacity
            onPress={() => navigate('LOGIN')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Já possuo uma conta, ir para o Login"
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
          >
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.primaryDark, fontWeight: '800', textDecorationLine: 'underline' },
              ]}
            >
              Entrar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ilustração Oficial do Figma na base da tela: Job hunt-rafiki 1 (#124:376 / 04_REGISTRO_CANDIDATO.png) */}
        <View style={styles.illustrationContainer}>
          <Image
            source={FIGMA_ASSETS.jobHuntRafiki}
            style={{ width: '100%', height: 165 }}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ilustração oficial do Equalis com profissional PcD explorando oportunidades de emprego"
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
  errorBanner: {
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 12,
  },
  formSection: {
    gap: 4,
  },
  termsLinkWrap: {
    paddingVertical: 8,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
});
