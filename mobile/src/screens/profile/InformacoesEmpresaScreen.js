import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleInput from '../../components/common/AccessibleInput';
import AccessibleButton from '../../components/common/AccessibleButton';
import BottomTabBar from '../../components/common/BottomTabBar';
import {
  validarSite,
  validarTelefone,
  validarEmail,
  formatarTelefone,
  MENSAGENS,
} from '../../utils/validators';

export default function InformacoesEmpresaScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { empresaPerfil, atualizarEmpresaPerfil, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  // Estado do formulário inicializado com dados do perfil corporativo
  const [nomeFantasia, setNomeFantasia] = useState(empresaPerfil?.nome_fantasia || '');
  const [setor, setSetor] = useState(
    empresaPerfil?.setor || empresaPerfil?.area_atuacao || ''
  );
  const [localizacao, setLocalizacao] = useState(
    empresaPerfil?.localizacao ||
      (empresaPerfil?.cidade
        ? `${empresaPerfil.cidade} - ${empresaPerfil.estado || 'DF'}`
        : '')
  );
  const [site, setSite] = useState(empresaPerfil?.site || '');
  const [email, setEmail] = useState(empresaPerfil?.email || '');
  const [telefone, setTelefone] = useState(
    formatarTelefone(empresaPerfil?.telefone || '')
  );
  const [descricao, setDescricao] = useState(empresaPerfil?.descricao || '');

  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);

  const audioSummary =
    'Formulário de Informações da Empresa. Preencha os dados institucionais como nome, setor corporativo, localização, site oficial, e-mail, telefone corporativo e descrição da organização.';

  const handleTelefoneChange = (text) => {
    setTelefone(formatarTelefone(text));
    if (errors.telefone) {
      setErrors((prev) => {
        const { telefone: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSalvar = async () => {
    const novosErros = {};

    if (!nomeFantasia.trim()) {
      novosErros.nomeFantasia = MENSAGENS.MSG_001;
    }
    if (!setor.trim()) {
      novosErros.setor = MENSAGENS.MSG_001;
    }
    if (!localizacao.trim()) {
      novosErros.localizacao = MENSAGENS.MSG_001;
    }
    if (site.trim() && !validarSite(site.trim())) {
      novosErros.site = MENSAGENS.MSG_012;
    }
    if (email.trim() && !validarEmail(email.trim())) {
      novosErros.email = MENSAGENS.MSG_002;
    }
    if (telefone.trim() && !validarTelefone(telefone.trim())) {
      novosErros.telefone = MENSAGENS.MSG_013;
    }

    if (Object.keys(novosErros).length > 0) {
      setErrors(novosErros);
      speak('Atenção: Por favor corrija os campos com erros antes de prosseguir.');
      return;
    }

    setErrors({});
    setSalvando(true);

    try {
      const payload = {
        nome_fantasia: nomeFantasia.trim(),
        setor: setor.trim(),
        area_atuacao: setor.trim(),
        localizacao: localizacao.trim(),
        site: site.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        descricao: descricao.trim(),
      };

      await atualizarEmpresaPerfil(payload);
      speak('Informações institucionais da empresa salvas com sucesso!');

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        alert('Informações da empresa atualizadas com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Informações da empresa atualizadas com sucesso!');
      }

      goBack('CONFIGURACOES_PERFIL');
    } catch (err) {
      speak('Erro ao salvar as informações da empresa. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <AccessibleHeader
        title="Informações da Empresa"
        showBack={true}
        onBack={() => goBack('CONFIGURACOES_PERFIL')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário de cadastro das informações institucionais da empresa"
      >
        <View style={styles.introBlock}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                fontSize: isAccessibleMode ? 26 : 22,
              },
            ]}
          >
            Dados Institucionais
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textMuted, marginTop: 6, lineHeight: 22 },
            ]}
          >
            Mantenha as informações da sua organização atualizadas para que candidatos PcD conheçam seu compromisso com a inclusão e acessibilidade.
          </Text>
        </View>

        <View style={styles.formCard}>
          <AccessibleInput
            label="Razão Social / Nome Fantasia"
            required={true}
            value={nomeFantasia}
            onChangeText={(text) => {
              setNomeFantasia(text);
              if (errors.nomeFantasia) {
                setErrors((prev) => {
                  const { nomeFantasia: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Ex: Centro Universitário UNICEPLAC"
            error={errors.nomeFantasia}
            accessibilityHint="Informe o nome fantasia ou razão social da empresa"
          />

          <AccessibleInput
            label="Setor Corporativo"
            required={true}
            value={setor}
            onChangeText={(text) => {
              setSetor(text);
              if (errors.setor) {
                setErrors((prev) => {
                  const { setor: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Ex: Ensino Superior e Saúde, Tecnologia, etc."
            error={errors.setor}
            accessibilityHint="Informe a área de atuação da empresa"
          />

          <AccessibleInput
            label="Localização (Cidade - UF)"
            required={true}
            value={localizacao}
            onChangeText={(text) => {
              setLocalizacao(text);
              if (errors.localizacao) {
                setErrors((prev) => {
                  const { localizacao: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Ex: Brasília - DF ou Gama - DF"
            error={errors.localizacao}
            accessibilityHint="Informe a cidade e UF da sede corporativa"
          />

          <AccessibleInput
            label="Site Institucional"
            value={site}
            onChangeText={(text) => {
              setSite(text);
              if (errors.site) {
                setErrors((prev) => {
                  const { site: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Ex: https://www.uniceplac.edu.br ou www.empresa.com"
            keyboardType="url"
            autoCapitalize="none"
            error={errors.site}
            helperText="Formato válido com ou sem protocolo (ex. www.empresa.com.br)"
            accessibilityHint="Endereço eletrônico do portal institucional da empresa"
          />

          <AccessibleInput
            label="E-mail de Contato Corporativo"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors((prev) => {
                  const { email: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Ex: contato@uniceplac.edu.br"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            helperText="E-mail institucional com domínio corporativo"
            accessibilityHint="Canal de e-mail corporativo para contato e processos seletivos"
          />

          <AccessibleInput
            label="Telefone Institucional"
            value={telefone}
            onChangeText={handleTelefoneChange}
            placeholder="Ex: (61) 3035-3900 ou (61) 98765-4321"
            keyboardType="phone-pad"
            error={errors.telefone}
            helperText="DDD obrigatório (10 ou 11 dígitos)"
            accessibilityHint="Telefone fixo ou celular da organização"
          />

          <AccessibleInput
            label="Descrição Institucional e Inclusão"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Apresente sua organização, trajetória e práticas de inclusão corporativa para profissionais com deficiência..."
            multiline={true}
            numberOfLines={5}
            maxLength={2600}
            accessibilityHint="Texto institucional descritivo com limite de 2.600 caracteres"
          />
        </View>

        <View style={styles.actionsBlock}>
          <AccessibleButton
            title={salvando ? 'Salvando...' : 'Salvar Informações'}
            onPress={handleSalvar}
            variant="primaryDark"
            disabled={salvando}
            accessibilityLabel="Salvar Informações da Empresa"
            accessibilityHint="Toque duas vezes para validar e gravar as informações da empresa no sistema"
          />

          <View style={{ height: 12 }} />

          <AccessibleButton
            title="Cancelar"
            onPress={() => goBack('ADICIONAR_SECAO')}
            variant="outline"
            accessibilityLabel="Cancelar edição de informações"
            accessibilityHint="Toque duas vezes para cancelar e retornar ao menu anterior"
          />
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>

      <BottomTabBar activeTab="HOME" />
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
  introBlock: {
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  actionsBlock: {
    marginTop: 8,
  },
});
