/**
 * Serviço de Vagas — Equalis
 * Regras de negócio para criação, consulta e encerramento de vagas PcD.
 * Atende a RN-026, RN-027, UC-21 e MSG-020 (Acessibilidade Obrigatória).
 */
const vagaRepository = require('../repositories/vagaRepository');
const empresaRepository = require('../repositories/empresaRepository');
const AppError = require('../errors/AppError');
const { sanitizarTexto, MENSAGENS } = require('../utils/validators');

async function listar({ empresaId } = {}) {
  return await vagaRepository.listar({ empresaId });
}

async function obter(id) {
  const vaga = await vagaRepository.buscarPorId(id);
  if (!vaga) {
    throw new AppError('Vaga não encontrada.', 404);
  }
  return vaga;
}

/**
 * Cria uma nova vaga afirmativa PcD com verificação rigorosa de acessibilidade
 * Atende a RN-026, RN-027, UC-21 e MSG-020.
 */
async function criar(dados) {
  const {
    empresa_id,
    titulo,
    cargo,
    descricao,
    requerimentos,
    categoria,
    carga_horaria,
    modalidade,
    cidade,
    localEmpresa,
    estado,
    salario,
    acessibilidades_ids,
  } = dados || {};

  const cargoFinal = cargo || titulo;
  const localFinal = localEmpresa || cidade;

  // 1. RN-026: Verificação de campos obrigatórios
  if (!cargoFinal || String(cargoFinal).trim().length < 2) {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }
  if (!requerimentos || String(requerimentos).trim().length === 0) {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }
  if (!localFinal || String(localFinal).trim().length === 0) {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }
  if (salario === undefined || salario === null || String(salario).trim() === '') {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }

  // 2. RN-026 e RN-027: Acessibilidade é estritamente obrigatória (mínimo 1 recurso).
  // O fallback permissivo [1, 2, 3] foi formalmente eliminado.
  if (
    !acessibilidades_ids ||
    !Array.isArray(acessibilidades_ids) ||
    acessibilidades_ids.length === 0
  ) {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }

  // Validação estrita de tipo perante coerções e arrays aninhados (Milestone 1 — Iteração 2):
  // Rejeita arrays aninhados (ex: [[1]]) ou qualquer elemento que não seja estritamente number inteiro positivo.
  const todosValidos = acessibilidades_ids.every(
    (id) => typeof id === 'number' && Number.isInteger(id) && id > 0
  );

  if (!todosValidos) {
    throw new AppError(MENSAGENS.MSG_020, 400);
  }

  const idsLimpos = [...new Set(acessibilidades_ids)];

  let finalEmpresaId = empresa_id ? Number(empresa_id) : 1;
  const empresaExiste = await empresaRepository.buscarPorId(finalEmpresaId);
  if (!empresaExiste) {
    finalEmpresaId = 1;
  }

  // Conversão segura de salário monetário (ex: "R$ 4.500,00" ou 4500)
  let salarioNumerico = 2000.0;
  if (typeof salario === 'number') {
    salarioNumerico = salario;
  } else if (typeof salario === 'string') {
    const limpo = salario.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(limpo);
    salarioNumerico = isNaN(parsed) ? 2000.0 : parsed;
  }

  const novaVaga = await vagaRepository.criar(
    {
      empresa_id: finalEmpresaId,
      titulo: sanitizarTexto(cargoFinal),
      descricao: descricao ? sanitizarTexto(descricao) : '',
      requerimentos: sanitizarTexto(requerimentos),
      categoria: categoria || 'Atendimento',
      carga_horaria: carga_horaria || '6 horas',
      modalidade: modalidade || 'Presencial',
      cidade: sanitizarTexto(localFinal),
      estado: estado || 'DF',
      salario: salarioNumerico,
    },
    idsLimpos
  );

  return novaVaga;
}

async function atualizar(id, dados) {
  const vagaExiste = await vagaRepository.buscarPorId(id);
  if (!vagaExiste) {
    throw new AppError('Vaga não encontrada para atualização.', 404);
  }

  const atualizada = await vagaRepository.atualizar(id, {
    titulo: dados.titulo ? sanitizarTexto(dados.titulo) : undefined,
    descricao: dados.descricao ? sanitizarTexto(dados.descricao) : undefined,
    requerimentos: dados.requerimentos ? sanitizarTexto(dados.requerimentos) : undefined,
    salario: dados.salario ? Number(dados.salario) : undefined,
    modalidade: dados.modalidade ? sanitizarTexto(dados.modalidade) : undefined,
    cidade: dados.cidade ? sanitizarTexto(dados.cidade) : undefined,
    estado: dados.estado,
    categoria: dados.categoria,
    carga_horaria: dados.carga_horaria,
  });

  return atualizada;
}

async function excluir(id) {
  const vagaExiste = await vagaRepository.buscarPorId(id);
  if (!vagaExiste) {
    throw new AppError('Vaga não encontrada para encerramento.', 404);
  }

  await vagaRepository.excluir(id);
  return { sucesso: true, id: Number(id) };
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  excluir,
};
