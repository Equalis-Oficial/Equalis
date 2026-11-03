/**
 * Controller de Rede & Mensagens — Equalis (Clean MVC)
 * Gerencia requisições HTTP para conexões profissionais e mensageria direta.
 */
const redeService = require('../services/redeService');

// =================== CONEXÕES ===================
async function listarConexoes(req, res, next) {
  try {
    const candidatoId = req.query.candidato_id ? Number(req.query.candidato_id) : null;
    const conexoes = await redeService.listarConexoes(candidatoId);
    return res.status(200).json(conexoes);
  } catch (err) {
    next(err);
  }
}

async function alternarConexao(req, res, next) {
  try {
    const resultado = await redeService.alternarConexao(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

// =================== MENSAGENS ===================
async function listarMensagens(req, res, next) {
  try {
    const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : null;
    const usuarioTipo = req.query.usuario_tipo || 'CANDIDATO';
    const mensagens = await redeService.listarMensagens({ usuarioId, usuarioTipo });
    return res.status(200).json(mensagens);
  } catch (err) {
    next(err);
  }
}

async function enviarMensagem(req, res, next) {
  try {
    const novaMensagem = await redeService.enviarMensagem(req.body || {});
    return res.status(201).json(novaMensagem);
  } catch (err) {
    next(err);
  }
}

async function marcarLida(req, res, next) {
  try {
    const resultado = await redeService.marcarComoLida(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function excluirMensagem(req, res, next) {
  try {
    const resultado = await redeService.excluirMensagem(req.params.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarConexoes,
  alternarConexao,
  listarMensagens,
  enviarMensagem,
  marcarLida,
  excluirMensagem,
};
