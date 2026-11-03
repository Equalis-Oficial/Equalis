/**
 * Repositório de Candidaturas — Equalis
 * Acesso a dados de Candidatura com joins em Candidato, Vaga e Empresa (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function listar({ candidatoId, empresaId } = {}) {
  let whereClauses = [];
  let params = [];

  if (candidatoId) {
    whereClauses.push('c.candidato_id = ?');
    params.push(Number(candidatoId));
  }
  if (empresaId) {
    whereClauses.push('v.empresa_id = ?');
    params.push(Number(empresaId));
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const rows = await execMySQL(
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

  if (!Array.isArray(rows)) return [];

  return rows.map((c) => ({
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
}

async function buscarPorCandidatoEVaga(candidatoId, vagaId) {
  const rows = await execMySQL(
    `SELECT * FROM Candidatura
     WHERE candidato_id = ? AND vaga_id = ? AND status_processo != 'CANCELADA'`,
    [Number(candidatoId), Number(vagaId)]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function criar(candidatoId, vagaId) {
  const result = await execMySQL(
    `INSERT INTO Candidatura (candidato_id, vaga_id, status_processo) VALUES (?, ?, 'ENVIADA')
     ON DUPLICATE KEY UPDATE status_processo = 'ENVIADA', updated_at = CURRENT_TIMESTAMP`,
    [Number(candidatoId), Number(vagaId)]
  );
  const id = result && result.insertId ? result.insertId : null;
  return {
    id,
    candidato_id: Number(candidatoId),
    vaga_id: Number(vagaId),
    status_processo: 'ENVIADA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function atualizarStatus(id, { status_processo = 'CANCELADA', vaga_id } = {}) {
  const idParam = Number(id);
  await execMySQL(
    `UPDATE Candidatura SET status_processo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR vaga_id = ?`,
    [status_processo, idParam, vaga_id ? Number(vaga_id) : idParam]
  );
  return { id: idParam, status_processo };
}

async function excluir(id, candidatoId = null) {
  const idParam = Number(id);
  let query = 'DELETE FROM Candidatura WHERE id = ? OR vaga_id = ?';
  let params = [idParam, idParam];

  if (candidatoId) {
    query = 'DELETE FROM Candidatura WHERE (id = ? OR vaga_id = ?) AND candidato_id = ?';
    params = [idParam, idParam, Number(candidatoId)];
  }

  await execMySQL(query, params);
  return true;
}

module.exports = {
  listar,
  buscarPorCandidatoEVaga,
  criar,
  atualizarStatus,
  excluir,
};
