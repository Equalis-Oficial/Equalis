/**
 * Controller de Candidatos — Equalis (Clean MVC)
 * Gerencia requisições HTTP para profissionais PcD, formações e experiências.
 */
const candidatoService = require('../services/candidatoService');

async function cadastrar(req, res, next) {
  try {
    const resultado = await candidatoService.cadastrar(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obterPerfil(req, res, next) {
  try {
    const perfil = await candidatoService.obterPerfil(req.params.id);
    return res.status(200).json(perfil);
  } catch (err) {
    next(err);
  }
}

async function atualizarPerfil(req, res, next) {
  try {
    const candidatoAtualizado = await candidatoService.atualizarPerfil(req.params.id, req.body);
    return res.status(200).json({
      sucesso: true,
      candidato: candidatoAtualizado,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadDocumento(req, res, next) {
  try {
    const doc = await candidatoService.uploadDocumento(req.params.id, req.body);
    return res.status(201).json({
      sucesso: true,
      documento: doc,
    });
  } catch (err) {
    next(err);
  }
}

// Formações acadêmicas
async function listarFormacoes(req, res, next) {
  try {
    const lista = await candidatoService.listarFormacoes(req.params.id);
    return res.status(200).json(lista);
  } catch (err) {
    next(err);
  }
}

async function adicionarFormacao(req, res, next) {
  try {
    const candId = req.params.id || req.body.candidato_id || 1;
    const novaForm = await candidatoService.adicionarFormacao(candId, req.body);
    return res.status(201).json(novaForm);
  } catch (err) {
    next(err);
  }
}

async function excluirFormacao(req, res, next) {
  try {
    const candId = req.params.id || req.body.candidato_id || 1;
    await candidatoService.excluirFormacao(req.params.formId, candId);
    return res.status(200).json({ sucesso: true, id: Number(req.params.formId) });
  } catch (err) {
    next(err);
  }
}

// Experiências profissionais
async function listarExperiencias(req, res, next) {
  try {
    const lista = await candidatoService.listarExperiencias(req.params.id);
    return res.status(200).json(lista);
  } catch (err) {
    next(err);
  }
}

async function adicionarExperiencia(req, res, next) {
  try {
    const candId = req.params.id || req.body.candidato_id || 1;
    const novaExp = await candidatoService.adicionarExperiencia(candId, req.body);
    return res.status(201).json(novaExp);
  } catch (err) {
    next(err);
  }
}

async function excluirExperiencia(req, res, next) {
  try {
    const candId = req.params.id || req.body.candidato_id || 1;
    await candidatoService.excluirExperiencia(req.params.expId, candId);
    return res.status(200).json({ sucesso: true, id: Number(req.params.expId) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  cadastrar,
  obterPerfil,
  atualizarPerfil,
  uploadDocumento,
  listarFormacoes,
  adicionarFormacao,
  excluirFormacao,
  listarExperiencias,
  adicionarExperiencia,
  excluirExperiencia,
};
