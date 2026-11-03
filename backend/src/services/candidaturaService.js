/**
 * Serviço de Candidaturas — Equalis
 * Regras de inscrição de profissionais PcD e controle de fluxo seletivo.
 */
const candidaturaRepository = require('../repositories/candidaturaRepository');
const vagaRepository = require('../repositories/vagaRepository');
const AppError = require('../errors/AppError');

async function listar({ candidatoId, empresaId } = {}) {
  return await candidaturaRepository.listar({ candidatoId, empresaId });
}

async function aplicar({ candidato_id = 1, vaga_id }) {
  if (!vaga_id) {
    throw new AppError('Identificador da vaga é obrigatório.', 400);
  }

  const vaga = await vagaRepository.buscarPorId(vaga_id);
  if (!vaga) {
    throw new AppError('Vaga não encontrada.', 404);
  }

  const jaExiste = await candidaturaRepository.buscarPorCandidatoEVaga(candidato_id, vaga_id);
  if (jaExiste) {
    throw new AppError('Você já possui uma candidatura ativa para esta vaga.', 409);
  }

  return await candidaturaRepository.criar(candidato_id, vaga_id);
}

async function atualizarStatus(id, dados) {
  const { status_processo = 'CANCELADA', vaga_id } = dados || {};
  return await candidaturaRepository.atualizarStatus(id, { status_processo, vaga_id });
}

async function excluir(id, candidatoId = null) {
  await candidaturaRepository.excluir(id, candidatoId);
  return { sucesso: true, id: Number(id) };
}

module.exports = {
  listar,
  aplicar,
  atualizarStatus,
  excluir,
};

