/**
 * Serviço de Rede & Mensagens — Equalis
 * Lógica de conexões profissionais e mensageria direta isolada por usuário.
 */
const redeRepository = require('../repositories/redeRepository');
const AppError = require('../errors/AppError');
const { sanitizarTexto } = require('../utils/validators');

// =================== CONEXÕES ===================
async function listarConexoes(candidatoId = null) {
  return await redeRepository.listarConexoes(candidatoId);
}

async function alternarConexao(id) {
  const conexaoAtualizada = await redeRepository.alternarStatusConexao(id);
  if (!conexaoAtualizada) {
    throw new AppError('Contato não encontrado.', 404);
  }
  return {
    sucesso: true,
    conexao: conexaoAtualizada,
    status: conexaoAtualizada.status,
  };
}

// =================== MENSAGENS ===================
async function listarMensagens({ usuarioId, usuarioTipo = 'CANDIDATO' } = {}) {
  return await redeRepository.listarMensagens({ usuarioId, usuarioTipo });
}

async function enviarMensagem(dados) {
  const { conteudo } = dados || {};
  if (!conteudo || !String(conteudo).trim()) {
    throw new AppError('Conteúdo da mensagem não pode ser vazio.', 400);
  }

  const novaMensagem = await redeRepository.criarMensagem({
    ...dados,
    conteudo: sanitizarTexto(conteudo),
  });

  return novaMensagem;
}

async function marcarComoLida(id) {
  await redeRepository.marcarMensagemLida(id);
  return { sucesso: true, id: Number(id), lida: true };
}

async function excluirMensagem(id) {
  await redeRepository.excluirMensagem(id);
  return { sucesso: true, id: Number(id) };
}

module.exports = {
  listarConexoes,
  alternarConexao,
  listarMensagens,
  enviarMensagem,
  marcarComoLida,
  excluirMensagem,
};

