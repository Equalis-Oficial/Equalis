import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleInput from '../../components/common/AccessibleInput';
import AccessibleButton from '../../components/common/AccessibleButton';

export default function AdicionarCargoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { adicionarExperiencia, candidatoPerfil, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [compartilharRede, setCompartilharRede] = useState(true);
  const [cargo, setCargo] = useState('');
  const [organizacao, setOrganizacao] = useState('');
  const [tipoEmprego, setTipoEmprego] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [tipoLocalidade, setTipoLocalidade] = useState('');
  const [mesInicio, setMesInicio] = useState('');
  const [anoInicio, setAnoInicio] = useState('');
  const [descricao, setDescricao] = useState('');
  const [competencias, setCompetencias] = useState([]);
  const [novaCompetencia, setNovaCompetencia] = useState('');
  const [erros, setErros] = useState({});

  const TIPOS_EMPREGO = ['Integral', 'Meio período', 'Estágio', 'Contrato / Freelance'];
  const TIPOS_LOCALIDADE = ['Presencial', 'Híbrido', 'Remoto / Home-Office'];

  const handleAddCompetencia = () => {
    const limpo = novaCompetencia.trim();
    if (!limpo) return;
    if (competencias.includes(limpo)) {
      Alert.alert('Aviso', 'Competência já adicionada.');
      return;
    }
    setCompetencias([...competencias, limpo]);
    setNovaCompetencia('');
  };

  const handleRemoveCompetencia = (comp) => {
    setCompetencias(competencias.filter((c) => c !== comp));
  };

  const validar = () => {
    const novosErros = {};
    if (!cargo.trim()) {
      novosErros.cargo = 'Informe o título do Cargo.';
    }
    if (!organizacao.trim()) {
      novosErros.organizacao = 'Informe a Organização ou Empresa.';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha os campos obrigatórios marcados com *');
      return;
    }

    adicionarExperiencia({
      cargo: cargo.trim(),
      organizacao: organizacao.trim(),
      tipo_emprego: tipoEmprego,
      localidade: localidade.trim(),
      tipo_localidade: tipoLocalidade,
      mes_inicio: mesInicio,
      ano_inicio: anoInicio,
      descricao: descricao.trim(),
      competencias,
      compartilharRede,
    });

    speak('Cargo profissional adicionado com sucesso!');
    Alert.alert(
      'Experiência Adicionada',
      'Seu novo cargo foi registrado com sucesso!',
      [{ text: 'OK', onPress: () => goBack('PERFIL_CANDIDATO') }]
    );
  };

  const audioSummary =
    'Tela de cadastro de Cargo e Experiência. Preencha Cargo, Organização, tipo de emprego, localidade, tipo de localidade, data de início e competências.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Adicionar Cargo"
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário de cadastro de cargo e experiência"
      >
        {/* Cabeçalho Visual com Avatar Oficial (#21_ADICIONAR_CARGO.png) */}
        <View style={styles.headerProfileBadge}>
          <Image
            source={FIGMA_ASSETS.avatarPandaRaposa}
            style={styles.headerAvatarImg}
            accessible={true}
            accessibilityLabel="Avatar do candidato"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              {candidatoPerfil?.nome || 'Candidato'}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Registrando nova experiência profissional
            </Text>
          </View>
        </View>

        {/* Toggle Compartilhar com a Rede */}
        <View
          style={[
            styles.notifyNetworkCard,
            {
              backgroundColor: 'rgba(0, 122, 221, 0.1)',
              borderColor: colors.primary,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.notifyTextCol}>
            <Text
              style={[
                typography.labelLarge,
                { color: colors.textPrimary, fontWeight: '700' },
              ]}
              accessibilityRole="header"
            >
              Compartilhar com sua rede
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
              ]}
            >
              Notifique seus contatos sobre este novo marco em sua carreira inclusiva.
            </Text>
          </View>

          <View style={styles.switchCol}>
            <Text
              style={[
                typography.caption,
                {
                  color: compartilharRede ? colors.primaryDark : colors.textMuted,
                  fontWeight: '700',
                  marginBottom: 4,
                },
              ]}
            >
              {compartilharRede ? 'Ativado' : 'Desativado'}
            </Text>
            <Switch
              value={compartilharRede}
              onValueChange={setCompartilharRede}
              trackColor={{ false: '#C2C2C2', true: colors.primary }}
              thumbColor={compartilharRede ? colors.primaryDark : '#F4F3F4'}
              accessible={true}
              accessibilityLabel={`Compartilhar com a rede: ${compartilharRede ? 'ativado' : 'desativado'}`}
            />
          </View>
        </View>

        <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 8 }]}>
          * Indica item obrigatório
        </Text>

        <AccessibleInput
          label="Cargo"
          value={cargo}
          onChangeText={setCargo}
          placeholder="Ex: Assistente de Marketing e Relacionamento"
          required={true}
          error={erros.cargo}
        />

        <AccessibleInput
          label="Organização / Empresa"
          value={organizacao}
          onChangeText={setOrganizacao}
          placeholder="Ex: Centro Universitário UNICEPLAC"
          required={true}
          error={erros.organizacao}
        />

        {/* Tipo de Emprego Selector */}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.textPrimary, marginTop: 10, marginBottom: 8 },
          ]}
        >
          Tipo de Emprego
        </Text>
        <View style={styles.pillsWrap}>
          {TIPOS_EMPREGO.map((item) => {
            const isSelected = tipoEmprego === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setTipoEmprego(item)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Tipo de emprego: ${item}`}
                style={[
                  styles.selectorPill,
                  {
                    backgroundColor: isSelected ? colors.primaryDark : colors.inputBg,
                    borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AccessibleInput
          label="Localidade"
          value={localidade}
          onChangeText={setLocalidade}
          placeholder="Ex: São Paulo, Guarulhos, Brasil"
        />

        {/* Tipo de Localidade */}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.textPrimary, marginTop: 10, marginBottom: 8 },
          ]}
        >
          Tipo de Localidade
        </Text>
        <View style={styles.pillsWrap}>
          {TIPOS_LOCALIDADE.map((item) => {
            const isSelected = tipoLocalidade === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setTipoLocalidade(item)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Tipo de localidade: ${item}`}
                style={[
                  styles.selectorPill,
                  {
                    backgroundColor: isSelected ? colors.primaryDark : colors.inputBg,
                    borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Data de Início */}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.textPrimary, marginTop: 10, marginBottom: 6 },
          ]}
        >
          Data de início
        </Text>
        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <AccessibleInput
              label="Mês"
              value={mesInicio}
              onChangeText={setMesInicio}
              placeholder="Março"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AccessibleInput
              label="Ano"
              value={anoInicio}
              onChangeText={setAnoInicio}
              placeholder="2024"
              keyboardType="numeric"
            />
          </View>
        </View>

        <AccessibleInput
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Conte sobre suas principais realizações, ferramentas e adaptações de acessibilidade utilizadas..."
          multiline={true}
          numberOfLines={4}
        />

        {/* Competências Utilizadas */}
        <View style={styles.competenciasSection}>
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, marginBottom: 6 },
            ]}
          >
            Competências desenvolvidas
          </Text>

          <View style={styles.addChipRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AccessibleInput
                value={novaCompetencia}
                onChangeText={setNovaCompetencia}
                placeholder="Ex: Atendimento ao Cliente..."
              />
            </View>
            <TouchableOpacity
              onPress={handleAddCompetencia}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar competência"
              style={[
                styles.addChipBtn,
                { backgroundColor: colors.primaryDark, borderRadius: radius.md },
              ]}
            >
              <Text style={styles.addChipBtnText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsContainer}>
            {competencias.map((comp, idx) => (
              <View
                key={idx}
                style={[
                  styles.chipItem,
                  { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                ]}
              >
                <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '600' }]}>
                  {comp}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveCompetencia(comp)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${comp}`}
                  style={styles.chipRemoveBtn}
                >
                  <Text style={[styles.chipRemoveText, { color: colors.danger }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Botão Salvar (#405:445 e #405:448) */}
        <View style={styles.saveWrap}>
          <AccessibleButton
            title="Salvar"
            onPress={handleSalvar}
            variant="primaryDark"
            accessibilityLabel="Salvar cargo no perfil"
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
  headerProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFF',
    marginBottom: 14,
  },
  headerAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notifyNetworkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  notifyTextCol: {
    flex: 1,
    marginRight: 12,
  },
  switchCol: {
    alignItems: 'center',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectorPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  competenciasSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  addChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addChipBtn: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addChipBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipRemoveBtn: {
    marginLeft: 6,
  },
  chipRemoveText: {
    fontWeight: '700',
    fontSize: 12,
  },
  saveWrap: {
    marginTop: 12,
  },
});
