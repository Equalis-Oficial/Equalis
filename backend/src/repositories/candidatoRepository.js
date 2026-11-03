/**
 * Repositório de Candidatos — Equalis
 * Acesso a dados de Candidato, Candidato_Deficiencia, Formacao_Academica e Experiencia_Profissional (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function buscarPorEmail(email) {
  const emailNorm = String(email || '').trim().toLowerCase();
  const rows = await execMySQL(
    'SELECT * FROM Candidato WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL',
    [emailNorm]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function buscarPorCpf(cpf) {
  const cpfLimpo = String(cpf || '').replace(/\D/g, '');
  const rows = await execMySQL(
    'SELECT * FROM Candidato WHERE cpf = ? AND deleted_at IS NULL',
    [cpfLimpo]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function buscarPorId(id) {
  const rows = await execMySQL(
    `SELECT id, nome, email, cpf, resumo_profissional, url_curriculo,
            cidade, estado, area_atuacao, usa_tela_acessivel, created_at, updated_at
     FROM Candidato WHERE id = ? AND deleted_at IS NULL`,
    [Number(id)]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function listarTodos() {
  const rows = await execMySQL(
    `SELECT id, nome, email, cpf, cidade, estado, area_atuacao, usa_tela_acessivel, created_at
     FROM Candidato WHERE deleted_at IS NULL ORDER BY id ASC`
  );
  return Array.isArray(rows) ? rows : [];
}

async function criar({ nome, email, senha, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel }) {
  const result = await execMySQL(
    `INSERT INTO Candidato (nome, email, senha, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome,
      email,
      senha,
      cpf,
      resumo_profissional || null,
      url_curriculo || null,
      cidade || 'Guarulhos',
      estado || 'SP',
      area_atuacao || 'Geral',
      usa_tela_acessivel ? 1 : 0,
    ]
  );
  const id = result && result.insertId ? result.insertId : null;
  return buscarPorId(id);
}

async function atualizar(id, dados) {
  const { nome, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel } = dados;
  await execMySQL(
    `UPDATE Candidato SET
       nome = COALESCE(?, nome),
       resumo_profissional = COALESCE(?, resumo_profissional),
       url_curriculo = COALESCE(?, url_curriculo),
       cidade = COALESCE(?, cidade),
       estado = COALESCE(?, estado),
       area_atuacao = COALESCE(?, area_atuacao),
       usa_tela_acessivel = COALESCE(?, usa_tela_acessivel),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND deleted_at IS NULL`,
    [
      nome || null,
      resumo_profissional || null,
      url_curriculo || null,
      cidade || null,
      estado || null,
      area_atuacao || null,
      usa_tela_acessivel !== undefined ? (usa_tela_acessivel ? 1 : 0) : null,
      Number(id),
    ]
  );
  return buscarPorId(id);
}

// Deficiências associadas
async function buscarDeficiencias(candidatoId) {
  const rows = await execMySQL(
    `SELECT cd.deficiencia_id, cd.url_laudo_medico, d.categoria, d.descricao
     FROM Candidato_Deficiencia cd
     JOIN Deficiencia d ON cd.deficiencia_id = d.id
     WHERE cd.candidato_id = ?`,
    [Number(candidatoId)]
  );
  return Array.isArray(rows) ? rows : [];
}

async function vincularDeficiencias(candidatoId, deficienciasIds = [], urlLaudo = null) {
  await execMySQL('DELETE FROM Candidato_Deficiencia WHERE candidato_id = ?', [Number(candidatoId)]);
  for (const defId of deficienciasIds) {
    await execMySQL(
      `INSERT INTO Candidato_Deficiencia (candidato_id, deficiencia_id, url_laudo_medico)
       VALUES (?, ?, ?)`,
      [Number(candidatoId), Number(defId), urlLaudo]
    );
  }
}

// Formações acadêmicas
async function listarFormacoes(candidatoId) {
  const rows = await execMySQL(
    'SELECT * FROM Formacao_Academica WHERE candidato_id = ? ORDER BY id DESC',
    [Number(candidatoId)]
  );
  return Array.isArray(rows) ? rows : [];
}

async function criarFormacao(candidatoId, dados) {
  const result = await execMySQL(
    `INSERT INTO Formacao_Academica (candidato_id, instituicao, diploma, area_estudo, mes_inicio, ano_inicio, mes_termino, ano_termino, atividades_grupos, descricao, competencias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(candidatoId),
      dados.instituicao || '',
      dados.diploma || '',
      dados.area_estudo || '',
      dados.mes_inicio || '',
      dados.ano_inicio || '',
      dados.mes_termino || '',
      dados.ano_termino || '',
      dados.atividades_grupos || '',
      dados.descricao || '',
      Array.isArray(dados.competencias) ? dados.competencias.join(', ') : dados.competencias || '',
    ]
  );
  const id = result && result.insertId ? result.insertId : Date.now();
  return { id, candidato_id: Number(candidatoId), ...dados };
}

async function excluirFormacao(formId, candidatoId) {
  await execMySQL(
    'DELETE FROM Formacao_Academica WHERE id = ? AND candidato_id = ?',
    [Number(formId), Number(candidatoId)]
  );
  return true;
}

// Experiências profissionais
async function listarExperiencias(candidatoId) {
  const rows = await execMySQL(
    'SELECT * FROM Experiencia_Profissional WHERE candidato_id = ? ORDER BY id DESC',
    [Number(candidatoId)]
  );
  return Array.isArray(rows) ? rows : [];
}

async function criarExperiencia(candidatoId, dados) {
  const result = await execMySQL(
    `INSERT INTO Experiencia_Profissional (candidato_id, cargo, organizacao, tipo_emprego, localidade, tipo_localidade, mes_inicio, ano_inicio, descricao, competencias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(candidatoId),
      dados.cargo || '',
      dados.organizacao || '',
      dados.tipo_emprego || '',
      dados.localidade || '',
      dados.tipo_localidade || '',
      dados.mes_inicio || '',
      dados.ano_inicio || '',
      dados.descricao || '',
      Array.isArray(dados.competencias) ? dados.competencias.join(', ') : dados.competencias || '',
    ]
  );
  const id = result && result.insertId ? result.insertId : Date.now();
  return { id, candidato_id: Number(candidatoId), ...dados };
}

async function excluirExperiencia(expId, candidatoId) {
  await execMySQL(
    'DELETE FROM Experiencia_Profissional WHERE id = ? AND candidato_id = ?',
    [Number(expId), Number(candidatoId)]
  );
  return true;
}

module.exports = {
  buscarPorEmail,
  buscarPorCpf,
  buscarPorId,
  listarTodos,
  criar,
  atualizar,
  buscarDeficiencias,
  vincularDeficiencias,
  listarFormacoes,
  criarFormacao,
  excluirFormacao,
  listarExperiencias,
  criarExperiencia,
  excluirExperiencia,
};
