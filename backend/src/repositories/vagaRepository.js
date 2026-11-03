/**
 * Repositório de Vagas — Equalis
 * Acesso a dados de Vaga e Vaga_Acessibilidade (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function listar({ empresaId } = {}) {
  const whereEmpresa = empresaId ? 'AND v.empresa_id = ?' : '';
  const params = empresaId ? [Number(empresaId)] : [];

  const dbVagas = await execMySQL(
    `SELECT v.*, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Vaga v
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     WHERE v.deleted_at IS NULL ${whereEmpresa}
     ORDER BY v.id DESC`,
    params
  );

  if (!Array.isArray(dbVagas)) return [];

  for (const v of dbVagas) {
    const defs = await execMySQL(
      `SELECT d.id, d.categoria FROM Vaga_Acessibilidade va
       JOIN Deficiencia d ON va.deficiencia_id = d.id
       WHERE va.vaga_id = ?`,
      [v.id]
    );
    v.acessibilidades_ids = defs && defs.length > 0 ? defs.map((d) => d.id) : [1, 2, 3];
    v.recursos_acessibilidade =
      defs && defs.length > 0 ? defs.map((d) => d.categoria) : ['Ambiente Adaptado PcD'];
    v.tempo_publicacao = 'Recentemente';
    v.avaliacao_empresa = '4.9';
  }

  return dbVagas;
}

async function buscarPorId(id) {
  const dbRows = await execMySQL(
    `SELECT v.*, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Vaga v
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     WHERE v.id = ? AND v.deleted_at IS NULL`,
    [Number(id)]
  );

  if (!Array.isArray(dbRows) || dbRows.length === 0) return null;

  const vaga = dbRows[0];
  const defs = await execMySQL(
    `SELECT d.id, d.categoria FROM Vaga_Acessibilidade va
     JOIN Deficiencia d ON va.deficiencia_id = d.id
     WHERE va.vaga_id = ?`,
    [vaga.id]
  );
  vaga.acessibilidades_ids = defs && defs.length > 0 ? defs.map((d) => d.id) : [1, 2, 3];
  vaga.recursos_acessibilidade =
    defs && defs.length > 0 ? defs.map((d) => d.categoria) : ['Ambiente Adaptado PcD'];
  vaga.tempo_publicacao = 'Recentemente';
  vaga.avaliacao_empresa = '4.9';

  return vaga;
}

async function criar(dadosVaga, acessibilidadesIds = []) {
  const result = await execMySQL(
    `INSERT INTO Vaga (empresa_id, titulo, descricao, requerimentos, categoria, carga_horaria, modalidade, cidade, estado, salario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(dadosVaga.empresa_id),
      dadosVaga.titulo,
      dadosVaga.descricao || '',
      dadosVaga.requerimentos || '',
      dadosVaga.categoria || 'Atendimento',
      dadosVaga.carga_horaria || '6 horas',
      dadosVaga.modalidade || 'Presencial',
      dadosVaga.cidade || 'Brasília',
      dadosVaga.estado || 'DF',
      dadosVaga.salario || 2000.0,
    ]
  );

  const novaId = result && result.insertId ? result.insertId : null;

  if (novaId && Array.isArray(acessibilidadesIds)) {
    for (const defId of acessibilidadesIds) {
      await execMySQL(
        'INSERT INTO Vaga_Acessibilidade (vaga_id, deficiencia_id) VALUES (?, ?)',
        [novaId, Number(defId)]
      );
    }
  }

  return buscarPorId(novaId);
}

async function atualizar(id, dadosVaga) {
  await execMySQL(
    `UPDATE Vaga SET
       titulo = COALESCE(?, titulo),
       descricao = COALESCE(?, descricao),
       requerimentos = COALESCE(?, requerimentos),
       salario = COALESCE(?, salario),
       modalidade = COALESCE(?, modalidade),
       cidade = COALESCE(?, cidade),
       estado = COALESCE(?, estado),
       categoria = COALESCE(?, categoria),
       carga_horaria = COALESCE(?, carga_horaria),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND deleted_at IS NULL`,
    [
      dadosVaga.titulo || null,
      dadosVaga.descricao || null,
      dadosVaga.requerimentos || null,
      dadosVaga.salario || null,
      dadosVaga.modalidade || null,
      dadosVaga.cidade || null,
      dadosVaga.estado || null,
      dadosVaga.categoria || null,
      dadosVaga.carga_horaria || null,
      Number(id),
    ]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  await execMySQL(
    'UPDATE Vaga SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
    [Number(id)]
  );
  return true;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
};

