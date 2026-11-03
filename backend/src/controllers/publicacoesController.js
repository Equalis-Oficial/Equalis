/**
 * Controller de Publicações — Equalis (Clean MVC)
 * Gerencia requisições HTTP para o feed social, curtidas, comentários e reposts.
 */
const publicacaoService = require('../services/publicacaoService');

async function listar(req, res, next) {
  try {
    const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : null;
    const usuarioTipo = req.query.usuario_tipo || 'CANDIDATO';
    const publicacoes = await publicacaoService.listar({ usuarioId, usuarioTipo });
    return res.status(200).json(publicacoes);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const novaPub = await publicacaoService.criar(req.body);
    return res.status(201).json(novaPub);
  } catch (err) {
    next(err);
  }
}

async function editar(req, res, next) {
  try {
    const resultado = await publicacaoService.editar(req.params.id, req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const resultado = await publicacaoService.excluir(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function curtir(req, res, next) {
  try {
    const resultado = await publicacaoService.alternarCurtida(req.params.id, req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function listarComentarios(req, res, next) {
  try {
    const comentarios = await publicacaoService.listarComentarios(req.params.id);
    return res.status(200).json(comentarios);
  } catch (err) {
    next(err);
  }
}

async function comentar(req, res, next) {
  try {
    const novoComentario = await publicacaoService.adicionarComentario(req.params.id, req.body);
    return res.status(201).json(novoComentario);
  } catch (err) {
    next(err);
  }
}

async function republicar(req, res, next) {
  try {
    const republicada = await publicacaoService.republicar(req.params.id, req.body);
    return res.status(201).json(republicada);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  criar,
  editar,
  excluir,
  curtir,
  listarComentarios,
  comentar,
  republicar,
};
