/**
 * Motor Global de Acessibilidade — Equalis
 * Gerencia:
 * - Modo Tela Acessível Simplificada vs. Modo Padrão Completo (fiel ao Figma)
 * - Leitura em Voz Alta em Português (Text-to-Speech via Web Speech API / expo-speech)
 * - Legenda Visual Assistiva simultânea (acessibilidade auditiva + visual)
 * - Escalonamento Tipográfico Dinâmico (100%, 120%, 140%)
 * - Modo de Alto Contraste (WCAG 2.2 AAA)
 */
import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { getThemeTokens } from '../theme/tokens';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechBannerText, setSpeechBannerText] = useState('');
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const speechTimerRef = useRef(null);

  const stopSpeaking = useCallback(() => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}
    setIsSpeaking(false);
    setSpeechBannerText('');
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;

    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    setSpeechBannerText(text);
    setIsSpeaking(true);

    // Duração dinâmica calculada para auto-dispensar o banner suavemente
    const displayDuration = Math.min(Math.max(text.length * 60, 3500), 7500);
    speechTimerRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setSpeechBannerText('');
      speechTimerRef.current = null;
    }, displayDuration);

    // Anunciar também para TalkBack / VoiceOver nativo
    try {
      if (AccessibilityInfo && AccessibilityInfo.announceForAccessibility) {
        AccessibilityInfo.announceForAccessibility(text);
      }
    } catch (_) {}

    // Síntese de voz no navegador (Expo Web)
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeechBannerText('');
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeechBannerText('');
        };
        window.speechSynthesis.speak(utterance);
      }
    } catch (_) {}
  }, []);

  const cycleFontScale = useCallback(() => {
    setFontScale((prev) => {
      if (prev < 1.15) return 1.2;
      if (prev < 1.35) return 1.4;
      return 1.0;
    });
  }, []);

  const theme = useMemo(
    () => getThemeTokens({ fontScale, highContrast, isAccessibleMode }),
    [fontScale, highContrast, isAccessibleMode]
  );

  const value = useMemo(
    () => ({
      theme,
      isAccessibleMode,
      setIsAccessibleMode,
      fontScale,
      setFontScale,
      cycleFontScale,
      highContrast,
      setHighContrast,
      isSpeaking,
      speechBannerText,
      speak,
      stopSpeaking,
      isA11yModalOpen,
      setIsA11yModalOpen,
    }),
    [
      theme,
      isAccessibleMode,
      fontScale,
      cycleFontScale,
      highContrast,
      isSpeaking,
      speechBannerText,
      speak,
      stopSpeaking,
      isA11yModalOpen,
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility deve ser utilizado dentro de AccessibilityProvider');
  }
  return ctx;
}

