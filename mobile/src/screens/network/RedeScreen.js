import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthAndData } from '../../context/AuthAndDataContext';
import { FIGMA_ASSETS } from '../../theme/figmaAssets';
import AccessibleHeader from '../../components/common/AccessibleHeader';
import BottomTabBar from '../../components/common/BottomTabBar';

export default function RedeScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { conexoes, alternarConexao, candidatoPerfil } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [activeTab, setActiveTab] = useState('AMPLIE'); // 'AMPLIE' | 'FIQUE_POR_DENTRO'
  const [accessibleIndex, setAccessibleIndex] = useState(0);

  const totalMinhasConexoes =
    typeof candidatoPerfil?.conexoesCount === 'number' ? candidatoPerfil.conexoesCount : 0;

  const currentAccessibleContact =
    conexoes[accessibleIndex % conexoes.length] || conexoes[0];

  const handleProximoAcessivel = () => {
    const nextIdx = (accessibleIndex + 1) % conexoes.length;
    setAccessibleIndex(nextIdx);
    const nextContact = conexoes[nextIdx];
    speak(
      `Contato sugerido: ${nextContact.nome_contato}, ${nextContact.cargo_contato}. Vocês possuem ${nextContact.conexoes_em_comum} conexões em comum. Status atual: ${nextContact.conectado ? 'Conectado' : 'Não conectado'}.`
    );
  };

  const handleToggleConexao = (id, nome) => {
    alternarConexao(id);
    const c = conexoes.find((item) => item.id === id);
    const novoStatus = !c?.conectado;
    if (novoStatus) {
      speak(`Solicitação de conexão enviada para ${nome}!`);
    } else {
      speak(`Conexão com ${nome} desfeita.`);
    }
  };

  const audioSummary =
    'Tela de Rede de Contatos do Equalis. Você pode ampliar suas conexões profissionais inclusivas, ver sugestões de recrutadores e profissionais com deficiência e gerenciar sua rede.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AccessibleHeader
        title="Rede de Conexões"
        showSearch={true}
        audioSummary={audioSummary}
      />

      {/* Tabs Superiores (#272:941 e #272:943 do Figma) */}
      <View
        style={[
          styles.topTabsBar,
          { backgroundColor: colors.background, borderBottomColor: colors.cardBorder },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('AMPLIE')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Aba Amplie suas conexões"
          accessibilityState={{ selected: activeTab === 'AMPLIE' }}
          style={[
            styles.tabButton,
            activeTab === 'AMPLIE' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 3,
            },
          ]}
        >
          <Text
            style={[
              typography.labelLarge,
              {
                color: activeTab === 'AMPLIE' ? colors.primary : colors.textMuted,
                fontWeight: activeTab === 'AMPLIE' ? '700' : '500',
              },
            ]}
          >
            Amplie suas conexões
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('FIQUE_POR_DENTRO')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Aba Fique por dentro de eventos e novidades"
          accessibilityState={{ selected: activeTab === 'FIQUE_POR_DENTRO' }}
          style={[
            styles.tabButton,
            activeTab === 'FIQUE_POR_DENTRO' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 3,
            },
          ]}
        >
          <Text
            style={[
              typography.labelLarge,
              {
                color:
                  activeTab === 'FIQUE_POR_DENTRO' ? colors.primary : colors.textMuted,
                fontWeight: activeTab === 'FIQUE_POR_DENTRO' ? '700' : '500',
              },
            ]}
          >
            Fique por dentro
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Lista de conexões e recomendações"
      >
        {/* Link / Resumo de Conexões Existentes (#286:324 do Figma) */}
        <View style={styles.myConnectionsRow}>
          <Text
            style={[
              typography.titleMedium,
              { color: colors.textPrimary, fontWeight: '700' },
            ]}
          >
            Ver suas conexões ({totalMinhasConexoes})
          </Text>
          <View
            style={[
              styles.connectionsBadge,
              { backgroundColor: colors.surfaceTint, borderColor: colors.primary },
            ]}
          >
            <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '700' }]}>
              Ativa
            </Text>
          </View>
        </View>

        {/* MODO ACESSÍVEL (#372:616 e 29_REDE_ACESSIVEL.png) */}
        {isAccessibleMode ? (
          <View
            style={[
              styles.accessibleCard,
              {
                backgroundColor: colors.primaryDark,
                borderRadius: radius.lg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {/* Foto Real de Charles Oliveira no Modo Acessível */}
            <View style={styles.accessibleAvatarBox}>
              <Image
                source={FIGMA_ASSETS.fotoCharles}
                style={styles.accessibleAvatarImg}
                accessible={true}
                accessibilityLabel={`Foto de perfil de ${currentAccessibleContact.nome_contato}`}
              />
            </View>

            <Text
              style={[
                styles.accessibleName,
                { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 12 },
              ]}
              accessibilityRole="header"
            >
              {currentAccessibleContact.nome_contato}
            </Text>

            <Text
              style={[
                styles.accessibleRole,
                { color: '#EAF4FF', fontSize: 18, marginTop: 6, lineHeight: 26, textAlign: 'center' },
              ]}
            >
              {currentAccessibleContact.cargo_contato}
            </Text>

            <View style={styles.accessibleStatsRow}>
              <View style={styles.accessibleStatItem}>
                <Text style={styles.accessibleStatLabel}>Conexões em comum</Text>
                <Text style={styles.accessibleStatValue}>
                  {currentAccessibleContact.conexoes_em_comum}
                </Text>
              </View>

              <View style={styles.accessibleStatItem}>
                <Text style={styles.accessibleStatLabel}>Total da rede</Text>
                <Text style={styles.accessibleStatValue}>
                  {currentAccessibleContact.total_conexoes}
                </Text>
              </View>
            </View>

            {/* Botões Grandes do Modo Acessível: "Adicionar" e "Próximo" */}
            <View style={styles.accessibleButtonsRow}>
              <TouchableOpacity
                onPress={() =>
                  handleToggleConexao(
                    currentAccessibleContact.id,
                    currentAccessibleContact.nome_contato
                  )
                }
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={
                  currentAccessibleContact.conectado
                    ? 'Desconectar de ' + currentAccessibleContact.nome_contato
                    : 'Adicionar conexão com ' + currentAccessibleContact.nome_contato
                }
                style={[
                  styles.accessibleActionBtn,
                  {
                    backgroundColor: currentAccessibleContact.conectado
                      ? colors.success
                      : '#FFFFFF',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.accessibleActionBtnText,
                    {
                      color: currentAccessibleContact.conectado
                        ? '#FFFFFF'
                        : colors.primaryDark,
                    },
                  ]}
                >
                  {currentAccessibleContact.conectado ? 'Conectado ✓' : 'Adicionar +'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleProximoAcessivel}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ver próximo contato sugerido"
                style={[
                  styles.accessibleNextBtn,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: '#FFFFFF' },
                ]}
              >
                <Text style={styles.accessibleNextBtnText}>Próximo →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* MODO PADRÃO COMPLETO (#232:168 e 25_REDE_PADRAO.png) */
          <View style={styles.contactsGrid}>
            {conexoes.map((item, index) => {
              const isCharles = item.nome_contato.includes('Charles') || index === 0;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.cardBorder,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <View style={styles.contactCardTop}>
                    {/* Foto Real de Charles Oliveira no primeiro card (#25_REDE_PADRAO.png) */}
                    <View
                      style={[
                        styles.contactAvatarWrap,
                        { borderColor: colors.primary },
                      ]}
                    >
                      {isCharles ? (
                        <Image
                          source={FIGMA_ASSETS.fotoCharles}
                          style={styles.contactAvatarImg}
                          accessible={true}
                          accessibilityLabel={`Foto de ${item.nome_contato}`}
                        />
                      ) : (
                        <View style={styles.contactAvatarPlaceholder}>
                          <Text style={{ fontSize: 26 }}>👨🏽‍💼</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.contactInfoCol}>
                      <Text
                        style={[
                          typography.labelLarge,
                          { color: colors.textPrimary, fontWeight: '700' },
                        ]}
                      >
                        {item.nome_contato}
                      </Text>
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
                        ]}
                        numberOfLines={2}
                      >
                        {item.cargo_contato}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.textMuted, marginTop: 4 },
                        ]}
                      >
                        🔗 {item.conexoes_em_comum} conexões em comum
                      </Text>
                    </View>
                  </View>

                  {/* Botão Adicionar / Conectado */}
                  <TouchableOpacity
                    onPress={() => handleToggleConexao(item.id, item.nome_contato)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.conectado
                        ? `Conectado com ${item.nome_contato}. Toque para desconectar`
                        : `Adicionar ${item.nome_contato} à sua rede`
                    }
                    style={[
                      styles.connectBtn,
                      {
                        backgroundColor: item.conectado
                          ? colors.surfaceTint
                          : colors.primaryDark,
                        borderColor: colors.primaryDark,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.labelLarge,
                        {
                          color: item.conectado ? colors.primaryDark : '#FFFFFF',
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {item.conectado ? 'Conectado ✓' : 'Adicionar +'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Ilustração Oficial do Figma na base da tela: Software Engineer (#291:337 do Figma) */}
        <View
          style={[
            styles.comingSoonBox,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text
            style={[
              typography.titleMedium,
              {
                color: colors.textPrimary,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 8,
              },
            ]}
          >
            Em breve mais funções estarão chegando nesta área
          </Text>

          <Image
            source={FIGMA_ASSETS.softwareEngineerRede}
            style={styles.softwareEngineerImg}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Ilustração de engenheiro de software trabalhando com acessibilidade"
          />

          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textMuted, textAlign: 'center', marginTop: 8 },
            ]}
          >
            Mentorias inclusivas, grupos temáticos de PcD e eventos de contratação direta.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomTabBar activeTab="REDE" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  myConnectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  connectionsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  contactsGrid: {
    marginBottom: 16,
  },
  contactCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  contactCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactAvatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  contactAvatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  contactAvatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfoCol: {
    flex: 1,
  },
  connectBtn: {
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessibleCard: {
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    alignItems: 'center',
    elevation: 4,
  },
  accessibleAvatarBox: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  accessibleAvatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  accessibleName: {
    textAlign: 'center',
  },
  accessibleRole: {
    textAlign: 'center',
  },
  accessibleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
  },
  accessibleStatItem: {
    alignItems: 'center',
  },
  accessibleStatLabel: {
    color: '#EAF4FF',
    fontSize: 13,
  },
  accessibleStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  accessibleButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  accessibleActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  accessibleActionBtnText: {
    fontWeight: '700',
    fontSize: 18,
  },
  accessibleNextBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  accessibleNextBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  comingSoonBox: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  softwareEngineerImg: {
    width: '100%',
    height: 210,
  },
});
