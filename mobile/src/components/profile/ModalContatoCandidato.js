import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModalContatoCandidato({
  visible = false,
  onClose,
  candidatoPerfil = {},
  colors,
  typography,
  radius,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.contactModalCard,
            { backgroundColor: colors.background, borderRadius: radius.lg },
          ]}
        >
          <Text
            style={[
              typography.titleMedium,
              { color: colors.textPrimary, fontWeight: '700', marginBottom: 16 },
            ]}
            accessibilityRole="header"
          >
            Informações de Contato
          </Text>

          <View style={styles.contactItemRow}>
            <Text style={styles.contactIcon}>📧</Text>
            <View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>E-mail</Text>
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}>
                {candidatoPerfil.email || 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.contactItemRow}>
            <Text style={styles.contactIcon}>📍</Text>
            <View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Localização</Text>
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}>
                {candidatoPerfil.cidade
                  ? `${candidatoPerfil.cidade}, ${candidatoPerfil.estado || 'DF'} - ${candidatoPerfil.pais || 'Brasil'}`
                  : 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.contactItemRow}>
            <Text style={styles.contactIcon}>📄</Text>
            <View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Currículo Anexo</Text>
              <Text style={[typography.bodyLarge, { color: colors.primaryDark, fontWeight: '600' }]}>
                {candidatoPerfil.url_curriculo || 'Nenhum currículo anexado'}
              </Text>
            </View>
          </View>

          <View style={styles.contactItemRow}>
            <Text style={styles.contactIcon}>♿</Text>
            <View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Laudo Médico PcD</Text>
              <Text style={[typography.bodyLarge, { color: colors.success, fontWeight: '600' }]}>
                {candidatoPerfil.url_laudo_medico ? 'Laudo Verificado ✓' : 'Pendente'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal de informações de contato"
            style={[
              styles.modalCloseBtn,
              { backgroundColor: colors.primaryDark, marginTop: 16 },
            ]}
          >
            <Text style={styles.modalCloseBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contactModalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    elevation: 5,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  contactIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  modalCloseBtn: {
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

