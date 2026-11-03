/**
 * Repositório de Rede & Mensagens — Equalis
 * Acesso a dados de Conexao e Mensagem (MySQL 8).
 */
const { execMySQL } = require('../config/database');

// =================== CONEXÕES ===================
async function listarConexoes(candidatoId = null) {
  let query = 'SELECT * FROM Conexao';
  let params = [];
  if (candidatoId) {
    query += ' WHERE candidato_id = ?';
    params.push(Number(candidatoId));
  }
  query += ' ORDER BY id ASC';
  const rows = await execMySQL(query, params);
  return Array.isArray(rows) ? rows : [];
}

async function buscarConexaoPorId(id) {
  const rows = await execMySQL('SELECT * FROM Conexao WHERE id = ?', [Number(id)]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function alternarStatusConexao(id) {
  const conexao = await buscarConexaoPorId(id);
  if (!conexao) return null;

  const novoStatus = conexao.status === 'CONECTADO' ? 'SUGERIDO' : 'CONECTADO';
  await execMySQL('UPDATE Conexao SET status = ? WHERE id = ?', [novoStatus, Number(id)]);
  return { ...conexao, status: novoStatus, conectado: novoStatus === 'CONECTADO' };
}

// =================== MENSAGENS ===================
async function listarMensagens({ usuarioId, usuarioTipo } = {}) {
  let query = 'SELECT * FROM Mensagem';
  let params = [];

  if (usuarioId && usuarioTipo) {
    query += ` WHERE (remetente_id = ? AND remetente_tipo = ?)
                 OR (destinatario_id = ? AND destinatario_tipo = ?)`;
    params = [Number(usuarioId), usuarioTipo, Number(usuarioId), usuarioTipo];
  }
  query += ' ORDER BY id DESC';

  const rows = await execMySQL(query, params);
  return Array.isArray(rows) ? rows : [];
}

async function criarMensagem({
  remetente_id,
  remetente_tipo,
  destinatario_id,
  destinatario_tipo,
  remetente_nome,
  remetente_cargo,
  conteudo,
  horario,
}) {
  const result = await execMySQL(
    `INSERT INTO Mensagem (remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, remetente_nome, remetente_cargo, conteudo, horario, nao_lida)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      remetente_id ? Number(remetente_id) : 1,
      remetente_tipo || 'CANDIDATO',
      destinatario_id ? Number(destinatario_id) : 1,
      destinatario_tipo || 'CANDIDATO',
      remetente_nome || 'Usuário Equalis',
      remetente_cargo || null,
      conteudo,
      horario || '10:12',
    ]
  );
  const id = result && result.insertId ? result.insertId : Date.now();
  return {
    id,
    remetente_id,
    remetente_tipo,
    destinatario_id,
    destinatario_tipo,
    remetente_nome,
    remetente_cargo,
    conteudo,
    horario,
    nao_lida: true,
  };
}

async function marcarMensagemLida(id) {
  await execMySQL('UPDATE Mensagem SET nao_lida = 0 WHERE id = ?', [Number(id)]);
  return true;
}

async function excluirMensagem(id) {
  await execMySQL('DELETE FROM Mensagem WHERE id = ?', [Number(id)]);
  return true;
}

module.exports = {
  listarConexoes,
  buscarConexaoPorId,
  alternarStatusConexao,
  listarMensagens,
  criarMensagem,
  marcarMensagemLida,
  excluirMensagem,
};
