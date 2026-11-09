/**
 * Controller de Notificações — Equalis (Clean MVC)
 * Endpoints RESTful para central de notificações e controle de badge numérico.
 */
const notificacaoService = require('../services/notificacaoService');

async function listar(req, res, next) {
  try {
    const usuario_id = req.query.usuario_id ? Number(req.query.usuario_id) : null;
    const usuario_tipo = req.query.usuario_tipo || 'CANDIDATO';
    const apenas_nao_lidas = req.query.apenas_nao_lidas === 'true' || req.query.apenas_nao_lidas === true;

    const resultado = await notificacaoService.listar({
      usuario_id,
      usuario_tipo,
      apenas_nao_lidas,
    });

    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const novaNotificacao = await notificacaoService.criar(req.body);
    return res.status(201).json(novaNotificacao);
  } catch (err) {
    next(err);
  }
}

async function marcarComoLida(req, res, next) {
  try {
    const usuarioId = req.query.usuario_id || (req.body && req.body.usuario_id);
    const resultado = await notificacaoService.marcarComoLida(req.params.id, usuarioId);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function marcarTodasComoLidas(req, res, next) {
  try {
    const usuario_id = (req.body && req.body.usuario_id) || req.query.usuario_id;
    const usuario_tipo = (req.body && req.body.usuario_tipo) || req.query.usuario_tipo || 'CANDIDATO';

    const resultado = await notificacaoService.marcarTodasComoLidas({
      usuario_id,
      usuario_tipo,
    });

    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const usuarioId = req.query.usuario_id || (req.body && req.body.usuario_id);
    const resultado = await notificacaoService.excluir(req.params.id, usuarioId);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  criar,
  marcarComoLida,
  marcarTodasComoLidas,
  excluir,
};
