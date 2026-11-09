/**
 * Configuração de Banco de Dados — MySQL 8 & Fallback In-Memory Resiliente
 * Gerencia a conexão com o container Docker equalis_mysql (porta 3306),
 * realiza migrações dinâmicas defensivas em runtime e fornece fallback
 * em memória quando o servidor MySQL estiver offline.
 */
const fs = require('fs');
const path = require('path');
const { hashSenha } = require('../utils/validators');

const SCHEMA_SQL_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const SEED_SQL_PATH = path.join(__dirname, '..', '..', 'database', 'seed.sql');

let mysqlPool = null;
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN_MS = 30000;
let memoryStore = null;

function getInitialMemoryStore() {
  const hashPadrao = hashSenha('equalis123');
  return {
    empresa: [
      {
        id: 1,
        nome_fantasia: 'Centro Universitário UNICEPLAC',
        cnpj: '00394460005887',
        email: 'rh@uniceplac.edu.br',
        senha: hashPadrao,
        descricao: 'Centro Universitário do Planalto Central Apparecido dos Santos (Gama - DF). Instituição comprometida com a acessibilidade universal e inclusão PcD.',
        setor: 'Educação Superior',
        localizacao: 'Gama, DF',
        site: 'https://uniceplac.edu.br',
        telefone: '(61) 3035-3900',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        deleted_at: null,
      },
      {
        id: 2,
        nome_fantasia: 'Inclusiva Tech Brasil',
        cnpj: '11222333000181',
        email: 'talentos@inclusivatech.com.br',
        senha: hashPadrao,
        descricao: 'Consultoria e desenvolvimento de software acessível com vagas adaptadas para trabalho remoto e híbrido.',
        setor: 'Tecnologia da Informação',
        localizacao: 'Brasília, DF',
        site: 'https://inclusivatech.com.br',
        telefone: '(61) 98765-4321',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        deleted_at: null,
      },
    ],
    candidato: [
      {
        id: 1,
        nome: 'Maria Ledentsova',
        email: 'maria@equalis.com.br',
        senha: hashPadrao,
        cpf: '52998224725',
        resumo_profissional: 'Especialista em Marketing Digital, Comunicação Inclusiva e Atendimento ao Público.',
        url_curriculo: 'https://equalis.app/curriculos/maria-ledentsova.pdf',
        cidade: 'Guarulhos',
        estado: 'SP',
        area_atuacao: 'Marketing',
        usa_tela_acessivel: 0,
        created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
        deleted_at: null,
      },
    ],
    deficiencia: [
      { id: 1, categoria: 'Deficiência Física', descricao: 'Alteração completa ou parcial de um ou mais segmentos do corpo humano.' },
      { id: 2, categoria: 'Deficiência Visual', descricao: 'Cegueira, baixa visão ou visão monocular, com suporte de leitores de tela.' },
      { id: 3, categoria: 'Deficiência Auditiva', descricao: 'Perda bilateral, parcial ou total da audição, com suporte em Libras.' },
      { id: 4, categoria: 'Deficiência Intelectual', descricao: 'Limitações adaptativas com suporte de comunicação simples.' },
      { id: 5, categoria: 'Deficiência Psicossocial / Mental', descricao: 'Condições neurodivergentes ou psicossociais com suporte sensorial.' },
    ],
    candidato_deficiencia: [
      {
        id: 1,
        candidato_id: 1,
        deficiencia_id: 1,
        cid: 'M89.9',
        url_laudo_medico: 'https://equalis.app/laudos/laudo-cid-maria.pdf',
        created_at: new Date().toISOString(),
      },
    ],
    vaga: [],
    vaga_acessibilidade: [],
    candidatura: [],
    formacao_academica: [
      {
        id: 1,
        candidato_id: 1,
        instituicao: 'Centro Universitário UNICEPLAC',
        diploma: 'Graduação / Tecnólogo',
        area_estudo: 'Marketing e Mídias Digitais',
        mes_inicio: 'Fevereiro',
        ano_inicio: '2024',
        mes_termino: 'Dezembro',
        ano_termino: '2026',
        atividades_grupos: 'Núcleo de Acessibilidade e Inclusão (NICE)',
        descricao: 'Projetos práticos voltados à comunicação inclusiva e redução de barreiras.',
        competencias: 'Marketing Digital, Acessibilidade',
        created_at: new Date().toISOString(),
      },
    ],
    experiencia_profissional: [
      {
        id: 1,
        candidato_id: 1,
        cargo: 'Assistente de Marketing e Relacionamento',
        organizacao: 'Agência Conecta Inclusão',
        tipo_emprego: 'Meio período',
        localidade: 'São Paulo, Guarulhos, Brasil',
        tipo_localidade: 'Híbrido',
        mes_inicio: 'Março',
        ano_inicio: '2024',
        descricao: 'Criação de campanhas digitais acessíveis, descrição de imagens para leitores de tela e suporte ao cliente.',
        competencias: 'Atendimento ao Cliente, Marketing',
        created_at: new Date().toISOString(),
      },
    ],
    publicacao: [],
    conexao: [
      {
        id: 1,
        candidato_id: 1,
        nome_contato: 'Charles Oliveira',
        cargo_contato: 'Gerente de Projetos com foco em diversidade e crescimento em equipe',
        conexoes_em_comum: 15,
        total_conexoes: 312,
        status: 'SUGERIDO',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        candidato_id: 1,
        nome_contato: 'Helena Costa',
        cargo_contato: 'Tech Recruiter Especialista em Inclusão PcD na Inclusiva Tech',
        conexoes_em_comum: 22,
        total_conexoes: 418,
        status: 'SUGERIDO',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        candidato_id: 1,
        nome_contato: 'Rafael Mendes',
        cargo_contato: 'Desenvolvedor Mobile & Especialista em Acessibilidade WCAG',
        conexoes_em_comum: 8,
        total_conexoes: 204,
        status: 'SUGERIDO',
        created_at: new Date().toISOString(),
      },
    ],
    mensagem: [],
    notificacao: [
      {
        id: 1,
        usuario_id: 1,
        usuario_tipo: 'CANDIDATO',
        tipo_evento: 'CANDIDATURA',
        titulo: 'Candidatura em Análise',
        mensagem: 'A empresa Centro Universitário UNICEPLAC iniciou a triagem da sua candidatura.',
        referencia_id: 1,
        lida: 0,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 2,
        usuario_id: 1,
        usuario_tipo: 'CANDIDATO',
        tipo_evento: 'CONVITE',
        titulo: 'Entrevista Agendada!',
        mensagem: 'Você foi selecionado para uma entrevista inclusiva na Inclusiva Tech Brasil.',
        referencia_id: 2,
        lida: 0,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        usuario_id: 1,
        usuario_tipo: 'CANDIDATO',
        tipo_evento: 'MENSAGEM',
        titulo: 'Nova Mensagem de Recrutador',
        mensagem: 'Olá Maria, recebemos seu laudo médico homologado com sucesso.',
        referencia_id: 1,
        lida: 1,
        created_at: new Date(Date.now() - 600000).toISOString(),
      },
    ],
    counters: {
      empresa: 10,
      candidato: 10,
      vaga: 10,
      candidatura: 10,
      publicacao: 10,
      formacao: 10,
      experiencia: 10,
      mensagem: 10,
      notificacao: 10,
    },
  };
}

function initMemoryStore() {
  if (!memoryStore) {
    memoryStore = getInitialMemoryStore();
  }
  return memoryStore;
}

async function initMySQLConnection() {
  if (isConnecting) return false;
  lastConnectionAttempt = Date.now();
  isConnecting = true;
  try {
    const mysql = require('mysql2/promise');
    if (!mysqlPool) {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'equalis_db',
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: true,
      });
    }

    const conn = await mysqlPool.getConnection();

    // Executa schema DDL se necessário
    if (fs.existsSync(SCHEMA_SQL_PATH)) {
      try {
        const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf-8');
        await conn.query(schemaSql);
      } catch (schemaErr) {
        console.warn('ℹ [MySQL Schema]:', schemaErr.message);
      }
    }

    // ====================================================================
    // MIGRAÇÕES DINÂMICAS DEFENSIVAS EM RUNTIME (COMPATIBILIDADE RETROATIVA)
    // ====================================================================

    // 1. Migração de Empresa: setor, localizacao, site, telefone (RN-018, RN-019, UC-14)
    const colunasEmpresa = [
      { nome: 'setor', def: 'VARCHAR(100) NULL' },
      { nome: 'localizacao', def: 'VARCHAR(150) NULL' },
      { nome: 'site', def: 'VARCHAR(255) NULL' },
      { nome: 'telefone', def: 'VARCHAR(30) NULL' },
    ];
    for (const col of colunasEmpresa) {
      try {
        await conn.query(`ALTER TABLE Empresa ADD COLUMN ${col.nome} ${col.def};`);
      } catch (_) {}
    }

    // 2. Migração de Candidato: colunas corporativas e acessibilidade
    try {
      await conn.query(`
        ALTER TABLE Candidato
          ADD COLUMN cidade VARCHAR(50) DEFAULT '',
          ADD COLUMN estado CHAR(2) DEFAULT '',
          ADD COLUMN area_atuacao VARCHAR(100) DEFAULT '',
          ADD COLUMN usa_tela_acessivel TINYINT(1) DEFAULT 0;
      `);
    } catch (_) {}

    // 3. Migração de Candidato_Deficiencia: cid homologado (Lei nº 8.213/91)
    try {
      await conn.query(`ALTER TABLE Candidato_Deficiencia ADD COLUMN cid VARCHAR(20) NULL;`);
    } catch (_) {}

    // 4. Migração de Vaga
    try {
      await conn.query(`
        ALTER TABLE Vaga
          ADD COLUMN requerimentos TEXT,
          ADD COLUMN categoria VARCHAR(50) DEFAULT 'Atendimento',
          ADD COLUMN carga_horaria VARCHAR(30) DEFAULT '6 horas',
          ADD COLUMN link_externo VARCHAR(255);
      `);
    } catch (_) {}

    // 5. Migração de Mensagem
    try {
      await conn.query(`
        ALTER TABLE Mensagem
          ADD COLUMN remetente_id INT NULL,
          ADD COLUMN remetente_tipo VARCHAR(20) DEFAULT 'CANDIDATO',
          ADD COLUMN destinatario_id INT NULL,
          ADD COLUMN destinatario_tipo VARCHAR(20) DEFAULT 'CANDIDATO';
      `);
    } catch (_) {}

    // 6. Migração da Tabela Notificacao (UC-22 & RN-031 - Central de Notificações)
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS Notificacao (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          usuario_tipo ENUM('CANDIDATO', 'EMPRESA') NOT NULL DEFAULT 'CANDIDATO',
          tipo_evento VARCHAR(50) NOT NULL DEFAULT 'CANDIDATURA',
          titulo VARCHAR(150) NOT NULL,
          mensagem TEXT NOT NULL,
          referencia_id INT NULL,
          lida TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notificacao_usuario (usuario_id),
          INDEX idx_notificacao_lida (lida),
          INDEX idx_notificacao_usuario_lida (usuario_id, usuario_tipo, lida)
        ) ENGINE=InnoDB;
      `);
    } catch (_) {}

    // Executa seed DML inicial se necessário
    if (fs.existsSync(SEED_SQL_PATH)) {
      try {
        const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf-8');
        await conn.query(seedSql);
      } catch (seedErr) {
        console.warn('ℹ [MySQL Seed]:', seedErr.message);
      }
    }

    conn.release();
    console.log('✔ [MySQL 8] Conectado com sucesso ao banco equalis_db (porta 3306) e sincronizado!');
    isConnecting = false;
    return true;
  } catch (err) {
    mysqlPool = null;
    isConnecting = false;
    initMemoryStore();
    return false;
  }
}

/**
 * Motor In-Memory SQL para resiliência quando o MySQL não estiver ativo
 */
function execInMemory(sql, params = []) {
  const store = initMemoryStore();
  const sqlLimpo = sql.replace(/\s+/g, ' ').trim();
  const sqlUpper = sqlLimpo.toUpperCase();

  // ==========================================
  // 1. CANDIDATURA (Avaliador primário devido a joins em Candidato, Vaga, Empresa e Deficiencia)
  // ==========================================
  if (/\bCANDIDATURA\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('CANDIDATO_ID = ? AND VAGA_ID = ?')) {
        const [candId, vagaId] = params.map(Number);
        const found = store.candidatura.find(
          (c) => c.candidato_id === candId && c.vaga_id === vagaId && c.status_processo !== 'CANCELADA'
        );
        return found ? [{ ...found }] : [];
      }

      let lista = [...store.candidatura];
      let pIdx = 0;
      if (sqlUpper.includes('C.ID = ?') || sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[pIdx++]);
        lista = lista.filter((c) => c.id === id);
      }
      if (sqlUpper.includes('C.CANDIDATO_ID = ?')) {
        const candId = Number(params[pIdx++]);
        lista = lista.filter((c) => c.candidato_id === candId);
      }
      if (sqlUpper.includes('V.EMPRESA_ID = ?')) {
        const empId = Number(params[pIdx++]);
        lista = lista.filter((c) => {
          const v = store.vaga.find((vaga) => vaga.id === c.vaga_id);
          return v && v.empresa_id === empId;
        });
      }

      return lista.map((c) => {
        const cand = store.candidato.find((candItem) => candItem.id === c.candidato_id);
        const vaga = store.vaga.find((vagaItem) => vagaItem.id === c.vaga_id);
        const emp = vaga ? store.empresa.find((e) => e.id === vaga.empresa_id) : null;
        const cd = store.candidato_deficiencia.find((item) => item.candidato_id === c.candidato_id);
        const def = cd ? store.deficiencia.find((d) => d.id === cd.deficiencia_id) : null;

        return {
          id: c.id,
          candidato_id: c.candidato_id,
          vaga_id: c.vaga_id,
          status_processo: c.status_processo,
          created_at: c.created_at,
          updated_at: c.updated_at,
          candidato_nome: cand ? cand.nome : 'Maria Ledentsova',
          candidato_email: cand ? cand.email : 'maria@equalis.com.br',
          candidato_area: cand ? cand.area_atuacao : 'Marketing',
          candidato_cidade: cand ? cand.cidade : 'Guarulhos',
          candidato_estado: cand ? cand.estado : 'SP',
          candidato_resumo: cand ? cand.resumo_profissional : '',
          candidato_curriculo: cand ? cand.url_curriculo : null,
          url_laudo_medico: cd ? cd.url_laudo_medico : 'https://equalis.app/laudos/laudo-cid-maria.pdf',
          candidato_cid: cd && cd.cid ? cd.cid : 'M89.9',
          candidato_deficiencia: def ? def.categoria : 'Deficiência Física',
          vaga_titulo: vaga ? vaga.titulo : 'Analista de QA',
          vaga_salario: vaga ? vaga.salario : 4500,
          vaga_cidade: vaga ? vaga.cidade : 'Brasília',
          vaga_modalidade: vaga ? vaga.modalidade : 'Remoto',
          empresa_id: vaga ? vaga.empresa_id : 1,
          empresa_nome: emp ? emp.nome_fantasia : 'Centro Universitário UNICEPLAC',
        };
      });
    }

    if (sqlUpper.startsWith('INSERT INTO CANDIDATURA')) {
      const [candId, vagaId] = params.map(Number);
      let cand = store.candidatura.find((c) => c.candidato_id === candId && c.vaga_id === vagaId);
      if (cand) {
        cand.status_processo = 'ENVIADA';
        cand.updated_at = new Date().toISOString();
        return { insertId: cand.id, affectedRows: 1 };
      }
      const id = ++store.counters.candidatura;
      cand = {
        id,
        candidato_id: candId,
        vaga_id: vagaId,
        status_processo: 'ENVIADA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.candidatura.push(cand);
      return { insertId: id, affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE CANDIDATURA')) {
      const status = params[0];
      const idParam = Number(params[1]);
      const vagaParam = params[2] ? Number(params[2]) : null;

      const cand = store.candidatura.find((c) => c.id === idParam || (vagaParam && c.vaga_id === vagaParam));
      if (cand) {
        cand.status_processo = status;
        cand.updated_at = new Date().toISOString();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }

    if (sqlUpper.startsWith('DELETE FROM CANDIDATURA')) {
      const idParam = Number(params[0]);
      const candId = params.length >= 3 ? Number(params[2]) : null;
      store.candidatura = store.candidatura.filter((c) => {
        const match = c.id === idParam || c.vaga_id === idParam;
        if (!match) return true;
        if (candId && c.candidato_id !== candId) return true;
        return false;
      });
      return { affectedRows: 1 };
    }
  }

  // ==========================================
  // 2. NOTIFICAÇÃO (M1)
  // ==========================================
  if (/\bNOTIFICACAO\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT COUNT(*)')) {
      const usuarioId = params.length > 0 ? Number(params[0]) : null;
      const usuarioTipo = params.length > 1 ? String(params[1]).toUpperCase() : null;

      let count = 0;
      for (const n of store.notificacao) {
        if (Number(n.lida) === 0) {
          if (usuarioId && n.usuario_id !== usuarioId) continue;
          if (usuarioTipo && String(n.usuario_tipo).toUpperCase() !== usuarioTipo) continue;
          count++;
        }
      }
      return [{ total: count }];
    }

    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const found = store.notificacao.find((n) => n.id === id);
        return found ? [{ ...found }] : [];
      }

      let lista = [...store.notificacao];
      if (params.length > 0) {
        const usuarioId = Number(params[0]);
        lista = lista.filter((n) => n.usuario_id === usuarioId);
      }
      if (params.length > 1 && typeof params[1] === 'string') {
        const usuarioTipo = String(params[1]).toUpperCase();
        lista = lista.filter((n) => String(n.usuario_tipo).toUpperCase() === usuarioTipo);
      }
      if (params.length > 2 && typeof params[2] === 'string' && sqlUpper.includes('TIPO_EVENTO = ?')) {
        const tipoEvento = String(params[2]).toUpperCase();
        lista = lista.filter((n) => String(n.tipo_evento || n.tipo).toUpperCase() === tipoEvento);
      }
      if (sqlUpper.includes('LIDA = 0')) {
        lista = lista.filter((n) => Number(n.lida) === 0);
      }

      // Ordena por created_at DESC, id DESC
      lista.sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id);
      return lista.map((n) => ({ ...n }));
    }

    if (sqlUpper.startsWith('INSERT INTO NOTIFICACAO')) {
      const id = ++store.counters.notificacao;
      const [usuario_id, usuario_tipo, tipo_evento, titulo, mensagem, referencia_id] = params;
      const nova = {
        id,
        usuario_id: Number(usuario_id),
        usuario_tipo: String(usuario_tipo || 'CANDIDATO').toUpperCase(),
        tipo_evento: tipo_evento || 'CANDIDATURA',
        titulo,
        mensagem,
        referencia_id: referencia_id ? Number(referencia_id) : null,
        lida: 0,
        created_at: new Date().toISOString(),
      };
      store.notificacao.unshift(nova);
      return { insertId: id, affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE NOTIFICACAO SET LIDA = 1')) {
      if (sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const n = store.notificacao.find((item) => item.id === id);
        if (n) {
          if (sqlUpper.includes('USUARIO_ID = ?') && params.length > 1) {
            const uid = Number(params[1]);
            if (n.usuario_id !== uid) return { affectedRows: 0 };
          }
          n.lida = 1;
          return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
      }
      // Marcar todas como lidas
      let afetadas = 0;
      const usuarioId = params.length > 0 ? Number(params[0]) : null;
      const usuarioTipo = params.length > 1 ? String(params[1]).toUpperCase() : null;

      for (const n of store.notificacao) {
        if (Number(n.lida) === 0) {
          if (usuarioId && n.usuario_id !== usuarioId) continue;
          if (usuarioTipo && String(n.usuario_tipo).toUpperCase() !== usuarioTipo) continue;
          n.lida = 1;
          afetadas++;
        }
      }
      return { affectedRows: afetadas };
    }

    if (sqlUpper.startsWith('DELETE FROM NOTIFICACAO')) {
      const id = Number(params[0]);
      const initialLen = store.notificacao.length;
      if (sqlUpper.includes('USUARIO_ID = ?') && params.length > 1) {
        const uid = Number(params[1]);
        store.notificacao = store.notificacao.filter((n) => !(n.id === id && n.usuario_id === uid));
      } else {
        store.notificacao = store.notificacao.filter((n) => n.id !== id);
      }
      const affectedRows = initialLen - store.notificacao.length;
      return { affectedRows };
    }
  }

  // ==========================================
  // 3. CANDIDATO_DEFICIENCIA
  // ==========================================
  if (/\bCANDIDATO_DEFICIENCIA\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('DELETE')) {
      const cid = Number(params[0]);
      store.candidato_deficiencia = store.candidato_deficiencia.filter((cd) => cd.candidato_id !== cid);
      return { affectedRows: 1 };
    }
    if (sqlUpper.startsWith('INSERT')) {
      const [candidato_id, deficiencia_id, url_laudo_medico] = params;
      store.candidato_deficiencia.push({
        id: Date.now() + Math.random(),
        candidato_id: Number(candidato_id),
        deficiencia_id: Number(deficiencia_id),
        cid: 'M89.9',
        url_laudo_medico: url_laudo_medico || null,
        created_at: new Date().toISOString(),
      });
      return { insertId: 1, affectedRows: 1 };
    }
    // SELECT joins
    const cid = Number(params[0]);
    const rows = store.candidato_deficiencia
      .filter((cd) => cd.candidato_id === cid)
      .map((cd) => {
        const d = store.deficiencia.find((def) => def.id === cd.deficiencia_id);
        return {
          deficiencia_id: cd.deficiencia_id,
          url_laudo_medico: cd.url_laudo_medico,
          cid: cd.cid || 'M89.9',
          categoria: d ? d.categoria : 'Deficiência Geral',
          descricao: d ? d.descricao : '',
        };
      });
    return rows;
  }

  // ==========================================
  // 4. DEFICIENCIA
  // ==========================================
  if (/\bDEFICIENCIA\b/i.test(sqlUpper)) {
    if (sqlUpper.includes('WHERE ID = ?')) {
      const def = store.deficiencia.find((d) => d.id === Number(params[0]));
      return def ? [{ ...def }] : [];
    }
    return store.deficiencia.map((d) => ({ ...d }));
  }

  // ==========================================
  // 5. VAGA_ACESSIBILIDADE
  // ==========================================
  if (/\bVAGA_ACESSIBILIDADE\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('INSERT')) {
      const [vaga_id, deficiencia_id] = params;
      store.vaga_acessibilidade.push({ vaga_id: Number(vaga_id), deficiencia_id: Number(deficiencia_id) });
      return { affectedRows: 1 };
    }
    if (sqlUpper.startsWith('SELECT')) {
      const vagaId = Number(params[0]);
      const vDefs = store.vaga_acessibilidade.filter((va) => va.vaga_id === vagaId);
      return vDefs.map((va) => {
        const d = store.deficiencia.find((def) => def.id === va.deficiencia_id);
        return {
          id: va.deficiencia_id,
          categoria: d ? d.categoria : 'Acessibilidade Adaptada',
        };
      });
    }
  }

  // ==========================================
  // 6. VAGA
  // ==========================================
  if (/\bVAGA\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      let lista = store.vaga.filter((v) => !v.deleted_at);
      if (sqlUpper.includes('V.ID = ?') || sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const found = lista.find((v) => v.id === id);
        if (found) {
          const emp = store.empresa.find((e) => e.id === found.empresa_id);
          return [{ ...found, empresa_nome: emp ? emp.nome_fantasia : 'Empresa Inclusiva' }];
        }
        return [];
      }
      if (sqlUpper.includes('V.EMPRESA_ID = ?')) {
        const empId = Number(params[0]);
        lista = lista.filter((v) => v.empresa_id === empId);
      }
      return lista.map((v) => {
        const emp = store.empresa.find((e) => e.id === v.empresa_id);
        return { ...v, empresa_nome: emp ? emp.nome_fantasia : 'Empresa Inclusiva' };
      });
    }

    if (sqlUpper.startsWith('INSERT INTO VAGA')) {
      const id = ++store.counters.vaga;
      const [empresa_id, titulo, descricao, requerimentos, categoria, carga_horaria, modalidade, cidade, estado, salario] = params;
      const nova = {
        id,
        empresa_id: Number(empresa_id),
        titulo,
        descricao,
        requerimentos,
        categoria: categoria || 'Atendimento',
        carga_horaria: carga_horaria || '6 horas',
        modalidade: modalidade || 'Presencial',
        cidade: cidade || 'Brasília',
        estado: estado || 'DF',
        salario: Number(salario) || 2000.0,
        status: 'ABERTA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      store.vaga.push(nova);
      return { insertId: id, affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE VAGA SET DELETED_AT')) {
      const id = Number(params[0]);
      const v = store.vaga.find((item) => item.id === id);
      if (v) v.deleted_at = new Date().toISOString();
      return { affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE VAGA')) {
      const id = Number(params[params.length - 1]);
      const v = store.vaga.find((item) => item.id === id && !item.deleted_at);
      if (v) {
        const [titulo, descricao, requerimentos, salario, modalidade, cidade, estado, categoria, carga_horaria] = params;
        if (titulo) v.titulo = titulo;
        if (descricao) v.descricao = descricao;
        if (requerimentos) v.requerimentos = requerimentos;
        if (salario !== null && salario !== undefined) v.salario = Number(salario);
        if (modalidade) v.modalidade = modalidade;
        if (cidade) v.cidade = cidade;
        if (estado) v.estado = estado;
        if (categoria) v.categoria = categoria;
        if (carga_horaria) v.carga_horaria = carga_horaria;
        v.updated_at = new Date().toISOString();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // ==========================================
  // 7. EMPRESA
  // ==========================================
  if (/\bEMPRESA\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      let lista = store.empresa.filter((e) => !e.deleted_at);
      if (sqlUpper.includes('LOWER(EMAIL) = LOWER(?)')) {
        const email = String(params[0] || '').toLowerCase();
        const found = lista.find((e) => String(e.email).toLowerCase() === email);
        return found ? [{ ...found }] : [];
      }
      if (sqlUpper.includes('CNPJ = ?')) {
        const cnpj = String(params[0] || '').replace(/\D/g, '');
        const found = lista.find((e) => String(e.cnpj).replace(/\D/g, '') === cnpj);
        return found ? [{ ...found }] : [];
      }
      if (sqlUpper.includes('ID = ?')) {
        const id = Number(params[0]);
        const found = lista.find((e) => e.id === id);
        return found ? [{ ...found }] : [];
      }
      return lista.map((e) => ({ ...e }));
    }

    if (sqlUpper.startsWith('INSERT INTO EMPRESA')) {
      const id = ++store.counters.empresa;
      const [nome_fantasia, cnpj, email, senha, descricao, setor, localizacao, site, telefone] = params;
      const novo = {
        id,
        nome_fantasia,
        cnpj,
        email,
        senha,
        descricao,
        setor: setor || null,
        localizacao: localizacao || null,
        site: site || null,
        telefone: telefone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      store.empresa.push(novo);
      return { insertId: id, affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE EMPRESA')) {
      const id = Number(params[params.length - 1]);
      const emp = store.empresa.find((e) => e.id === id && !e.deleted_at);
      if (emp) {
        if (params.length >= 7) {
          const [nome_fantasia, descricao, setor, localizacao, site, telefone] = params;
          if (nome_fantasia !== null && nome_fantasia !== undefined) emp.nome_fantasia = nome_fantasia;
          if (descricao !== null && descricao !== undefined) emp.descricao = descricao;
          if (setor !== null && setor !== undefined) emp.setor = setor;
          if (localizacao !== null && localizacao !== undefined) emp.localizacao = localizacao;
          if (site !== null && site !== undefined) emp.site = site;
          if (telefone !== null && telefone !== undefined) emp.telefone = telefone;
        } else if (params.length === 3) {
          const [nome_fantasia, descricao] = params;
          if (nome_fantasia !== null && nome_fantasia !== undefined) emp.nome_fantasia = nome_fantasia;
          if (descricao !== null && descricao !== undefined) emp.descricao = descricao;
        }
        emp.updated_at = new Date().toISOString();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // ==========================================
  // 8. CANDIDATO
  // ==========================================
  if (/\bCANDIDATO\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      let lista = store.candidato.filter((c) => !c.deleted_at);
      if (sqlUpper.includes('LOWER(EMAIL) = LOWER(?)')) {
        const email = String(params[0] || '').toLowerCase();
        const found = lista.find((c) => String(c.email).toLowerCase() === email);
        return found ? [{ ...found }] : [];
      }
      if (sqlUpper.includes('CPF = ?')) {
        const cpf = String(params[0] || '').replace(/\D/g, '');
        const found = lista.find((c) => String(c.cpf).replace(/\D/g, '') === cpf);
        return found ? [{ ...found }] : [];
      }
      if (sqlUpper.includes('ID = ?')) {
        const id = Number(params[0]);
        const found = lista.find((c) => c.id === id);
        return found ? [{ ...found }] : [];
      }
      return lista.map((c) => ({ ...c }));
    }

    if (sqlUpper.startsWith('INSERT INTO CANDIDATO')) {
      const id = ++store.counters.candidato;
      const [nome, email, senha, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel] = params;
      const novo = {
        id,
        nome,
        email,
        senha,
        cpf,
        resumo_profissional: resumo_profissional || null,
        url_curriculo: url_curriculo || null,
        cidade: cidade || '',
        estado: estado || '',
        area_atuacao: area_atuacao || '',
        usa_tela_acessivel: usa_tela_acessivel ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      store.candidato.push(novo);
      return { insertId: id, affectedRows: 1 };
    }

    if (sqlUpper.startsWith('UPDATE CANDIDATO')) {
      const id = Number(params[params.length - 1]);
      const cand = store.candidato.find((c) => c.id === id && !c.deleted_at);
      if (cand) {
        const [nome, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel] = params;
        if (nome !== null && nome !== undefined) cand.nome = nome;
        if (resumo_profissional !== null && resumo_profissional !== undefined) cand.resumo_profissional = resumo_profissional;
        if (url_curriculo !== null && url_curriculo !== undefined) cand.url_curriculo = url_curriculo;
        if (cidade !== null && cidade !== undefined) cand.cidade = cidade;
        if (estado !== null && estado !== undefined) cand.estado = estado;
        if (area_atuacao !== null && area_atuacao !== undefined) cand.area_atuacao = area_atuacao;
        if (usa_tela_acessivel !== null && usa_tela_acessivel !== undefined) cand.usa_tela_acessivel = usa_tela_acessivel ? 1 : 0;
        cand.updated_at = new Date().toISOString();
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // ==========================================
  // 9. FORMAÇÃO ACADÊMICA
  // ==========================================
  if (/\bFORMACAO_ACADEMICA\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      const candId = Number(params[0]);
      return store.formacao_academica.filter((f) => f.candidato_id === candId);
    }
    if (sqlUpper.startsWith('INSERT')) {
      const id = ++store.counters.formacao;
      const [candidato_id, instituicao, diploma, area_estudo, mes_inicio, ano_inicio, mes_termino, ano_termino, atividades_grupos, descricao, competencias] = params;
      const nova = {
        id,
        candidato_id: Number(candidato_id),
        instituicao,
        diploma,
        area_estudo,
        mes_inicio,
        ano_inicio,
        mes_termino,
        ano_termino,
        atividades_grupos,
        descricao,
        competencias,
        created_at: new Date().toISOString(),
      };
      store.formacao_academica.push(nova);
      return { insertId: id, affectedRows: 1 };
    }
    if (sqlUpper.startsWith('DELETE')) {
      const [formId, candId] = params.map(Number);
      store.formacao_academica = store.formacao_academica.filter((f) => !(f.id === formId && f.candidato_id === candId));
      return { affectedRows: 1 };
    }
  }

  // ==========================================
  // 10. EXPERIÊNCIA PROFISSIONAL
  // ==========================================
  if (/\bEXPERIENCIA_PROFISSIONAL\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      const candId = Number(params[0]);
      return store.experiencia_profissional.filter((e) => e.candidato_id === candId);
    }
    if (sqlUpper.startsWith('INSERT')) {
      const id = ++store.counters.experiencia;
      const [candidato_id, cargo, organizacao, tipo_emprego, localidade, tipo_localidade, mes_inicio, ano_inicio, descricao, competencias] = params;
      const nova = {
        id,
        candidato_id: Number(candidato_id),
        cargo,
        organizacao,
        tipo_emprego,
        localidade,
        tipo_localidade,
        mes_inicio,
        ano_inicio,
        descricao,
        competencias,
        created_at: new Date().toISOString(),
      };
      store.experiencia_profissional.push(nova);
      return { insertId: id, affectedRows: 1 };
    }
    if (sqlUpper.startsWith('DELETE')) {
      const [expId, candId] = params.map(Number);
      store.experiencia_profissional = store.experiencia_profissional.filter((e) => !(e.id === expId && e.candidato_id === candId));
      return { affectedRows: 1 };
    }
  }

  // ==========================================
  // 11. PUBLICAÇÃO
  // ==========================================
  if (/\bPUBLICACAO\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const p = store.publicacao.find((item) => item.id === id);
        return p ? [{ ...p }] : [];
      }
      return store.publicacao.map((p) => ({ ...p }));
    }
    if (sqlUpper.startsWith('INSERT')) {
      const id = ++store.counters.publicacao;
      const [autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id] = params;
      const nova = {
        id,
        autor_tipo: autor_tipo || 'CANDIDATO',
        autor_id: Number(autor_id),
        autor_nome,
        autor_subtitulo: autor_subtitulo || null,
        conteudo,
        vaga_id: vaga_id ? Number(vaga_id) : null,
        curtidas: 0,
        comentarios: 0,
        compartilhamentos: 0,
        created_at: new Date().toISOString(),
      };
      store.publicacao.unshift(nova);
      return { insertId: id, affectedRows: 1 };
    }
    if (sqlUpper.startsWith('UPDATE PUBLICACAO SET CONTEUDO')) {
      const [conteudo, id] = params;
      const p = store.publicacao.find((item) => item.id === Number(id));
      if (p) p.conteudo = conteudo;
      return { affectedRows: 1 };
    }
    if (sqlUpper.includes('CURTIDAS = CURTIDAS + 1')) {
      const id = Number(params[0]);
      const p = store.publicacao.find((item) => item.id === id);
      if (p) p.curtidas = (p.curtidas || 0) + 1;
      return { affectedRows: 1 };
    }
    if (sqlUpper.includes('CURTIDAS - 1') || sqlUpper.includes('GREATEST(0, CURTIDAS - 1)')) {
      const id = Number(params[0]);
      const p = store.publicacao.find((item) => item.id === id);
      if (p) p.curtidas = Math.max(0, (p.curtidas || 0) - 1);
      return { affectedRows: 1 };
    }
    if (sqlUpper.includes('COMPARTILHAMENTOS = COMPARTILHAMENTOS + 1')) {
      const id = Number(params[0]);
      const p = store.publicacao.find((item) => item.id === id);
      if (p) p.compartilhamentos = (p.compartilhamentos || 0) + 1;
      return { affectedRows: 1 };
    }
    if (sqlUpper.includes('COMENTARIOS = COMENTARIOS + 1')) {
      const id = Number(params[0]);
      const p = store.publicacao.find((item) => item.id === id);
      if (p) p.comentarios = (p.comentarios || 0) + 1;
      return { affectedRows: 1 };
    }
    if (sqlUpper.startsWith('DELETE FROM PUBLICACAO')) {
      const id = Number(params[0]);
      store.publicacao = store.publicacao.filter((p) => p.id !== id);
      return { affectedRows: 1 };
    }
  }

  // ==========================================
  // 12. CONEXÃO
  // ==========================================
  if (/\bCONEXAO\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      if (sqlUpper.includes('WHERE ID = ?')) {
        const id = Number(params[0]);
        const found = store.conexao.find((c) => c.id === id);
        return found ? [{ ...found }] : [];
      }
      if (sqlUpper.includes('CANDIDATO_ID = ?')) {
        const candId = Number(params[0]);
        return store.conexao.filter((c) => c.candidato_id === candId);
      }
      return store.conexao.map((c) => ({ ...c }));
    }
    if (sqlUpper.startsWith('UPDATE')) {
      const status = params[0];
      const id = Number(params[1]);
      const c = store.conexao.find((item) => item.id === id);
      if (c) {
        c.status = status;
        return { affectedRows: 1 };
      }
      return { affectedRows: 0 };
    }
  }

  // ==========================================
  // 13. MENSAGEM
  // ==========================================
  if (/\bMENSAGEM\b/i.test(sqlUpper)) {
    if (sqlUpper.startsWith('SELECT')) {
      if (params.length === 0) {
        return store.mensagem.map((m) => ({ ...m }));
      }
      const [rId, rTipo, dId, dTipo] = params;
      return store.mensagem.filter(
        (m) =>
          (m.remetente_id === Number(rId) && m.remetente_tipo === rTipo) ||
          (m.destinatario_id === Number(dId) && m.destinatario_tipo === dTipo)
      );
    }
    if (sqlUpper.startsWith('INSERT')) {
      const id = ++store.counters.mensagem;
      const [remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, remetente_nome, remetente_cargo, conteudo, horario] = params;
      const nova = {
        id,
        remetente_id: Number(remetente_id),
        remetente_tipo,
        destinatario_id: Number(destinatario_id),
        destinatario_tipo,
        remetente_nome,
        remetente_cargo,
        conteudo,
        horario: horario || '10:12',
        nao_lida: 1,
        created_at: new Date().toISOString(),
      };
      store.mensagem.push(nova);
      return { insertId: id, affectedRows: 1 };
    }
    if (sqlUpper.startsWith('UPDATE')) {
      const id = Number(params[0]);
      const m = store.mensagem.find((item) => item.id === id);
      if (m) m.nao_lida = 0;
      return { affectedRows: 1 };
    }
    if (sqlUpper.startsWith('DELETE')) {
      const id = Number(params[0]);
      store.mensagem = store.mensagem.filter((item) => item.id !== id);
      return { affectedRows: 1 };
    }
  }

  return [];
}

async function execMySQL(sql, params = []) {
  if (!mysqlPool && (Date.now() - lastConnectionAttempt > CONNECTION_COOLDOWN_MS)) {
    await initMySQLConnection();
  }
  if (!mysqlPool) {
    return execInMemory(sql, params);
  }
  try {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  } catch (err) {
    console.warn('[MySQL Query Warning, using memory fallback]:', err.message);
    return execInMemory(sql, params);
  }
}

function isMySQLConnected() {
  return Boolean(mysqlPool);
}

module.exports = {
  initMySQLConnection,
  execMySQL,
  isMySQLConnected,
};
