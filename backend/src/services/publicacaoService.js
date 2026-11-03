/**
 * Serviço de Publicações — Equalis
 * Lógica do feed social inclusivo, curtidas, comentários e republicações.
 */
const publicacaoRepository = require('../repositories/publicacaoRepository');
const AppError = require('../errors/AppError');
const { sanitizarTexto } = require('../utils/validators');

// Armazenamento em memória estruturado para curtidas por usuário e comentários
const userLikesMap = new Map(); // publicacaoId -> Set(userKey)
const comentariosList = []; // { id, publicacao_id, autor_nome, texto, created_at }

async function listar({ usuarioId, usuarioTipo = 'CANDIDATO' } = {}) {
  const userKey = usuarioId ? `${usuarioTipo}_${usuarioId}` : null;
  const pubs = await publicacaoRepository.listar();

  return pubs.map((p) => {
    const likesSet = userLikesMap.get(p.id) || new Set();
    return {
      ...p,
      curtidoPeloUsuario: userKey ? likesSet.has(userKey) : false,
    };
  });
}

async function obter(id) {
  const pub = await publicacaoRepository.buscarPorId(id);
  if (!pub) {
    throw new AppError('Publicação não encontrada.', 404);
  }
  return pub;
}

async function criar(dados) {
  const { autor_tipo, autor_id, autor_nome, autor_subtitulo, conteudo, vaga_id } = dados || {};
  if (!conteudo || !String(conteudo).trim()) {
    throw new AppError('Conteúdo da publicação não pode ser vazio.', 400);
  }

  const autorNomeDefault = autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva' : 'Candidato PcD';
  const autorSubDefault = autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva • Agora mesmo' : 'Profissional PcD';

  const novaPub = await publicacaoRepository.criar({
    autor_tipo: autor_tipo || 'CANDIDATO',
    autor_id: autor_id || 1,
    autor_nome: sanitizarTexto(autor_nome || autorNomeDefault),
    autor_subtitulo: sanitizarTexto(autor_subtitulo || autorSubDefault),
    conteudo: sanitizarTexto(conteudo),
    vaga_id: vaga_id ? Number(vaga_id) : null,
  });

  return novaPub;
}

async function editar(id, dados) {
  const { conteudo } = dados || {};
  if (!conteudo || !String(conteudo).trim()) {
    throw new AppError('Conteúdo da publicação não pode ser vazio.', 400);
  }

  const pubExiste = await publicacaoRepository.buscarPorId(id);
  if (!pubExiste) {
    throw new AppError('Publicação não encontrada para edição.', 404);
  }

  const atualizada = await publicacaoRepository.atualizar(id, {
    conteudo: sanitizarTexto(conteudo),
  });

  return { sucesso: true, publicacao: atualizada };
}

async function excluir(id) {
  const pubExiste = await publicacaoRepository.buscarPorId(id);
  if (!pubExiste) {
    throw new AppError('Publicação não encontrada para exclusão.', 404);
  }

  await publicacaoRepository.excluir(id);
  userLikesMap.delete(Number(id));
  return { sucesso: true, id: Number(id) };
}

async function alternarCurtida(id, { usuario_id = 1, usuario_tipo = 'CANDIDATO' } = {}) {
  const idNum = Number(id);
  const pub = await publicacaoRepository.buscarPorId(idNum);
  if (!pub) {
    throw new AppError('Publicação não encontrada.', 404);
  }

  const userKey = `${usuario_tipo}_${usuario_id}`;
  if (!userLikesMap.has(idNum)) {
    userLikesMap.set(idNum, new Set());
  }
  const likesSet = userLikesMap.get(idNum);
  const jaCurtiu = likesSet.has(userKey);

  let pubAtualizada;
  if (jaCurtiu) {
    likesSet.delete(userKey);
    pubAtualizada = await publicacaoRepository.descurtir(idNum);
  } else {
    likesSet.add(userKey);
    pubAtualizada = await publicacaoRepository.curtir(idNum);
  }

  return {
    sucesso: true,
    curtidas: pubAtualizada ? pubAtualizada.curtidas : 0,
    curtido: !jaCurtiu,
  };
}

async function listarComentarios(publicacaoId) {
  const idNum = Number(publicacaoId);
  return comentariosList.filter((c) => c.publicacao_id === idNum);
}

async function adicionarComentario(publicacaoId, { autor_nome, texto }) {
  const idNum = Number(publicacaoId);
  if (!texto || !String(texto).trim()) {
    throw new AppError('Texto do comentário é obrigatório.', 400);
  }

  const pub = await publicacaoRepository.buscarPorId(idNum);
  if (!pub) {
    throw new AppError('Publicação não encontrada.', 404);
  }

  await publicacaoRepository.incrementarComentarioCount(idNum);

  const novoComentario = {
    id: Date.now(),
    publicacao_id: idNum,
    autor_nome: sanitizarTexto(autor_nome || 'Profissional Equalis'),
    texto: sanitizarTexto(texto),
    created_at: new Date().toISOString(),
  };

  comentariosList.push(novoComentario);
  return novoComentario;
}

async function republicar(id, { autor_tipo, autor_id, autor_nome, autor_subtitulo } = {}) {
  const idNum = Number(id);
  const original = await publicacaoRepository.buscarPorId(idNum);
  if (!original) {
    throw new AppError('Publicação original não encontrada.', 404);
  }

  await publicacaoRepository.incrementarCompartilhamento(idNum);

  const autorNomeDefault = autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva' : 'Candidato PcD';
  const autorSubDefault = autor_tipo === 'EMPRESA' ? 'Empresa Inclusiva • Agora mesmo' : 'Profissional PcD';

  const republicada = await publicacaoRepository.criar({
    autor_tipo: autor_tipo || 'CANDIDATO',
    autor_id: autor_id || 1,
    autor_nome: sanitizarTexto(autor_nome || autorNomeDefault),
    autor_subtitulo: sanitizarTexto(autor_subtitulo || autorSubDefault),
    conteudo: sanitizarTexto(`[Republicado de ${original.autor_nome}]: ${original.conteudo}`),
    vaga_id: original.vaga_id || null,
  });

  return republicada;
}

module.exports = {
  listar,
  obter,
  criar,
  editar,
  excluir,
  alternarCurtida,
  listarComentarios,
  adicionarComentario,
  republicar,
};

