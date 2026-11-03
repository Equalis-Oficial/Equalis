/**
 * Camada de Dados (Model / DataStore) — Equalis
 * Mantém o espelho em memória e em arquivo JSON (`database/local_store.json`)
 * garantindo resiliência e auto-recuperação caso o banco MySQL esteja em inicialização.
 */
const fs = require('fs');
const path = require('path');
const { hashSenha } = require('../utils/validators');

const STORE_PATH = path.join(__dirname, '..', '..', 'database', 'local_store.json');

const INITIAL_DATA = {
  deficiencias: [
    {
      id: 1,
      categoria: 'Deficiência Física',
      descricao:
        'Alteração completa ou parcial de um ou mais segmentos do corpo humano, com suporte de mobilidade e ergonomia.',
    },
    {
      id: 2,
      categoria: 'Deficiência Visual',
      descricao:
        'Cegueira, baixa visão ou visão monocular, com suporte de leitores de tela, braille e alto contraste.',
    },
    {
      id: 3,
      categoria: 'Deficiência Auditiva',
      descricao:
        'Perda bilateral, parcial ou total da audição, com suporte em Libras e comunicação visual.',
    },
    {
      id: 4,
      categoria: 'Deficiência Intelectual',
      descricao:
        'Limitações adaptativas com suporte de comunicação simples, rotinas estruturadas e mentoria inclusiva.',
    },
    {
      id: 5,
      categoria: 'Deficiência Psicossocial / Mental',
      descricao:
        'Condições neurodivergentes ou psicossociais (TEA, TDAH) com suporte sensorial e flexibilidade.',
    },
  ],
  empresas: [
    {
      id: 1,
      nome_fantasia: 'Centro Universitário UNICEPLAC',
      cnpj: '00394460005887',
      email: 'rh@uniceplac.edu.br',
      senha: hashSenha('equalis123'),
      descricao:
        'Centro Universitário do Planalto Central Apparecido dos Santos (Gama - DF). Instituição comprometida com a acessibilidade universal e inclusão PcD.',
      created_at: '2026-08-04T10:00:00Z',
    },
    {
      id: 2,
      nome_fantasia: 'Inclusiva Tech Brasil',
      cnpj: '11222333000181',
      email: 'talentos@inclusivatech.com.br',
      senha: hashSenha('equalis123'),
      descricao:
        'Empresa de tecnologia focada em soluções digitais acessíveis e contratação afirmativa de pessoas com deficiência.',
      created_at: '2026-08-04T10:00:00Z',
    },
  ],
  candidatos: [
    {
      id: 1,
      nome: 'Maria Ledentsova',
      email: 'maria@equalis.com.br',
      senha: hashSenha('equalis123'),
      cpf: '52998224725',
      resumo_profissional:
        'Especialista em Marketing Digital, Comunicação Inclusiva e Atendimento ao Público.',
      url_curriculo: 'curriculo_maria_ledentsova.pdf',
      cidade: 'Guarulhos',
      estado: 'SP',
      area_atuacao: 'Marketing',
      servicos: ['Marketing Digital', 'Comunicação Acessível'],
      deficiencias_ids: [1],
      usa_tela_acessivel: 0,
      created_at: '2026-08-04T10:00:00Z',
    },
  ],
  vagas: [],
  candidaturas: [],
  formacoes: [],
  experiencias: [],
  publicacoes: [],
  conexoes: [
    {
      id: 1,
      candidato_id: null,
      nome_contato: 'Charles Oliveira',
      cargo_contato: 'Gerente de projetos com foco em crescimento em equipe',
      conexoes_em_comum: 15,
      total_conexoes: 312,
      conectado: false,
    },
    {
      id: 2,
      candidato_id: null,
      nome_contato: 'Helena Costa',
      cargo_contato: 'Tech Recruiter Especialista em Diversidade e Inclusão PcD',
      conexoes_em_comum: 22,
      total_conexoes: 418,
      conectado: false,
    },
    {
      id: 3,
      candidato_id: null,
      nome_contato: 'Rafael Mendes',
      cargo_contato: 'Engenheiro de Software & Consultor de Acessibilidade WCAG',
      conexoes_em_comum: 9,
      total_conexoes: 204,
      conectado: false,
    },
  ],
  mensagens: [],
  comentarios: [],
};

let activeStore = null;

function loadStore() {
  if (activeStore) return activeStore;
  try {
    if (fs.existsSync(STORE_PATH)) {
      activeStore = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      return activeStore;
    }
  } catch (err) {
    console.warn('[DataStore] Erro ao carregar arquivo de store, restaurando padrão:', err.message);
  }
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  activeStore = JSON.parse(JSON.stringify(INITIAL_DATA));
  return activeStore;
}

function saveStore(store) {
  activeStore = store;
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DataStore] Erro ao gravar store:', err.message);
  }
}

module.exports = {
  INITIAL_DATA,
  loadStore,
  saveStore,
};

