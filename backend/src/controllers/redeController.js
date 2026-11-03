/**
 * Controller de Rede e Mensagens — Equalis
 * Gerencia conexões entre profissionais PcD e recrutadores,
 * além de mensagens instantâneas da plataforma.
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');
const { sanitizarTexto } = require('../utils/validators');

async function alternarConexao(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  let conexao = (store.conexoes || []).find((c) => c.id === idParam);
  let dbRows = await execMySQL('SELECT * FROM Conexao WHERE id = ?', [idParam]);
  let row = dbRows && dbRows[0];

  const statusAtual = row ? row.status : (conexao?.status || 'SUGERIDO');
  const novoStatus = statusAtual === 'CONECTADO' ? 'SUGERIDO' : 'CONECTADO';
  const total = row ? row.total_conexoes : (conexao?.total_conexoes || 300);
  const novoTotal = novoStatus === 'CONECTADO' ? total + 1 : Math.max(0, total - 1);

  await execMySQL(`UPDATE Conexao SET status = ?, total_conexoes = ? WHERE id = ?`, [novoStatus, novoTotal, idParam]);
  if (conexao) {
    conexao.conectado = novoStatus === 'CONECTADO';
    conexao.status = novoStatus;
    conexao.total_conexoes = novoTotal;
    saveStore(store);
  }

  return res.status(200).json({
    sucesso: true,
    conectado: novoStatus === 'CONECTADO',
    status: novoStatus,
    total_conexoes: novoTotal,
  });
}

async function listarConexoes(req, res) {
  const store = loadStore();
  const rows = await execMySQL(
    `SELECT * FROM Conexao ORDER BY id ASC`
  );
  if (Array.isArray(rows) && rows.length > 0) {
    return res.status(200).json(rows.map((r) => ({ ...r, conectado: r.status === 'CONECTADO' })));
  }
  return res.status(200).json(store.conexoes || []);
}

async function listarMensagens(req, res) {
  const store = loadStore();
  const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : null;
  const usuarioTipo = req.query.usuario_tipo || 'CANDIDATO';

  if (usuarioId) {
    const rows = await execMySQL(
      `SELECT * FROM Mensagem
       WHERE (destinatario_id = ? AND destinatario_tipo = ?)
          OR (remetente_id = ? AND remetente_tipo = ?)
       ORDER BY id DESC`,
      [usuarioId, usuarioTipo, usuarioId, usuarioTipo]
    );
    if (Array.isArray(rows)) {
      return res.status(200).json(rows);
    }
    const filtradas = (store.mensagens || []).filter(
      (m) =>
        (m.destinatario_id === usuarioId && (m.destinatario_tipo || 'CANDIDATO') === usuarioTipo) ||
        (m.remetente_id === usuarioId && (m.remetente_tipo || 'CANDIDATO') === usuarioTipo)
    );
    return res.status(200).json(filtradas);
  }

  const rows = await execMySQL('SELECT * FROM Mensagem ORDER BY id DESC');
  return res.status(200).json(Array.isArray(rows) ? rows : store.mensagens || []);
}

async function enviarMensagem(req, res) {
  const store = loadStore();
  const body = req.body || {};

  if (!body.conteudo || !String(body.conteudo).trim()) {
    return res.status(400).json({ erro: 'Conteúdo da mensagem não pode ser vazio.' });
  }

  const remetenteId = body.remetente_id ? Number(body.remetente_id) : null;
  const remetenteTipo = body.remetente_tipo || 'CANDIDATO';
  const destinatarioId = body.destinatario_id ? Number(body.destinatario_id) : remetenteId;
  const destinatarioTipo = body.destinatario_tipo || remetenteTipo;
  const remetente = sanitizarTexto(body.remetente_nome || 'Profissional Equalis');
  const cargo = sanitizarTexto(body.remetente_cargo || 'Candidato PcD');
  const conteudo = sanitizarTexto(body.conteudo);
  const agora = new Date();
  const horario = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

  const dbResult = await execMySQL(
    `INSERT INTO Mensagem (remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, remetente_nome, remetente_cargo, conteudo, horario, nao_lida)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [remetenteId, remetenteTipo, destinatarioId, destinatarioTipo, remetente, cargo, conteudo, horario]
  );

  const novaMsg = {
    id: dbResult && dbResult.insertId ? dbResult.insertId : Date.now(),
    remetente_id: remetenteId,
    remetente_tipo: remetenteTipo,
    destinatario_id: destinatarioId,
    destinatario_tipo: destinatarioTipo,
    remetente_nome: remetente,
    remetente_cargo: cargo,
    conteudo,
    horario,
    nao_lida: 1,
    created_at: agora.toISOString(),
  };

  store.mensagens.push(novaMsg);
  saveStore(store);

  return res.status(201).json(novaMsg);
}

async function excluirMensagem(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  await execMySQL(`DELETE FROM Mensagem WHERE id = ?`, [idParam]);
  store.mensagens = (store.mensagens || []).filter((m) => m.id !== idParam);
  saveStore(store);
  return res.status(200).json({ sucesso: true, id: idParam });
}

async function marcarLida(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  await execMySQL(`UPDATE Mensagem SET nao_lida = 0 WHERE id = ?`, [idParam]);
  const msg = (store.mensagens || []).find((m) => m.id === idParam);
  if (msg) msg.nao_lida = 0;
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: idParam, nao_lida: 0 });
}

module.exports = {
  alternarConexao,
  listarConexoes,
  listarMensagens,
  enviarMensagem,
  marcarLida,
  excluirMensagem,
};

