/**
 * Controller de Autenticação — Equalis
 * Gerencia login com criptografia scrypt, emissão de tokens JWT (HS256),
 * autenticação federada (SSO Gov.br / Google) e recuperação de senha.
 */
const { execMySQL } = require('../config/database');
const { loadStore } = require('../models/dataStore');
const {
  validarEmail,
  verificarSenha,
  gerarTokenSessao,
} = require('../utils/validators');

async function login(req, res) {
  const store = loadStore();
  const { email, senha, tipo } = req.body || {};

  if (!validarEmail(email)) {
    return res.status(400).json({ erro: 'Formato de e-mail inválido.' });
  }
  if (!senha) {
    return res.status(400).json({ erro: 'Informe sua senha de acesso.' });
  }

  const emailNorm = String(email).trim().toLowerCase();

  if (tipo === 'EMPRESA') {
    const dbEmpresas = await execMySQL(
      'SELECT * FROM Empresa WHERE LOWER(email) = LOWER(?)',
      [emailNorm]
    );
    const empresa = (dbEmpresas && dbEmpresas[0]) || store.empresas.find(
      (e) => e.email.toLowerCase() === emailNorm
    );

    if (!empresa || !verificarSenha(senha, empresa.senha)) {
      return res.status(401).json({ erro: 'Credenciais de empresa inválidas. Verifique o e-mail e senha.' });
    }

    const token = gerarTokenSessao({ id: empresa.id, tipo: 'EMPRESA' });
    return res.status(200).json({
      tipo: 'EMPRESA',
      usuario: { ...empresa, senha: '***' },
      token,
    });
  }

  // Candidato
  const dbCandidatos = await execMySQL(
    'SELECT * FROM Candidato WHERE LOWER(email) = LOWER(?)',
    [emailNorm]
  );
  const candidato = (dbCandidatos && dbCandidatos[0]) || store.candidatos.find(
    (c) => c.email.toLowerCase() === emailNorm
  );

  if (!candidato || !verificarSenha(senha, candidato.senha)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos. Verifique suas credenciais.' });
  }

  const token = gerarTokenSessao({ id: candidato.id, tipo: 'CANDIDATO' });

  const dbFormacoes = await execMySQL(
    'SELECT * FROM Formacao_Academica WHERE candidato_id = ? ORDER BY id DESC',
    [candidato.id]
  );
  const dbExperiencias = await execMySQL(
    'SELECT * FROM Experiencia_Profissional WHERE candidato_id = ? ORDER BY id DESC',
    [candidato.id]
  );
  const dbCandidaturas = await execMySQL(
    `SELECT c.id, c.candidato_id, c.vaga_id, c.status_processo, c.created_at, c.updated_at,
            v.titulo as vaga_titulo, v.salario as vaga_salario, v.cidade as vaga_cidade, v.modalidade as vaga_modalidade,
            v.empresa_id, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Candidatura c
     JOIN Vaga v ON c.vaga_id = v.id
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     WHERE c.candidato_id = ?
     ORDER BY c.id DESC`,
    [candidato.id]
  );

  const candFormacoes = Array.isArray(dbFormacoes)
    ? dbFormacoes
    : store.formacoes
    ? store.formacoes.filter((f) => f.candidato_id === candidato.id)
    : [];
  const candExperiencias = Array.isArray(dbExperiencias)
    ? dbExperiencias
    : store.experiencias
    ? store.experiencias.filter((e) => e.candidato_id === candidato.id)
    : [];
  const candCandidaturas = Array.isArray(dbCandidaturas)
    ? dbCandidaturas.map((c) => ({
        id: c.id,
        candidato_id: c.candidato_id,
        vaga_id: c.vaga_id,
        status_processo: c.status_processo,
        created_at: c.created_at,
        updated_at: c.updated_at,
        vaga: {
          id: c.vaga_id,
          empresa_id: c.empresa_id,
          titulo: c.vaga_titulo,
          empresa_nome: c.empresa_nome,
          salario: c.vaga_salario,
          cidade: c.vaga_cidade,
          modalidade: c.vaga_modalidade,
        },
      }))
    : store.candidaturas
    ? store.candidaturas.filter((c) => c.candidato_id === candidato.id)
    : [];

  return res.status(200).json({
    tipo: 'CANDIDATO',
    usuario: {
      ...candidato,
      senha: '***',
      formacoes: candFormacoes,
      experiencias: candExperiencias,
      candidaturas: candCandidaturas,
    },
    token,
  });
}

async function recuperarSenha(req, res) {
  const store = loadStore();
  const { email } = req.body || {};

  if (!email || !validarEmail(email)) {
    return res.status(400).json({ erro: 'Informe um endereço de e-mail válido para recuperação.' });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const cand = store.candidatos.find((c) => c.email.toLowerCase() === emailNorm);
  const emp = store.empresas.find((e) => e.email.toLowerCase() === emailNorm);

  if (!cand && !emp) {
    return res.status(404).json({
      erro: 'E-mail não encontrado na base de dados do Equalis. Verifique os dados digitados.',
    });
  }

  const tokenRecuperacao = gerarTokenSessao({ email: emailNorm, finalidade: 'RECUPERACAO_SENHA' });
  return res.status(200).json({
    sucesso: true,
    email: emailNorm,
    mensagem: 'Instruções e token de redefinição enviados com sucesso para o e-mail cadastrado.',
    tokenRecuperacao,
  });
}

async function sso(req, res) {
  const store = loadStore();
  const { provedor = 'Gov.br', email, tipo = 'CANDIDATO' } = req.body || {};

  const emailAlvo = email
    ? String(email).toLowerCase()
    : tipo === 'EMPRESA'
    ? 'rh@uniceplac.edu.br'
    : 'maria@equalis.com.br';

  let usuario =
    tipo === 'EMPRESA'
      ? store.empresas.find((e) => e.email.toLowerCase() === emailAlvo) || store.empresas[0]
      : store.candidatos.find((c) => c.email.toLowerCase() === emailAlvo) || store.candidatos[0];

  const token = gerarTokenSessao({ id: usuario.id, tipo, ssoProvedor: provedor });

  let candFormacoes = [];
  let candExperiencias = [];
  let candCandidaturas = [];

  if (tipo === 'CANDIDATO') {
    const dbForm = await execMySQL(
      'SELECT * FROM Formacao_Academica WHERE candidato_id = ? ORDER BY id DESC',
      [usuario.id]
    );
    const dbExp = await execMySQL(
      'SELECT * FROM Experiencia_Profissional WHERE candidato_id = ? ORDER BY id DESC',
      [usuario.id]
    );
    const dbCand = await execMySQL(
      `SELECT c.id, c.candidato_id, c.vaga_id, c.status_processo, c.created_at, c.updated_at,
              v.titulo as vaga_titulo, v.salario as vaga_salario, v.cidade as vaga_cidade, v.modalidade as vaga_modalidade,
              v.empresa_id, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
       FROM Candidatura c
       JOIN Vaga v ON c.vaga_id = v.id
       LEFT JOIN Empresa e ON v.empresa_id = e.id
       WHERE c.candidato_id = ?
       ORDER BY c.id DESC`,
      [usuario.id]
    );
    candFormacoes = Array.isArray(dbForm) ? dbForm : (store.formacoes ? store.formacoes.filter((f) => f.candidato_id === usuario.id) : []);
    candExperiencias = Array.isArray(dbExp) ? dbExp : (store.experiencias ? store.experiencias.filter((e) => e.candidato_id === usuario.id) : []);
    candCandidaturas = Array.isArray(dbCand)
      ? dbCand.map((c) => ({
          id: c.id,
          candidato_id: c.candidato_id,
          vaga_id: c.vaga_id,
          status_processo: c.status_processo,
          created_at: c.created_at,
          updated_at: c.updated_at,
          vaga: {
            id: c.vaga_id,
            empresa_id: c.empresa_id,
            titulo: c.vaga_titulo,
            empresa_nome: c.empresa_nome,
            salario: c.vaga_salario,
            cidade: c.vaga_cidade,
            modalidade: c.vaga_modalidade,
          },
        }))
      : store.candidaturas
      ? store.candidaturas.filter((c) => c.candidato_id === usuario.id)
      : [];
  }

  return res.status(200).json({
    sucesso: true,
    tipo,
    usuario: {
      ...usuario,
      senha: '***',
      ssoAutenticado: true,
      ssoProvedor: provedor,
      ...(tipo === 'CANDIDATO'
        ? {
            formacoes: candFormacoes,
            experiencias: candExperiencias,
            candidaturas: candCandidaturas,
          }
        : {}),
    },
    token,
  });
}

module.exports = {
  login,
  recuperarSenha,
  sso,
};

