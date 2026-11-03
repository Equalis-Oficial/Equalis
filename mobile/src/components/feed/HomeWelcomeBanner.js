import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function HomeWelcomeBanner({
  userType = 'CANDIDATO',
  primeiroNome = 'Candidato',
  empresaNome = 'Empresa',
  onActionPress,
  isAccessibleMode = false,
  colors,
  radius,
}) {
  const isEmpresa = userType === 'EMPRESA';

  return (
    <View
      style={[
        styles.welcomeBanner,
        { backgroundColor: colors.primary, borderRadius: radius.lg },
      ]}
    >
      <View style={styles.bannerTextCol}>
        <Text
          style={[
            styles.welcomeTitle,
            { color: '#FFFFFF', fontSize: isAccessibleMode ? 28 : 22 },
          ]}
          accessibilityRole="header"
        >
          {isEmpresa ? `Painel ${empresaNome}` : `Olá, ${primeiroNome}!`}
        </Text>
        <Text
          style={[
            styles.welcomeSubhead,
            { color: '#FFFFFF', fontSize: isAccessibleMode ? 18 : 15 },
          ]}
        >
          {isEmpresa
            ? 'Gestão de vagas e oportunidades inclusivas'
            : 'É bom te ver novamente dentro do equalis'}
        </Text>
        <Text
          style={[
            styles.welcomeCaption,
            { color: '#EAF4FF', fontSize: isAccessibleMode ? 14 : 12 },
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
          accessibilityLabel={isEmpresa ? 'Publicar nova vaga de emprego' : 'Ver vagas recomendadas para você'}
          accessibilityHint={isEmpresa ? 'Abre o formulário para cadastrar vaga' : 'Navega para a tela de busca de empregos'}
          style={[
            styles.bannerBtn,
            {
              backgroundColor: colors.primaryDark,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.bannerBtnText}>
            {isEmpresa ? '+ Publicar Vaga' : 'Ver Vagas'}
          </Text>
          <Text style={styles.bannerBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Ilustração Working Rafiki (#159:217 do Figma) */}
      <Image
        source={FIGMA_ASSETS.workingRafikiHome}
        style={styles.bannerRafikiImg}
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="Ilustração de profissional no computador"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bannerTextCol: {
    flex: 1.2,
    marginRight: 8,
  },
  welcomeTitle: {
    fontWeight: '800',
  },
  welcomeSubhead: {
    fontWeight: '700',
    marginTop: 4,
  },
  welcomeCaption: {
    marginTop: 4,
    lineHeight: 16,
  },
  bannerBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bannerBtnArrow: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  bannerRafikiImg: {
    flex: 0.8,
    height: 110,
  },
});
