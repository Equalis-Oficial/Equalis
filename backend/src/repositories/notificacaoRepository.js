/**
 * Repositório de Notificações — Equalis
 * Acesso a dados da tabela Notificacao (MySQL 8).
 * Atende aos requisitos UC-22 e RN-031 (baixa em leitura e badge de não lidas).
 */
const { execMySQL } = require('../config/database');

/**
 * Insere uma nova notificação para o usuário (Candidato ou Empresa).
 */
async function criar({
  usuario_id,
  usuario_tipo = 'CANDIDATO',
  tipo_evento,
  tipo,
  titulo,
  mensagem,
  referencia_id = null,
}) {
  const tipoFinal = tipo_evento || tipo || 'CANDIDATURA';
  const tipoUsuario = String(usuario_tipo || 'CANDIDATO').toUpperCase();

  const result = await execMySQL(
    `INSERT INTO Notificacao (usuario_id, usuario_tipo, tipo_evento, titulo, mensagem, referencia_id, lida)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [
      Number(usuario_id),
      tipoUsuario,
      tipoFinal,
      titulo,
      mensagem,
      referencia_id ? Number(referencia_id) : null,
    ]
  );

  const id = result && result.insertId ? result.insertId : null;
  if (id) {
    return buscarPorId(id);
  }

  return {
    id: Date.now(),
    usuario_id: Number(usuario_id),
    usuario_tipo: tipoUsuario,
    tipo: tipoFinal,
    tipo_evento: tipoFinal,
    titulo,
    mensagem,
    referencia_id: referencia_id ? Number(referencia_id) : null,
    lida: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Busca uma notificação específica pelo ID.
 */
async function buscarPorId(id) {
  const rows = await execMySQL(
    `SELECT id, usuario_id, usuario_tipo, tipo_evento, titulo, mensagem, referencia_id, lida, created_at
     FROM Notificacao WHERE id = ?`,
    [Number(id)]
  );
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const n = rows[0];
  return {
    id: n.id,
    usuario_id: n.usuario_id,
    usuario_tipo: n.usuario_tipo,
    tipo: n.tipo_evento,
    tipo_evento: n.tipo_evento,
    titulo: n.titulo,
    mensagem: n.mensagem,
    referencia_id: n.referencia_id,
    lida: Boolean(n.lida),
    created_at: n.created_at,
  };
}

/**
 * Lista as notificações ordenadas por data desc com filtros opcionais.
 */
async function listarPorUsuario({
  usuario_id,
  usuario_tipo,
  tipo_evento,
  apenas_nao_lidas = false,
  limit = 50,
  offset = 0,
} = {}) {
  let whereClauses = [];
  let params = [];

  if (usuario_id) {
    whereClauses.push('usuario_id = ?');
    params.push(Number(usuario_id));
  }
  if (usuario_tipo) {
    whereClauses.push('usuario_tipo = ?');
    params.push(String(usuario_tipo).toUpperCase());
  }
  if (tipo_evento) {
    whereClauses.push('tipo_evento = ?');
    params.push(String(tipo_evento));
  }
  if (apenas_nao_lidas) {
    whereClauses.push('lida = 0');
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const limitVal = Math.max(1, Math.min(100, Number(limit) || 50));
  const offsetVal = Math.max(0, Number(offset) || 0);

  const rows = await execMySQL(
    `SELECT id, usuario_id, usuario_tipo, tipo_evento, titulo, mensagem, referencia_id, lida, created_at
     FROM Notificacao
     ${whereSql}
     ORDER BY created_at DESC, id DESC
     LIMIT ${limitVal} OFFSET ${offsetVal}`,
    params
  );

  if (!Array.isArray(rows)) return [];

  return rows.map((n) => ({
    id: n.id,
    usuario_id: n.usuario_id,
    usuario_tipo: n.usuario_tipo,
    tipo: n.tipo_evento,
    tipo_evento: n.tipo_evento,
    titulo: n.titulo,
    mensagem: n.mensagem,
    referencia_id: n.referencia_id,
    lida: Boolean(n.lida),
    created_at: n.created_at,
  }));
}

/**
 * Retorna a contagem exata de notificações não lidas para o badge do menu (RN-031).
 */
async function contarNaoLidas(usuario_id, usuario_tipo) {
  let uid = usuario_id;
  let utipo = usuario_tipo;
  if (typeof usuario_id === 'object' && usuario_id !== null) {
    uid = usuario_id.usuario_id;
    utipo = usuario_id.usuario_tipo;
  }

  let sql = 'SELECT COUNT(*) as total FROM Notificacao WHERE lida = 0';
  let params = [];

  if (uid) {
    sql += ' AND usuario_id = ?';
    params.push(Number(uid));
  }
  if (utipo) {
    sql += ' AND usuario_tipo = ?';
    params.push(String(utipo).toUpperCase());
  }

  const rows = await execMySQL(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].total) : 0;
}

/**
 * Marca uma notificação individual como lida (lida = 1).
 */
async function marcarLida(id, usuario_id = null) {
  let sql = 'UPDATE Notificacao SET lida = 1 WHERE id = ?';
  let params = [Number(id)];

  if (usuario_id) {
    sql += ' AND usuario_id = ?';
    params.push(Number(usuario_id));
  }

  const result = await execMySQL(sql, params);
  const afetadas = result && result.affectedRows !== undefined ? result.affectedRows : 0;
  return { id: Number(id), lida: true, afetadas };
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
async function marcarTodasLidas(usuario_id, usuario_tipo) {
  let uid = usuario_id;
  let utipo = usuario_tipo;
  if (typeof usuario_id === 'object' && usuario_id !== null) {
    uid = usuario_id.usuario_id;
    utipo = usuario_id.usuario_tipo;
  }

  let sql = 'UPDATE Notificacao SET lida = 1 WHERE lida = 0';
  let params = [];

  if (uid) {
    sql += ' AND usuario_id = ?';
    params.push(Number(uid));
  }
  if (utipo) {
    sql += ' AND usuario_tipo = ?';
    params.push(String(utipo).toUpperCase());
  }

  const result = await execMySQL(sql, params);
  const afetadas = result && result.affectedRows !== undefined ? result.affectedRows : 0;
  return afetadas;
}

/**
 * Exclui uma notificação específica.
 */
async function excluir(id, usuario_id = null) {
  let sql = 'DELETE FROM Notificacao WHERE id = ?';
  let params = [Number(id)];

  if (usuario_id) {
    sql += ' AND usuario_id = ?';
    params.push(Number(usuario_id));
  }

  const result = await execMySQL(sql, params);
  const afetadas = result && result.affectedRows !== undefined ? result.affectedRows : 0;
  return { sucesso: true, afetadas };
}

module.exports = {
  criar,
  buscarPorId,
  listarPorUsuario,
  contarNaoLidas,
  marcarLida,
  marcarTodasLidas,
  excluir,
};
