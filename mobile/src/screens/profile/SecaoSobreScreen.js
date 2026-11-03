import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import AccessibleButton from '../../components/common/AccessibleButton';

export default function SecaoSobreScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { candidatoPerfil, atualizarCandidatoPerfil, navigate, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [resumo, setResumo] = useState(candidatoPerfil.resumo_profissional || '');
  const [competencias, setCompetencias] = useState(candidatoPerfil.competencias || []);
  const [novaCompetencia, setNovaCompetencia] = useState('');

  const MAX_CHARS = 2600;

  const handleAddCompetencia = () => {
    const limpo = novaCompetencia.trim();
    if (!limpo) return;
    if (competencias.includes(limpo)) {
      Alert.alert('Aviso', 'Esta competência já foi adicionada.');
      return;
    }
    setCompetencias([...competencias, limpo]);
    setNovaCompetencia('');
  };

  const handleRemoveCompetencia = (comp) => {
    setCompetencias(competencias.filter((c) => c !== comp));
  };

  const handleSalvar = () => {
    atualizarCandidatoPerfil({
      resumo_profissional: resumo,
      competencias,
    });
    Alert.alert('Sucesso', 'Seção Sobre atualizada com sucesso!', [
      { text: 'OK', onPress: () => goBack('PERFIL_CANDIDATO') },
    ]);
  };

  const audioSummary =
    'Tela Seção Sobre. Escreva sobre sua experiência, setor ou competências em até 2600 caracteres e adicione competências destacadas.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Seção Sobre"
        showBack={true}
        onBack={() => goBack('PERFIL_CANDIDATO')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Formulário da seção Sobre do perfil"
      >
        <View style={styles.guidanceBox}>
          <Text
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                fontSize: isAccessibleMode ? 24 : 20,
              },
            ]}
            accessibilityRole="header"
          >
            Seção Sobre
          </Text>
          <Text
            style={[
              typography.bodyLarge,
              { color: colors.textMuted, marginTop: 6, lineHeight: 22 },
            ]}
          >
            Escreva sobre sua experiência, setor ou competências. Inclua também conquistas, projetos acessíveis ou áreas de interesse.
          </Text>
        </View>

        {/* Campo de Texto Multilinha */}
        <View style={styles.inputSection}>
          <View style={styles.charCountRow}>
            <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
              Resumo Profissional
            </Text>
            <Text
              style={[
                typography.caption,
                { color: resumo.length > MAX_CHARS ? colors.danger : colors.textMuted },
              ]}
              accessible={true}
              accessibilityLabel={`${resumo.length} de ${MAX_CHARS} caracteres utilizados`}
            >
              {resumo.length} de {MAX_CHARS}
            </Text>
          </View>

          <View
            style={[
              styles.textAreaWrapper,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
                borderRadius: radius.md,
                borderWidth: isAccessibleMode ? 2 : 1.5,
              },
            ]}
          >
            <TextInput
              value={resumo}
              onChangeText={setResumo}
              placeholder="Ex: Profissional de Marketing Digital e Comunicação Acessível com foco em campanhas inclusivas..."
              placeholderTextColor={colors.textMuted}
              multiline={true}
              numberOfLines={8}
              maxLength={MAX_CHARS}
              style={[
                styles.textArea,
                typography.bodyLarge,
                { color: colors.textPrimary, textAlignVertical: 'top' },
              ]}
              accessible={true}
              accessibilityLabel="Campo de texto do resumo profissional"
            />
          </View>
        </View>

        {/* Competências em Destaque */}
        <View style={styles.competenciasSection}>
          <Text
            style={[
              typography.titleMedium,
              { color: colors.textPrimary, fontWeight: '700', marginBottom: 6 },
            ]}
            accessibilityRole="header"
          >
            Competências em Destaque
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textMuted, marginBottom: 12 }]}>
            Adicione palavras-chave para que recrutadores encontrem seu perfil mais facilmente.
          </Text>

          {/* Input para adicionar nova competência */}
          <View style={styles.addChipRow}>
            <TextInput
              value={novaCompetencia}
              onChangeText={setNovaCompetencia}
              placeholder="Ex: Libras, Python, WCAG..."
              placeholderTextColor={colors.textMuted}
              style={[
                styles.addChipInput,
                typography.bodyMedium,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.sm,
                  color: colors.textPrimary,
                },
              ]}
              onSubmitEditing={handleAddCompetencia}
              accessible={true}
              accessibilityLabel="Campo para digitar nova competência"
            />
            <TouchableOpacity
              onPress={handleAddCompetencia}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Adicionar competência digitada"
              style={[
                styles.addChipBtn,
                { backgroundColor: colors.primaryDark, borderRadius: radius.sm },
              ]}
            >
              <Text style={styles.addChipBtnText}>+ Inserir</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Chips */}
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
                  accessibilityLabel={`Remover competência ${comp}`}
                  style={styles.chipRemoveBtn}
                >
                  <Text style={[styles.chipRemoveText, { color: colors.danger }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Botão Salvar */}
        <View style={styles.saveBtnWrap}>
          <AccessibleButton
            title="Salvar"
            onPress={handleSalvar}
            variant="primaryDark"
            accessibilityLabel="Salvar seção sobre e voltar ao perfil"
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
  guidanceBox: {
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textAreaWrapper: {
    minHeight: 180,
    padding: 12,
  },
  textArea: {
    flex: 1,
    minHeight: 160,
  },
  competenciasSection: {
    marginBottom: 24,
  },
  addChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addChipInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  addChipBtn: {
    height: 46,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChipBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipRemoveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  chipRemoveText: {
    fontWeight: '700',
    fontSize: 12,
  },
  saveBtnWrap: {
    marginTop: 10,
  },
});
