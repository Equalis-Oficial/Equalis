/**
 * Controller de Vagas — Equalis (Clean MVC)
 * Gerencia requisições HTTP para consulta, publicação, edição e encerramento de vagas PcD.
 */
const vagaService = require('../services/vagaService');

async function listar(req, res, next) {
  try {
    const empresaId = req.query.empresa_id ? Number(req.query.empresa_id) : null;
    const vagas = await vagaService.listar({ empresaId });
    return res.status(200).json(vagas);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const vaga = await vagaService.obter(req.params.id);
    return res.status(200).json(vaga);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const novaVaga = await vagaService.criar(req.body);
    return res.status(201).json(novaVaga);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const vagaAtualizada = await vagaService.atualizar(req.params.id, req.body);
    return res.status(200).json({
      sucesso: true,
      vaga: vagaAtualizada,
    });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const resultado = await vagaService.excluir(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  excluir,
};
