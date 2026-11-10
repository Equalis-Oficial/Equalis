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

const cleanUtf8 = (str) => {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/Ã£/g, 'ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã/g, 'í');
};

const getContactAvatar = (contact) => {
  if (!contact || !contact.nome_contato) return FIGMA_ASSETS.fotoCharles;
  const n = contact.nome_contato.toLowerCase();
  if (n.includes('charles')) return FIGMA_ASSETS.fotoCharles;
  if (n.includes('helena')) return FIGMA_ASSETS.atendente1;
  if (n.includes('rafael')) return FIGMA_ASSETS.atendente2;
  return FIGMA_ASSETS.atendente3;
};

const ARTIGOS_FIQUE_POR_DENTRO = [
  {
    id: 1,
    tag: 'Legislação PcD',
    tagBg: '#EAF4FF',
    tagColor: '#007ADE',
    titulo: 'Lei de Cotas (Lei nº 8.213/91): Entenda seus Direitos',
    tempoLeitura: '4 min de leitura',
    resumo:
      'Empresas com 100 ou mais empregados são obrigadas a preencher de 2% a 5% dos seus cargos com beneficiários reabilitados ou pessoas com deficiência.',
    detalhes:
      'A legislação brasileira estabelece percentuais progressivos de contratação: até 200 empregados (2%), de 201 a 500 (3%), de 501 a 1.000 (4%) e de 1.001 em diante (5%). A dispensa imotivada de trabalhador reabilitado ou com deficiência só pode ocorrer após a contratação de substituto em condição semelhante.',
  },
  {
    id: 2,
    tag: 'Acessibilidade Digital',
    tagBg: '#E8F5E9',
    tagColor: '#2E7D32',
    titulo: 'Tecnologias Assistivas no Trabalho: O que a Empresa Deve Fornecer',
    tempoLeitura: '3 min de leitura',
    resumo:
      'Leitores de tela como NVDA e TalkBack, softwares ampliadores, periféricos adaptados e mesas ergonômicas fazem parte do direito à adaptação razoável garantido pela LBI.',
    detalhes:
      'A Lei Brasileira de Inclusão (Lei nº 13.146/2015) assegura que a recusa de adaptações razoáveis e de fornecimento de tecnologias assistivas constitui discriminação em razão da deficiência no ambiente de trabalho.',
  },
  {
    id: 3,
    tag: 'Carreira & Dicas',
    tagBg: '#FFF3E0',
    tagColor: '#E65100',
    titulo: 'Como Estruturar seu Currículo PcD e Homologação do Laudo CID',
    tempoLeitura: '5 min de leitura',
    resumo:
      'Saiba como destacar suas competências técnicas e descrever com clareza as adaptações de acessibilidade que você necessita durante a entrevista e o dia a dia.',
    detalhes:
      'Mantenha seu laudo médico atualizado com assinatura e CRM do médico, indicação expressa da deficiência e o código CID correspondente. Laudos de deficiências permanentes e irreversíveis têm validade permanente assegurada.',
  },
  {
    id: 4,
    tag: 'Eventos & Networking',
    tagBg: '#EDE7F6',
    tagColor: '#512DA8',
    titulo: 'Feira Virtual de Empregabilidade Inclusiva Equalis 2026',
    tempoLeitura: 'Evento Gratuito',
    resumo:
      'Conecte-se diretamente com recrutadores de tecnologia, finanças e serviços que possuem vagas afirmativas com suporte completo de acessibilidade.',
    detalhes:
      'Salas virtuais com intérprete de Libras simultâneo, legendagem em tempo real e audiodescrição de apresentações corporativas.',
  },
];

export default function RedeScreen() {
  const { theme, isAccessibleMode, speak } = useAccessibility();
  const { conexoes, alternarConexao, candidatoPerfil } = useAuthAndData();
  const { colors, typography, radius } = theme;

  const [activeTab, setActiveTab] = useState('AMPLIE'); // 'AMPLIE' | 'FIQUE_POR_DENTRO'
  const [accessibleIndex, setAccessibleIndex] = useState(0);
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  const totalMinhasConexoes =
    typeof candidatoPerfil?.conexoesCount === 'number' ? candidatoPerfil.conexoesCount : 0;

  const totalContatos = (conexoes || []).length;
  const currentAccessibleContact =
    totalContatos > 0 ? conexoes[accessibleIndex % totalContatos] : null;

  const handleProximoAcessivel = () => {
    if (totalContatos === 0) return;
    const nextIdx = (accessibleIndex + 1) % totalContatos;
    setAccessibleIndex(nextIdx);
    const nextContact = conexoes[nextIdx];
    speak(
      `Contato sugerido: ${nextContact.nome_contato}, ${cleanUtf8(nextContact.cargo_contato)}. Vocês possuem ${nextContact.conexoes_em_comum} conexões em comum. Status atual: ${nextContact.conectado ? 'Conectado' : 'Não conectado'}.`
    );
  };

  const handleToggleConexao = (id, nome) => {
    alternarConexao(id);
    const c = (conexoes || []).find((item) => item.id === id);
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
        accessibilityLabel={activeTab === 'AMPLIE' ? 'Lista de conexões profissionais' : 'Artigos e notícias inclusivas'}
      >
        {activeTab === 'AMPLIE' ? (
          <>
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
              currentAccessibleContact ? (
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
                  {/* Contador de Sugestões Acessível */}
                  <View style={styles.accessibleCounterBadge}>
                    <Text style={styles.accessibleCounterText}>
                      {`Sugestão ${(accessibleIndex % totalContatos) + 1} de ${totalContatos}`}
                    </Text>
                  </View>

                  {/* Foto Real do Contato Específico no Modo Acessível */}
                  <View style={styles.accessibleAvatarBox}>
                    <Image
                      source={getContactAvatar(currentAccessibleContact)}
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
                    {cleanUtf8(currentAccessibleContact.cargo_contato)}
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
              ) : null
            ) : (
              /* MODO PADRÃO COMPLETO (#232:168 e 25_REDE_PADRAO.png) */
              <View style={styles.contactsGrid}>
                {conexoes.map((item) => {
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
                        {/* Foto Real de Cada Contato */}
                        <View
                          style={[
                            styles.contactAvatarWrap,
                            { borderColor: colors.primary },
                          ]}
                        >
                          <Image
                            source={getContactAvatar(item)}
                            style={styles.contactAvatarImg}
                            accessible={true}
                            accessibilityLabel={`Foto de ${item.nome_contato}`}
                          />
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
                            {cleanUtf8(item.cargo_contato)}
                          </Text>
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.textMuted, marginTop: 4 },
                            ]}
                          >
                            {item.conexoes_em_comum} conexões em comum
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

            {/* Dica Construtiva de Rede */}
            <View
              style={[
                styles.networkTipCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Dica de Conexão Inclusiva
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>
                  Conectar-se com recrutadores especialistas e outros profissionais amplia sua visibilidade e facilita o compartilhamento de oportunidades com adaptações comprovadas de acessibilidade.
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* ABA FIQUE POR DENTRO — ARTIGOS E INFORMAÇÕES DE LEGISLAÇÃO E INCLUSÃO */
          <View style={styles.fiquePorDentroContainer}>
            <View style={styles.fiquePorDentroHeader}>
              <Text style={[typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                Notícias & Direitos PcD no Mercado
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textMuted, marginTop: 4 }]}>
                Orientações práticas sobre a Lei de Cotas, tecnologias assistivas e eventos inclusivos.
              </Text>
            </View>

            {ARTIGOS_FIQUE_POR_DENTRO.map((artigo) => {
              const isExpanded = expandedArticleId === artigo.id;
              return (
                <View
                  key={artigo.id}
                  style={[
                    styles.articleCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.articleTagRow}>
                    <View style={[styles.articleTagPill, { backgroundColor: artigo.tagBg }]}>
                      <Text style={[typography.caption, { color: artigo.tagColor, fontWeight: '700' }]}>
                        {artigo.tag}
                      </Text>
                    </View>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {artigo.tempoLeitura}
                    </Text>
                  </View>

                  <Text
                    style={[
                      typography.titleMedium,
                      { color: colors.textPrimary, fontWeight: '700', marginTop: 4 },
                    ]}
                  >
                    {artigo.titulo}
                  </Text>

                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
                    ]}
                  >
                    {artigo.resumo}
                  </Text>

                  {isExpanded && (
                    <View style={[styles.articleExpandedContent, { borderTopColor: colors.cardBorder }]}>
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: colors.textPrimary, lineHeight: 22, fontStyle: 'italic' },
                        ]}
                      >
                        {artigo.detalhes}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.articleActionsRow, { borderTopColor: colors.cardBorder }]}>
                    <TouchableOpacity
                      onPress={() => speak(`${artigo.titulo}. ${artigo.resumo}`, true)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Ouvir resumo do artigo ${artigo.titulo}`}
                      style={styles.articleAudioBtn}
                    >
                      <Text style={[typography.labelMedium, { color: colors.primaryDark, fontWeight: '700' }]}>
                        Ouvir Resumo
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setExpandedArticleId(isExpanded ? null : artigo.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={isExpanded ? 'Recolher detalhes' : 'Ler artigo completo'}
                      style={styles.articleReadBtn}
                    >
                      <Text style={[typography.labelMedium, { color: colors.primary, fontWeight: '700' }]}>
                        {isExpanded ? 'Menos detalhes ▲' : 'Ler mais ▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  accessibleCounterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  accessibleCounterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
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
  networkTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  fiquePorDentroContainer: {
    marginBottom: 20,
  },
  fiquePorDentroHeader: {
    marginBottom: 16,
  },
  articleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  articleTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  articleExpandedContent: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  articleActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  articleAudioBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  articleReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
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
