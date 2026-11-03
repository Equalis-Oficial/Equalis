import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import BottomTabBar from '../../components/common/BottomTabBar';
import JobSearchHeader from '../../components/jobs/JobSearchHeader';
import JobCategoryFilter from '../../components/jobs/JobCategoryFilter';
import JobDisabilityFilter from '../../components/jobs/JobDisabilityFilter';
import JobCard from '../../components/jobs/JobCard';
import { useFilteredJobs, JOB_CATEGORIES } from '../../hooks/useFilteredJobs';

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
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedDisabilityId,
    setSelectedDisabilityId,
    locationFilter,
    setLocationFilter,
    keywordFilter,
    setKeywordFilter,
    filteredVagas,
    handleClearFilters,
  } = useFilteredJobs(vagas, candidatoPerfil, searchTerm);

  // Áudio resumo da tela para leitores de tela e auxílio auditivo
  const handleListenScreenSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const summary = `Tela de Empregos do Equalis. Aqui você encontra oportunidades profissionais adaptadas para pessoas com deficiência. Estão listadas ${filteredVagas.length} vagas recentes com recursos inclusivos como Libras, piso tátil, softwares de leitura e horário flexível. Toque em qualquer vaga para ver detalhes e se candidatar.`;
      speak(summary);
    }
  };

  const handleOpenVaga = (vaga) => {
    setSelectedVagaId(vaga.id);
    const destination = isAccessibleMode ? 'DETALHES_VAGA_ACESSIVEL' : 'DETALHES_VAGA';
    navigate(destination, { vagaId: vaga.id });
  };

  const hasActiveFilters =
    selectedDisabilityId !== null ||
    selectedCategory !== 'TODAS' ||
    Boolean(locationFilter) ||
    Boolean(keywordFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.highContrast ? 'light-content' : 'dark-content'} />

      {/* BANNER SUPERIOR INSPIRADO NO FRAME DO FIGMA #374:1084 */}
      <JobSearchHeader
        onBack={() => goBack(isAccessibleMode ? 'TELA_ACESSIVEL' : 'HOME')}
        title="Vagas Inclusivas"
        isSpeaking={isSpeaking}
        onToggleVoiceAssist={handleListenScreenSummary}
        onOpenA11yModal={() => setIsA11yModalOpen(true)}
        locationFilter={locationFilter}
        onChangeLocationFilter={setLocationFilter}
        keywordFilter={keywordFilter}
        onChangeKeywordFilter={setKeywordFilter}
        colors={colors}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEÇÃO: CATEGORIA DE EMPREGOS (CARROSSEL HORIZONTAL) */}
        <JobCategoryFilter
          categories={JOB_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          colors={colors}
          typography={typography}
        />

        {/* SEÇÃO: FILTRO DE COMPATIBILIDADE PCD */}
        <JobDisabilityFilter
          deficiencias={deficiencias}
          selectedDisabilityId={selectedDisabilityId}
          onSelectDisability={setSelectedDisabilityId}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          colors={colors}
          typography={typography}
        />

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
              Tente selecionar outra categoria ou remover os filtros de localidade e acessibilidade.
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
          filteredVagas.map((vaga) => (
            <JobCard
              key={vaga.id}
              vaga={vaga}
              onPressDetails={handleOpenVaga}
              colors={colors}
              typography={typography}
              radius={radius}
            />
          ))
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionHeaderWrap: {
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
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
});
