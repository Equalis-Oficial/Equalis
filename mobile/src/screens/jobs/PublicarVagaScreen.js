import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleCheckbox from '../../components/common/AccessibleCheckbox';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

const DEFAULT_RECURSOS = [
  'Rampas e Elevador Acessível',
  'Piso Tátil e Sinalização em Braille',
  'Intérprete de Libras no Local',
  'Softwares Leitores de Tela (NVDA/JAWS)',
  'Mobiliário Ergonômico Regulável',
  'Horário e Jornada Flexível',
  'Ambiente Sensorialmente Adaptado (baixo ruído)',
];

const MODALIDADES = ['Presencial', 'Home-Office', 'Híbrido'];
const CATEGORIAS = ['Atendimento', 'Programador', 'Marketing', 'Home-Office', 'Administrativo'];

export default function PublicarVagaScreen() {
  const { theme, speak } = useAccessibility();
  const { publicarVaga, goBack, navigate, deficiencias, empresaPerfil } = useAuthAndData();
  const { colors, typography, radius } = theme;

  // Campos do Formulário conforme frame #328:224 do Figma
  const [cargo, setCargo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState('Presencial');
  const [localEmpresa, setLocalEmpresa] = useState('');
  const [requerimentos, setRequerimentos] = useState('');
  const [salario, setSalario] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [linkExterno, setLinkExterno] = useState('');
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [selectedRecursos, setSelectedRecursos] = useState([]);
  const [novoRecurso, setNovoRecurso] = useState('');
  const [midiaSelecionada, setMidiaSelecionada] = useState(false);

  // Erros e Modal de Sucesso
  const [errors, setErrors] = useState({});
  const [sucessoModal, setSucessoModal] = useState(false);

  const toggleDisability = (id) => {
    setSelectedDisabilities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleRecurso = (recurso) => {
    setSelectedRecursos((prev) =>
      prev.includes(recurso) ? prev.filter((r) => r !== recurso) : [...prev, recurso]
    );
  };

  const handleAddCustomRecurso = () => {
    if (novoRecurso.trim() && !selectedRecursos.includes(novoRecurso.trim())) {
      setSelectedRecursos((prev) => [...prev, novoRecurso.trim()]);
      setNovoRecurso('');
    }
  };

  const handlePublicar = () => {
    const novosErros = {};
    if (!cargo.trim()) novosErros.cargo = 'O campo Cargo é obrigatório.';
    if (!descricao.trim()) novosErros.descricao = 'Informe os detalhes da vaga.';
    if (!localEmpresa.trim()) novosErros.localEmpresa = 'Informe a cidade e UF da vaga.';
    if (!requerimentos.trim()) novosErros.requerimentos = 'Informe os requerimentos.';
    if (!salario.trim()) novosErros.salario = 'Informe a remuneração.';

    if (Object.keys(novosErros).length > 0) {
      setErrors(novosErros);
      speak('Atenção: Por favor preencha todos os campos obrigatórios marcados com asterisco.');
      return;
    }

    setErrors({});

    // Extrair cidade e estado
    const parts = (localEmpresa || '').split(',');
    const cidade = parts[0]?.trim() || 'Brasília';
    const estado = parts[1]?.trim() || 'DF';

    const dadosVaga = {
      empresa_nome: empresaPerfil?.nome_fantasia || 'Empresa Inclusiva',
      titulo: cargo,
      descricao,
      requerimentos,
      modalidade: modalidade || 'Presencial',
      cidade,
      estado,
      salario: parseFloat(salario.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
      categoria: categoria || 'Geral',
      carga_horaria: cargaHoraria || '6 horas',
      link_externo: linkExterno,
      acessibilidades_ids: selectedDisabilities,
      recursos_acessibilidade: selectedRecursos,
    };

    publicarVaga(dadosVaga);
    speak('Vaga publicada com sucesso no Equalis! Os candidatos PcD compatíveis já podem visualizá-la.');
    setSucessoModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* CABEÇALHO DO FIGMA (#328:224) */}
      <AccessibleHeader
        title="Publicar Vaga"
        showBack={true}
        onBack={() => goBack('EMPREGO')}
        audioSummary="Tela de publicação de oportunidade de emprego para empresas parceiras. Preencha cargo, descrição, localidade e recursos de acessibilidade da vaga."
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 16 }]}>
          Empresa contratante:{' '}
          <Text style={{ fontWeight: '700', color: colors.primaryDark }}>
            {empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'}
          </Text>
        </Text>

        {/* CAMPO: CARGO * (FIGMA #328:242 & #328:251) */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Cargo<Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TextInput
            value={cargo}
            onChangeText={(text) => {
              setCargo(text);
              if (errors.cargo) setErrors((prev) => ({ ...prev, cargo: null }));
            }}
            placeholder="Ex: Atendimento ao Cliente / Assistente Administrativo"
            placeholderTextColor={colors.textMuted}
            accessible={true}
            accessibilityLabel="Cargo da vaga, obrigatório"
            style={[
              styles.textInput,
              {
                borderColor: errors.cargo ? colors.danger : colors.cardBorder,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderRadius: radius.sm,
              },
            ]}
          />
          {errors.cargo ? <Text style={styles.errorText}>{errors.cargo}</Text> : null}
        </View>

        {/* CAMPO: MODALIDADE * */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Modalidade de Trabalho<Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <View style={styles.optionsRow}>
            {MODALIDADES.map((mod) => {
              const isSelected = modalidade === mod;
              return (
                <TouchableOpacity
                  key={mod}
                  onPress={() => setModalidade(mod)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel={`Modalidade ${mod}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isSelected ? colors.primaryDark : colors.surfaceSoft,
                      borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {mod}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CAMPO: INFORMAÇÕES SOBRE A VAGA, DETALHES * (FIGMA #328:247 & #328:253) */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithCounterRow}>
            <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
              Informações sobre a vaga, detalhes<Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {descricao.length} de 2.000
            </Text>
          </View>
          <TextInput
            value={descricao}
            onChangeText={(text) => {
              setDescricao(text);
              if (errors.descricao) setErrors((prev) => ({ ...prev, descricao: null }));
            }}
            placeholder="Informações sobre a vaga, rotina, ambiente inclusivo e adaptações já existentes no local..."
            placeholderTextColor={colors.textMuted}
            multiline={true}
            numberOfLines={4}
            maxLength={2000}
            accessible={true}
            accessibilityLabel="Informações sobre a vaga e detalhes, obrigatório"
            style={[
              styles.textArea,
              {
                borderColor: errors.descricao ? colors.danger : colors.cardBorder,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderRadius: radius.sm,
              },
            ]}
          />
          {errors.descricao ? <Text style={styles.errorText}>{errors.descricao}</Text> : null}
        </View>

        {/* CAMPO: LOCAL DA EMPRESA * (FIGMA #358:234 & #358:235) */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Local da Empresa<Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TextInput
            value={localEmpresa}
            onChangeText={(text) => {
              setLocalEmpresa(text);
              if (errors.localEmpresa) setErrors((prev) => ({ ...prev, localEmpresa: null }));
            }}
            placeholder="Cidade, UF (Ex: Brasília, DF)"
            placeholderTextColor={colors.textMuted}
            accessible={true}
            accessibilityLabel="Local da empresa, cidade e UF, obrigatório"
            style={[
              styles.textInput,
              {
                borderColor: errors.localEmpresa ? colors.danger : colors.cardBorder,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderRadius: radius.sm,
              },
            ]}
          />
          {errors.localEmpresa ? <Text style={styles.errorText}>{errors.localEmpresa}</Text> : null}
        </View>

        {/* CAMPO: REQUERIMENTOS * (FIGMA #358:238 & #358:237) */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Requerimentos<Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <TextInput
            value={requerimentos}
            onChangeText={(text) => {
              setRequerimentos(text);
              if (errors.requerimentos) setErrors((prev) => ({ ...prev, requerimentos: null }));
            }}
            placeholder="Requisitos de formação, experiência, habilidades e compatibilidade inclusiva"
            placeholderTextColor={colors.textMuted}
            multiline={true}
            numberOfLines={3}
            accessible={true}
            accessibilityLabel="Requerimentos da vaga, obrigatório"
            style={[
              styles.textArea,
              {
                borderColor: errors.requerimentos ? colors.danger : colors.cardBorder,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderRadius: radius.sm,
              },
            ]}
          />
          {errors.requerimentos ? (
            <Text style={styles.errorText}>{errors.requerimentos}</Text>
          ) : null}
        </View>

        {/* CAMPO: SALÁRIO * (FIGMA #380:246 & #380:247) */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
              Salário (R$)<Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              value={salario}
              onChangeText={(text) => {
                setSalario(text);
                if (errors.salario) setErrors((prev) => ({ ...prev, salario: null }));
              }}
              placeholder="1621.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              accessible={true}
              accessibilityLabel="Salário oferecido, obrigatório"
              style={[
                styles.textInput,
                {
                  borderColor: errors.salario ? colors.danger : colors.cardBorder,
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderRadius: radius.sm,
                },
              ]}
            />
            {errors.salario ? <Text style={styles.errorText}>{errors.salario}</Text> : null}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
              Carga Horária
            </Text>
            <TextInput
              value={cargaHoraria}
              onChangeText={setCargaHoraria}
              placeholder="6 horas"
              placeholderTextColor={colors.textMuted}
              accessible={true}
              accessibilityLabel="Carga horária diária"
              style={[
                styles.textInput,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderRadius: radius.sm,
                },
              ]}
            />
          </View>
        </View>

        {/* CAMPO: CATEGORIA DA VAGA */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Área / Categoria
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CATEGORIAS.map((cat) => {
              const isSelected = categoria === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSoft,
                      borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CAMPO: LINK EXTERNO (FIGMA #418:267 & #418:268) */}
        <View style={styles.inputGroup}>
          <Text style={[typography.labelLarge, styles.labelFixed, { color: colors.textPrimary }]}>
            Link externo (opcional)
          </Text>
          <TextInput
            value={linkExterno}
            onChangeText={setLinkExterno}
            placeholder="https://suaempresa.com.br/vagas"
            placeholderTextColor={colors.textMuted}
            keyboardType="url"
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Link externo da vaga"
            style={[
              styles.textInput,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderRadius: radius.sm,
              },
            ]}
          />
        </View>

        {/* SEÇÃO: DEFICIÊNCIAS ATENDIDAS (VAGA_ACESSIBILIDADE - MER PÁG. 11) */}
        <View style={styles.sectionWrap}>
          <Text
            accessibilityRole="header"
            style={[typography.titleMedium, styles.sectionSubHeading, { color: colors.textPrimary }]}
          >
            ♿ Deficiências Atendidas pela Vaga:
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 10 }]}>
            Marque os perfis de PcD para os quais o posto e o ambiente já estão preparados:
          </Text>

          {deficiencias.map((def) => {
            const isChecked = selectedDisabilities.includes(def.id);
            return (
              <AccessibleCheckbox
                key={def.id}
                label={def.categoria}
                description={def.descricao}
                checked={isChecked}
                onToggle={() => toggleDisability(def.id)}
              />
            );
          })}
        </View>

        {/* SEÇÃO: RECURSOS DE ACESSIBILIDADE OFERECIDOS */}
        <View style={styles.sectionWrap}>
          <Text
            accessibilityRole="header"
            style={[typography.titleMedium, styles.sectionSubHeading, { color: colors.textPrimary }]}
          >
            🛠️ Recursos de Acessibilidade Disponíveis:
          </Text>

          {DEFAULT_RECURSOS.map((rec, i) => {
            const isChecked = selectedRecursos.includes(rec);
            return (
              <AccessibleCheckbox
                key={i}
                label={rec}
                checked={isChecked}
                onToggle={() => toggleRecurso(rec)}
              />
            );
          })}

          {/* Adicionar Recurso Personalizado */}
          <View style={styles.addCustomRow}>
            <TextInput
              value={novoRecurso}
              onChangeText={setNovoRecurso}
              placeholder="Outro recurso (ex: Mesa ajustável)"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.customRecursoInput,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderRadius: radius.sm,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddCustomRecurso}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar recurso personalizado"
              style={[styles.addCustomBtn, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={styles.addCustomBtnText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEÇÃO: CONTEÚDO DE MÍDIA (FIGMA #328:249, #328:233 & #358:244) */}
        <View style={styles.sectionWrap}>
          <Text
            accessibilityRole="header"
            style={[typography.titleMedium, styles.sectionSubHeading, { color: colors.textPrimary }]}
          >
            Conteúdo de mídia
          </Text>

          <TouchableOpacity
            onPress={() => setMidiaSelecionada((prev) => !prev)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Alternar ou adicionar imagem institucional de mídia para a vaga"
            style={[styles.mediaPillBtn, { borderColor: colors.primaryDark }]}
          >
            <Text style={[styles.mediaPillText, { color: colors.primaryDark }]}>
              {midiaSelecionada ? 'Alterar conteúdo de mídia' : 'Adicionar conteúdo de mídia'}
            </Text>
          </TouchableOpacity>

          {midiaSelecionada ? (
            <View style={styles.mediaPreviewContainer}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 6 }]}>
                Imagem selecionada:
              </Text>
              <View style={[styles.illustrationCard, { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}>
                <Image
                  source={FIGMA_ASSETS.businessDealCuate}
                  style={{ width: '100%', height: 165 }}
                  resizeMode="contain"
                  accessible={true}
                  accessibilityLabel="Ilustração oficial de aperto de mãos celebrando parceria e contratação inclusiva"
                />
                <Text style={[typography.caption, { color: colors.success, fontWeight: '700', marginTop: 8 }]}>
                  ✓ Imagem institucional aprovada
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* BOTÃO POSTAR VAGA (FIGMA #328:231 & #328:234) */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            onPress={handlePublicar}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Postar vaga de emprego e disponibilizar para candidatos PcD"
            style={[
              styles.postarVagaBtn,
              { backgroundColor: colors.primaryDark, borderRadius: radius.pill },
            ]}
          >
            <Text style={styles.postarVagaBtnText}>Postar Vaga</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE SUCESSO */}
      <Modal
        visible={sucessoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSucessoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#FFFFFF', borderRadius: radius.lg }]}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={[typography.titleLarge, { color: colors.textPrimary, textAlign: 'center' }]}>
              Vaga Publicada!
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginVertical: 14 },
              ]}
            >
              A oportunidade para "{cargo}" foi cadastrada com sucesso e está visível para candidatos
              com deficiência compatíveis com os recursos indicados.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSucessoModal(false);
                navigate('EMPREGO');
              }}
              style={[styles.modalActionBtn, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={styles.modalActionBtnText}>Ver Vaga no Mural</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      </KeyboardAvoidingView>

      {/* RODAPÉ TAB BAR */}
      <BottomTabBar activeTab="PUBLICAR" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 26,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelFixed: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  labelWithCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    minHeight: 46,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#D93025',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionChipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionWrap: {
    marginTop: 18,
    marginBottom: 14,
  },
  sectionSubHeading: {
    fontWeight: '800',
    marginBottom: 4,
  },
  addCustomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  customRecursoInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addCustomBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addCustomBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  mediaPillBtn: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  mediaPillText: {
    fontWeight: '700',
    fontSize: 13,
  },
  mediaPreviewContainer: {
    marginTop: 4,
  },
  illustrationCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE4E9',
  },
  illustrationEmoji: {
    fontSize: 44,
    letterSpacing: 4,
    marginBottom: 8,
  },
  illustrationCaption: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  postarVagaBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  postarVagaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalActionBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
