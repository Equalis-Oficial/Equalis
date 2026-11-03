/**
 * Controller de Candidaturas — Equalis (Clean MVC)
 * Gerencia requisições HTTP para inscrição em vagas e fluxo de processo seletivo.
 */
const candidaturaService = require('../services/candidaturaService');

async function listar(req, res, next) {
  try {
    const candidatoId = req.query.candidato_id ? Number(req.query.candidato_id) : null;
    const empresaId = req.query.empresa_id ? Number(req.query.empresa_id) : null;
    const candidaturas = await candidaturaService.listar({ candidatoId, empresaId });
    return res.status(200).json(candidaturas);
  } catch (err) {
    next(err);
  }
}

async function aplicar(req, res, next) {
  try {
    const novaCandidatura = await candidaturaService.aplicar(req.body || {});
    return res.status(201).json(novaCandidatura);
  } catch (err) {
    next(err);
  }
}

async function atualizarStatus(req, res, next) {
  try {
    const resultado = await candidaturaService.atualizarStatus(req.params.id, req.body);
    return res.status(200).json({
      sucesso: true,
      status_processo: resultado.status_processo,
    });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const candidatoId = req.query.candidato_id ? Number(req.query.candidato_id) : null;
    const resultado = await candidaturaService.excluir(req.params.id, candidatoId);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  aplicar,
  atualizarStatus,
  excluir,
};
