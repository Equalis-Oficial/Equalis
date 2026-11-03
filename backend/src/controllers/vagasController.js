/**
 * Controller de Vagas — Equalis
 * Implementa consulta e publicação de oportunidades exclusivas PcD
 * (Lei de Cotas nº 8.213/91) com mapeamento de recursos de acessibilidade.
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');
const { sanitizarTexto } = require('../utils/validators');

async function listar(req, res) {
  const store = loadStore();
  const empresaId = req.query.empresa_id ? Number(req.query.empresa_id) : null;
  const whereEmpresa = empresaId ? 'AND v.empresa_id = ?' : '';
  const params = empresaId ? [empresaId] : [];

  const dbVagas = await execMySQL(
    `SELECT v.*, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Vaga v
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     WHERE v.deleted_at IS NULL ${whereEmpresa}
     ORDER BY v.id DESC`,
    params
  );

  if (Array.isArray(dbVagas)) {
    for (const v of dbVagas) {
      const defs = await execMySQL(
        `SELECT d.id, d.categoria FROM Vaga_Acessibilidade va
         JOIN Deficiencia d ON va.deficiencia_id = d.id
         WHERE va.vaga_id = ?`,
        [v.id]
      );
      v.acessibilidades_ids = defs && defs.length > 0 ? defs.map((d) => d.id) : [1, 2, 3];
      v.recursos_acessibilidade =
        defs && defs.length > 0 ? defs.map((d) => d.categoria) : ['Ambiente Adaptado PcD'];
      v.tempo_publicacao = 'Recentemente';
      v.avaliacao_empresa = '4.9';
    }
    return res.status(200).json(dbVagas);
  }

  const filtradas = empresaId
    ? (store.vagas || []).filter((v) => v.empresa_id === empresaId)
    : store.vagas || [];
  return res.status(200).json(filtradas);
}

async function obter(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  const dbRows = await execMySQL(
    `SELECT v.*, COALESCE(e.nome_fantasia, 'Empresa Inclusiva') as empresa_nome
     FROM Vaga v
     LEFT JOIN Empresa e ON v.empresa_id = e.id
     WHERE v.id = ? AND v.deleted_at IS NULL`,
    [idParam]
  );

  if (Array.isArray(dbRows) && dbRows.length > 0) {
    const v = dbRows[0];
    const defs = await execMySQL(
      `SELECT d.id, d.categoria FROM Vaga_Acessibilidade va
       JOIN Deficiencia d ON va.deficiencia_id = d.id
       WHERE va.vaga_id = ?`,
      [v.id]
    );
    v.acessibilidades_ids = defs && defs.length > 0 ? defs.map((d) => d.id) : [1, 2, 3];
    v.recursos_acessibilidade =
      defs && defs.length > 0 ? defs.map((d) => d.categoria) : ['Ambiente Adaptado PcD'];
    return res.status(200).json(v);
  }

  const local = (store.vagas || []).find((v) => v.id === idParam);
  if (local) return res.status(200).json(local);

  return res.status(404).json({ erro: 'Vaga não encontrada.' });
}

async function criar(req, res) {
  const store = loadStore();
  const body = req.body || {};

  if (!body.titulo || !body.descricao) {
    return res.status(400).json({ erro: 'Título e descrição da vaga são obrigatórios.' });
  }

  let empId = Number(body.empresa_id) || 1;
  // Garante que o empresa_id exista para respeitar a foreign key
  const checaEmp = await execMySQL('SELECT id FROM Empresa WHERE id = ?', [empId]);
  if (!checaEmp || checaEmp.length === 0) {
    empId = 1; // Fallback para empresa inicial UNICEPLAC
  }

  const dbResult = await execMySQL(
    `INSERT INTO Vaga (empresa_id, titulo, descricao, requerimentos, categoria, carga_horaria, modalidade, cidade, estado, salario, link_externo, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTA')`,
    [
      empId,
      sanitizarTexto(body.titulo),
      sanitizarTexto(body.descricao),
      sanitizarTexto(body.requerimentos || 'Ensino Médio Completo.'),
      body.categoria || 'Atendimento',
      body.carga_horaria || '6 horas',
      body.modalidade || 'Presencial',
      sanitizarTexto(body.cidade || 'Brasília'),
      (body.estado || 'DF').slice(0, 2).toUpperCase(),
      parseFloat(body.salario) || 2000.0,
      body.link_externo || '',
    ]
  );

  const vagaId = dbResult && dbResult.insertId ? dbResult.insertId : store.vagas.length + 1;
  const acessIds =
    Array.isArray(body.acessibilidades_ids) && body.acessibilidades_ids.length > 0
      ? body.acessibilidades_ids
      : [1, 2, 3];

  for (const defId of acessIds) {
    await execMySQL(
      `INSERT INTO Vaga_Acessibilidade (vaga_id, deficiencia_id) VALUES (?, ?)`,
      [vagaId, defId]
    );
  }

  const novaVaga = {
    id: vagaId,
    empresa_id: empId,
    empresa_nome: body.empresa_nome || 'Empresa Inclusiva',
    titulo: sanitizarTexto(body.titulo),
    descricao: sanitizarTexto(body.descricao),
    requerimentos: sanitizarTexto(body.requerimentos || 'Ensino Médio Completo.'),
    categoria: body.categoria || 'Atendimento',
    carga_horaria: body.carga_horaria || '6 horas',
    avaliacao_empresa: '5.0',
    tempo_publicacao: 'Agora mesmo',
    modalidade: body.modalidade || 'Presencial',
    cidade: sanitizarTexto(body.cidade || 'Brasília'),
    estado: (body.estado || 'DF').slice(0, 2).toUpperCase(),
    salario: parseFloat(body.salario) || 2000.0,
    link_externo: body.link_externo || '',
    status: 'ABERTA',
    acessibilidades_ids: acessIds,
    recursos_acessibilidade: body.recursos_acessibilidade || [
      'Ambiente Adaptado PcD',
      'Suporte de Acessibilidade',
    ],
    created_at: new Date().toISOString(),
  };

  store.vagas = store.vagas || [];
  store.vagas.unshift(novaVaga);
  saveStore(store);

  return res.status(201).json(novaVaga);
}

async function atualizar(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  await execMySQL(
    `UPDATE Vaga SET
       titulo = COALESCE(?, titulo),
       descricao = COALESCE(?, descricao),
       requerimentos = COALESCE(?, requerimentos),
       categoria = COALESCE(?, categoria),
       carga_horaria = COALESCE(?, carga_horaria),
       modalidade = COALESCE(?, modalidade),
       cidade = COALESCE(?, cidade),
       estado = COALESCE(?, estado),
       salario = COALESCE(?, salario),
       status = COALESCE(?, status)
     WHERE id = ?`,
    [
      body.titulo ? sanitizarTexto(body.titulo) : null,
      body.descricao ? sanitizarTexto(body.descricao) : null,
      body.requerimentos ? sanitizarTexto(body.requerimentos) : null,
      body.categoria || null,
      body.carga_horaria || null,
      body.modalidade || null,
      body.cidade ? sanitizarTexto(body.cidade) : null,
      body.estado ? body.estado.slice(0, 2).toUpperCase() : null,
      body.salario ? parseFloat(body.salario) : null,
      body.status || null,
      idParam,
    ]
  );

  let vaga = (store.vagas || []).find((v) => v.id === idParam);
  if (vaga) {
    Object.assign(vaga, body);
    saveStore(store);
  }

  return res.status(200).json({ sucesso: true, id: idParam, ...body });
}

async function excluir(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  await execMySQL(
    `UPDATE Vaga SET deleted_at = CURRENT_TIMESTAMP, status = 'ENCERRADA' WHERE id = ?`,
    [idParam]
  );

  store.vagas = (store.vagas || []).filter((v) => v.id !== idParam);
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: idParam, status: 'ENCERRADA' });
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  excluir,
};

