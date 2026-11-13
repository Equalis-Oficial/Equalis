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

export default function AdicionarFormacaoScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { adicionarFormacao, candidatoPerfil, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [notificarRede, setNotificarRede] = useState(true);
  const [instituicao, setInstituicao] = useState('');
  const [diploma, setDiploma] = useState('');
  const [areaEstudo, setAreaEstudo] = useState('');
  const [mesInicio, setMesInicio] = useState('');
  const [anoInicio, setAnoInicio] = useState('');
  const [mesTermino, setMesTermino] = useState('');
  const [anoTermino, setAnoTermino] = useState('');
  const [atividadesGrupos, setAtividadesGrupos] = useState('');
  const [descricao, setDescricao] = useState('');
  const [competencias, setCompetencias] = useState([]);
  const [novaCompetencia, setNovaCompetencia] = useState('');
  const [erros, setErros] = useState({});

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
    if (!instituicao.trim()) {
      novosErros.instituicao = 'Informe a Instituição de Ensino.';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha os campos obrigatórios marcados com *');
      return;
    }

    adicionarFormacao({
      instituicao: instituicao.trim(),
      diploma: diploma.trim() || 'Graduação / Tecnólogo',
      area_estudo: areaEstudo.trim() || 'Geral',
      mes_inicio: mesInicio,
      ano_inicio: anoInicio,
      mes_termino: mesTermino,
      ano_termino: anoTermino,
      atividades_grupos: atividadesGrupos.trim(),
      descricao: descricao.trim(),
      competencias,
      notificarRede,
    });

    speak('Formação acadêmica adicionada com sucesso!');
    Alert.alert(
      'Formação Adicionada',
      'Sua formação acadêmica foi incluída com sucesso no seu perfil!',
      [{ text: 'OK', onPress: () => goBack('PERFIL_CANDIDATO') }]
    );
  };

  const audioSummary =
    'Tela de cadastro de Formação Acadêmica. Preencha Instituição de Ensino, Diploma, Área de estudo, período de início e término e competências adquiridas.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Formação Acadêmica"
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário de cadastro de formação acadêmica"
      >
        {/* Cabeçalho Visual com Avatar Oficial e Informações (#20_ADICIONAR_FORMACAO.png) */}
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
              Adicionando nova formação ao currículo
            </Text>
          </View>
        </View>

        {/* Banner Notificar a Rede (#196:442 do Figma) */}
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
              Notificar a rede
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
              ]}
            >
              Ative para notificar sua rede sobre mudanças importantes no seu perfil (como nova formação acadêmica) e aniversário de empresa.
            </Text>
          </View>

          <View style={styles.switchCol}>
            <Text
              style={[
                typography.caption,
                {
                  color: notificarRede ? colors.primaryDark : colors.textMuted,
                  fontWeight: '700',
                  marginBottom: 4,
                },
              ]}
            >
              {notificarRede ? 'Ativado' : 'Desativado'}
            </Text>
            <Switch
              value={notificarRede}
              onValueChange={setNotificarRede}
              trackColor={{ false: '#C2C2C2', true: colors.primary }}
              thumbColor={notificarRede ? colors.primaryDark : '#F4F3F4'}
              accessible={true}
              accessibilityLabel={`Notificar a rede: atualmente ${notificarRede ? 'ativado' : 'desativado'}`}
            />
          </View>
        </View>

        <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 8 }]}>
          * Indica item obrigatório
        </Text>

        {/* Campos Principais do Figma */}
        <AccessibleInput
          label="Instituição de Ensino"
          value={instituicao}
          onChangeText={setInstituicao}
          placeholder="Ex: Nome da Instituição de Ensino"
          required={true}
          error={erros.instituicao}
        />

        <AccessibleInput
          label="Diploma"
          value={diploma}
          onChangeText={setDiploma}
          placeholder="Ex: Graduação, Tecnólogo, Bacharelado"
        />

        <AccessibleInput
          label="Área de estudo"
          value={areaEstudo}
          onChangeText={setAreaEstudo}
          placeholder="Ex: Marketing e Mídias Digitais"
        />

        {/* Período de Início */}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.textPrimary, marginTop: 8, marginBottom: 6 },
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
              placeholder="Fevereiro"
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

        {/* Período de Término */}
        <Text
          style={[
            typography.labelLarge,
            { color: colors.textPrimary, marginTop: 8, marginBottom: 6 },
          ]}
        >
          Data de término (ou prevista)
        </Text>
        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <AccessibleInput
              label="Mês"
              value={mesTermino}
              onChangeText={setMesTermino}
              placeholder="Dezembro"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AccessibleInput
              label="Ano"
              value={anoTermino}
              onChangeText={setAnoTermino}
              placeholder="2026"
              keyboardType="numeric"
            />
          </View>
        </View>

        <AccessibleInput
          label="Atividades e Grupos"
          value={atividadesGrupos}
          onChangeText={setAtividadesGrupos}
          placeholder="Ex: Núcleo de Acessibilidade e Inclusão (NICE), Grêmio Estudantil..."
          multiline={true}
          numberOfLines={3}
        />

        <AccessibleInput
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Conte sobre seus aprendizados, projetos práticos ou artigos desenvolvidos..."
          multiline={true}
          numberOfLines={3}
        />

        {/* Competências Adquiridas */}
        <View style={styles.competenciasSection}>
          <Text
            style={[
              typography.labelLarge,
              { color: colors.textPrimary, marginBottom: 6 },
            ]}
          >
            Competências
          </Text>

          <View style={styles.addChipRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AccessibleInput
                value={novaCompetencia}
                onChangeText={setNovaCompetencia}
                placeholder="Ex: Comunicação, Liderança..."
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

        {/* Botão Salvar (#195:388 e #365:436) */}
        <View style={styles.saveWrap}>
          <AccessibleButton
            title="Salvar"
            onPress={handleSalvar}
            variant="primaryDark"
            accessibilityLabel="Salvar formação acadêmica no perfil"
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
