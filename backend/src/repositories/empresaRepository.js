/**
 * Repositório de Empresas — Equalis
 * Acesso a dados da tabela Empresa (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function buscarPorEmail(email) {
  const emailNorm = String(email || '').trim().toLowerCase();
  const rows = await execMySQL(
    'SELECT * FROM Empresa WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL',
    [emailNorm]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function buscarPorCnpj(cnpj) {
  const cnpjLimpo = String(cnpj || '').replace(/\D/g, '');
  const rows = await execMySQL(
    'SELECT * FROM Empresa WHERE cnpj = ? AND deleted_at IS NULL',
    [cnpjLimpo]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function buscarPorId(id) {
  const rows = await execMySQL(
    `SELECT id, nome_fantasia, cnpj, email, descricao, created_at, updated_at
     FROM Empresa WHERE id = ? AND deleted_at IS NULL`,
    [Number(id)]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function listarTodas() {
  const rows = await execMySQL(
    `SELECT id, nome_fantasia, cnpj, email, descricao, created_at
     FROM Empresa WHERE deleted_at IS NULL ORDER BY id ASC`
  );
  return Array.isArray(rows) ? rows : [];
}

async function criar({ nome_fantasia, cnpj, email, senha, descricao }) {
  const result = await execMySQL(
    `INSERT INTO Empresa (nome_fantasia, cnpj, email, senha, descricao)
     VALUES (?, ?, ?, ?, ?)`,
    [nome_fantasia, cnpj, email, senha, descricao]
  );
  const id = result && result.insertId ? result.insertId : null;
  return buscarPorId(id);
}

async function atualizar(id, { nome_fantasia, descricao }) {
  await execMySQL(
    `UPDATE Empresa SET
       nome_fantasia = COALESCE(?, nome_fantasia),
       descricao = COALESCE(?, descricao),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND deleted_at IS NULL`,
    [nome_fantasia || null, descricao || null, Number(id)]
  );
  return buscarPorId(id);
}

module.exports = {
  buscarPorEmail,
  buscarPorCnpj,
  buscarPorId,
  listarTodas,
  criar,
  atualizar,
};

