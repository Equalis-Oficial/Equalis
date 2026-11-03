/**
 * RegistroEmpresaScreen — Equalis Mobile
 * Baseado no frame "REGISTRO EMPRESA" (#355:269) do Figma (`06_REGISTRO_EMPRESA.png`) + WCAG 2.2 AAA.
 *
 * Características:
 * - Ilustração oficial do Figma `FIGMA_ASSETS.jobHuntRafiki` na base da tela.
 * - Labels fixos e visíveis acima de cada campo (WCAG 3.3.2).
 * - Máscara e validação algorítmica de CNPJ (14 dígitos com cálculo real dos dígitos verificadores).
 * - Persistência completa no MySQL via `registrarEmpresa(...)`.
 * - Navegação para 'TERMOS'.
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
  formatarCNPJ,
  validarCNPJ,
  validarEmail,
} from '../../utils/validators';

export default function RegistroEmpresaScreen() {
  const { theme, speak } = useAccessibility();
  const { navigate, goBack, registrarEmpresa } = useAuthAndData();
  const { colors, typography, spacing } = theme;

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [emailCorporativo, setEmailCorporativo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [descricao, setDescricao] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [erros, setErros] = useState({});
  const [feedbackGeral, setFeedbackGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  const audioSummary =
    'Cadastro de Empresa Inclusiva no Equalis. Preencha o nome da empresa ou razão social, CNPJ, e-mail corporativo, senha, confirmação de senha e descrição das ações inclusivas da sua organização.';

  const handleCnpjChange = (texto) => {
    const mascarado = formatarCNPJ(texto);
    setCnpj(mascarado);
    if (erros.cnpj) setErros((prev) => ({ ...prev, cnpj: '' }));
  };

  const handleRegistrar = async () => {
    const novosErros = {};

    if (!nomeEmpresa.trim() || nomeEmpresa.trim().length < 2) {
      novosErros.nomeEmpresa = 'Informe o nome da empresa ou razão social.';
    }

    if (!cnpj.trim()) {
      novosErros.cnpj = 'Informe o CNPJ da empresa.';
    } else if (!validarCNPJ(cnpj)) {
      novosErros.cnpj = 'CNPJ inválido. Verifique os números digitados.';
    }

    if (!emailCorporativo.trim()) {
      novosErros.emailCorporativo = 'Informe o e-mail corporativo ou de RH.';
    } else if (!validarEmail(emailCorporativo)) {
      novosErros.emailCorporativo = 'E-mail inválido. Utilize o formato rh@empresa.com.br.';
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
      novosErros.termos = 'É necessário aceitar os Termos e Políticas de Recrutamento Inclusivo.';
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
    speak('Gravando cadastro da empresa no servidor...');

    try {
      await registrarEmpresa({
        nome_fantasia: nomeEmpresa.trim(),
        cnpj: cnpj.trim(),
        email: emailCorporativo.trim(),
        descricao:
          descricao.trim() ||
          'Empresa comprometida com a inclusão de profissionais PcD e conformidade com a Lei de Cotas nº 8.213/91.',
        senha,
      });

      speak('Cadastro de empresa gravado com sucesso! Seja bem-vinda ao Equalis.');
      navigate('PUBLICAR_VAGA_EMPRESA');
    } catch (err) {
      const msg = err.message || 'Falha ao salvar empresa no servidor. Verifique a conexão.';
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
            Cadastre sua Empresa
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
            Preencha todos os campos para criar a conta institucional da sua organização
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
            label="Nome da empresa"
            value={nomeEmpresa}
            onChangeText={(txt) => {
              setNomeEmpresa(txt);
              if (erros.nomeEmpresa) setErros((prev) => ({ ...prev, nomeEmpresa: '' }));
            }}
            placeholder="Razão Social ou Nome Fantasia"
            autoCapitalize="words"
            required={true}
            error={erros.nomeEmpresa}
            accessibilityHint="Digite o nome oficial da organização"
          />

          <AccessibleInput
            label="CNPJ"
            value={cnpj}
            onChangeText={handleCnpjChange}
            placeholder="00.000.000/0000-00"
            keyboardType="numeric"
            maxLength={18}
            required={true}
            error={erros.cnpj}
            accessibilityHint="Digite os 14 números do CNPJ da sua empresa"
          />

          <AccessibleInput
            label="E-mail corporativo"
            value={emailCorporativo}
            onChangeText={(txt) => {
              setEmailCorporativo(txt);
              if (erros.emailCorporativo) setErros((prev) => ({ ...prev, emailCorporativo: '' }));
            }}
            placeholder="ex: rh@suaempresa.com.br"
            keyboardType="email-address"
            autoCapitalize="none"
            required={true}
            error={erros.emailCorporativo}
            accessibilityHint="E-mail utilizado para notificações de candidaturas e login"
          />

          <AccessibleInput
            label="Senha"
            value={senha}
            onChangeText={(txt) => {
              setSenha(txt);
              if (erros.senha) setErros((prev) => ({ ...prev, senha: '' }));
            }}
            placeholder="Crie sua senha corporativa (mínimo 6 dígitos)"
            secureTextEntry={true}
            required={true}
            error={erros.senha}
            accessibilityHint="Crie uma senha de acesso para a equipe de RH"
          />

          <AccessibleInput
            label="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={(txt) => {
              setConfirmarSenha(txt);
              if (erros.confirmarSenha) setErros((prev) => ({ ...prev, confirmarSenha: '' }));
            }}
            placeholder="Repita sua senha corporativa"
            secureTextEntry={true}
            required={true}
            error={erros.confirmarSenha}
            accessibilityHint="Repita a mesma senha do campo anterior"
          />

          <AccessibleInput
            label="Descrição Institucional e Compromisso Inclusivo"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Conte brevemente sobre o ambiente de trabalho, adaptações físicas e culturais da sua empresa."
            multiline={true}
            numberOfLines={3}
            maxLength={300}
            accessibilityHint="Breve apresentação institucional visível para os candidatos PcD"
          />

          {/* Link para Termos */}
          <TouchableOpacity
            onPress={() => navigate('TERMOS')}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Ler termos de conformidade e LGPD"
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
            label="Concordo com os Termos de Uso, Política de Proteção a Dados PcD (LGPD) e Diretrizes de Acessibilidade"
            checked={aceitouTermos}
            onToggle={() => {
              const novo = !aceitouTermos;
              setAceitouTermos(novo);
              if (novo && erros.termos) {
                setErros((prev) => ({ ...prev, termos: '' }));
              }
            }}
            accessibilityHint="Marque esta caixa para aceitar os termos de empresa inclusiva"
          />
          {erros.termos ? (
            <Text style={[typography.caption, { color: colors.danger, marginLeft: 8 }]}>
              {erros.termos}
            </Text>
          ) : null}

          {/* Botão REGISTRAR */}
          <AccessibleButton
            title={carregando ? 'GRAVANDO...' : 'REGISTRAR EMPRESA'}
            variant="primary"
            onPress={handleRegistrar}
            disabled={carregando}
            accessibilityHint="Finaliza o cadastro corporativo e abre os termos"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Rodapé: Já possui conta */}
        <View style={styles.footerRow}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Sua organização já possui cadastro?
          </Text>
          <TouchableOpacity
            onPress={() => navigate('LOGIN')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Já possuo uma conta corporativa, ir para o Login"
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

        {/* Ilustração Oficial do Figma na base da tela: Job hunt-rafiki 1 (#355:286 / 06_REGISTRO_EMPRESA.png) */}
        <View style={styles.illustrationContainer}>
          <Image
            source={FIGMA_ASSETS.jobHuntRafiki}
            style={{ width: '100%', height: 175 }}
            resizeMode="contain"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ilustração oficial do Equalis com recrutador contratando talentos com deficiência"
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
