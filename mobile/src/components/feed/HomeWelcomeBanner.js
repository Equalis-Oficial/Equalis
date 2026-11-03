import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function HomeWelcomeBanner({
  userType = 'CANDIDATO',
  primeiroNome = 'Maria',
  empresaNome = 'Centro Universitário UNICEPLAC',
  onAvatarPress,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onMessagesPress,
  unreadMessagesCount = 3,
  onActionPress,
  onA11yPress,
  isSpeaking = false,
  isAccessibleMode = false,
  colors,
}) {
  const isEmpresa = userType === 'EMPRESA';

  return (
    <View style={[styles.headerContainer, { backgroundColor: '#007ADE' }]}>
      {/* 1. BARRA SUPERIOR INTEGRADA (FIGMA #125:3790) */}
      <View style={styles.topBarRow}>
        {/* Avatar do Usuário */}
        <TouchableOpacity
          onPress={onAvatarPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isEmpresa ? `Perfil de ${empresaNome}` : `Perfil de ${primeiroNome}`}
          style={styles.avatarBtn}
        >
          <Image
            source={isEmpresa ? FIGMA_ASSETS.logoUniceplacQuadrada : FIGMA_ASSETS.avatarPandaRaposa}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Cápsula de Pesquisa Branca com Ícone de Lupa */}
        <View style={styles.searchCapsule}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            placeholder="Pesquisar"
            placeholderTextColor="#8A92A6"
            returnKeyType="search"
            accessible={true}
            accessibilityLabel="Pesquisar vagas, postagens ou pessoas"
            style={styles.searchInput}
          />
        </View>

        {/* Ícone de Mensagens com Badge de Notificação */}
        <TouchableOpacity
          onPress={onMessagesPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Abrir mensagens. ${unreadMessagesCount} novas mensagens`}
          style={styles.chatBtn}
        >
          <Text style={styles.chatIcon}>💬</Text>
          {unreadMessagesCount > 0 ? (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>{unreadMessagesCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Botão de Leitura de Tela / Acessibilidade WCAG */}
        <TouchableOpacity
          onPress={onA11yPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isSpeaking ? 'Parar leitura de tela' : 'Ouvir resumo em voz alta da tela inicial'}
          style={[styles.a11yBtn, { backgroundColor: isSpeaking ? '#D93025' : 'rgba(255,255,255,0.25)' }]}
        >
          <Text style={styles.a11yIcon}>{isSpeaking ? '⏹️' : '♿'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. HERO BOAS-VINDAS + ILUSTRAÇÃO WORKING RAFIKI */}
      <View style={styles.heroRow}>
        <View style={styles.heroTextCol}>
          <Text
            style={[
              styles.welcomeTitle,
              { fontSize: isAccessibleMode ? 26 : 22 },
            ]}
            accessibilityRole="header"
          >
            {isEmpresa ? `Olá, ${empresaNome}!` : `Olá, ${primeiroNome}!`}
          </Text>

          <Text
            style={[
              styles.welcomeSubhead,
              { fontSize: isAccessibleMode ? 17 : 15 },
            ]}
          >
            {isEmpresa
              ? 'Gestão de vagas e oportunidades inclusivas'
              : 'É bom te ver novamente dentro do equalis'}
          </Text>

          <Text
            style={[
              styles.welcomeCaption,
              { fontSize: isAccessibleMode ? 13 : 11 },
            ]}
          >
            {isEmpresa
              ? 'Cadastre oportunidades exclusivas e avalie candidatos PcD capacitados'
              : 'Recomendamos algumas vagas enquanto você navega no aplicativo'}
          </Text>

          <TouchableOpacity
            onPress={onActionPress}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isEmpresa ? 'Publicar nova vaga inclusiva' : 'Ver vagas recomendadas para você'}
            style={styles.verVagasPill}
          >
            <Text style={styles.verVagasText}>
              {isEmpresa ? '+ Publicar Vaga' : 'Ver Vagas'}
            </Text>
            <Text style={styles.verVagasArrow}>↓</Text>
          </TouchableOpacity>
        </View>

        {/* Ilustração Oficial Working-rafiki (#159:217 do Figma) */}
        <Image
          source={FIGMA_ASSETS.workingRafikiHome}
          style={styles.workingRafikiImg}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Ilustração oficial de colaborador no ambiente de trabalho com computador"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  searchCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#191919',
    paddingVertical: 0,
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  chatIcon: {
    fontSize: 20,
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E53E3E',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#007ADE',
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  a11yBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  a11yIcon: {
    fontSize: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1.25,
    paddingRight: 6,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  welcomeSubhead: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 20,
  },
  welcomeCaption: {
    color: '#E0F2FE',
    marginTop: 6,
    lineHeight: 16,
    fontWeight: '400',
  },
  verVagasPill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  verVagasText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  verVagasArrow: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },
  workingRafikiImg: {
    flex: 0.85,
    height: 120,
  },
});
