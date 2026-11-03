import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';

const TABS_CANDIDATO = [
  { id: 'HOME', label: 'Início', icon: '🏠', target: 'HOME' },
  { id: 'REDE', label: 'Rede', icon: '👥', target: 'REDE' },
  { id: 'PUBLICAR', label: 'Publicar', icon: '🖼️', target: 'CRIAR_PUBLICACAO' },
  { id: 'NOTIFICACOES', label: 'Candidaturas', icon: '🔔', target: 'MINHAS_CANDIDATURAS' },
  { id: 'VAGAS', label: 'Vagas', icon: '💼', target: 'EMPREGO' },
];

const TABS_EMPRESA = [
  { id: 'HOME', label: 'Feed', icon: '🏠', target: 'HOME' },
  { id: 'VAGAS', label: 'Vagas', icon: '💼', target: 'EMPREGO' },
  { id: 'PUBLICAR', label: '+ Criar Vaga', icon: '➕', target: 'PUBLICAR_VAGA_EMPRESA' },
  { id: 'NOTIFICACOES', label: 'Inscrições', icon: '📋', target: 'MINHAS_CANDIDATURAS' },
  { id: 'PERFIL', label: 'Empresa', icon: '🏢', target: 'PERFIL_CANDIDATO' },
];

export default function BottomTabBar({ activeTab = 'HOME' }) {
  const { theme, isAccessibleMode } = useAccessibility();
  const { navigate, userType } = useAuthAndData();
  const { colors, typography } = theme;

  const currentTabs = userType === 'EMPRESA' ? TABS_EMPRESA : TABS_CANDIDATO;

  if (isAccessibleMode) {
    return (
      <View
        style={[
          styles.accessibleFooter,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.cardBorder,
            paddingBottom: Platform.OS === 'ios' ? 24 : (Platform.OS === 'android' ? 28 : 12),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigate('TELA_ACESSIVEL')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o Menu Principal da Tela Acessível"
          style={[styles.accessibleHomeBtn, { backgroundColor: colors.primaryDark }]}
        >
          <Text style={styles.accessibleHomeText}>
            ♿ VOLTAR AO MENU PRINCIPAL ACESSÍVEL
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder || '#D9D9D9',
        },
      ]}
    >
      {currentTabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => navigate(tab.target)}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`Aba ${tab.label}`}
            accessibilityState={{ selected: isSelected }}
            style={styles.tabItem}
          >
            {isSelected ? (
              <View
                style={[styles.activeTopLine, { backgroundColor: colors.primary }]}
              />
            ) : null}
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                typography.caption,
                {
                  color: isSelected ? colors.primary : colors.textPrimary,
                  fontWeight: isSelected ? '800' : '500',
                  fontSize: 11,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.65}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: Platform.OS === 'ios' ? 78 : (Platform.OS === 'android' ? 84 : 64),
    borderTopWidth: 1.5,
    paddingBottom: Platform.OS === 'ios' ? 20 : (Platform.OS === 'android' ? 28 : 6),
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeTopLine: {
    position: 'absolute',
    top: 0,
    width: 38,
    height: 3.5,
    borderRadius: 2,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  accessibleFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1.5,
  },
  accessibleHomeBtn: {
    minHeight: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  accessibleHomeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
