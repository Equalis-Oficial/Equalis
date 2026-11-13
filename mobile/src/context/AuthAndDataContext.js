/**
 * Contexto Global de Dados, Navegação e Regras de Negócio — Equalis
 * Implementa todos os métodos do Diagrama de Classes (pág. 12), MER (pág. 11)
 * e sincronização em tempo real com o Backend MySQL 8 (localhost:3333 / LAN IP).
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { apiFetch, buildCandidateApiUrls, API_CANDIDATE_URLS, getActiveApiBaseUrl } from '../services/apiClient';
import {
  INITIAL_DEFICIENCIAS,
  INITIAL_VAGAS,
  EMPTY_CANDIDATO,
  MARIA_PERFIL,
  MARIA_FORMACOES,
  MARIA_EXPERIENCIAS,
  MARIA_CANDIDATURAS,
  DEFAULT_EMPRESA,
  EMPTY_EMPRESA,
  INITIAL_CONEXOES,
  INITIAL_PUBLICACOES,
  INITIAL_MENSAGENS,
  INITIAL_NOTIFICACOES,
  DEFAULT_NOTIFICACOES,
} from '../services/initialData';

export {
  apiFetch,
  buildCandidateApiUrls,
  API_CANDIDATE_URLS,
  getActiveApiBaseUrl,
  INITIAL_DEFICIENCIAS,
  INITIAL_VAGAS,
  EMPTY_CANDIDATO,
  MARIA_PERFIL,
  MARIA_FORMACOES,
  MARIA_EXPERIENCIAS,
  MARIA_CANDIDATURAS,
  DEFAULT_EMPRESA,
  EMPTY_EMPRESA,
  INITIAL_CONEXOES,
  INITIAL_PUBLICACOES,
  INITIAL_MENSAGENS,
  INITIAL_NOTIFICACOES,
  DEFAULT_NOTIFICACOES,
};

const AuthAndDataContext = createContext(null);
const API_BASE_URL = '/api';

export function AuthAndDataProvider({ children }) {
  // Navegação estruturada entre as 36 telas do Figma
  const [currentScreen, setCurrentScreen] = useState('TELA_INICIAL');
  const [screenParams, setScreenParams] = useState({});
  const [history, setHistory] = useState([]);

  // Estado do Usuário Autenticado (Candidato ou Empresa)
  const [userType, setUserType] = useState('CANDIDATO'); // 'CANDIDATO' | 'EMPRESA'
  const [searchTerm, setSearchTerm] = useState('');

  const alternarPapel = useCallback(() => {
    setUserType((prev) => (prev === 'CANDIDATO' ? 'EMPRESA' : 'CANDIDATO'));
  }, []);
  const activeSessionRef = useRef(0);
  const [candidatoPerfil, setCandidatoPerfil] = useState(EMPTY_CANDIDATO);
  const [empresaPerfil, setEmpresaPerfil] = useState(EMPTY_EMPRESA);

  const [deficiencias] = useState(INITIAL_DEFICIENCIAS);
  const [vagas, setVagas] = useState(INITIAL_VAGAS);
  const [selectedVagaId, setSelectedVagaId] = useState(1);

  const [candidaturas, setCandidaturas] = useState([]);

  const [formacoes, setFormacoes] = useState([]);

  const [experiencias, setExperiencias] = useState([]);

  const [publicacoes, setPublicacoes] = useState([]);

  const [conexoes, setConexoes] = useState([]);

  const [mensagens, setMensagens] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);

  const notificacoesNaoLidasCount = useMemo(() => {
    if (Array.isArray(notificacoes)) {
      return notificacoes.filter((n) => Number(n.lida) === 0 || n.lida === false).length;
    }
    return serverUnreadCount;
  }, [notificacoes, serverUnreadCount]);

  const [sessionToken, setSessionToken] = useState(null);

  // Carregar notificações do backend (UC-22 / RN-031)
  const carregarNotificacoes = useCallback(async (customUserId, customUserType) => {
    const activeUserId = customUserId || (userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id);
    const activeUserType = customUserType || userType;

    if (!activeUserId) {
      setNotificacoes([]);
      setServerUnreadCount(0);
      return { total: 0, nao_lidas: 0, notificacoes: [] };
    }

    try {
      const res = await apiFetch(`${API_BASE_URL}/notificacoes?usuario_id=${activeUserId}&usuario_tipo=${activeUserType}`);
      if (res && res.ok) {
        const data = await res.json();
        const items = Array.isArray(data.notificacoes) ? data.notificacoes : (Array.isArray(data) ? data : []);
        const normalized = items.map((n) => ({
          ...n,
          lida: Number(n.lida) === 1 || n.lida === true ? 1 : 0,
          tipo: n.tipo || n.tipo_evento || 'CANDIDATURA',
          tipo_evento: n.tipo_evento || n.tipo || 'CANDIDATURA',
        }));
        setNotificacoes(normalized);
        const unread = typeof data.nao_lidas === 'number' ? data.nao_lidas : normalized.filter((n) => Number(n.lida) === 0).length;
        setServerUnreadCount(unread);
        return data;
      }
    } catch (_) {
      // Preserva o estado atual em caso de falha de rede
    }
    return { total: 0, nao_lidas: 0, notificacoes: [] };
  }, [userType, empresaPerfil?.id, candidatoPerfil?.id]);

  // Baixa de notificação individual (RN-031) com atualização otimista imediata
  const marcarNotificacaoComoLida = useCallback(async (notificacaoId) => {
    const notifIdNum = Number(notificacaoId);
    // 1. Atualização Otimista Imediata (decrementa o badge na hora)
    setNotificacoes((prev) =>
      prev.map((n) =>
        n.id === notifIdNum || String(n.id) === String(notificacaoId)
          ? { ...n, lida: 1 }
          : n
      )
    );

    const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
    try {
      const res = await apiFetch(`${API_BASE_URL}/notificacoes/${notificacaoId}/lida`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: activeUserId }),
      });
      if (res && res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Falha de rede silenciosa preservando estado otimista
    }
    return { success: true, id: notifIdNum, lida: 1 };
  }, [userType, empresaPerfil?.id, candidatoPerfil?.id]);

  // Baixa em lote de todas as notificações (RN-031) com atualização otimista imediata
  const marcarTodasNotificacoesComoLidas = useCallback(async () => {
    // 1. Atualização Otimista Imediata (zera o badge na hora)
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: 1 })));
    setServerUnreadCount(0);

    const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
    try {
      const res = await apiFetch(`${API_BASE_URL}/notificacoes/marcar-todas-lidas`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: activeUserId || 1,
          usuario_tipo: userType,
        }),
      });
      if (res && res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Falha de rede silenciosa preservando estado otimista
    }
    return { success: true, afetadas: notificacoes.length };
  }, [userType, empresaPerfil?.id, candidatoPerfil?.id, notificacoes.length]);

  // Criação de notificação
  const criarNotificacao = useCallback(async (dados) => {
    const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
    const payload = {
      usuario_id: dados.usuario_id || activeUserId,
      usuario_tipo: dados.usuario_tipo || userType,
      tipo_evento: dados.tipo_evento || dados.tipo || 'CANDIDATURA',
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      referencia_id: dados.referencia_id || null,
    };

    try {
      const res = await apiFetch(`${API_BASE_URL}/notificacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res && res.ok) {
        const nova = await res.json();
        const normalizada = { ...nova, lida: 0 };
        setNotificacoes((prev) => [normalizada, ...prev]);
        return normalizada;
      }
    } catch (err) {
      const novaMock = { id: Date.now(), ...payload, lida: 0, created_at: new Date().toISOString() };
      setNotificacoes((prev) => [novaMock, ...prev]);
      return novaMock;
    }
  }, [userType, empresaPerfil?.id, candidatoPerfil?.id]);

  // Sincronização inicial com o Backend Node/MySQL (equalis_db)
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/vagas`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setVagas(data);
        }
      })
      .catch(() => {});

    apiFetch(`${API_BASE_URL}/publicacoes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPublicacoes(data);
        }
      })
      .catch(() => {});

    apiFetch(`${API_BASE_URL}/conexoes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setConexoes(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sincronização isolada por usuário autenticado (mensagens, candidaturas e curtidas próprias)
  useEffect(() => {
    const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
    if (!sessionToken || !activeUserId) {
      setMensagens([]);
      return;
    }

    apiFetch(`${API_BASE_URL}/mensagens?usuario_id=${activeUserId}&usuario_tipo=${userType}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setMensagens(data);
        }
      })
      .catch(() => {});

    const candQuery =
      userType === 'EMPRESA'
        ? `empresa_id=${activeUserId}`
        : `candidato_id=${activeUserId}`;
    apiFetch(`${API_BASE_URL}/candidaturas?${candQuery}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCandidaturas(data);
        }
      })
      .catch(() => {});

    apiFetch(`${API_BASE_URL}/publicacoes?usuario_id=${activeUserId}&usuario_tipo=${userType}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPublicacoes(data);
        }
      })
      .catch(() => {});

    carregarNotificacoes(activeUserId, userType);
  }, [sessionToken, userType, candidatoPerfil?.id, empresaPerfil?.id, carregarNotificacoes]);

  const navigate = useCallback(
    (nextScreen, params = {}) => {
      setHistory((prev) => [...prev, { screen: currentScreen, params: screenParams }]);
      if (params.vagaId) {
        setSelectedVagaId(params.vagaId);
      }
      setScreenParams(params);
      setCurrentScreen(nextScreen);
    },
    [currentScreen, screenParams]
  );

  const executarBusca = useCallback(
    (termo) => {
      setSearchTerm(termo);
      navigate('EMPREGO', { busca: termo });
    },
    [navigate]
  );

  const goBack = useCallback(
    (fallbackScreen = 'HOME') => {
      setHistory((prev) => {
        if (prev.length === 0) {
          setCurrentScreen(fallbackScreen);
          setScreenParams({});
          return [];
        }
        const last = prev[prev.length - 1];
        setCurrentScreen(last.screen);
        setScreenParams(last.params || {});
        return prev.slice(0, -1);
      });
    },
    []
  );

  // Encerramento completo de sessão (R5 / AC Data & State)
  const logout = useCallback(() => {
    activeSessionRef.current++;
    setSessionToken(null);
    setUserType('CANDIDATO');
    setCandidatoPerfil(EMPTY_CANDIDATO);
    setEmpresaPerfil(EMPTY_EMPRESA);
    setFormacoes([]);
    setExperiencias([]);
    setCandidaturas([]);
    setMensagens([]);
    setNotificacoes(INITIAL_NOTIFICACOES || []);
    setServerUnreadCount(0);
    setConexoes([]);
    setPublicacoes((prev) => prev.map((p) => ({ ...p, curtidoPeloUsuario: false })));
    setSearchTerm('');
    setScreenParams({});
    setHistory([]);
    setCurrentScreen('TELA_INICIAL');
  }, []);

  // Autenticação Real no MySQL (POST /api/auth/login) com isolamento estrito de conta (R1)
  const login = useCallback(async (email, senha, tipo) => {
    const emailNorm = String(email || '').trim().toLowerCase();
    const sessionEpoch = ++activeSessionRef.current;
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, senha, tipo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.erro || 'Falha ao autenticar no servidor.');
      }
      if (activeSessionRef.current !== sessionEpoch) return data;
      setMensagens([]);
      setPublicacoes((prev) => prev.map((p) => ({ ...p, curtidoPeloUsuario: false })));
      setSessionToken(data.token);
      setUserType(data.tipo);
      if (data.tipo === 'EMPRESA') {
        setConexoes([]);
        setCandidatoPerfil(EMPTY_CANDIDATO);
        setFormacoes([]);
        setExperiencias([]);
        setCandidaturas([]);
        setEmpresaPerfil({
          ...EMPTY_EMPRESA,
          ...(data.usuario || {}),
        });
      } else {
        setEmpresaPerfil(EMPTY_EMPRESA);
        if (emailNorm === 'maria@equalis.com.br') {
          setCandidatoPerfil({
            ...MARIA_PERFIL,
            ...(data.usuario || {}),
          });
          setFormacoes(data.usuario?.formacoes && data.usuario.formacoes.length > 0 ? data.usuario.formacoes : MARIA_FORMACOES);
          setExperiencias(data.usuario?.experiencias && data.usuario.experiencias.length > 0 ? data.usuario.experiencias : MARIA_EXPERIENCIAS);
          setCandidaturas(data.usuario?.candidaturas || []);
        } else {
          setCandidatoPerfil({
            ...EMPTY_CANDIDATO,
            ...(data.usuario || {}),
            conexoesCount: 0,
            resumo_profissional: data.usuario?.resumo_profissional || '',
            servicos: data.usuario?.servicos || [],
            competencias: data.usuario?.competencias || [],
          });
          setFormacoes(data.usuario?.formacoes || []);
          setExperiencias(data.usuario?.experiencias || []);
          setCandidaturas(data.usuario?.candidaturas || []);
        }
      }
      return data;
    } catch (err) {
      if (activeSessionRef.current !== sessionEpoch) throw err;
      if (emailNorm === 'maria@equalis.com.br' && (senha === 'equalis123' || !senha)) {
        const demoToken = 'demo-jwt-token-maria';
        setSessionToken(demoToken);
        setUserType('CANDIDATO');
        setCandidatoPerfil(MARIA_PERFIL);
        setEmpresaPerfil(EMPTY_EMPRESA);
        setFormacoes(MARIA_FORMACOES);
        setExperiencias(MARIA_EXPERIENCIAS);
        setCandidaturas([]);
        setMensagens([]);
        return { token: demoToken, tipo: 'CANDIDATO', usuario: MARIA_PERFIL };
      }
      if (emailNorm === 'rh@uniceplac.edu.br' && (senha === 'equalis123' || !senha)) {
        const demoToken = 'demo-jwt-token-uniceplac';
        setSessionToken(demoToken);
        setUserType('EMPRESA');
        setEmpresaPerfil(DEFAULT_EMPRESA);
        setCandidatoPerfil(EMPTY_CANDIDATO);
        setFormacoes([]);
        setExperiencias([]);
        setCandidaturas([]);
        setMensagens([]);
        return { token: demoToken, tipo: 'EMPRESA', usuario: DEFAULT_EMPRESA };
      }
      throw err;
    }
  }, []);

  // Autenticação Federada / SSO Legítimo (Gov.br / Google Workspace) com isolamento
  const loginSSO = useCallback(async (provedor, tipo = 'CANDIDATO', email = null) => {
    const sessionEpoch = ++activeSessionRef.current;
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provedor, tipo, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.erro || 'Falha ao realizar login federado.');
      }
      if (activeSessionRef.current !== sessionEpoch) return data;
      setMensagens([]);
      setPublicacoes((prev) => prev.map((p) => ({ ...p, curtidoPeloUsuario: false })));
      setSessionToken(data.token);
      setUserType(data.tipo);
      if (data.tipo === 'EMPRESA') {
        setConexoes([]);
        setCandidatoPerfil(EMPTY_CANDIDATO);
        setFormacoes([]);
        setExperiencias([]);
        setCandidaturas([]);
        setEmpresaPerfil({
          ...EMPTY_EMPRESA,
          ...(data.usuario || {}),
        });
      } else {
        setEmpresaPerfil(EMPTY_EMPRESA);
        const emailNorm = String(data.usuario?.email || email || '').trim().toLowerCase();
        if (emailNorm === 'maria@equalis.com.br') {
          setCandidatoPerfil({
            ...MARIA_PERFIL,
            ...(data.usuario || {}),
          });
          setFormacoes(data.usuario?.formacoes && data.usuario.formacoes.length > 0 ? data.usuario.formacoes : MARIA_FORMACOES);
          setExperiencias(data.usuario?.experiencias && data.usuario.experiencias.length > 0 ? data.usuario.experiencias : MARIA_EXPERIENCIAS);
          setCandidaturas(data.usuario?.candidaturas || []);
        } else {
          setCandidatoPerfil({
            ...EMPTY_CANDIDATO,
            ...(data.usuario || {}),
            conexoesCount: 0,
            resumo_profissional: data.usuario?.resumo_profissional || '',
            servicos: data.usuario?.servicos || [],
            competencias: data.usuario?.competencias || [],
          });
          setFormacoes(data.usuario?.formacoes || []);
          setExperiencias(data.usuario?.experiencias || []);
          setCandidaturas(data.usuario?.candidaturas || []);
        }
      }
      return data;
    } catch (err) {
      if (activeSessionRef.current !== sessionEpoch) throw err;
      throw err;
    }
  }, []);

  // Recuperação de Senha Real (POST /api/auth/recuperar-senha)
  const solicitarRecuperacaoSenha = useCallback(async (email) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/recuperar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.erro || 'Não foi possível solicitar recuperação de senha.');
    }
    return data;
  }, []);

  // Anexo e Homologação Real de Documento (Laudo CID / Currículo)
  const anexarDocumento = useCallback(
    async ({ tipo, nomeArquivo, tamanhoBytes, tipoMime, deficienciaId = 1 }) => {
      const candId = candidatoPerfil?.id;
      let data = {};
      if (candId) {
        try {
          const res = await apiFetch(`${API_BASE_URL}/candidatos/${candId}/documentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tipo,
              nome_arquivo: nomeArquivo,
              tamanho_bytes: tamanhoBytes,
              tipo_mime: tipoMime,
              deficiencia_id: deficienciaId,
            }),
          });
          data = await res.json();
        } catch (_) {}
      }
      if (tipo === 'LAUDO') {
        setCandidatoPerfil((prev) => ({
          ...prev,
          url_laudo_medico: nomeArquivo,
          laudo_info: data.documento || {
            nome_arquivo: nomeArquivo,
            tamanho_bytes: tamanhoBytes,
            tipo_mime: tipoMime,
          },
        }));
      } else {
        setCandidatoPerfil((prev) => ({
          ...prev,
          url_curriculo: nomeArquivo,
          curriculo_info: data.documento || {
            nome_arquivo: nomeArquivo,
            tamanho_bytes: tamanhoBytes,
            tipo_mime: tipoMime,
          },
        }));
      }
      return data;
    },
    [candidatoPerfil?.id]
  );

  // Persistência de Candidato no MySQL (POST /api/candidatos) com estado inicial limpo (R1)
  const registrarCandidato = useCallback(async (dados) => {
    const sessionEpoch = ++activeSessionRef.current;
    let saved = null;
    let res = null;
    try {
      res = await apiFetch('/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      saved = await res.json();
    } catch (networkErr) {
      throw new Error(
        `Não foi possível conectar ao servidor (${getActiveApiBaseUrl()}). Verifique se o backend está em execução: ${networkErr.message}`
      );
    }

    if (!res.ok) {
      throw new Error(saved?.erro || 'Falha ao registrar candidato no servidor.');
    }

    if (activeSessionRef.current !== sessionEpoch) return saved;

    const savedId = saved.id || saved.usuario?.id || Date.now();
    const novoCandidato = {
      ...EMPTY_CANDIDATO,
      ...dados,
      ...(saved.usuario || {}),
      id: savedId,
      conexoesCount: 0,
      resumo_profissional: '',
      servicos: [],
      competencias: [],
    };
    setCandidatoPerfil(novoCandidato);
    setEmpresaPerfil(EMPTY_EMPRESA);
    setFormacoes([]);
    setExperiencias([]);
    setCandidaturas([]);
    setMensagens([]);
    setNotificacoes([]);
    setServerUnreadCount(0);
    setConexoes([]);
    setPublicacoes((prev) => prev.map((p) => ({ ...p, curtidoPeloUsuario: false })));
    setUserType('CANDIDATO');
    setSessionToken(saved.token || `token-${Date.now()}`);
    return saved;
  }, []);

  // Persistência de Empresa no MySQL (POST /api/empresas) com estado limpo
  const registrarEmpresa = useCallback(async (dados) => {
    const sessionEpoch = ++activeSessionRef.current;
    let saved = null;
    let res = null;
    try {
      res = await apiFetch('/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      saved = await res.json();
    } catch (networkErr) {
      throw new Error(
        `Não foi possível conectar ao servidor (${getActiveApiBaseUrl()}). Verifique se o backend está em execução: ${networkErr.message}`
      );
    }

    if (!res.ok) {
      throw new Error(saved?.erro || 'Falha ao registrar empresa no servidor.');
    }

    if (activeSessionRef.current !== sessionEpoch) return saved;

    const savedId = saved.id || saved.usuario?.id || saved.empresa?.id || Date.now();
    const novaEmpresa = {
      ...EMPTY_EMPRESA,
      ...dados,
      ...(saved.empresa || saved.usuario || {}),
      id: savedId,
    };
    setEmpresaPerfil(novaEmpresa);
    setCandidatoPerfil(EMPTY_CANDIDATO);
    setFormacoes([]);
    setExperiencias([]);
    setCandidaturas([]);
    setMensagens([]);
    setNotificacoes([]);
    setServerUnreadCount(0);
    setConexoes([]);
    setPublicacoes((prev) => prev.map((p) => ({ ...p, curtidoPeloUsuario: false })));
    setUserType('EMPRESA');
    setSessionToken(saved.token || `token-${Date.now()}`);
    return saved;
  }, []);

  // Métodos do Diagrama de Classes: Candidatura (com persistência em MySQL)
  const aplicarParaVaga = useCallback(
    (vagaId) => {
      const activeCandId = candidatoPerfil?.id;
      const existente = candidaturas.find(
        (c) => c.vaga_id === vagaId && c.status_processo !== 'CANCELADA' && (!activeCandId || c.candidato_id === activeCandId)
      );
      if (existente) {
        return {
          sucesso: false,
          mensagem: 'Você já possui uma candidatura ativa para esta vaga.',
        };
      }
      const candId = activeCandId || Date.now();
      const nova = {
        id: Date.now(),
        candidato_id: candId,
        vaga_id: vagaId,
        status_processo: 'ENVIADA',
        created_at: new Date().toLocaleDateString('pt-BR'),
      };
      setCandidaturas((prev) => [nova, ...prev]);

      if (activeCandId) {
        apiFetch(`${API_BASE_URL}/candidaturas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidato_id: activeCandId,
            vaga_id: vagaId,
          }),
        }).catch(() => {});
      }

      return {
        sucesso: true,
        mensagem:
          'Candidatura enviada com sucesso! A empresa receberá seu perfil e recursos de acessibilidade.',
      };
    },
    [candidaturas, candidatoPerfil?.id]
  );

  const cancelarCandidatura = useCallback(
    (vagaId) => {
      const alvo = candidaturas.find((c) => c.vaga_id === vagaId);
      setCandidaturas((prev) =>
        prev.map((c) =>
          c.vaga_id === vagaId
            ? { ...c, status_processo: 'CANCELADA', status: 'CANCELADA' }
            : c
        )
      );
      if (alvo?.id) {
        apiFetch(`${API_BASE_URL}/candidaturas/${alvo.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CANCELADA', status_processo: 'CANCELADA' }),
        }).catch(() => {});
      }
    },
    [candidaturas]
  );

  const atualizarStatusCandidatura = useCallback((candidaturaId, novoStatus) => {
    setCandidaturas((prev) =>
      prev.map((c) =>
        c.id === candidaturaId
          ? { ...c, status_processo: novoStatus, status: novoStatus }
          : c
      )
    );
    return apiFetch(`${API_BASE_URL}/candidaturas/${candidaturaId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus, status_processo: novoStatus }),
    }).catch(() => {});
  }, []);

  // Métodos do Diagrama de Classes: Empresa.cadastrarVaga() + VagaAcessibilidade.vincularAcessibilidade()
  const publicarVaga = useCallback(
    (dadosVaga) => {
      const companyId = empresaPerfil?.id || Date.now();
      const companyNome = dadosVaga.empresa_nome || empresaPerfil?.nome_fantasia || 'Empresa Inclusiva';
      const cargoTitulo = dadosVaga.cargo || dadosVaga.titulo || '';
      const local = dadosVaga.localEmpresa || (dadosVaga.cidade ? `${dadosVaga.cidade} - ${dadosVaga.estado || 'DF'}` : 'Brasília - DF');
      const novaVaga = {
        id: Date.now(),
        empresa_id: companyId,
        empresa_nome: companyNome,
        titulo: cargoTitulo,
        cargo: cargoTitulo,
        descricao: dadosVaga.descricao,
        localEmpresa: local,
        requerimentos: dadosVaga.requerimentos || 'Ensino Médio Completo.',
        categoria: dadosVaga.categoria || 'Atendimento',
        carga_horaria: dadosVaga.carga_horaria || '6 horas',
        avaliacao_empresa: '5.0',
        tempo_publicacao: 'Agora mesmo',
        modalidade: dadosVaga.modalidade || 'Presencial',
        cidade: dadosVaga.cidade || 'Brasília',
        estado: dadosVaga.estado || 'DF',
        salario: parseFloat(dadosVaga.salario) || 2000,
        link_externo: dadosVaga.link_externo || '',
        status: 'ABERTA',
        acessibilidades_ids: dadosVaga.acessibilidades_ids || [],
        recursos_acessibilidade: dadosVaga.recursos_acessibilidade || [
          'Ambiente Adaptado PcD',
          'Processo Seletivo Acessível',
        ],
      };
      setVagas((prev) => [novaVaga, ...prev]);
      setSelectedVagaId(novaVaga.id);

      // Gera automaticamente uma postagem de anúncio no Feed da Home
      const postAnuncio = {
        id: Date.now() + 1,
        autor_tipo: 'EMPRESA',
        autor_id: companyId,
        autor_nome: companyNome,
        autor_subtitulo: `${companyNome} • Nova Vaga Aberta`,
        conteudo: `Estamos com novas vagas de ${novaVaga.titulo} disponíveis no Equalis para profissionais PcD. Confira os detalhes e envie sua candidatura!`,
        vaga_id: novaVaga.id,
        curtidas: 0,
        curtidoPeloUsuario: false,
        comentarios: 0,
        compartilhamentos: 0,
      };
      setPublicacoes((prev) => [postAnuncio, ...prev]);

      apiFetch(`${API_BASE_URL}/vagas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaVaga),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((saved) => {
          if (saved && saved.id) {
            setVagas((prev) =>
              prev.map((v) => (v.id === novaVaga.id ? { ...v, id: saved.id } : v))
            );
            setSelectedVagaId(saved.id);
          }
        })
        .catch(() => {});

      return novaVaga;
    },
    [empresaPerfil]
  );

  // Métodos do Perfil, Formação, Cargo e Publicações
  const atualizarCandidatoPerfil = useCallback(
    (novosDados) => {
      setCandidatoPerfil((prev) => {
        const atualizado = { ...prev, ...novosDados };
        if (atualizado.id) {
          apiFetch(`${API_BASE_URL}/candidatos/${atualizado.id}/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atualizado),
          }).catch(() => {});
        }
        return atualizado;
      });
    },
    []
  );

  const adicionarFormacao = useCallback(
    (novaFormacao) => {
      const item = { id: Date.now(), ...novaFormacao };
      setFormacoes((prev) => [item, ...prev]);
      if (candidatoPerfil?.id) {
        apiFetch(`${API_BASE_URL}/candidatos/${candidatoPerfil?.id}/formacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaFormacao),
        }).catch(() => {});
      }
    },
    [candidatoPerfil?.id]
  );

  const adicionarExperiencia = useCallback(
    (novaExp) => {
      const item = { id: Date.now(), ...novaExp };
      setExperiencias((prev) => [item, ...prev]);
      if (candidatoPerfil?.id) {
        apiFetch(`${API_BASE_URL}/candidatos/${candidatoPerfil?.id}/experiencias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaExp),
        }).catch(() => {});
      }
    },
    [candidatoPerfil?.id]
  );

  const criarPublicacao = useCallback(
    (conteudoOuPayload, vagaId = null) => {
      let conteudoFinal = '';
      let midiaUrl = null;
      let midiaTipo = null;
      let audioDesc = null;
      let idVaga = vagaId;

      if (typeof conteudoOuPayload === 'object' && conteudoOuPayload !== null) {
        conteudoFinal = String(conteudoOuPayload.conteudo || '');
        midiaUrl = conteudoOuPayload.imagem || conteudoOuPayload.midia_url || null;
        midiaTipo = conteudoOuPayload.midia_tipo || (midiaUrl ? String(midiaUrl).split('.').pop() : null);
        audioDesc = conteudoOuPayload.audiodescricao || null;
        if (conteudoOuPayload.vagaId !== undefined && conteudoOuPayload.vagaId !== null) {
          idVaga = conteudoOuPayload.vagaId;
        }

        if (audioDesc && !conteudoFinal.includes('#PraCegoVer')) {
          conteudoFinal = conteudoFinal.trim()
            ? `${conteudoFinal.trim()}\n\n[#PraCegoVer: ${audioDesc.trim()}]`
            : `[#PraCegoVer: ${audioDesc.trim()}]`;
        }
      } else {
        conteudoFinal = String(conteudoOuPayload || '');
      }

      const novaPub = {
        id: Date.now(),
        autor_tipo: userType,
        autor_id: userType === 'EMPRESA' ? (empresaPerfil?.id || Date.now()) : (candidatoPerfil?.id || Date.now()),
        autor_nome:
          userType === 'EMPRESA'
            ? (empresaPerfil?.nome_fantasia || 'Empresa Inclusiva')
            : (candidatoPerfil?.nome || 'Candidato PcD'),
        autor_subtitulo:
          userType === 'EMPRESA'
            ? 'Empresa Inclusiva • Agora mesmo'
            : `${candidatoPerfil?.area_atuacao || 'Profissional PcD'}${candidatoPerfil?.cidade ? ` • ${candidatoPerfil.cidade}, ${candidatoPerfil?.estado || 'DF'}` : ''}`,
        conteudo: conteudoFinal,
        midia_url: midiaUrl,
        vaga_id: idVaga,
        curtidas: 0,
        curtidoPeloUsuario: false,
        comentarios: 0,
        compartilhamentos: 0,
      };
      setPublicacoes((prev) => [novaPub, ...prev]);

      apiFetch(`${API_BASE_URL}/publicacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaPub),
      }).catch(() => {});

      return novaPub;
    },
    [userType, empresaPerfil, candidatoPerfil]
  );

  const editarPublicacao = useCallback((id, novoConteudo) => {
    setPublicacoes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, conteudo: novoConteudo } : p))
    );
    apiFetch(`${API_BASE_URL}/publicacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conteudo: novoConteudo }),
    }).catch(() => {});
  }, []);

  const excluirPublicacao = useCallback((id) => {
    setPublicacoes((prev) => prev.filter((p) => p.id !== id));
    apiFetch(`${API_BASE_URL}/publicacoes/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  }, []);

  const curtirPublicacao = useCallback(
    (id) => {
      const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
      setPublicacoes((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const jaCurtiu = Boolean(p.curtidoPeloUsuario);
          return {
            ...p,
            curtidoPeloUsuario: !jaCurtiu,
            curtidas: jaCurtiu ? Math.max(0, p.curtidas - 1) : p.curtidas + 1,
          };
        })
      );
      apiFetch(`${API_BASE_URL}/publicacoes/${id}/curtir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: activeUserId || 1,
          usuario_tipo: userType,
        }),
      }).catch(() => {});
    },
    [userType, empresaPerfil?.id, candidatoPerfil?.id]
  );

  const adicionarComentario = useCallback(
    async (publicacaoId, texto) => {
      const autor =
        userType === 'EMPRESA'
          ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
          : candidatoPerfil?.nome || 'Candidato PcD';
      try {
        const res = await apiFetch(`${API_BASE_URL}/publicacoes/${publicacaoId}/comentarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autor_nome: autor, texto }),
        });
        const data = await res.json();
        setPublicacoes((prev) =>
          prev.map((p) =>
            p.id === publicacaoId ? { ...p, comentarios: (p.comentarios || 0) + 1 } : p
          )
        );
        return data;
      } catch (e) {
        setPublicacoes((prev) =>
          prev.map((p) =>
            p.id === publicacaoId ? { ...p, comentarios: (p.comentarios || 0) + 1 } : p
          )
        );
        return { id: Date.now(), publicacao_id: publicacaoId, autor_nome: autor, texto };
      }
    },
    [userType, empresaPerfil?.nome_fantasia, candidatoPerfil?.nome]
  );

  const republicarPublicacao = useCallback(
    async (publicacaoId) => {
      const autor =
        userType === 'EMPRESA'
          ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
          : candidatoPerfil?.nome || 'Candidato PcD';
      const subtitulo =
        userType === 'EMPRESA'
          ? (empresaPerfil?.cidade ? `${empresaPerfil?.nome_fantasia || 'Empresa'} • ${empresaPerfil?.cidade}` : (empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'))
          : `${candidatoPerfil?.area_atuacao || 'Profissional PcD'}${candidatoPerfil?.cidade ? ` • ${candidatoPerfil?.cidade}, ${candidatoPerfil?.estado || 'DF'}` : ''}`;
      try {
        const res = await apiFetch(`${API_BASE_URL}/publicacoes/${publicacaoId}/republicar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            autor_tipo: userType,
            autor_nome: autor,
            autor_subtitulo: subtitulo,
          }),
        });
        const data = await res.json();
        if (res.ok && data) {
          setPublicacoes((prev) => [data, ...prev]);
        }
        return data;
      } catch (e) {
        const original = publicacoes.find((p) => p.id === publicacaoId);
        const fallbackPub = {
          id: Date.now(),
          autor_tipo: userType,
          autor_nome: autor,
          autor_subtitulo: subtitulo,
          conteudo: original
            ? `[Republicado de ${original.autor_nome}]: ${original.conteudo}`
            : 'Republicação de conteúdo acessível',
          curtidas: 0,
          comentarios: 0,
          compartilhamentos: 0,
        };
        setPublicacoes((prev) => [fallbackPub, ...prev]);
        return fallbackPub;
      }
    },
    [userType, empresaPerfil?.nome_fantasia, candidatoPerfil, publicacoes]
  );

  const alternarConexao = useCallback((id) => {
    let conectouAgora = false;
    setConexoes((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const novoStatus = !c.conectado;
        conectouAgora = novoStatus;
        return {
          ...c,
          conectado: novoStatus,
          total_conexoes: novoStatus ? c.total_conexoes + 1 : c.total_conexoes - 1,
        };
      })
    );
    setCandidatoPerfil((prev) => ({
      ...prev,
      conexoesCount: Math.max(0, (prev?.conexoesCount || 0) + (conectouAgora ? 1 : -1)),
    }));
    apiFetch(`${API_BASE_URL}/conexoes/${id}/conectar`, {
      method: 'POST',
    }).catch(() => {});
  }, []);

  const enviarMensagem = useCallback(
    (destinatario, texto) => {
      const agora = new Date();
      const horario = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
      const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;
      const remetente =
        userType === 'EMPRESA'
          ? empresaPerfil?.nome_fantasia || 'Empresa Inclusiva'
          : candidatoPerfil?.nome || 'Candidato PcD';
      const cargo = userType === 'EMPRESA' ? 'Recrutamento Inclusivo' : 'Candidato PcD';

      const nova = {
        id: Date.now(),
        remetente_id: activeUserId,
        remetente_tipo: userType,
        destinatario_id: activeUserId,
        destinatario_tipo: userType,
        remetente_nome: destinatario || remetente,
        remetente_cargo: cargo,
        conteudo: texto,
        horario,
        nao_lida: 0,
      };
      setMensagens((prev) => [nova, ...prev]);
      apiFetch(`${API_BASE_URL}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remetente_id: activeUserId,
          remetente_tipo: userType,
          destinatario_id: activeUserId,
          destinatario_tipo: userType,
          remetente_nome: remetente,
          remetente_cargo: cargo,
          conteudo: texto,
          destinatario,
        }),
      }).catch(() => {});
    },
    [userType, empresaPerfil?.id, empresaPerfil?.nome_fantasia, candidatoPerfil?.id, candidatoPerfil?.nome]
  );

  const selectedVaga = vagas.find((v) => v.id === selectedVagaId) || vagas[0];

  const candidaturasRecebidas = useMemo(() => {
    return candidaturas.map((cand) => {
      const vagaAssoc = vagas.find((v) => v.id === cand.vaga_id) || vagas[0];
      return {
        ...cand,
        vaga: vagaAssoc,
        candidato: cand.candidato || (cand.candidato_id === candidatoPerfil?.id && userType === 'CANDIDATO' ? {
          id: cand.candidato_id,
          nome: candidatoPerfil?.nome || 'Candidato PcD',
          email: candidatoPerfil?.email || '',
          area_atuacao: candidatoPerfil?.area_atuacao || 'Profissional PcD',
          cidade: candidatoPerfil?.cidade || 'São Paulo',
          estado: candidatoPerfil?.estado || 'SP',
          resumo: candidatoPerfil?.resumo_profissional || '',
          laudo: 'laudo_cid_aprovado.pdf',
        } : {
          id: cand.candidato_id,
          nome: 'Candidato PcD',
          email: 'candidato@equalis.com.br',
          area_atuacao: 'Profissional PcD',
          cidade: 'São Paulo',
          estado: 'SP',
          resumo: 'Currículo e laudo médico anexados para análise inclusiva.',
          laudo: 'laudo_cid_aprovado.pdf',
        }),
      };
    });
  }, [candidaturas, vagas, candidatoPerfil, userType]);

  const marcarMensagemComoLida = useCallback((id) => {
    setMensagens((prev) =>
      prev.map((m) => (m.id === id ? { ...m, nao_lida: 0 } : m))
    );
    apiFetch(`${API_BASE_URL}/mensagens/${id}/lida`, {
      method: 'PATCH',
    }).catch(() => {});
  }, []);

  const excluirVaga = useCallback((vagaId) => {
    setVagas((prev) => prev.filter((v) => v.id !== vagaId));
    apiFetch(`${API_BASE_URL}/vagas/${vagaId}`, {
      method: 'DELETE',
    }).catch(() => {});
  }, []);

  const excluirFormacao = useCallback(
    (formId) => {
      setFormacoes((prev) => prev.filter((f) => f.id !== formId));
      if (candidatoPerfil?.id) {
        apiFetch(`${API_BASE_URL}/candidatos/${candidatoPerfil?.id}/formacoes/${formId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    },
    [candidatoPerfil?.id]
  );

  const excluirExperiencia = useCallback(
    (expId) => {
      setExperiencias((prev) => prev.filter((e) => e.id !== expId));
      if (candidatoPerfil?.id) {
        apiFetch(`${API_BASE_URL}/candidatos/${candidatoPerfil?.id}/experiencias/${expId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    },
    [candidatoPerfil?.id]
  );

  const atualizarEmpresaPerfil = useCallback(
    async (novosDados) => {
      let resultado = null;
      const targetId = novosDados?.id || empresaPerfil?.id || 1;
      const atualizado = { ...empresaPerfil, ...novosDados };
      setEmpresaPerfil(atualizado);

      try {
        const res = await apiFetch(`${API_BASE_URL}/empresas/${targetId}/perfil`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(atualizado),
        });
        if (res && res.ok) {
          const data = await res.json();
          resultado = data;
          if (data && data.empresa) {
            setEmpresaPerfil((prev) => ({ ...prev, ...data.empresa }));
          }
        }
      } catch (err) {
        // Fallback defensivo mantendo atualização local
      }

      return resultado || { success: true, empresa: atualizado };
    },
    [empresaPerfil]
  );

  const recarregarDados = useCallback(() => {
    const activeUserId = userType === 'EMPRESA' ? empresaPerfil?.id : candidatoPerfil?.id;

    apiFetch(`${API_BASE_URL}/vagas`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setVagas(data);
      })
      .catch(() => {});

    apiFetch(`${API_BASE_URL}/publicacoes${activeUserId ? `?usuario_id=${activeUserId}&usuario_tipo=${userType}` : ''}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPublicacoes(data);
      })
      .catch(() => {});

    apiFetch(`${API_BASE_URL}/conexoes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setConexoes(data);
      })
      .catch(() => {});

    if (activeUserId) {
      apiFetch(`${API_BASE_URL}/mensagens?usuario_id=${activeUserId}&usuario_tipo=${userType}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setMensagens(data);
        })
        .catch(() => {});

      const candQuery =
        userType === 'EMPRESA'
          ? `empresa_id=${activeUserId}`
          : `candidato_id=${activeUserId}`;
      apiFetch(`${API_BASE_URL}/candidaturas?${candQuery}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCandidaturas(data);
        })
        .catch(() => {});

      carregarNotificacoes(activeUserId, userType);
    }
  }, [userType, empresaPerfil?.id, candidatoPerfil?.id, carregarNotificacoes]);

  const value = {
    currentScreen,
    screenParams,
    navigate,
    goBack,
    userType,
    setUserType,
    alternarPapel,
    sessionToken,
    login,
    logout,
    loginSSO,
    solicitarRecuperacaoSenha,
    anexarDocumento,
    searchTerm,
    setSearchTerm,
    executarBusca,
    candidatoPerfil,
    setCandidatoPerfil,
    atualizarCandidatoPerfil,
    registrarCandidato,
    empresaPerfil,
    setEmpresaPerfil,
    atualizarEmpresaPerfil,
    registrarEmpresa,
    deficiencias,
    vagas,
    selectedVaga,
    selectedVagaId,
    setSelectedVagaId,
    candidaturas,
    candidaturasRecebidas,
    aplicarParaVaga,
    cancelarCandidatura,
    atualizarStatusCandidatura,
    publicarVaga,
    excluirVaga,
    formacoes,
    adicionarFormacao,
    excluirFormacao,
    experiencias,
    adicionarExperiencia,
    excluirExperiencia,
    publicacoes,
    criarPublicacao,
    editarPublicacao,
    excluirPublicacao,
    curtirPublicacao,
    adicionarComentario,
    republicarPublicacao,
    conexoes,
    alternarConexao,
    mensagens,
    enviarMensagem,
    marcarMensagemComoLida,
    notificacoes,
    notificacoesNaoLidasCount,
    carregarNotificacoes,
    marcarNotificacaoComoLida,
    marcarTodasNotificacoesComoLidas,
    criarNotificacao,
    recarregarDados,
    apiBaseUrl: getActiveApiBaseUrl(),
  };

  return (
    <AuthAndDataContext.Provider value={value}>
      {children}
    </AuthAndDataContext.Provider>
  );
}

export function useAuthAndData() {
  const ctx = useContext(AuthAndDataContext);
  if (!ctx) {
    throw new Error('useAuthAndData deve ser utilizado dentro de AuthAndDataProvider');
  }
  return ctx;
}
