/**
 * Central de Notificações Dedicada — Equalis Mobile (UC-22 & RN-031)
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

const CATEGORIAS_FILTRO = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'CANDIDATURA', label: 'Candidaturas' },
  { id: 'CONVITE', label: 'Convites' },
  { id: 'MENSAGEM', label: 'Mensagens' },
];

function formatarTempoRelativo(dataIso) {
  if (!dataIso) return 'Recentemente';
  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return String(dataIso);
  const diffMin = Math.floor((Date.now() - data.getTime()) / 60000);
  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  return data.toLocaleDateString('pt-BR');
}

export default function NotificacoesScreen() {
  const { theme, speak, highContrast } = useAccessibility();
  const {
    notificacoes: contextNotificacoes,
    carregarNotificacoes,
    marcarNotificacaoComoLida,
    marcarTodasNotificacoesComoLidas,
    userType,
    candidatoPerfil,
    empresaPerfil,
    navigate,
    goBack,
  } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');
  const [atualizando, setAtualizando] = useState(false);

  const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
  const listaNotificacoes = Array.isArray(contextNotificacoes) ? contextNotificacoes : [];

  const totalNaoLidas = useMemo(
    () => listaNotificacoes.filter((n) => Number(n.lida) === 0 || n.lida === false).length,
    [listaNotificacoes]
  );

  // RN-031: Ao abrir/visualizar as notificações, remove o indicador numérico de não lidas
  useEffect(() => {
    if (totalNaoLidas > 0 && marcarTodasNotificacoesComoLidas) {
      marcarTodasNotificacoesComoLidas();
    }
  }, [totalNaoLidas, marcarTodasNotificacoesComoLidas]);

  const onRefresh = useCallback(async () => {
    setAtualizando(true);
    if (carregarNotificacoes) {
      await carregarNotificacoes(activeUserId, userType);
    }
    setAtualizando(false);
  }, [carregarNotificacoes, activeUserId, userType]);

  const notificacoesFiltradas = useMemo(() => {
    if (categoriaAtiva === 'TODAS') return listaNotificacoes;
    return listaNotificacoes.filter(
      (n) => String(n.tipo_evento || n.tipo || '').toUpperCase() === categoriaAtiva
    );
  }, [listaNotificacoes, categoriaAtiva]);

  const handleCardPress = (item) => {
    if (Number(item.lida) === 0 || item.lida === false) {
      marcarNotificacaoComoLida?.(item.id);
    }
    speak(`${item.titulo}. ${item.mensagem}`);
    const tipo = String(item.tipo_evento || item.tipo || '').toUpperCase();
    if (tipo === 'CANDIDATURA') {
      navigate('MINHAS_CANDIDATURAS');
    } else if (tipo === 'CONVITE') {
      navigate('REDE');
    } else if (tipo === 'MENSAGEM') {
      navigate('MENSAGENS');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Notificações"
        showBack={true}
        onBack={() => goBack('HOME')}
        audioSummary={`Central de Notificações. Você possui ${listaNotificacoes.length} alertas registrados.`}
      />

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {CATEGORIAS_FILTRO.map((cat) => {
            const ativo = categoriaAtiva === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoriaAtiva(cat.id)}
                accessible={true}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativo }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: ativo ? colors.primaryDark : colors.surfaceSoft,
                    borderColor: ativo ? colors.primaryDark : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: ativo ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigate('MINHAS_CANDIDATURAS')}
          style={[styles.shortcutBtn, { backgroundColor: colors.surfaceTint, borderColor: colors.cardBorder }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ver acompanhamento de candidaturas"
        >
          <Text style={[styles.shortcutText, { color: colors.primaryDark }]}>
            📋 Ver Minhas Candidaturas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} />}
      >
        {notificacoesFiltradas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surfaceSoft }]}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[typography.titleMedium, { color: colors.textPrimary, marginTop: 8 }]}>
              Nenhuma notificação por enquanto
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
              Quando houver atualizações em suas candidaturas, conexões ou mensagens, elas aparecerão aqui.
            </Text>
          </View>
        ) : (
          notificacoesFiltradas.map((item) => {
            const naoLida = Number(item.lida) === 0 || item.lida === false;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${item.titulo}. ${item.mensagem}`}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: naoLida
                      ? highContrast
                        ? '#1A1A1A'
                        : colors.surfaceTint
                      : colors.background,
                    borderColor: colors.cardBorder,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[typography.labelLarge, { color: colors.textPrimary, fontWeight: '700', flex: 1 }]}>
                    {item.titulo}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {formatarTempoRelativo(item.created_at)}
                  </Text>
                </View>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
                  {item.mensagem}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomTabBar activeTab="NOTIFICACOES" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  emptyCard: {
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  notifCard: {
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
