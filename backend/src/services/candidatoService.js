/**
 * Serviço de Candidatos — Equalis
 * Lógica de negócio para cadastro PcD, laudos CID, histórico acadêmico e profissional.
 */
const candidatoRepository = require('../repositories/candidatoRepository');
const AppError = require('../errors/AppError');
const {
  limparDigitos,
  validarCPF,
  validarEmail,
  validarSenhaForte,
  hashSenha,
  gerarTokenSessao,
  sanitizarTexto,
} = require('../utils/validators');

async function cadastrar({
  nome,
  email,
  senha,
  confirmarSenha,
  cpf,
  deficiencias_ids = [],
  usa_tela_acessivel = 0,
  resumo_profissional,
  cidade,
  estado,
  area_atuacao,
}) {
  if (!nome || String(nome).trim().length < 3) {
    throw new AppError('Informe o nome completo do candidato.', 400);
  }
  if (!validarCPF(cpf)) {
    throw new AppError('CPF inválido pelos dígitos verificadores.', 400);
  }
  if (!validarEmail(email)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }
  const checkSenha = validarSenhaForte(senha);
  if (!checkSenha.valida) {
    throw new AppError(checkSenha.erro, 400);
  }
  if (confirmarSenha !== undefined && senha !== confirmarSenha) {
    throw new AppError('A confirmação de senha não confere.', 400);
  }

  const cpfLimpo = limparDigitos(cpf);
  const emailNorm = String(email).trim().toLowerCase();

  const existeEmail = await candidatoRepository.buscarPorEmail(emailNorm);
  if (existeEmail) {
    throw new AppError('Já existe um candidato cadastrado com este e-mail.', 409);
  }

  const existeCpf = await candidatoRepository.buscarPorCpf(cpfLimpo);
  if (existeCpf) {
    throw new AppError('Já existe um candidato cadastrado com este CPF.', 409);
  }

  const senhaHash = hashSenha(senha);
  const novoCandidato = await candidatoRepository.criar({
    nome: sanitizarTexto(nome),
    email: emailNorm,
    senha: senhaHash,
    cpf: cpfLimpo,
    resumo_profissional: resumo_profissional ? sanitizarTexto(resumo_profissional) : null,
    cidade: cidade ? sanitizarTexto(cidade) : 'Guarulhos',
    estado: estado || 'SP',
    area_atuacao: area_atuacao ? sanitizarTexto(area_atuacao) : 'Geral',
    usa_tela_acessivel: Boolean(usa_tela_acessivel),
  });

  if (Array.isArray(deficiencias_ids) && deficiencias_ids.length > 0) {
    await candidatoRepository.vincularDeficiencias(novoCandidato.id, deficiencias_ids);
  }

  return {
    usuario: {
      ...novoCandidato,
      senha: '***',
      deficiencias_ids,
    },
    token: gerarTokenSessao({ id: novoCandidato.id, tipo: 'CANDIDATO' }),
  };
}

async function obterPerfil(id) {
  const candidato = await candidatoRepository.buscarPorId(id);
  if (!candidato) {
    throw new AppError('Candidato não encontrado.', 404);
  }

  const defs = await candidatoRepository.buscarDeficiencias(id);
  const formacoes = await candidatoRepository.listarFormacoes(id);
  const experiencias = await candidatoRepository.listarExperiencias(id);

  return {
    ...candidato,
    deficiencias_ids: defs.map((d) => d.deficiencia_id),
    url_laudo_medico: defs[0] ? defs[0].url_laudo_medico : null,
    formacoes,
    experiencias,
  };
}

async function atualizarPerfil(id, dados) {
  const candidato = await candidatoRepository.buscarPorId(id);
  if (!candidato) {
    throw new AppError('Candidato não encontrado.', 404);
  }

  const atualizado = await candidatoRepository.atualizar(id, {
    nome: dados.nome ? sanitizarTexto(dados.nome) : undefined,
    resumo_profissional: dados.resumo_profissional ? sanitizarTexto(dados.resumo_profissional) : undefined,
    cidade: dados.cidade ? sanitizarTexto(dados.cidade) : undefined,
    estado: dados.estado ? sanitizarTexto(dados.estado) : undefined,
    area_atuacao: dados.area_atuacao ? sanitizarTexto(dados.area_atuacao) : undefined,
    usa_tela_acessivel: dados.usa_tela_acessivel,
  });

  return atualizado;
}

async function uploadDocumento(candidatoId, dados) {
  const { tipo, nome_arquivo, deficiencia_id } = dados || {};
  if (!nome_arquivo) {
    throw new AppError('Arquivo não especificado.', 400);
  }

  const documento = {
    id: Date.now(),
    candidato_id: Number(candidatoId),
    tipo: tipo || 'LAUDO',
    nome_arquivo: sanitizarTexto(nome_arquivo),
    deficiencia_id: deficiencia_id ? Number(deficiencia_id) : 1,
    homologado: true,
    data_envio: new Date().toISOString(),
  };

  if (documento.tipo === 'LAUDO') {
    await candidatoRepository.vincularDeficiencias(
      candidatoId,
      [documento.deficiencia_id],
      `https://equalis.app/laudos/${documento.nome_arquivo}`
    );
  }

  return documento;
}

// Formações
async function listarFormacoes(candidatoId) {
  return await candidatoRepository.listarFormacoes(candidatoId);
}

async function adicionarFormacao(candidatoId, dados) {
  if (!dados.instituicao) {
    throw new AppError('Nome da instituição é obrigatório.', 400);
  }
  return await candidatoRepository.criarFormacao(candidatoId, dados);
}

async function excluirFormacao(formId, candidatoId) {
  return await candidatoRepository.excluirFormacao(formId, candidatoId);
}

// Experiências
async function listarExperiencias(candidatoId) {
  return await candidatoRepository.listarExperiencias(candidatoId);
}

async function adicionarExperiencia(candidatoId, dados) {
  if (!dados.cargo || !dados.organizacao) {
    throw new AppError('Cargo e organização são obrigatórios.', 400);
  }
  return await candidatoRepository.criarExperiencia(candidatoId, dados);
}

async function excluirExperiencia(expId, candidatoId) {
  return await candidatoRepository.excluirExperiencia(expId, candidatoId);
}

module.exports = {
  cadastrar,
  obterPerfil,
  atualizarPerfil,
  uploadDocumento,
  listarFormacoes,
  adicionarFormacao,
  excluirFormacao,
  listarExperiencias,
  adicionarExperiencia,
  excluirExperiencia,
};
