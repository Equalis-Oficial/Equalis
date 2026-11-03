import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';

export default function DetalhesVagaBanner({
  isSpeaking = false,
  onToggleVoiceAssist,
  colors,
}) {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerGradientBg}>
        <View style={styles.bannerContentRow}>
          {/* Lado Esquerdo: Textos institucionais + Logo Branca UNICEPLAC */}
          <View style={styles.bannerLeftCol}>
            <Image
              source={FIGMA_ASSETS.logoUniceplacBranca}
              style={{ width: 110, height: 36, marginBottom: 8 }}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Logo Branca UNICEPLAC Centro Universitário"
            />
            <Text accessibilityRole="header" style={styles.bannerVagasAbertasTitle}>
              Vagas Abertas
            </Text>
            <Text style={styles.bannerSubtitle}>
              Junte-se à nossa equipe!
            </Text>
            <Text style={styles.bannerEnvieCurriculo}>
              Envie seu currículo para:
            </Text>
            <View style={styles.orangeBadge}>
              <Text style={styles.orangeBadgeText}>www.uniceplac.edu.br</Text>
            </View>
          </View>

          {/* Lado Direito: Fotos Circulares Reais dos Atendentes com Headsets */}
          <View style={styles.bannerRightCol}>
            <View style={styles.atendentesCluster}>
              <Image
                source={FIGMA_ASSETS.atendente1}
                style={[styles.atendenteCircle, styles.atendenteCircle1]}
                resizeMode="cover"
                accessible={true}
                accessibilityLabel="Foto da colaboradora atendente"
              />
              <Image
                source={FIGMA_ASSETS.atendente2}
                style={[styles.atendenteCircle, styles.atendenteCircle2]}
                resizeMode="cover"
                accessible={true}
                accessibilityLabel="Foto do colaborador de atendimento"
              />
              <Image
                source={FIGMA_ASSETS.atendente3}
                style={[styles.atendenteCircle, styles.atendenteCircle3]}
                resizeMode="cover"
                accessible={true}
                accessibilityLabel="Foto da colaboradora de relacionamento acadêmico"
              />
            </View>

            {/* Botão de Ouvir Vaga em Áudio */}
            <TouchableOpacity
              onPress={onToggleVoiceAssist}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isSpeaking
                  ? 'Parar áudio explicativo da vaga'
                  : 'Ouvir toda a descrição e requisitos da vaga em voz alta'
              }
              style={[
                styles.audioSpeakerButton,
                { backgroundColor: isSpeaking ? colors.danger : 'rgba(255, 255, 255, 0.95)' },
              ]}
            >
              <Text style={styles.audioSpeakerIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
              <Text
                style={[
                  styles.audioSpeakerText,
                  { color: isSpeaking ? '#FFFFFF' : colors.primaryDark },
                ]}
              >
                {isSpeaking ? 'Parar' : 'Ouvir Vaga'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bannerGradientBg: {
    backgroundColor: '#067451',
    padding: 16,
  },
  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeftCol: {
    flex: 1.15,
  },
  bannerVagasAbertasTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    color: '#E0F2E9',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bannerEnvieCurriculo: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 8,
    opacity: 0.9,
  },
  orangeBadge: {
    backgroundColor: '#E8590C',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  orangeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  bannerRightCol: {
    flex: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atendentesCluster: {
    width: 120,
    height: 80,
    position: 'relative',
    marginBottom: 8,
  },
  atendenteCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
  },
  atendenteCircle1: {
    top: 0,
    left: 4,
    zIndex: 3,
  },
  atendenteCircle2: {
    top: 14,
    left: 36,
    zIndex: 2,
  },
  atendenteCircle3: {
    top: 28,
    left: 68,
    zIndex: 1,
  },
  audioSpeakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginTop: 4,
  },
  audioSpeakerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  audioSpeakerText: {
    fontWeight: '700',
    fontSize: 12,
  },
});

