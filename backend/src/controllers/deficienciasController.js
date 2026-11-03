/**
 * Controller de Deficiências — Equalis
 * Categorias oficiais de deficiência previstas na legislação brasileira.
 */
const { execMySQL } = require('../config/database');
const { loadStore } = require('../models/dataStore');

async function listar(req, res) {
  const store = loadStore();
  const rows = await execMySQL('SELECT * FROM Deficiencia ORDER BY id ASC');
  return res.status(200).json(rows && rows.length ? rows : store.deficiencias);
}

module.exports = {
  listar,
};

