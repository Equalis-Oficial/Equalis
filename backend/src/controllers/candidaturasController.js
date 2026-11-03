/**
 * Controller de Candidaturas — Equalis
 * Gerencia a inscrição de candidatos PcD em oportunidades inclusivas,
 * fluxo de seleção e acompanhamento das cotas pela empresa.
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');

async function listar(req, res) {
  const store = loadStore();
  const candidatoId = req.query.candidato_id ? Number(req.query.candidato_id) : null;
  const empresaId = req.query.empresa_id ? Number(req.query.empresa_id) : null;

  let whereClauses = [];
  let params = [];

  if (candidatoId) {
    whereClauses.push('c.candidato_id = ?');
    params.push(candidatoId);
  }
  if (empresaId) {
    whereClauses.push('v.empresa_id = ?');
    params.push(empresaId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const dbCandidaturas = await execMySQL(
    `SELECT c.id, c.candidato_id, c.vaga_id, c.status_processo, c.created_at, c.updated_at,
            cand.nome as candidato_nome, cand.email as candidato_email, cand.area_atuacao as candidato_area,
            cand.cidade as candidato_cidade, cand.estado as candidato_estado, cand.resumo_profissional as candidato_resumo,
            cand.url_curriculo as candidato_curriculo,
            v.titulo as vaga_titulo, v.salario as vaga_salario, v.cidade as vaga_cidade, v.modalidade as vaga_modalidade,
            v.empresa_id,
            COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Candidatura c
     LEFT JOIN Candidato cand ON c.candidato_id = cand.id
     LEFT JOIN Vaga v ON c.vaga_id = v.id
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     ${whereSql}
     ORDER BY c.id DESC`,
    params
  );

  if (Array.isArray(dbCandidaturas)) {
    const formatadas = dbCandidaturas.map((c) => ({
      id: c.id,
      candidato_id: c.candidato_id,
      vaga_id: c.vaga_id,
      status_processo: c.status_processo,
      created_at: c.created_at,
      updated_at: c.updated_at,
      candidato: {
        id: c.candidato_id,
        nome: c.candidato_nome || 'Candidato PcD',
        email: c.candidato_email || '',
        area_atuacao: c.candidato_area || 'Geral',
        cidade: c.candidato_cidade || '',
        estado: c.candidato_estado || '',
        resumo_profissional: c.candidato_resumo || '',
        url_curriculo: c.candidato_curriculo || null,
        laudo: 'laudo_cid_homologado.pdf',
      },
      vaga: {
        id: c.vaga_id,
        empresa_id: c.empresa_id,
        titulo: c.vaga_titulo || 'Vaga Inclusiva',
        empresa_nome: c.empresa_nome || 'Empresa Inclusiva',
        salario: c.vaga_salario || 2000,
        cidade: c.vaga_cidade || 'Brasília',
        modalidade: c.vaga_modalidade || 'Presencial',
      },
    }));
    return res.status(200).json(formatadas);
  }

  let enriquecidas = (store.candidaturas || []).map((c) => {
    const vaga = (store.vagas || []).find((v) => v.id === c.vaga_id);
    const candidato = (store.candidatos || []).find((cand) => cand.id === c.candidato_id);
    return {
      ...c,
      vaga,
      candidato: candidato
        ? { id: candidato.id, nome: candidato.nome, email: candidato.email, area_atuacao: candidato.area_atuacao }
        : null,
    };
  });

  if (candidatoId) {
    enriquecidas = enriquecidas.filter((c) => c.candidato_id === candidatoId);
  }
  if (empresaId) {
    enriquecidas = enriquecidas.filter((c) => c.vaga && c.vaga.empresa_id === empresaId);
  }

  return res.status(200).json(enriquecidas);
}

async function aplicar(req, res) {
  const store = loadStore();
  const { candidato_id = 1, vaga_id } = req.body || {};

  if (!vaga_id) {
    return res.status(400).json({ erro: 'Identificador da vaga é obrigatório.' });
  }

  const jaExiste = store.candidaturas.find(
    (c) =>
      c.candidato_id === candidato_id &&
      c.vaga_id === vaga_id &&
      c.status_processo !== 'CANCELADA'
  );
  if (jaExiste) {
    return res.status(409).json({
      erro: 'Você já possui uma candidatura ativa para esta vaga.',
    });
  }

  const dbResult = await execMySQL(
    `INSERT INTO Candidatura (candidato_id, vaga_id, status_processo) VALUES (?, ?, 'ENVIADA')
     ON DUPLICATE KEY UPDATE status_processo = 'ENVIADA', updated_at = CURRENT_TIMESTAMP`,
    [candidato_id, vaga_id]
  );

  const novaCandidatura = {
    id: dbResult && dbResult.insertId ? dbResult.insertId : store.candidaturas.length + 1,
    candidato_id,
    vaga_id,
    status_processo: 'ENVIADA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.candidaturas.push(novaCandidatura);
  saveStore(store);

  return res.status(201).json(novaCandidatura);
}

async function atualizarStatus(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const { status_processo = 'CANCELADA', vaga_id } = req.body || {};

  await execMySQL(
    `UPDATE Candidatura SET status_processo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR vaga_id = ?`,
    [status_processo, idParam, vaga_id || idParam]
  );

  store.candidaturas = store.candidaturas.map((c) =>
    c.id === idParam || c.vaga_id === (vaga_id || idParam)
      ? { ...c, status_processo, updated_at: new Date().toISOString() }
      : c
  );
  saveStore(store);

  return res.status(200).json({ sucesso: true, status_processo });
}

async function excluir(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const candidatoId = req.query.candidato_id ? Number(req.query.candidato_id) : null;

  let query = 'DELETE FROM Candidatura WHERE id = ? OR vaga_id = ?';
  let params = [idParam, idParam];

  if (candidatoId) {
    query = 'DELETE FROM Candidatura WHERE (id = ? OR vaga_id = ?) AND candidato_id = ?';
    params = [idParam, idParam, candidatoId];
  }

  await execMySQL(query, params);

  store.candidaturas = store.candidaturas.filter(
    (c) => !(c.id === idParam || c.vaga_id === idParam)
  );
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: idParam });
}

module.exports = {
  listar,
  aplicar,
  atualizarStatus,
  excluir,
};

