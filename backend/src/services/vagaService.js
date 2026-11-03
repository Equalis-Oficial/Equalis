/**
 * Serviço de Vagas — Equalis
 * Regras de negócio para criação, consulta e encerramento de vagas PcD.
 */
const vagaRepository = require('../repositories/vagaRepository');
const empresaRepository = require('../repositories/empresaRepository');
const AppError = require('../errors/AppError');
const { sanitizarTexto } = require('../utils/validators');

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

async function criar(dados) {
  const {
    empresa_id,
    titulo,
    descricao,
    requerimentos,
    categoria,
    carga_horaria,
    modalidade,
    cidade,
    estado,
    salario,
    acessibilidades_ids,
  } = dados || {};

  if (!titulo || String(titulo).trim().length < 3) {
    throw new AppError('Título da vaga é obrigatório (mínimo 3 caracteres).', 400);
  }

  let finalEmpresaId = empresa_id ? Number(empresa_id) : 1;
  const empresaExiste = await empresaRepository.buscarPorId(finalEmpresaId);
  if (!empresaExiste) {
    finalEmpresaId = 1;
  }

  const novaVaga = await vagaRepository.criar(
    {
      empresa_id: finalEmpresaId,
      titulo: sanitizarTexto(titulo),
      descricao: descricao ? sanitizarTexto(descricao) : '',
      requerimentos: requerimentos ? sanitizarTexto(requerimentos) : '',
      categoria: categoria || 'Atendimento',
      carga_horaria: carga_horaria || '6 horas',
      modalidade: modalidade || 'Presencial',
      cidade: cidade ? sanitizarTexto(cidade) : 'Brasília',
      estado: estado || 'DF',
      salario: salario ? Number(salario) : 2000.0,
    },
    Array.isArray(acessibilidades_ids) && acessibilidades_ids.length > 0 ? acessibilidades_ids : [1, 2, 3]
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
