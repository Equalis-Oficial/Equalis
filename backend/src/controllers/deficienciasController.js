/**
 * Controller de Deficiências — Equalis (Clean MVC)
 * Gerencia requisições HTTP para consulta do catálogo de acessibilidade LBI.
 */
const deficienciaService = require('../services/deficienciaService');

async function listar(req, res, next) {
  try {
    const deficiencias = await deficienciaService.listar();
    return res.status(200).json(deficiencias);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const deficiencia = await deficienciaService.obter(req.params.id);
    if (!deficiencia) {
      return res.status(404).json({ erro: 'Deficiência não encontrada.' });
    }
    return res.status(200).json(deficiencia);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obter,
};
