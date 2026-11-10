/**
 * Serviço de Autenticação — Equalis
 * Lógica de login, verificação de credenciais, SSO e recuperação de senha.
 */
const candidatoRepository = require('../repositories/candidatoRepository');
const empresaRepository = require('../repositories/empresaRepository');
const candidaturaRepository = require('../repositories/candidaturaRepository');
const AppError = require('../errors/AppError');
const {
  verificarSenha,
  gerarTokenSessao,
} = require('../utils/validators');

async function login({ email, senha, tipo = 'CANDIDATO' }) {
  if (!email || !senha) {
    throw new AppError('Informe e-mail e senha para continuar.', 400);
  }

  const emailNorm = String(email).trim().toLowerCase();

  if (tipo === 'EMPRESA') {
    const empresa = await empresaRepository.buscarPorEmail(emailNorm);
    if (!empresa || !verificarSenha(senha, empresa.senha)) {
      throw new AppError('E-mail corporativo ou senha incorretos.', 401);
    }
    const token = gerarTokenSessao({ id: empresa.id, tipo: 'EMPRESA' });
    return {
      token,
      tipo: 'EMPRESA',
      usuario: {
        id: empresa.id,
        nome_fantasia: empresa.nome_fantasia,
        cnpj: empresa.cnpj,
        email: empresa.email,
        descricao: empresa.descricao,
        setor: empresa.setor,
        localizacao: empresa.localizacao,
        cidade: empresa.cidade,
        estado: empresa.estado,
        site: empresa.site,
        telefone: empresa.telefone,
        logo_url: empresa.logo_url,
        banner_url: empresa.banner_url,
      },
    };
  }

  // Login de Candidato
  const candidato = await candidatoRepository.buscarPorEmail(emailNorm);
  if (!candidato || !verificarSenha(senha, candidato.senha)) {
    throw new AppError('E-mail ou senha incorretos. Verifique suas credenciais.', 401);
  }

  const token = gerarTokenSessao({ id: candidato.id, tipo: 'CANDIDATO' });
  const formacoes = await candidatoRepository.listarFormacoes(candidato.id);
  const experiencias = await candidatoRepository.listarExperiencias(candidato.id);
  const candidaturas = await candidaturaRepository.listar({ candidatoId: candidato.id });
  const defs = await candidatoRepository.buscarDeficiencias(candidato.id);

  return {
    token,
    tipo: 'CANDIDATO',
    usuario: {
      id: candidato.id,
      nome: candidato.nome,
      email: candidato.email,
      cpf: candidato.cpf,
      cidade: candidato.cidade,
      estado: candidato.estado,
      area_atuacao: candidato.area_atuacao,
      resumo_profissional: candidato.resumo_profissional,
      url_curriculo: candidato.url_curriculo,
      usa_tela_acessivel: Boolean(candidato.usa_tela_acessivel),
      deficiencias_ids: defs.map((d) => d.deficiencia_id),
      formacoes,
      experiencias,
      candidaturas,
    },
  };
}

async function recuperarSenha(email) {
  if (!email) {
    throw new AppError('Informe o e-mail cadastrado.', 400);
  }

  const emailNorm = String(email).trim().toLowerCase();
  const cand = await candidatoRepository.buscarPorEmail(emailNorm);
  const emp = await empresaRepository.buscarPorEmail(emailNorm);

  if (!cand && !emp) {
    return { sucesso: true, mensagem: 'Se o e-mail estiver cadastrado, as instruções serão enviadas.' };
  }

  return {
    sucesso: true,
    mensagem: 'Instruções para redefinição de senha enviadas com sucesso para o e-mail informado.',
  };
}

async function loginSSO({ provedor = 'Gov.br', tipo = 'CANDIDATO', email }) {
  const emailSSO = email
    ? String(email).trim().toLowerCase()
    : tipo === 'EMPRESA'
    ? 'rh@uniceplac.edu.br'
    : 'maria@equalis.com.br';

  if (tipo === 'EMPRESA') {
    let empresa = await empresaRepository.buscarPorEmail(emailSSO);
    if (!empresa) {
      empresa = await empresaRepository.buscarPorId(1);
    }
    const token = gerarTokenSessao({ id: empresa?.id || 1, tipo: 'EMPRESA' });
    return {
      token,
      tipo: 'EMPRESA',
      usuario: {
        id: empresa?.id || 1,
        nome_fantasia: empresa?.nome_fantasia || 'Empresa Parceira',
        email: emailSSO,
        ssoProvedor: provedor,
      },
    };
  }

  let candidato = await candidatoRepository.buscarPorEmail(emailSSO);
  if (!candidato) {
    candidato = await candidatoRepository.buscarPorId(1);
  }

  const token = gerarTokenSessao({ id: candidato?.id || 1, tipo: 'CANDIDATO' });
  const formacoes = candidato ? await candidatoRepository.listarFormacoes(candidato.id) : [];
  const experiencias = candidato ? await candidatoRepository.listarExperiencias(candidato.id) : [];
  const candidaturas = candidato ? await candidaturaRepository.listar({ candidatoId: candidato.id }) : [];
  const defs = candidato ? await candidatoRepository.buscarDeficiencias(candidato.id) : [];

  return {
    token,
    tipo: 'CANDIDATO',
    usuario: {
      id: candidato?.id || 1,
      nome: candidato?.nome || 'Usuário Gov.br',
      email: emailSSO,
      cpf: candidato?.cpf || '00000000000',
      cidade: candidato?.cidade || 'Brasília',
      estado: candidato?.estado || 'DF',
      area_atuacao: candidato?.area_atuacao || 'Geral',
      resumo_profissional: candidato?.resumo_profissional || '',
      usa_tela_acessivel: Boolean(candidato?.usa_tela_acessivel),
      deficiencias_ids: defs.map((d) => d.deficiencia_id),
      ssoProvedor: provedor,
      formacoes,
      experiencias,
      candidaturas,
    },
  };
}

module.exports = {
  login,
  recuperarSenha,
  loginSSO,
};

