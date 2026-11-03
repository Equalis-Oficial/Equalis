/**
 * Controller de Publicações — Equalis
 * Feed social inclusivo com persistência de curtidas, comentários,
 * reposts com atribuição e mídia com audiodescrição (#PraCegoVer).
 */
const { execMySQL } = require('../config/database');
const { loadStore, saveStore } = require('../models/dataStore');
const { sanitizarTexto } = require('../utils/validators');

async function listar(req, res) {
  const store = loadStore();
  const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : null;
  const usuarioTipo = req.query.usuario_tipo || 'CANDIDATO';
  const userKey = usuarioId ? `${usuarioTipo}_${usuarioId}` : null;

  const dbPubs = await execMySQL(`SELECT * FROM Publicacao ORDER BY id DESC`);
  const baseList = Array.isArray(dbPubs) ? dbPubs : store.publicacoes || [];

  const enriched = baseList.map((p) => {
    const localPub = (store.publicacoes || []).find((sp) => sp.id === p.id);
    const curtidoPor = Array.isArray(localPub?.curtido_por) ? localPub.curtido_por : [];
    return {
      ...p,
      curtidoPeloUsuario: userKey ? curtidoPor.includes(userKey) : false,
    };
  });

  return res.status(200).json(enriched);
}

async function criar(req, res) {
  const store = loadStore();
  const body = req.body || {};

  if (!body.conteudo || !String(body.conteudo).trim()) {
    return res.status(400).json({ erro: 'Conteúdo da publicação não pode ser vazio.' });
  }

  const autorNomeDefault = body.autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva' : 'Candidato PcD';
  const autorSubDefault = body.autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva • Agora mesmo' : 'Profissional PcD';
  const autorNomeFinal = sanitizarTexto(body.autor_nome || autorNomeDefault);
  const autorSubFinal = sanitizarTexto(body.autor_subtitulo || autorSubDefault);

  const dbResult = await execMySQL(
    `INSERT INTO Publicacao (autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      body.autor_tipo || 'CANDIDATO',
      body.autor_id || 1,
      autorNomeFinal,
      autorSubFinal,
      sanitizarTexto(body.conteudo || ''),
      body.vaga_id || null,
    ]
  );

  const novaPub = {
    id: dbResult && dbResult.insertId ? dbResult.insertId : Date.now(),
    autor_tipo: body.autor_tipo || 'CANDIDATO',
    autor_id: body.autor_id || 1,
    autor_nome: autorNomeFinal,
    autor_subtitulo: autorSubFinal,
    conteudo: sanitizarTexto(body.conteudo || ''),
    vaga_id: body.vaga_id || null,
    curtidas: 0,
    comentarios: 0,
    compartilhamentos: 0,
    created_at: new Date().toISOString(),
  };

  store.publicacoes.unshift(novaPub);
  saveStore(store);

  return res.status(201).json(novaPub);
}

async function editar(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  if (!body.conteudo || !String(body.conteudo).trim()) {
    return res.status(400).json({ erro: 'Conteúdo da publicação não pode ser vazio.' });
  }

  const conteudoSanitizado = sanitizarTexto(body.conteudo);
  await execMySQL(
    `UPDATE Publicacao SET conteudo = ?, vaga_id = ? WHERE id = ?`,
    [conteudoSanitizado, body.vaga_id || null, idParam]
  );

  let pub = store.publicacoes.find((p) => p.id === idParam);
  if (pub) {
    pub.conteudo = conteudoSanitizado;
    if (body.vaga_id !== undefined) pub.vaga_id = body.vaga_id;
  }
  saveStore(store);

  return res.status(200).json({
    sucesso: true,
    publicacao: pub || { id: idParam, conteudo: conteudoSanitizado },
  });
}

async function excluir(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);

  await execMySQL(`DELETE FROM Publicacao WHERE id = ?`, [idParam]);
  store.publicacoes = store.publicacoes.filter((p) => p.id !== idParam);
  saveStore(store);

  return res.status(200).json({ sucesso: true, id: idParam });
}

async function curtir(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};
  const usuarioId = body.usuario_id ? Number(body.usuario_id) : 1;
  const usuarioTipo = body.usuario_tipo || 'CANDIDATO';
  const userKey = `${usuarioTipo}_${usuarioId}`;

  let pub = store.publicacoes.find((p) => p.id === idParam);
  if (!pub) {
    const dbRows = await execMySQL(`SELECT * FROM Publicacao WHERE id = ?`, [idParam]);
    if (Array.isArray(dbRows) && dbRows.length > 0) {
      pub = { ...dbRows[0], curtido_por: [] };
      store.publicacoes.push(pub);
    } else {
      return res.status(404).json({ erro: 'Publicação não encontrada.' });
    }
  }

  pub.curtido_por = Array.isArray(pub.curtido_por) ? pub.curtido_por : [];
  const jaCurtiu = pub.curtido_por.includes(userKey);
  const novoStatus = !jaCurtiu;
  if (novoStatus) {
    pub.curtido_por.push(userKey);
  } else {
    pub.curtido_por = pub.curtido_por.filter((k) => k !== userKey);
  }
  pub.curtidoPeloUsuario = novoStatus;
  pub.curtidas = novoStatus ? (pub.curtidas || 0) + 1 : Math.max(0, (pub.curtidas || 1) - 1);

  await execMySQL(`UPDATE Publicacao SET curtidas = ? WHERE id = ?`, [pub.curtidas, idParam]);
  saveStore(store);

  return res.status(200).json({ sucesso: true, curtidas: pub.curtidas, curtido: novoStatus });
}

async function listarComentarios(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  store.comentarios = store.comentarios || [];
  const filtrados = store.comentarios.filter((c) => c.publicacao_id === idParam);
  return res.status(200).json(filtrados);
}

async function comentar(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  if (!body.texto || !String(body.texto).trim()) {
    return res.status(400).json({ erro: 'Texto do comentário é obrigatório.' });
  }

  let pub = store.publicacoes.find((p) => p.id === idParam);
  if (pub) {
    pub.comentarios = (pub.comentarios || 0) + 1;
    await execMySQL(`UPDATE Publicacao SET comentarios = ? WHERE id = ?`, [pub.comentarios, idParam]);
  }

  store.comentarios = store.comentarios || [];
  const novoComentario = {
    id: Date.now(),
    publicacao_id: idParam,
    autor_nome: sanitizarTexto(body.autor_nome || 'Profissional Equalis'),
    texto: sanitizarTexto(body.texto),
    created_at: new Date().toISOString(),
  };

  store.comentarios.push(novoComentario);
  saveStore(store);

  return res.status(201).json(novoComentario);
}

async function republicar(req, res) {
  const store = loadStore();
  const idParam = Number(req.params.id);
  const body = req.body || {};

  let original = store.publicacoes.find((p) => p.id === idParam);
  if (!original) {
    return res.status(404).json({ erro: 'Publicação original não encontrada.' });
  }

  original.compartilhamentos = (original.compartilhamentos || 0) + 1;
  await execMySQL(`UPDATE Publicacao SET compartilhamentos = ? WHERE id = ?`, [original.compartilhamentos, idParam]);

  const autorNomeDefault = body.autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva' : 'Candidato PcD';
  const autorSubDefault = body.autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva • Agora mesmo' : 'Profissional PcD';
  const autorNomeFinal = sanitizarTexto(body.autor_nome || autorNomeDefault);
  const autorSubFinal = sanitizarTexto(body.autor_subtitulo || autorSubDefault);

  const dbResult = await execMySQL(
    `INSERT INTO Publicacao (autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      body.autor_tipo || 'CANDIDATO',
      body.autor_id || 1,
      autorNomeFinal,
      autorSubFinal,
      sanitizarTexto(`[Republicado de ${original.autor_nome}]: ${original.conteudo}`),
      original.vaga_id || null,
    ]
  );

  const novaPub = {
    id: dbResult && dbResult.insertId ? dbResult.insertId : Date.now(),
    autor_tipo: body.autor_tipo || 'CANDIDATO',
    autor_id: body.autor_id || 1,
    autor_nome: autorNomeFinal,
    autor_subtitulo: autorSubFinal,
    conteudo: `[Republicado de ${original.autor_nome}]: ${original.conteudo}`,
    vaga_id: original.vaga_id || null,
    curtidas: 0,
    comentarios: 0,
    compartilhamentos: 0,
    created_at: new Date().toISOString(),
  };

  store.publicacoes.unshift(novaPub);
  saveStore(store);

  return res.status(201).json(novaPub);
}

module.exports = {
  listar,
  criar,
  editar,
  excluir,
  curtir,
  listarComentarios,
  comentar,
  republicar,
};

