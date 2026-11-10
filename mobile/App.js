/**
 * Equalis — Aplicativo Mobile de Empregabilidade e Controle de Vagas PcD
 * Projeto Integrado de Desenvolvimento Mobile — UNICEPLAC 2026
 *
 * Roteamento mestre com suporte a alternância em tempo real entre:
 * - Modo Padrão Completo (fiel ao Figma)
 * - Modo Tela Acessível Simplificada (fiel ao Figma)
 * - Assistente de Voz Text-to-Speech (TTS)
 * - Escala Tipográfica Dinâmica e Alto Contraste (WCAG 2.2 AAA)
 */
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  AccessibilityProvider,
  useAccessibility,
} from './src/context/AccessibilityContext';
import {
  AuthAndDataProvider,
  useAuthAndData,
} from './src/context/AuthAndDataContext';
import AccessibilityModal from './src/components/common/AccessibilityModal';

// 1. Telas de Onboarding, Autenticação e Acessibilidade (Frente 1)
import TelaInicialScreen from './src/screens/auth/TelaInicialScreen';
import IntroducaoAppScreen from './src/screens/auth/IntroducaoAppScreen';
import OpcoesCadastroScreen from './src/screens/auth/OpcoesCadastroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegistroCandidatoScreen from './src/screens/auth/RegistroCandidatoScreen';
import RegistroEmpresaScreen from './src/screens/auth/RegistroEmpresaScreen';
import TermosScreen from './src/screens/auth/TermosScreen';
import EscolhaDeficienciaScreen from './src/screens/auth/EscolhaDeficienciaScreen';
import ConfirmacaoAcessivelScreen from './src/screens/accessible/ConfirmacaoAcessivelScreen';
import TelaAcessivelScreen from './src/screens/accessible/TelaAcessivelScreen';

// 2. Telas de Vagas, Candidaturas e Empresas (Frente 2)
import EmpregoScreen from './src/screens/jobs/EmpregoScreen';
import DetalhesVagaScreen from './src/screens/jobs/DetalhesVagaScreen';
import DetalhesVagaAcessivelScreen from './src/screens/accessible/DetalhesVagaAcessivelScreen';
import PublicarPostAcessivelScreen from './src/screens/accessible/PublicarPostAcessivelScreen';
import PublicarVagaScreen from './src/screens/jobs/PublicarVagaScreen';
import MinhasCandidaturasScreen from './src/screens/jobs/MinhasCandidaturasScreen';

// 3. Telas de Perfil, Rede, Publicações e Mensagens (Frente 3)
import HomeScreen from './src/screens/network/HomeScreen';
import PerfilCandidatoScreen from './src/screens/profile/PerfilCandidatoScreen';
import AdicionarSecaoScreen from './src/screens/profile/AdicionarSecaoScreen';
import SecaoSobreScreen from './src/screens/profile/SecaoSobreScreen';
import FormacaoAcademicaScreen from './src/screens/profile/FormacaoAcademicaScreen';
import AdicionarFormacaoScreen from './src/screens/profile/AdicionarFormacaoScreen';
import CargoScreen from './src/screens/profile/CargoScreen';
import AdicionarCargoScreen from './src/screens/profile/AdicionarCargoScreen';
import EditarPerfilScreen from './src/screens/profile/EditarPerfilScreen';
import ConfiguracoesPerfilScreen from './src/screens/profile/ConfiguracoesPerfilScreen';
import InformacoesEmpresaScreen from './src/screens/profile/InformacoesEmpresaScreen';
import RedeScreen from './src/screens/network/RedeScreen';
import PublicarPostScreen from './src/screens/network/PublicarPostScreen';
import CriarPublicacaoScreen from './src/screens/network/CriarPublicacaoScreen';
import VerPublicacoesScreen from './src/screens/network/VerPublicacoesScreen';
import EditarPublicacaoScreen from './src/screens/network/EditarPublicacaoScreen';
import OpcoesPublicacaoScreen from './src/screens/network/OpcoesPublicacaoScreen';
import ConfirmarExclusaoScreen from './src/screens/network/ConfirmarExclusaoScreen';
import MensagensScreen from './src/screens/network/MensagensScreen';
import NotificacoesScreen from './src/screens/network/NotificacoesScreen';

const PUBLIC_SCREENS = [
  'TELA_INICIAL',
  'INTRODUCAO_APP',
  'OPCOES_CADASTRO',
  'LOGIN',
  'REGISTRO_CANDIDATO',
  'REGISTRO_EMPRESA',
  'TERMOS',
  'ESCOLHA_DEFICIENCIA',
];

function ScreenRouter() {
  const { currentScreen, sessionToken } = useAuthAndData();
  const { theme, isAccessibleMode } = useAccessibility();

  // Route Guard: telas privadas requerem autenticação legítima (sessionToken)
  const isPublicScreen = PUBLIC_SCREENS.includes(currentScreen);
  const activeScreen = !sessionToken && !isPublicScreen ? 'TELA_INICIAL' : currentScreen;

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      // Frente 1
      case 'TELA_INICIAL':
        return <TelaInicialScreen />;
      case 'INTRODUCAO_APP':
        return <IntroducaoAppScreen />;
      case 'OPCOES_CADASTRO':
        return <OpcoesCadastroScreen />;
      case 'LOGIN':
        return <LoginScreen />;
      case 'REGISTRO_CANDIDATO':
        return <RegistroCandidatoScreen />;
      case 'REGISTRO_EMPRESA':
        return <RegistroEmpresaScreen />;
      case 'TERMOS':
        return <TermosScreen />;
      case 'ESCOLHA_DEFICIENCIA':
        return <EscolhaDeficienciaScreen />;
      case 'CONFIRMACAO_ACESSIVEL':
        return <ConfirmacaoAcessivelScreen />;
      case 'TELA_ACESSIVEL':
        return <TelaAcessivelScreen />;

      // Frente 2
      case 'EMPREGO':
        return <EmpregoScreen />;
      case 'DETALHES_VAGA':
        return <DetalhesVagaScreen />;
      case 'DETALHES_VAGA_ACESSIVEL':
        return <DetalhesVagaAcessivelScreen />;
      case 'PUBLICAR_VAGA_EMPRESA':
        return <PublicarVagaScreen />;
      case 'MINHAS_CANDIDATURAS':
        return <MinhasCandidaturasScreen />;

      // Frente 3
      case 'HOME':
        return <HomeScreen />;
      case 'PERFIL_EMPRESA':
      case 'PERFIL_CANDIDATO':
        return <PerfilCandidatoScreen />;
      case 'CONFIGURACOES_PERFIL':
        return <ConfiguracoesPerfilScreen />;
      case 'INFORMACOES_EMPRESA':
        return <InformacoesEmpresaScreen />;
      case 'ADICIONAR_SECAO':
        return <AdicionarSecaoScreen />;
      case 'SECAO_SOBRE':
        return <SecaoSobreScreen />;
      case 'FORMACAO_ACADEMICA':
        return <FormacaoAcademicaScreen />;
      case 'ADICIONAR_FORMACAO':
        return <AdicionarFormacaoScreen />;
      case 'CARGO':
        return <CargoScreen />;
      case 'ADICIONAR_CARGO':
        return <AdicionarCargoScreen />;
      case 'EDITAR_PERFIL':
        return <EditarPerfilScreen />;
      case 'REDE':
        return <RedeScreen />;
      case 'PUBLICAR_POST_ACESSIVEL':
      case 'PUBLICAR_ACESSIVEL':
        return <PublicarPostAcessivelScreen />;
      case 'PUBLICAR':
        return isAccessibleMode ? <PublicarPostAcessivelScreen /> : <PublicarPostScreen />;
      case 'CRIAR_PUBLICACAO':
        return <CriarPublicacaoScreen />;
      case 'VER_PUBLICACOES':
        return <VerPublicacoesScreen />;
      case 'EDITAR_PUBLICACAO':
        return <EditarPublicacaoScreen />;
      case 'OPCOES_PUBLICACAO':
        return <OpcoesPublicacaoScreen />;
      case 'CONFIRMAR_EXCLUSAO':
        return <ConfirmarExclusaoScreen />;
      case 'MENSAGENS':
      case 'CHAT':
        return <MensagensScreen />;
      case 'NOTIFICACOES':
        return <NotificacoesScreen />;

      default:
        return <TelaInicialScreen />;
    }
  };

  const { width: windowWidth } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 520;

  return (
    <View
      style={[
        styles.rootWrapper,
        {
          backgroundColor: isDesktopWeb ? '#F1F5F9' : theme.colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.deviceFrame,
          {
            backgroundColor: theme.colors.background,
          },
          isDesktopWeb && styles.desktopFrame,
        ]}
      >
        <StatusBar
          barStyle={theme.highContrast ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <SafeAreaView style={styles.contentWrap}>
          {renderCurrentScreen()}
        </SafeAreaView>
        <AccessibilityModal />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthAndDataProvider>
        <ScreenRouter />
      </AuthAndDataProvider>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    height: '100%',
    overflow: 'hidden',
  },
  desktopFrame: {
    maxHeight: 920,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginVertical: 16,
  },
  contentWrap: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 36) : 0,
    paddingBottom: Platform.OS === 'android' ? 28 : 0,
  },
});

