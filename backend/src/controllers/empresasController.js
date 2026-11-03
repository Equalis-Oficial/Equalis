/**
 * Controller de Empresas — Equalis
 * Cadastro institucional de empresas comprometidas com a inclusão e cotas PcD.
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');
const {
  limparDigitos,
  validarCNPJ,
  validarEmail,
  validarSenhaForte,
  hashSenha,
  gerarTokenSessao,
  sanitizarTexto,
} = require('../utils/validators');

async function cadastrar(req, res) {
  const store = loadStore();
  const body = req.body || {};
  const { nome_fantasia, cnpj, email, senha, confirmarSenha, descricao } = body;

  if (!nome_fantasia || String(nome_fantasia).trim().length < 2) {
    return res.status(400).json({ erro: 'Informe o nome da empresa.' });
  }
  if (!validarCNPJ(cnpj)) {
    return res.status(400).json({ erro: 'CNPJ inválido pelos dígitos verificadores.' });
  }
  if (!validarEmail(email)) {
    return res.status(400).json({ erro: 'Informe um e-mail corporativo válido.' });
  }
  const checkSenha = validarSenhaForte(senha);
  if (!checkSenha.valida) {
    return res.status(400).json({ erro: checkSenha.erro });
  }
  if (confirmarSenha !== undefined && senha !== confirmarSenha) {
    return res.status(400).json({ erro: 'A confirmação de senha não confere.' });
  }

  const senhaHash = hashSenha(senha);
  const cnpjLimpo = limparDigitos(cnpj);
  const emailNorm = String(email).trim().toLowerCase();

  const dbResult = await execMySQL(
    `INSERT INTO Empresa (nome_fantasia, cnpj, email, senha, descricao) VALUES (?, ?, ?, ?, ?)`,
    [
      sanitizarTexto(nome_fantasia),
      cnpjLimpo,
      emailNorm,
      senhaHash,
      sanitizarTexto(
        descricao ||
          'Empresa comprometida com a inclusão de profissionais PcD e cumprimento da Lei de Cotas nº 8.213/91.'
      ),
    ]
  );

  const novoId = dbResult && dbResult.insertId ? dbResult.insertId : store.empresas.length + 1;
  const novaEmpresa = {
    id: novoId,
    nome_fantasia: sanitizarTexto(nome_fantasia),
    cnpj: cnpjLimpo,
    email: emailNorm,
    senha: senhaHash,
    descricao: sanitizarTexto(
      descricao ||
        'Empresa comprometida com a inclusão de profissionais PcD e cumprimento da Lei de Cotas nº 8.213/91.'
    ),
    created_at: new Date().toISOString(),
  };

  store.empresas.push(novaEmpresa);
  saveStore(store);

  return res.status(201).json({
    usuario: { ...novaEmpresa, senha: '***' },
    token: gerarTokenSessao({ id: novaEmpresa.id, tipo: 'EMPRESA' }),
  });
}

async function obterPerfil(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  const dbRows = await execMySQL(
    `SELECT id, nome_fantasia, cnpj, email, descricao, created_at FROM Empresa WHERE id = ?`,
    [idParam]
  );

  if (Array.isArray(dbRows) && dbRows.length > 0) {
    return res.status(200).json(dbRows[0]);
  }

  const emp = (store.empresas || []).find((e) => e.id === idParam);
  if (emp) return res.status(200).json({ ...emp, senha: '***' });

  return res.status(404).json({ erro: 'Empresa não encontrada.' });
}

async function atualizarPerfil(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  await execMySQL(
    `UPDATE Empresa SET
       nome_fantasia = COALESCE(?, nome_fantasia),
       descricao = COALESCE(?, descricao)
     WHERE id = ?`,
    [
      body.nome_fantasia ? sanitizarTexto(body.nome_fantasia) : null,
      body.descricao ? sanitizarTexto(body.descricao) : null,
      idParam,
    ]
  );

  let emp = (store.empresas || []).find((e) => e.id === idParam);
  if (emp) {
    if (body.nome_fantasia) emp.nome_fantasia = sanitizarTexto(body.nome_fantasia);
    if (body.descricao) emp.descricao = sanitizarTexto(body.descricao);
    saveStore(store);
  }

  return res.status(200).json({
    sucesso: true,
    empresa: emp || { id: idParam, ...body },
  });
}

module.exports = {
  cadastrar,
  obterPerfil,
  atualizarPerfil,
};

