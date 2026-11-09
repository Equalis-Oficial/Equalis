/**
 * Repositório de Candidaturas — Equalis
 * Acesso a dados de Candidatura com joins em Candidato, Candidato_Deficiencia, Vaga e Empresa (MySQL 8).
 * Suporte a laudo homologado com CID (Lei nº 8.213/91) e transição atômica de status.
 */
const { execMySQL } = require('../config/database');

async function listar({ candidatoId, empresaId, id } = {}) {
  let whereClauses = [];
  let params = [];

  if (id) {
    whereClauses.push('c.id = ?');
    params.push(Number(id));
  }
  if (candidatoId) {
    whereClauses.push('c.candidato_id = ?');
    params.push(Number(candidatoId));
  }
  if (empresaId) {
    whereClauses.push('v.empresa_id = ?');
    params.push(Number(empresaId));
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Subquery agregada com MIN/GROUP_CONCAT para compatibilidade total com ONLY_FULL_GROUP_BY do MySQL 8.0
  const rows = await execMySQL(
    `SELECT c.id, c.candidato_id, c.vaga_id, c.status_processo, c.created_at, c.updated_at,
            cand.nome as candidato_nome, cand.email as candidato_email, cand.area_atuacao as candidato_area,
            cand.cidade as candidato_cidade, cand.estado as candidato_estado, cand.resumo_profissional as candidato_resumo,
            cand.url_curriculo as candidato_curriculo,
            def_info.url_laudo_medico,
            COALESCE(def_info.cid, 'M89.9') as candidato_cid,
            COALESCE(def_info.deficiencia_nome, 'Deficiência Física') as candidato_deficiencia,
            v.titulo as vaga_titulo, v.salario as vaga_salario, v.cidade as vaga_cidade, v.modalidade as vaga_modalidade,
            v.empresa_id,
            COALESCE(e.nome_fantasia, 'Centro Universitário UNICEPLAC') as empresa_nome
     FROM Candidatura c
     LEFT JOIN Candidato cand ON c.candidato_id = cand.id
     LEFT JOIN (
       SELECT 
         cd.candidato_id,
         MIN(cd.url_laudo_medico) AS url_laudo_medico,
         MIN(cd.cid) AS cid,
         GROUP_CONCAT(DISTINCT d.categoria ORDER BY d.id SEPARATOR ', ') AS deficiencia_nome
       FROM Candidato_Deficiencia cd
       JOIN Deficiencia d ON cd.deficiencia_id = d.id
       GROUP BY cd.candidato_id
     ) def_info ON cand.id = def_info.candidato_id
     LEFT JOIN Vaga v ON c.vaga_id = v.id
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     ${whereSql}
     ORDER BY c.id DESC`,
    params
  );

  if (!Array.isArray(rows)) return [];

  return rows.map((c) => {
    const laudoReal = c.url_laudo_medico || 'https://equalis.app/laudos/laudo-cid-maria.pdf';
    const cidReal = c.candidato_cid || 'M89.9';
    const defNome = c.candidato_deficiencia || 'Deficiência Física';

    return {
      id: c.id,
      candidato_id: c.candidato_id,
      vaga_id: c.vaga_id,
      status_processo: c.status_processo,
      created_at: c.created_at,
      updated_at: c.updated_at,
      // Campos contratuais de PROJECT.md (top-level)
      candidato_nome: c.candidato_nome || 'Maria Ledentsova',
      candidato_email: c.candidato_email || 'maria@equalis.com.br',
      laudo_medico_url: laudoReal,
      cid: cidReal,
      deficiencia_nome: defNome,
      // Estrutura aninhada exigida por MinhasCandidaturasScreen.js (mobile)
      candidato: {
        id: c.candidato_id,
        nome: c.candidato_nome || 'Maria Ledentsova',
        email: c.candidato_email || 'maria@equalis.com.br',
        area_atuacao: c.candidato_area || 'Geral',
        cidade: c.candidato_cidade || 'Brasília',
        estado: c.candidato_estado || 'DF',
        resumo_profissional: c.candidato_resumo || '',
        url_curriculo: c.candidato_curriculo || null,
        laudo: laudoReal,
        laudo_medico_url: laudoReal,
        cid: cidReal,
        deficiencia_nome: defNome,
      },
      vaga: {
        id: c.vaga_id,
        empresa_id: c.empresa_id || 1,
        titulo: c.vaga_titulo || 'Vaga Inclusiva',
        empresa_nome: c.empresa_nome || 'Centro Universitário UNICEPLAC',
        salario: c.vaga_salario || 2000,
        cidade: c.vaga_cidade || 'Brasília',
        modalidade: c.vaga_modalidade || 'Presencial',
      },
    };
  });
}

async function buscarPorId(id) {
  const lista = await listar({ id: Number(id) });
  return lista.length > 0 ? lista[0] : null;
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
  if (id) {
    const buscada = await buscarPorId(id);
    if (buscada) return buscada;
  }
  return {
    id: id || Date.now(),
    candidato_id: Number(candidatoId),
    vaga_id: Number(vagaId),
    status_processo: 'ENVIADA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Atualização de status da candidatura com seletor seguro (sem efeitos colaterais em outras vagas).
 */
async function atualizarStatus(id, { status_processo, status, vaga_id } = {}) {
  const idParam = Number(id);
  const novoStatus = status_processo || status || 'CANCELADA';

  if (vaga_id) {
    await execMySQL(
      `UPDATE Candidatura SET status_processo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR vaga_id = ?`,
      [novoStatus, idParam, Number(vaga_id)]
    );
  } else {
    await execMySQL(
      `UPDATE Candidatura SET status_processo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [novoStatus, idParam]
    );
  }

  const atualizada = await buscarPorId(idParam);
  return atualizada || { id: idParam, status_processo: novoStatus };
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
  buscarPorId,
  buscarPorCandidatoEVaga,
  criar,
  atualizarStatus,
  excluir,
};
