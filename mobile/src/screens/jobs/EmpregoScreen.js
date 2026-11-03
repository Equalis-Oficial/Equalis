import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import BottomTabBar from '../../components/common/BottomTabBar';

const JOB_CATEGORIES = [
  { id: 'TODAS', label: 'Todas', icon: '⭐' },
  { id: 'Home-Office', label: 'Home-Office', icon: '🏠' },
  { id: 'Atendimento', label: 'Atendimento', icon: '👥' },
  { id: 'Programador', label: 'Programador', icon: '💻' },
  { id: 'Marketing', label: 'Marketing', icon: '🎯' },
];

export default function EmpregoScreen() {
  const { theme, isAccessibleMode, speak, isSpeaking, stopSpeaking, setIsA11yModalOpen } =
    useAccessibility();
  const {
    vagas,
    setSelectedVagaId,
    navigate,
    goBack,
    deficiencias,
    candidatoPerfil,
    searchTerm,
    setSearchTerm,
    userType,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedDisabilityId, setSelectedDisabilityId] = useState(null); // null = todas
  const [locationFilter, setLocationFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState(searchTerm || '');

  React.useEffect(() => {
    if (searchTerm) {
      setKeywordFilter(searchTerm);
    }
  }, [searchTerm]);

  // Áudio resumo da tela para leitores de tela e auxílio auditivo
  const handleListenScreenSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const summary = `Tela de Empregos do Equalis. Aqui você encontra oportunidades profissionais adaptadas para pessoas com deficiência. Estão listadas ${filteredVagas.length} vagas recentes com recursos inclusivos como Libras, piso tátil, softwares de leitura e horário flexível. Toque em qualquer vaga para ver detalhes e se candidatar.`;
      speak(summary);
    }
  };

  // Filtragem combinada: Categoria + PcD + Cidade + Palavra-chave
  const filteredVagas = useMemo(() => {
    return vagas.filter((vaga) => {
      // Filtro de Categoria
      if (selectedCategory !== 'TODAS') {
        const catMatch =
          vaga.categoria?.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategory === 'Home-Office' &&
            vaga.modalidade?.toLowerCase().includes('home-office'));
        if (!catMatch) return false;
      }

      // Filtro de Deficiência Compatível
      if (selectedDisabilityId) {
        if (selectedDisabilityId === 'MEU_PERFIL') {
          const userDisabilities = candidatoPerfil?.deficiencias_ids || [];
          const matchesAny = (vaga.acessibilidades_ids || []).some((id) =>
            userDisabilities.includes(id)
          );
          if (!matchesAny) return false;
        } else {
          const hasCompat = (vaga.acessibilidades_ids || []).includes(selectedDisabilityId);
          if (!hasCompat) return false;
        }
      }

      // Filtro de Localidade
      if (locationFilter.trim()) {
        const loc = locationFilter.toLowerCase();
        const cityMatch =
          vaga.cidade?.toLowerCase().includes(loc) ||
          vaga.estado?.toLowerCase().includes(loc);
        if (!cityMatch) return false;
      }

      // Filtro de Palavra-chave / Cargo
      if (keywordFilter.trim()) {
        const kw = keywordFilter.toLowerCase();
        const titleMatch = vaga.titulo?.toLowerCase().includes(kw);
        const descMatch = vaga.descricao?.toLowerCase().includes(kw);
        const empMatch = vaga.empresa_nome?.toLowerCase().includes(kw);
        if (!titleMatch && !descMatch && !empMatch) return false;
      }

      return true;
    });
  }, [vagas, selectedCategory, selectedDisabilityId, locationFilter, keywordFilter, candidatoPerfil]);

  const handleOpenVaga = (vaga) => {
    setSelectedVagaId(vaga.id);
    const destination = isAccessibleMode ? 'DETALHES_VAGA_ACESSIVEL' : 'DETALHES_VAGA';
    navigate(destination, { vagaId: vaga.id });
  };

  const handleClearFilters = () => {
    setSelectedCategory('TODAS');
    setSelectedDisabilityId(null);
    setLocationFilter('');
    setKeywordFilter('');
  };

  const formatCurrency = (val) => {
    if (typeof val === 'number') {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `R$ ${val || '1.621'}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.highContrast ? 'light-content' : 'dark-content'} />

      {/* BANNER SUPERIOR INSPIRADO NO FRAME DO FIGMA #374:1084 */}
      <View style={[styles.bannerHeader, { backgroundColor: '#104169' }]}>
        {/* Camada decorativa de ondas orgânicas */}
        <View style={styles.waveOverlay} />

        {/* Linha de Ações do Topo */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => goBack(isAccessibleMode ? 'TELA_ACESSIVEL' : 'HOME')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.backCircleBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.backCircleArrow}>←</Text>
          </TouchableOpacity>

          <Text
            accessibilityRole="header"
            style={[styles.headerBrandTitle, { color: '#FFFFFF' }]}
          >
            Vagas Inclusivas
          </Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={handleListenScreenSummary}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isSpeaking
                  ? 'Parar leitura em voz alta da tela de vagas'
                  : 'Ouvir resumo em áudio das vagas disponíveis'
              }
              style={[
                styles.voiceAssistBtn,
                { backgroundColor: isSpeaking ? colors.danger : colors.surfaceTint },
              ]}
            >
              <Text style={styles.voiceAssistIcon}>{isSpeaking ? '⏹️' : '♿'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsA11yModalOpen(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Configurações de acessibilidade, contraste e tamanho de texto"
              style={[styles.a11ySettingsBtn, { backgroundColor: colors.surfaceTint }]}
            >
              <Text style={styles.a11ySettingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CÁPSULA DE BUSCA DUPLA DO FIGMA (LOCALIDADE + CARGO) */}
        <View
          style={[
            styles.searchCapsuleContainer,
            { borderColor: colors.primary, backgroundColor: '#007ADE' },
          ]}
        >
          {/* Campo 1: Localidade */}
          <View style={[styles.capsulePill, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.capsuleIcon}>📍</Text>
            <TextInput
              value={locationFilter}
              onChangeText={setLocationFilter}
              placeholder="Brasília"
              placeholderTextColor="#7C8691"
              accessible={true}
              accessibilityLabel="Filtrar por cidade ou estado. Padrão: Brasília"
              style={[styles.capsuleInput, { color: colors.textPrimary }]}
            />
            {locationFilter.length > 0 ? (
              <TouchableOpacity
                onPress={() => setLocationFilter('')}
                accessibilityLabel="Limpar filtro de localidade"
              >
                <Text style={styles.clearSmallIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Campo 2: Cargo / Palavra-chave */}
          <View style={[styles.capsulePill, styles.capsulePillRight, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.capsuleIcon}>🔍</Text>
            <TextInput
              value={keywordFilter}
              onChangeText={setKeywordFilter}
              placeholder="Buscar cargo..."
              placeholderTextColor="#7C8691"
              accessible={true}
              accessibilityLabel="Buscar por cargo, habilidade ou nome da empresa"
              style={[styles.capsuleInput, { color: colors.textPrimary }]}
            />
            {keywordFilter.length > 0 ? (
              <TouchableOpacity
                onPress={() => setKeywordFilter('')}
                accessibilityLabel="Limpar filtro de busca de cargo"
              >
                <Text style={styles.clearSmallIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEÇÃO: CATEGORIA DE EMPREGOS (CARROSSEL HORIZONTAL) */}
        <View style={styles.sectionHeaderWrap}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleLarge,
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Categoria de empregos
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Selecione uma área de atuação
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollTrack}
        >
          {JOB_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Categoria ${cat.label}`}
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? colors.primary : '#FFFFFF',
                    borderColor: isSelected ? colors.primaryDark : '#E2E8F0',
                  },
                ]}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : colors.surfaceTint,
                    },
                  ]}
                >
                  <Text style={styles.categoryIconEmoji}>{cat.icon}</Text>
                </View>
                <Text
                  style={[
                    typography.caption,
                    styles.categoryCardLabel,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SEÇÃO: FILTRO DE COMPATIBILIDADE PCD */}
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.rowBetween}>
            <Text
              accessibilityRole="header"
              style={[
                typography.titleMedium,
                styles.sectionTitle,
                { color: colors.textPrimary },
              ]}
            >
              Compatibilidade PcD
            </Text>
            {selectedDisabilityId !== null || selectedCategory !== 'TODAS' || locationFilter || keywordFilter ? (
              <TouchableOpacity
                onPress={handleClearFilters}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Limpar todos os filtros ativos"
              >
                <Text style={[styles.clearFiltersLink, { color: colors.primary }]}>
                  Limpar Filtros
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Filtre por recursos adaptados à sua necessidade
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pcdChipsTrack}
        >
          {/* Chip Meu Perfil */}
          <TouchableOpacity
            onPress={() =>
              setSelectedDisabilityId((prev) =>
                prev === 'MEU_PERFIL' ? null : 'MEU_PERFIL'
              )
            }
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filtrar vagas compatíveis com meu perfil cadastrado"
            accessibilityState={{ selected: selectedDisabilityId === 'MEU_PERFIL' }}
            style={[
              styles.pcdChip,
              {
                backgroundColor:
                  selectedDisabilityId === 'MEU_PERFIL'
                    ? colors.accessibleNavy
                    : colors.surfaceSoft,
                borderColor:
                  selectedDisabilityId === 'MEU_PERFIL'
                    ? colors.primaryDark
                    : colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.pcdChipText,
                {
                  color:
                    selectedDisabilityId === 'MEU_PERFIL'
                      ? '#FFFFFF'
                      : colors.textPrimary,
                  fontWeight: selectedDisabilityId === 'MEU_PERFIL' ? '700' : '500',
                },
              ]}
            >
              ⭐ Meu Perfil
            </Text>
          </TouchableOpacity>

          {/* Chips das 5 Deficiências Oficiais */}
          {deficiencias.map((def) => {
            const isSelected = selectedDisabilityId === def.id;
            const shortName = def.categoria.replace('Deficiência ', '');
            const iconMap = {
              1: '🦽',
              2: '👁️',
              3: '🧏',
              4: '🧠',
              5: '🧩',
            };
            const icon = iconMap[def.id] || '♿';

            return (
              <TouchableOpacity
                key={def.id}
                onPress={() =>
                  setSelectedDisabilityId((prev) => (prev === def.id ? null : def.id))
                }
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filtro para ${def.categoria}`}
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.pcdChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryDark
                      : colors.surfaceSoft,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pcdChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {icon} {shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SEÇÃO: LISTA DE EMPREGOS RECENTES */}
        <View style={styles.sectionHeaderWrap}>
          <Text
            accessibilityRole="header"
            style={[
              typography.titleLarge,
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Lista de empregos recentes
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {filteredVagas.length}{' '}
            {filteredVagas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
          </Text>
        </View>

        {filteredVagas.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceSoft }]}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text
              style={[
                typography.titleMedium,
                { color: colors.textPrimary, textAlign: 'center', marginTop: 10 },
              ]}
            >
              Nenhuma vaga encontrada
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
              ]}
            >
              Tente selecionar outra categoria ou remover os filtros de localidade e
              acessibilidade.
            </Text>
            <TouchableOpacity
              onPress={handleClearFilters}
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver todas as vagas disponíveis"
            >
              <Text style={styles.emptyActionBtnText}>Ver Todas as Vagas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredVagas.map((vaga) => {
            const isPresencial = vaga.modalidade?.toLowerCase().includes('presencial');
            return (
              <View
                key={vaga.id}
                accessible={true}
                accessibilityLabel={`Vaga de ${vaga.titulo} na empresa ${vaga.empresa_nome}. Salário ${formatCurrency(vaga.salario)}. Localidade ${vaga.cidade}.`}
                style={[
                  styles.jobCard,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: colors.cardBorder,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                {/* Linha 1: Logo da Empresa + Nome + Badges */}
                <View style={styles.cardHeaderRow}>
                  {vaga.empresa_nome?.includes('UNICEPLAC') || vaga.empresa_id === 1 ? (
                    <Image
                      source={FIGMA_ASSETS.logoUniceplacQuadrada}
                      style={styles.companyLogoImg}
                      resizeMode="cover"
                      accessible={true}
                      accessibilityLabel={`Logo da empresa ${vaga.empresa_nome}`}
                    />
                  ) : (
                    <View style={[styles.companyLogoBox, { backgroundColor: colors.primary }]}>
                      <Text style={styles.companyLogoInitial}>
                        {(vaga.empresa_nome || 'E').substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.companyNameBadgeRow}>
                      <Text
                        style={[
                          typography.labelLarge,
                          styles.companyNameText,
                          { color: colors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {vaga.empresa_nome}
                      </Text>
                      {/* Selo oficial de inclusão PcD */}
                      <View style={[styles.verifiedTag, { backgroundColor: colors.primaryDark }]}>
                        <Text style={styles.verifiedTagText}>✓ PcD Inclusivo</Text>
                      </View>
                    </View>

                    {/* Localidade */}
                    <View style={styles.locationRow}>
                      <Text style={styles.locationPinEmoji}>📍</Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {vaga.cidade} • {vaga.estado}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Linha 2: Cargo em Destaque */}
                <Text
                  style={[
                    typography.titleMedium,
                    styles.jobTitleText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {vaga.titulo}
                </Text>

                {/* Linha 3: Metadados (Carga horária + Avaliação + Tempo + Salário) */}
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>💼</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {vaga.carga_horaria || '6 horas'}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⭐</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
                      {vaga.avaliacao_empresa || '4.9'}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🕒</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {vaga.tempo_publicacao || 'Recente'}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text
                      style={[
                        typography.caption,
                        styles.salaryHighlight,
                        { color: colors.success },
                      ]}
                    >
                      {formatCurrency(vaga.salario)}
                    </Text>
                  </View>
                </View>

                {/* Linha 4: Tags de Recursos de Acessibilidade */}
                <View style={styles.accessibilityTagsWrap}>
                  <View
                    style={[
                      styles.modalidadeChip,
                      {
                        backgroundColor: isPresencial ? '#E6F4EA' : '#E8F0FE',
                        borderColor: isPresencial ? '#34A853' : '#1A73E8',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalidadeChipText,
                        { color: isPresencial ? '#137333' : '#174EA6' },
                      ]}
                    >
                      {vaga.modalidade || 'Presencial'}
                    </Text>
                  </View>

                  {(vaga.recursos_acessibilidade || []).slice(0, 2).map((rec, i) => (
                    <View
                      key={i}
                      style={[
                        styles.accessChip,
                        { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder },
                      ]}
                    >
                      <Text
                        style={[typography.caption, { color: colors.primaryDark, fontSize: 12 }]}
                        numberOfLines={1}
                      >
                        ✓ {rec}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Linha 5: Botão Detalhes vaga alinhado à direita (Figma #395:250) */}
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenVaga(vaga)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalhes da vaga de ${vaga.titulo} na ${vaga.empresa_nome}`}
                    style={[
                      styles.detalhesVagaBtn,
                      { backgroundColor: colors.primaryDark },
                    ]}
                  >
                    <Text style={styles.detalhesVagaBtnText}>Detalhes vaga</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* RODAPÉ TAB BAR INTEGRADO */}
      <BottomTabBar activeTab="VAGAS" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerHeader: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  waveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
    backgroundColor: '#00B2FF',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backCircleArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 24,
    marginTop: Platform.OS === 'android' ? -2 : 0,
    marginLeft: Platform.OS === 'android' ? -1 : 0,
  },
  headerBrandTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAssistBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  voiceAssistIcon: {
    fontSize: 20,
  },
  a11ySettingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  a11ySettingsIcon: {
    fontSize: 18,
  },
  searchCapsuleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: 40,
    padding: 4,
    gap: 6,
  },
  capsulePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  capsulePillRight: {
    flex: 1.35,
  },
  capsuleIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  capsuleInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearSmallIcon: {
    color: '#8A92A6',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionHeaderWrap: {
    marginBottom: 10,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  clearFiltersLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  categoriesScrollTrack: {
    paddingVertical: 6,
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    width: 96,
    height: 104,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconEmoji: {
    fontSize: 22,
  },
  categoryCardLabel: {
    textAlign: 'center',
  },
  pcdChipsTrack: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 16,
  },
  pcdChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pcdChipText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: 28,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyActionBtn: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  jobCard: {
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogoImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  companyLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  cardHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  companyNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  companyNameText: {
    fontWeight: '700',
    maxWidth: '65%',
  },
  verifiedTag: {
    backgroundColor: '#0966C2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  inclusiveTagEmoji: {
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPinEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  jobTitleText: {
    fontWeight: '700',
    marginBottom: 10,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
  },
  salaryHighlight: {
    fontWeight: '700',
  },
  accessibilityTagsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  modalidadeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalidadeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  accessChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
    paddingTop: 12,
  },
  detalhesVagaBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#1F41BB',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  detalhesVagaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
