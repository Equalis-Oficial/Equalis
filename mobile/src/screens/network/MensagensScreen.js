import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function MensagensScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { mensagens, enviarMensagem, marcarMensagemComoLida, goBack } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [chatModalVisible, setChatModalVisible] = useState(false);

  React.useEffect(() => {
    if (Array.isArray(mensagens) && marcarMensagemComoLida) {
      mensagens.forEach((m) => {
        if (m.nao_lida) {
          marcarMensagemComoLida(m.id);
        }
      });
    }
  }, [mensagens, marcarMensagemComoLida]);

  const handleOpenConversation = (conversa) => {
    setSelectedConversation(conversa);
    setChatModalVisible(true);
    if (conversa.nao_lida && marcarMensagemComoLida) {
      marcarMensagemComoLida(conversa.id);
    }
    speak(
      `Conversa com ${conversa.remetente_nome}. Mensagem recebida: ${conversa.conteudo}.`
    );
  };

  const handleEnviarResposta = () => {
    if (!respostaTexto.trim()) {
      Alert.alert('Mensagem vazia', 'Por favor, digite uma resposta para enviar.');
      return;
    }

    enviarMensagem(selectedConversation?.remetente_nome, respostaTexto.trim());
    speak('Mensagem enviada com sucesso!');
    setRespostaTexto('');
    Alert.alert('Mensagem enviada', 'Sua resposta foi entregue ao recrutador.');
  };

  const audioSummary = `Tela de Mensagens Geral. Você possui ${mensagens.length} conversas com empresas e recrutadores inclusivos.`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Mensagens Geral"
        showBack={true}
        onBack={() => goBack('HOME')}
        audioSummary={audioSummary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Lista de mensagens e conversas com recrutadores"
      >
        <View style={styles.headerTitleRow}>
          <Text
            style={[
              typography.titleLarge,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                fontSize: isAccessibleMode ? 26 : 22,
              },
            ]}
            accessibilityRole="header"
          >
            Mensagens Geral
          </Text>
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: colors.primaryDark },
            ]}
          >
            <Text style={styles.unreadBadgeText}>
              {mensagens.filter((m) => m.nao_lida).length} novas
            </Text>
          </View>
        </View>

        <Text style={[typography.bodyMedium, { color: colors.textMuted, marginBottom: 16 }]}>
          Comunique-se diretamente com recrutadores de empresas comprometidas com a inclusão e acessibilidade.
        </Text>

        {/* Lista de Conversas (#441:276 e 36_MENSAGENS_ACESSIVEL.png) */}
        <View style={styles.conversationsList}>
          {mensagens.length === 0 ? (
            <View
              style={[
                styles.conversaCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingVertical: 28,
                },
              ]}
              accessible={true}
              accessibilityLabel="Nenhuma conversa no momento"
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>💬</Text>
              <Text
                style={[
                  typography.titleMedium,
                  { color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
                ]}
              >
                Nenhuma mensagem no momento
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: 20,
                  },
                ]}
              >
                Quando empresas ou recrutadores entrarem em contato sobre suas candidaturas, as conversas aparecerão aqui.
              </Text>
            </View>
          ) : (
            mensagens.map((item, index) => {
              const isUniceplac = (item.remetente_nome || '').includes('UNICEPLAC');

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleOpenConversation(item)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Conversa com ${item.remetente_nome}, ${item.remetente_cargo}. Mensagem: ${item.conteudo}. Horário: ${item.horario}. ${item.nao_lida ? 'Não lida' : 'Lida'}`}
                accessibilityHint="Toque duas vezes para abrir o chat completo"
                style={[
                  styles.conversaCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: item.nao_lida ? colors.primary : colors.cardBorder,
                    borderRadius: radius.md,
                    borderWidth: isAccessibleMode || item.nao_lida ? 2 : 1,
                  },
                ]}
              >
                {/* Avatar Oficial: UNICEPLAC ou Foto de Charles (#36_MENSAGENS_ACESSIVEL.png) */}
                <View style={styles.avatarBox}>
                  {isUniceplac ? (
                    <Image
                      source={FIGMA_ASSETS.logoUniceplacQuadrada}
                      style={styles.avatarLogoImg}
                      accessible={true}
                      accessibilityLabel={item.remetente_nome ? `Logo de ${item.remetente_nome}` : 'Logo da Empresa'}
                    />
                  ) : (
                    <Image
                      source={FIGMA_ASSETS.fotoCharles}
                      style={styles.avatarCharlesImg}
                      accessible={true}
                      accessibilityLabel="Foto do recrutador"
                    />
                  )}
                </View>

                {/* Conteúdo da Conversa */}
                <View style={styles.conversaMeta}>
                  <View style={styles.conversaHeader}>
                    <Text
                      style={[
                        typography.labelLarge,
                        {
                          color: colors.textPrimary,
                          fontWeight: '700',
                          flex: 1,
                          fontSize: isAccessibleMode ? 17 : 15,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.remetente_nome}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                      {item.horario}
                    </Text>
                  </View>

                  <Text
                    style={[
                      typography.caption,
                      { color: colors.primaryDark, fontWeight: '600', marginTop: 1 },
                    ]}
                  >
                    {item.remetente_cargo}
                  </Text>

                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: colors.textSecondary,
                        marginTop: 4,
                        lineHeight: 20,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.conteudo}
                  </Text>
                </View>

                {/* Badge de Não Lida (#441:296 do Figma) */}
                {item.nao_lida ? (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.unreadDotText}>1</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE CHAT / RESPOSTA RÁPIDA */}
      <Modal
        visible={chatModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.chatModalCard,
              { backgroundColor: colors.background, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.titleMedium,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                  accessibilityRole="header"
                >
                  {selectedConversation?.remetente_nome}
                </Text>
                <Text style={[typography.caption, { color: colors.primaryDark }]}>
                  {selectedConversation?.remetente_cargo}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    speak(
                      `Mensagem recebida: ${selectedConversation.conteudo}`
                    );
                  }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ouvir mensagem por voz alta"
                style={[
                  styles.audioBtn,
                  { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🔊 Ouvir</Text>
              </TouchableOpacity>
            </View>

            {/* Balão de Mensagem Recebida */}
            <View
              style={[
                styles.messageBubbleIn,
                { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[typography.bodyLarge, { color: colors.textPrimary, lineHeight: 22 }]}>
                {selectedConversation?.conteudo}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, alignSelf: 'flex-end', marginTop: 4 },
                ]}
              >
                {selectedConversation?.horario}
              </Text>
            </View>

            {/* Input de Resposta */}
            <View
              style={[
                styles.replyBoxWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
              ]}
            >
              <TextInput
                value={respostaTexto}
                onChangeText={setRespostaTexto}
                placeholder="Escreva sua resposta para o recrutador..."
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={3}
                style={[
                  styles.replyTextInput,
                  typography.bodyMedium,
                  { color: colors.textPrimary, textAlignVertical: 'top' },
                ]}
                accessible={true}
                accessibilityLabel="Campo para digitar sua resposta"
              />
            </View>

            {/* Botões de Ação do Chat */}
            <View style={styles.chatActionButtonsRow}>
              <TouchableOpacity
                onPress={() => setChatModalVisible(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Fechar conversa"
                style={[
                  styles.chatCloseBtn,
                  { borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[typography.labelLarge, { color: colors.textSecondary }]}>
                  Fechar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEnviarResposta}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensagem agora"
                style={[
                  styles.chatSendBtn,
                  { backgroundColor: colors.primaryDark },
                ]}
              >
                <Text style={styles.chatSendBtnText}>Enviar Mensagem ✈️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar activeTab="HOME" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  unreadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  conversationsList: {
    marginTop: 4,
  },
  conversaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarLogoImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  avatarCharlesImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversaMeta: {
    flex: 1,
  },
  conversaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadDotText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatModalCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  audioBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  messageBubbleIn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  replyBoxWrapper: {
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    marginBottom: 16,
  },
  replyTextInput: {
    flex: 1,
    minHeight: 60,
  },
  chatActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chatCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  chatSendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  chatSendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
