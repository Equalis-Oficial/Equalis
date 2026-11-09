/**
 * Serviço de Empresas — Equalis
 * Lógica de negócio e regras de cadastro institucional de empresas inclusivas (UC-14).
 */
const empresaRepository = require('../repositories/empresaRepository');
const AppError = require('../errors/AppError');
const {
  limparDigitos,
  validarCNPJ,
  validarEmail,
  validarSenhaForte,
  validarSite,
  validarTelefone,
  formatarTelefone,
  hashSenha,
  gerarTokenSessao,
  sanitizarTexto,
  MENSAGENS,
} = require('../utils/validators');

async function cadastrar({
  nome_fantasia,
  cnpj,
  email,
  senha,
  confirmarSenha,
  descricao,
  setor,
  localizacao,
  site,
  telefone,
}) {
  if (!nome_fantasia || String(nome_fantasia).trim().length < 2) {
    throw new AppError('Informe o nome da empresa.', 400);
  }
  if (!validarCNPJ(cnpj)) {
    throw new AppError('CNPJ inválido pelos dígitos verificadores.', 400);
  }
  if (!validarEmail(email)) {
    throw new AppError(MENSAGENS.MSG_002, 400);
  }
  const checkSenha = validarSenhaForte(senha);
  if (!checkSenha.valida) {
    throw new AppError(checkSenha.erro, 400);
  }
  if (confirmarSenha !== undefined && senha !== confirmarSenha) {
    throw new AppError('A confirmação de senha não confere.', 400);
  }

  if (site && !validarSite(site)) {
    throw new AppError(MENSAGENS.MSG_012, 400);
  }
  if (telefone && !validarTelefone(telefone)) {
    throw new AppError(MENSAGENS.MSG_013, 400);
  }

  const cnpjLimpo = limparDigitos(cnpj);
  const emailNorm = String(email).trim().toLowerCase();

  const existeEmail = await empresaRepository.buscarPorEmail(emailNorm);
  if (existeEmail) {
    throw new AppError('Já existe uma empresa cadastrada com este e-mail.', 409);
  }

  const existeCnpj = await empresaRepository.buscarPorCnpj(cnpjLimpo);
  if (existeCnpj) {
    throw new AppError('Já existe uma empresa cadastrada com este CNPJ.', 409);
  }

  const senhaHash = hashSenha(senha);
  const novaEmpresa = await empresaRepository.criar({
    nome_fantasia: sanitizarTexto(nome_fantasia),
    cnpj: cnpjLimpo,
    email: emailNorm,
    senha: senhaHash,
    descricao: sanitizarTexto(
      descricao ||
        'Empresa comprometida com a inclusão de profissionais PcD e cumprimento da Lei de Cotas nº 8.213/91.'
    ),
    setor: setor ? sanitizarTexto(setor) : null,
    localizacao: localizacao ? sanitizarTexto(localizacao) : null,
    site: site ? sanitizarTexto(site) : null,
    telefone: telefone ? formatarTelefone(telefone) : null,
  });

  return {
    usuario: { ...novaEmpresa, senha: '***' },
    token: gerarTokenSessao({ id: novaEmpresa.id, tipo: 'EMPRESA' }),
  };
}

async function obterPerfil(id) {
  const empresa = await empresaRepository.buscarPorId(id);
  if (!empresa) {
    throw new AppError('Empresa não encontrada.', 404);
  }
  return empresa;
}

async function atualizarPerfil(id, dados = {}) {
  const empresaId = Number(id);
  if (!empresaId || isNaN(empresaId)) {
    throw new AppError('Identificador de empresa inválido.', 400);
  }

  const empresa = await empresaRepository.buscarPorId(empresaId);
  if (!empresa) {
    throw new AppError('Empresa não encontrada.', 404);
  }

  const {
    nome_fantasia,
    descricao,
    setor,
    localizacao,
    site,
    telefone,
    email,
  } = dados;

  // Validação opcional de e-mail corporativo (RN-002 / MSG-002)
  if (email !== undefined && email !== null && String(email).trim() !== '') {
    if (!validarEmail(email)) {
      throw new AppError(MENSAGENS.MSG_002, 400);
    }
    const emailNorm = String(email).trim().toLowerCase();
    const emailOcupado = await empresaRepository.buscarPorEmail(emailNorm);
    if (emailOcupado && emailOcupado.id !== empresaId) {
      throw new AppError('Já existe uma empresa cadastrada com este e-mail.', 409);
    }
  }

  // RN-018: Validação de URL corporativa (MSG-012)
  if (site !== undefined && site !== null && String(site).trim() !== '') {
    if (!validarSite(site)) {
      throw new AppError(MENSAGENS.MSG_012, 400);
    }
  }

  // RN-019: Validação de Telefone de Contato com DDD (MSG-013)
  if (telefone !== undefined && telefone !== null && String(telefone).trim() !== '') {
    if (!validarTelefone(telefone)) {
      throw new AppError(MENSAGENS.MSG_013, 400);
    }
  }

  const dadosAtualizados = {
    nome_fantasia: nome_fantasia !== undefined ? sanitizarTexto(nome_fantasia) : undefined,
    descricao: descricao !== undefined ? sanitizarTexto(descricao) : undefined,
    setor: setor !== undefined ? (setor ? sanitizarTexto(setor) : null) : undefined,
    localizacao: localizacao !== undefined ? (localizacao ? sanitizarTexto(localizacao) : null) : undefined,
    site: site !== undefined ? (site ? sanitizarTexto(site) : null) : undefined,
    telefone: telefone !== undefined ? (telefone ? formatarTelefone(telefone) : null) : undefined,
  };

  const atualizada = await empresaRepository.atualizar(empresaId, dadosAtualizados);
  return atualizada;
}

async function listarTodas() {
  return await empresaRepository.listarTodas();
}

module.exports = {
  cadastrar,
  obterPerfil,
  atualizarPerfil,
  listarTodas,
};
