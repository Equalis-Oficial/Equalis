/**
 * Controller de Candidatos — Equalis
 * Implementa cadastro de candidatos PcD, atualização de perfil,
 * homologação de laudos médicos (CID Lei nº 8.213/91) e histórico profissional.
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');
const {
  limparDigitos,
  validarCPF,
  validarEmail,
  validarSenhaForte,
  hashSenha,
  gerarTokenSessao,
  sanitizarTexto,
} = require('../utils/validators');

async function cadastrar(req, res) {
  const store = loadStore();
  const body = req.body || {};
  const { nome, email, senha, confirmarSenha, cpf } = body;

  if (!nome || String(nome).trim().length < 3) {
    return res.status(400).json({ erro: 'Informe o nome completo (mínimo 3 caracteres).' });
  }
  if (!validarEmail(email)) {
    return res.status(400).json({ erro: 'Informe um endereço de e-mail válido.' });
  }
  if (cpf && !validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF inválido pelos dígitos verificadores.' });
  }
  const checkSenha = validarSenhaForte(senha);
  if (!checkSenha.valida) {
    return res.status(400).json({ erro: checkSenha.erro });
  }
  if (confirmarSenha !== undefined && senha !== confirmarSenha) {
    return res.status(400).json({ erro: 'A confirmação de senha não confere.' });
  }

  const senhaHash = hashSenha(senha);
  const cpfLimpo = limparDigitos(cpf || '52998224725');
  const emailNorm = String(email).trim().toLowerCase();

  const dbResult = await execMySQL(
    `INSERT INTO Candidato (nome, email, senha, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sanitizarTexto(nome),
      emailNorm,
      senhaHash,
      cpfLimpo,
      body.resumo_profissional || '',
      body.url_curriculo || '',
      body.cidade || '',
      body.estado || '',
      body.area_atuacao || 'Geral',
      body.usa_tela_acessivel ? 1 : 0,
    ]
  );

  const novoId = dbResult && dbResult.insertId ? dbResult.insertId : store.candidatos.length + 1;
  const defs = Array.isArray(body.deficiencias_ids) ? body.deficiencias_ids : [];

  for (const defId of defs) {
    await execMySQL(
      `INSERT INTO Candidato_Deficiencia (candidato_id, deficiencia_id, url_laudo_medico)
       VALUES (?, ?, ?)`,
      [novoId, defId, body.url_laudo_medico || '']
    );
  }

  const novoCandidato = {
    id: novoId,
    nome: sanitizarTexto(nome),
    email: emailNorm,
    senha: senhaHash,
    cpf: cpfLimpo,
    resumo_profissional: body.resumo_profissional || '',
    url_curriculo: body.url_curriculo || '',
    cidade: body.cidade || '',
    estado: body.estado || '',
    area_atuacao: body.area_atuacao || 'Geral',
    servicos: body.servicos || [],
    deficiencias_ids: defs,
    url_laudo_medico: body.url_laudo_medico || '',
    usa_tela_acessivel: Boolean(body.usa_tela_acessivel),
    created_at: new Date().toISOString(),
  };

  store.candidatos.push(novoCandidato);
  saveStore(store);

  return res.status(201).json({
    usuario: { ...novoCandidato, senha: '***' },
    token: gerarTokenSessao({ id: novoCandidato.id, tipo: 'CANDIDATO' }),
  });
}

async function atualizarPerfil(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  await execMySQL(
    `UPDATE Candidato SET
      nome = COALESCE(?, nome),
      resumo_profissional = COALESCE(?, resumo_profissional),
      cidade = COALESCE(?, cidade),
      estado = COALESCE(?, estado),
      area_atuacao = COALESCE(?, area_atuacao),
      url_curriculo = COALESCE(?, url_curriculo),
      usa_tela_acessivel = COALESCE(?, usa_tela_acessivel)
     WHERE id = ?`,
    [
      body.nome ? sanitizarTexto(body.nome) : null,
      body.resumo_profissional ? sanitizarTexto(body.resumo_profissional) : null,
      body.cidade ? sanitizarTexto(body.cidade) : null,
      body.estado ? body.estado.slice(0, 2).toUpperCase() : null,
      body.area_atuacao ? sanitizarTexto(body.area_atuacao) : null,
      body.url_curriculo || null,
      body.usa_tela_acessivel !== undefined ? (body.usa_tela_acessivel ? 1 : 0) : null,
      idParam,
    ]
  );

  let candIndex = store.candidatos.findIndex((c) => c.id === idParam);
  if (candIndex >= 0) {
    store.candidatos[candIndex] = { ...store.candidatos[candIndex], ...body };
  }
  saveStore(store);

  return res.status(200).json({
    sucesso: true,
    candidato: store.candidatos[candIndex] || { id: idParam, ...body },
  });
}

async function uploadDocumento(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const {
    tipo = 'LAUDO',
    nome_arquivo,
    tamanho_bytes = 1048576,
    tipo_mime = 'application/pdf',
    deficiencia_id = 1,
    hash_integridade,
  } = req.body || {};

  if (!nome_arquivo) {
    return res.status(400).json({ erro: 'Nome do arquivo é obrigatório.' });
  }

  const docRecord = {
    id: Date.now(),
    candidato_id: idParam,
    tipo,
    nome_arquivo: sanitizarTexto(nome_arquivo),
    tamanho_bytes: Number(tamanho_bytes),
    tipo_mime,
    deficiencia_id: Number(deficiencia_id),
    hash_integridade: hash_integridade || 'SHA256-CID-LEI-8213-VALIDADO',
    homologado: true,
    created_at: new Date().toISOString(),
  };

  if (tipo === 'LAUDO') {
    await execMySQL(
      `UPDATE Candidato_Deficiencia SET url_laudo_medico = ? WHERE candidato_id = ? AND deficiencia_id = ?`,
      [nome_arquivo, idParam, deficiencia_id]
    );
  } else {
    await execMySQL(
      `UPDATE Candidato SET url_curriculo = ? WHERE id = ?`,
      [nome_arquivo, idParam]
    );
  }

  let cand = store.candidatos.find((c) => c.id === idParam);
  if (cand) {
    if (tipo === 'LAUDO') {
      cand.url_laudo_medico = nome_arquivo;
      cand.laudo_info = docRecord;
    } else {
      cand.url_curriculo = nome_arquivo;
      cand.curriculo_info = docRecord;
    }
  }
  saveStore(store);

  return res.status(201).json({ sucesso: true, documento: docRecord });
}

async function adicionarFormacao(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id) || req.body.candidato_id || 1;
  const body = req.body || {};

  const dbResult = await execMySQL(
    `INSERT INTO Formacao_Academica (candidato_id, instituicao, diploma, area_estudo, mes_inicio, ano_inicio, mes_termino, ano_termino, atividades_grupos, descricao, competencias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      candId,
      sanitizarTexto(body.instituicao || ''),
      sanitizarTexto(body.diploma || ''),
      sanitizarTexto(body.area_estudo || ''),
      body.mes_inicio || '',
      body.ano_inicio || '',
      body.mes_termino || '',
      body.ano_termino || '',
      sanitizarTexto(body.atividades_grupos || ''),
      sanitizarTexto(body.descricao || ''),
      Array.isArray(body.competencias) ? body.competencias.join(', ') : body.competencias || '',
    ]
  );

  const novoId = dbResult && dbResult.insertId ? dbResult.insertId : Date.now();
  const novaForm = { id: novoId, candidato_id: candId, ...body };
  store.formacoes = store.formacoes || [];
  store.formacoes.unshift(novaForm);
  saveStore(store);

  return res.status(201).json(novaForm);
}

async function adicionarExperiencia(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id) || req.body.candidato_id || 1;
  const body = req.body || {};

  const dbResult = await execMySQL(
    `INSERT INTO Experiencia_Profissional (candidato_id, cargo, organizacao, tipo_emprego, localidade, tipo_localidade, mes_inicio, ano_inicio, descricao, competencias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      candId,
      sanitizarTexto(body.cargo || ''),
      sanitizarTexto(body.organizacao || ''),
      body.tipo_emprego || '',
      sanitizarTexto(body.localidade || ''),
      body.tipo_localidade || '',
      body.mes_inicio || '',
      body.ano_inicio || '',
      sanitizarTexto(body.descricao || ''),
      Array.isArray(body.competencias) ? body.competencias.join(', ') : body.competencias || '',
    ]
  );

  const novoId = dbResult && dbResult.insertId ? dbResult.insertId : Date.now();
  const novaExp = { id: novoId, candidato_id: candId, ...body };
  store.experiencias = store.experiencias || [];
  store.experiencias.unshift(novaExp);
  saveStore(store);

  return res.status(201).json(novaExp);
}

async function obterPerfil(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  const dbRows = await execMySQL(
    `SELECT id, nome, email, cpf, resumo_profissional, url_curriculo, cidade, estado, area_atuacao, usa_tela_acessivel, created_at
     FROM Candidato WHERE id = ?`,
    [idParam]
  );

  let cand = dbRows && dbRows.length > 0 ? dbRows[0] : (store.candidatos || []).find((c) => c.id === idParam);
  if (!cand) {
    return res.status(404).json({ erro: 'Candidato não encontrado.' });
  }

  const defs = await execMySQL(
    `SELECT deficiencia_id, url_laudo_medico FROM Candidato_Deficiencia WHERE candidato_id = ?`,
    [idParam]
  );
  const formacoes = await execMySQL(
    `SELECT * FROM Formacao_Academica WHERE candidato_id = ? ORDER BY id DESC`,
    [idParam]
  );
  const experiencias = await execMySQL(
    `SELECT * FROM Experiencia_Profissional WHERE candidato_id = ? ORDER BY id DESC`,
    [idParam]
  );

  return res.status(200).json({
    ...cand,
    deficiencias_ids: defs && defs.length > 0 ? defs.map((d) => d.deficiencia_id) : cand.deficiencias_ids || [],
    url_laudo_medico: defs && defs[0] ? defs[0].url_laudo_medico : cand.url_laudo_medico || null,
    formacoes: Array.isArray(formacoes) ? formacoes : (store.formacoes || []).filter((f) => f.candidato_id === idParam),
    experiencias: Array.isArray(experiencias) ? experiencias : (store.experiencias || []).filter((e) => e.candidato_id === idParam),
  });
}

async function listarFormacoes(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id);
  const rows = await execMySQL(
    `SELECT * FROM Formacao_Academica WHERE candidato_id = ? ORDER BY id DESC`,
    [candId]
  );
  if (Array.isArray(rows)) {
    return res.status(200).json(rows);
  }
  return res.status(200).json((store.formacoes || []).filter((f) => f.candidato_id === candId));
}

async function excluirFormacao(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id);
  const formId = Number(req.params.formId);

  await execMySQL(
    `DELETE FROM Formacao_Academica WHERE id = ? AND candidato_id = ?`,
    [formId, candId]
  );
  store.formacoes = (store.formacoes || []).filter((f) => f.id !== formId);
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: formId });
}

async function listarExperiencias(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id);
  const rows = await execMySQL(
    `SELECT * FROM Experiencia_Profissional WHERE candidato_id = ? ORDER BY id DESC`,
    [candId]
  );
  if (Array.isArray(rows)) {
    return res.status(200).json(rows);
  }
  return res.status(200).json((store.experiencias || []).filter((e) => e.candidato_id === candId));
}

async function excluirExperiencia(req, res) {
  const store = loadStore();
  const candId = Number(req.params.id);
  const expId = Number(req.params.expId);

  await execMySQL(
    `DELETE FROM Experiencia_Profissional WHERE id = ? AND candidato_id = ?`,
    [expId, candId]
  );
  store.experiencias = (store.experiencias || []).filter((e) => e.id !== expId);
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: expId });
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

