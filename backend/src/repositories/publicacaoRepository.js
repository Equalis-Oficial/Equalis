/**
 * Repositório de Publicações — Equalis
 * Acesso a dados de Publicacao, Curtidas e Comentários (MySQL 8).
 */
const { execMySQL } = require('../config/database');

async function listar() {
  const rows = await execMySQL(
    'SELECT * FROM Publicacao ORDER BY id DESC'
  );
  return Array.isArray(rows) ? rows : [];
}

async function buscarPorId(id) {
  const rows = await execMySQL(
    'SELECT * FROM Publicacao WHERE id = ?',
    [Number(id)]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function criar({ autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id }) {
  const result = await execMySQL(
    `INSERT INTO Publicacao (autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id, curtidas, comentarios, compartilhamentos)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)`,
    [
      autor_tipo || 'CANDIDATO',
      Number(autor_id),
      autor_nome,
      autor_subtitulo || null,
      conteudo,
      vaga_id ? Number(vaga_id) : null,
    ]
  );
  const id = result && result.insertId ? result.insertId : null;
  return buscarPorId(id);
}

async function atualizar(id, { conteudo }) {
  await execMySQL(
    'UPDATE Publicacao SET conteudo = ? WHERE id = ?',
    [conteudo, Number(id)]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  await execMySQL(
    'DELETE FROM Publicacao WHERE id = ?',
    [Number(id)]
  );
  return true;
}

async function curtir(id) {
  await execMySQL(
    'UPDATE Publicacao SET curtidas = curtidas + 1 WHERE id = ?',
    [Number(id)]
  );
  return buscarPorId(id);
}

async function descurtir(id) {
  await execMySQL(
    'UPDATE Publicacao SET curtidas = GREATEST(0, curtidas - 1) WHERE id = ?',
    [Number(id)]
  );
  return buscarPorId(id);
}

async function incrementarCompartilhamento(id) {
  await execMySQL(
    'UPDATE Publicacao SET compartilhamentos = compartilhamentos + 1 WHERE id = ?',
    [Number(id)]
  );
  return buscarPorId(id);
}

async function incrementarComentarioCount(id) {
  await execMySQL(
    'UPDATE Publicacao SET comentarios = comentarios + 1 WHERE id = ?',
    [Number(id)]
  );
  return buscarPorId(id);
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  curtir,
  descurtir,
  incrementarCompartilhamento,
  incrementarComentarioCount,
};
