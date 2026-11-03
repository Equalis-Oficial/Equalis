/**
 * Hook de Filtragem de Vagas — Equalis
 * Isola a lógica de busca combinada (Categoria + Deficiência + Localidade + Palavra-chave).
 */
import { useState, useMemo, useEffect } from 'react';

export const JOB_CATEGORIES = [
  { id: 'TODAS', label: 'Todas', icon: '⭐' },
  { id: 'Home-Office', label: 'Home-Office', icon: '🏠' },
  { id: 'Atendimento', label: 'Atendimento', icon: '👥' },
  { id: 'Programador', label: 'Programador', icon: '💻' },
  { id: 'Marketing', label: 'Marketing', icon: '🎯' },
];

export function useFilteredJobs(vagas = [], candidatoPerfil = null, initialSearchTerm = '') {
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedDisabilityId, setSelectedDisabilityId] = useState(null); // null = todas
  const [locationFilter, setLocationFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState(initialSearchTerm || '');

  useEffect(() => {
    if (initialSearchTerm) {
      setKeywordFilter(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const filteredVagas = useMemo(() => {
    return (vagas || []).filter((vaga) => {
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

  const handleClearFilters = () => {
    setSelectedCategory('TODAS');
    setSelectedDisabilityId(null);
    setLocationFilter('');
    setKeywordFilter('');
  };

  return {
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
  };
}

