/**
 * Design Tokens — Equalis
 * Mapeados diretamente do protótipo no Figma (VcMPiZPmrPYgFWdjswKuDZ)
 * com suporte nativo a Escala de Fonte e Modo de Alto Contraste (WCAG 2.2 AAA).
 */

export const BASE_COLORS = {
  // Paleta Principal do Figma
  primary: '#007ADE',        // Azul principal Equalis (fill_89146a51)
  primaryDark: '#1F41BB',    // Azul escuro botões/bordas (fill_2aab5044)
  secondaryBlue: '#0966C2',  // Azul institucional / LinkedIn-style (fill_0966C2)
  accessibleNavy: '#1D2F5F', // Azul marinho dos cards da Tela Acessível
  accentCyan: '#00B2FF',     // Destaque sutil
  uniceplacGreen: '#067451', // Verde institucional UNICEPLAC (EL-ae9bee27)
  success: '#1E8E3E',        // Verde confirmação acessível (contraste AA/AAA)
  warning: '#D97706',        // Laranja alerta
  danger: '#D93025',         // Vermelho erro semântico acessível

  // Superfícies e Fundos do Figma
  background: '#FFFFFF',     // Fundo principal (fill_658ab2fa)
  surfaceSoft: '#F9FAFF',    // Fundo suave (fill_9ebf3aa8)
  surfaceTint: '#F1F4FF',    // Fundo decorativo / chips (fill_897846b3)
  inputBg: '#F6F6F6',        // Fundo dos inputs no Figma
  dividerBeige: '#E9E5DF',   // Divisor de seções no Perfil/Feed (Figma)
  cardBorder: '#DFE4E9',     // Borda de cards e checkboxes

  // Tipografia (Contraste corrigido para >= 4.5:1 AA)
  textPrimary: '#191919',    // Texto principal (fill_0f8538f0)
  textBlack: '#000000',
  textSecondary: '#494949',  // Texto secundário legível (contraste 8.9:1 sobre branco)
  textMuted: '#565C65',      // Subtítulos e metadados (contraste 6.7:1 sobre branco)
  textOnPrimary: '#FFFFFF',
};

export const HIGH_CONTRAST_COLORS = {
  ...BASE_COLORS,
  primary: '#004494',
  primaryDark: '#002868',
  accessibleNavy: '#0A1931',
  background: '#FFFFFF',
  surfaceSoft: '#FFFFFF',
  surfaceTint: '#E6F0FF',
  inputBg: '#FFFFFF',
  cardBorder: '#191919',
  textPrimary: '#000000',
  textSecondary: '#191919',
  textMuted: '#222222',
  danger: '#B30000',
  success: '#0D652D',
};

export function getThemeTokens({ fontScale = 1, highContrast = false, isAccessibleMode = false } = {}) {
  const colors = highContrast ? HIGH_CONTRAST_COLORS : BASE_COLORS;
  const effectiveScale = isAccessibleMode ? Math.max(fontScale, 1.12) : fontScale;

  const scale = (size) => Math.round(size * effectiveScale);

  return {
    colors,
    isAccessibleMode,
    highContrast,
    fontScale: effectiveScale,
    typography: {
      displayLarge: {
        fontSize: scale(28),
        lineHeight: scale(36),
        fontWeight: '700',
      },
      titleLarge: {
        fontSize: scale(22),
        lineHeight: scale(30),
        fontWeight: '700',
      },
      titleMedium: {
        fontSize: scale(18),
        lineHeight: scale(26),
        fontWeight: '600',
      },
      bodyLarge: {
        fontSize: scale(16),
        lineHeight: scale(24),
        fontWeight: '400',
      },
      bodyMedium: {
        fontSize: scale(14),
        lineHeight: scale(21),
        fontWeight: '400',
      },
      labelLarge: {
        fontSize: scale(15),
        lineHeight: scale(22),
        fontWeight: '600',
      },
      caption: {
        fontSize: scale(13),
        lineHeight: scale(18),
        fontWeight: '500',
      },
    },
    spacing: {
      xs: 6,
      sm: 10,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radius: {
      sm: 8,
      md: 10,   // Borda padrão de botões e inputs no Figma
      lg: 16,   // Cards da Tela Acessível e vagas
      pill: 999,
    },
    touchTarget: {
      minHeight: isAccessibleMode ? 56 : 48, // WCAG 2.2 AA/AAA Target Size
    },
  };
}

