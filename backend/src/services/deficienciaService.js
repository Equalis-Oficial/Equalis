/**
 * Serviço de Deficiências — Equalis
 * Lógica de negócio do catálogo oficial de acessibilidade LBI.
 */
const deficienciaRepository = require('../repositories/deficienciaRepository');

async function listar() {
  return await deficienciaRepository.listarTodas();
}

async function obter(id) {
  return await deficienciaRepository.buscarPorId(id);
}

module.exports = {
  listar,
  obter,
};

