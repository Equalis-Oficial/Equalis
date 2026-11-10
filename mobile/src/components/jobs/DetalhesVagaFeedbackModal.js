import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIGMA_ICONS } from '../../theme/figmaAssets';

export default function DetalhesVagaFeedbackModal({
  visible = false,
  tipo = 'SUCESSO',
  titulo = '',
  mensagem = '',
  onClose,
  onConfirmCancel,
  colors,
  typography,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: tipo === 'SUCESSO' ? '#E6F4EA' : '#FEE2E2',
              },
            ]}
          >
            {tipo === 'SUCESSO' ? (
              <Image
                source={FIGMA_ICONS.check}
                style={{ width: 28, height: 28, tintColor: '#137333' }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: 26, fontWeight: '800', color: colors.danger }}>!</Text>
            )}
          </View>

          <Text
            style={[
              typography.titleLarge,
              styles.modalTitle,
              { color: colors.textPrimary },
            ]}
          >
            {titulo}
          </Text>

          <Text
            style={[
              typography.bodyLarge,
              styles.modalMessage,
              { color: colors.textSecondary },
            ]}
          >
            {mensagem}
          </Text>

          {tipo === 'CANCELAR' ? (
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.modalOutlineBtn, { borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.modalOutlineBtnText, { color: colors.textPrimary }]}>
                  Voltar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirmCancel}
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.danger }]}
              >
                <Text style={styles.modalPrimaryBtnText}>Sim, Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalPrimaryBtn, { backgroundColor: colors.primaryDark }]}
            >
              <Text style={styles.modalPrimaryBtnText}>Entendi, Obrigado!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalOutlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalOutlineBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

