/**
 * Repositório de Deficiências — Equalis
 * Acesso a dados do catálogo oficial de deficiências da LBI (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function listarTodas() {
  const rows = await execMySQL(
    'SELECT id, categoria, descricao FROM Deficiencia ORDER BY id ASC'
  );
  return Array.isArray(rows) ? rows : [];
}

async function buscarPorId(id) {
  const rows = await execMySQL(
    'SELECT id, categoria, descricao FROM Deficiencia WHERE id = ?',
    [Number(id)]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

module.exports = {
  listarTodas,
  buscarPorId,
};
