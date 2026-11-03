/**
 * Serviço de Empresas — Equalis
 * Lógica de negócio e regras de cadastro institucional de empresas inclusivas.
 */
const empresaRepository = require('../repositories/empresaRepository');
const AppError = require('../errors/AppError');
const {
  limparDigitos,
  validarCNPJ,
  validarEmail,
  validarSenhaForte,
  hashSenha,
  gerarTokenSessao,
  sanitizarTexto,
} = require('../utils/validators');

async function cadastrar({ nome_fantasia, cnpj, email, senha, confirmarSenha, descricao }) {
  if (!nome_fantasia || String(nome_fantasia).trim().length < 2) {
    throw new AppError('Informe o nome da empresa.', 400);
  }
  if (!validarCNPJ(cnpj)) {
    throw new AppError('CNPJ inválido pelos dígitos verificadores.', 400);
  }
  if (!validarEmail(email)) {
    throw new AppError('Informe um e-mail corporativo válido.', 400);
  }
  const checkSenha = validarSenhaForte(senha);
  if (!checkSenha.valida) {
    throw new AppError(checkSenha.erro, 400);
  }
  if (confirmarSenha !== undefined && senha !== confirmarSenha) {
    throw new AppError('A confirmação de senha não confere.', 400);
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

async function atualizarPerfil(id, dados) {
  const empresa = await empresaRepository.buscarPorId(id);
  if (!empresa) {
    throw new AppError('Empresa não encontrada.', 404);
  }

  const atualizada = await empresaRepository.atualizar(id, {
    nome_fantasia: dados.nome_fantasia ? sanitizarTexto(dados.nome_fantasia) : null,
    descricao: dados.descricao ? sanitizarTexto(dados.descricao) : null,
  });

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

