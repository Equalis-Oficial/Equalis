/**
 * Serviço de Notificações — Equalis (UC-22 & RN-031)
 * Gerencia ciclo de vida, contagem de itens não lidos para o badge e baixa de leitura.
 */
const notificacaoRepository = require('../repositories/notificacaoRepository');
const AppError = require('../errors/AppError');
const { sanitizarTexto } = require('../utils/validators');

/**
 * Lista notificações de um usuário com metadados de contagem de não lidas
 */
async function listar({ usuario_id, usuario_tipo = 'CANDIDATO', apenas_nao_lidas = false } = {}) {
  const uid = Number(usuario_id);
  if (!uid || isNaN(uid) || uid <= 0 || !Number.isInteger(uid)) {
    throw new AppError('Parâmetro usuario_id é obrigatório.', 400);
  }

  const tipo = String(usuario_tipo).toUpperCase() === 'EMPRESA' ? 'EMPRESA' : 'CANDIDATO';
  const filtrarNaoLidas = Boolean(apenas_nao_lidas === true || apenas_nao_lidas === 'true' || apenas_nao_lidas === '1' || apenas_nao_lidas === 1);

  const [notificacoes, totalNaoLidas] = await Promise.all([
    notificacaoRepository.listarPorUsuario({
      usuario_id: uid,
      usuario_tipo: tipo,
      apenas_nao_lidas: filtrarNaoLidas,
    }),
    notificacaoRepository.contarNaoLidas(uid, tipo),
  ]);

  return {
    total: Array.isArray(notificacoes) ? notificacoes.length : 0,
    nao_lidas: Number(totalNaoLidas) || 0,
    notificacoes: Array.isArray(notificacoes) ? notificacoes : [],
  };
}

/**
 * Cria uma notificação no sistema
 */
async function criar(dados) {
  const {
    usuario_id,
    usuario_tipo = 'CANDIDATO',
    tipo_evento = 'CANDIDATURA',
    tipo,
    titulo,
    mensagem,
    referencia_id,
  } = dados || {};

  const uid = Number(usuario_id);
  if (!uid || isNaN(uid) || uid <= 0 || !Number.isInteger(uid)) {
    throw new AppError('Identificador de usuário destinatário é obrigatório.', 400);
  }

  if (!titulo || String(titulo).trim().length < 2) {
    throw new AppError('Título da notificação é obrigatório.', 400);
  }

  if (!mensagem || String(mensagem).trim().length < 2) {
    throw new AppError('Mensagem da notificação é obrigatória.', 400);
  }

  const tipoEventoFinal = tipo_evento || tipo || 'CANDIDATURA';
  const usuarioTipoFinal = String(usuario_tipo).toUpperCase() === 'EMPRESA' ? 'EMPRESA' : 'CANDIDATO';

  const novaNotificacao = await notificacaoRepository.criar({
    usuario_id: uid,
    usuario_tipo: usuarioTipoFinal,
    tipo_evento: sanitizarTexto(tipoEventoFinal),
    titulo: sanitizarTexto(titulo),
    mensagem: sanitizarTexto(mensagem),
    referencia_id: referencia_id ? Number(referencia_id) : null,
  });

  return novaNotificacao;
}

/**
 * Marca uma notificação individual como lida (RN-031)
 */
async function marcarComoLida(id, usuarioId = null) {
  const notifId = Number(id);
  if (!notifId || isNaN(notifId) || notifId <= 0 || !Number.isInteger(notifId)) {
    throw new AppError('Identificador de notificação inválido.', 400);
  }

  const existe = await notificacaoRepository.buscarPorId(notifId);
  if (!existe) {
    throw new AppError('Notificação não encontrada.', 404);
  }

  await notificacaoRepository.marcarLida(notifId, usuarioId ? Number(usuarioId) : null);
  return {
    success: true,
    sucesso: true,
    id: notifId,
    lida: 1,
    message: 'Notificação marcada como lida.',
  };
}

/**
 * Marca todas as notificações do usuário como lidas
 */
async function marcarTodasComoLidas({ usuario_id, usuario_tipo = 'CANDIDATO' } = {}) {
  const uid = Number(usuario_id);
  if (!uid || isNaN(uid) || uid <= 0 || !Number.isInteger(uid)) {
    throw new AppError('Identificador do usuário é obrigatório.', 400);
  }

  const tipo = String(usuario_tipo).toUpperCase() === 'EMPRESA' ? 'EMPRESA' : 'CANDIDATO';
  const afetadas = await notificacaoRepository.marcarTodasLidas(uid, tipo);

  return {
    success: true,
    sucesso: true,
    afetadas: Number(afetadas) || 0,
    message: 'Todas as notificações foram marcadas como lidas.',
  };
}

/**
 * Remove uma notificação do sistema
 */
async function excluir(id, usuarioId = null) {
  const notifId = Number(id);
  if (!notifId || isNaN(notifId) || notifId <= 0 || !Number.isInteger(notifId)) {
    throw new AppError('Identificador de notificação inválido.', 400);
  }

  await notificacaoRepository.excluir(notifId, usuarioId ? Number(usuarioId) : null);
  return {
    success: true,
    sucesso: true,
    id: notifId,
    message: 'Notificação excluída com sucesso.',
  };
}

module.exports = {
  listar,
  criar,
  marcarComoLida,
  marcarTodasComoLidas,
  excluir,
};
