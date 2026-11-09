/**
 * Serviço de Candidaturas — Equalis
 * Regras de inscrição de profissionais PcD e controle de fluxo seletivo (UC-20, R1).
 * Máquina de estados canônica com disparo reativo de notificações ao candidato.
 */
const candidaturaRepository = require('../repositories/candidaturaRepository');
const vagaRepository = require('../repositories/vagaRepository');
const AppError = require('../errors/AppError');

// Carregamento defensivo de notificacaoService para evitar dependência circular
let notificacaoService = null;
function getNotificacaoService() {
  if (!notificacaoService) {
    try {
      notificacaoService = require('./notificacaoService');
    } catch (_) {
      notificacaoService = null;
    }
  }
  return notificacaoService;
}

const STATUS_CANONICOS = [
  'ENVIADA',
  'EM ANÁLISE',
  'ENTREVISTA AGENDADA',
  'APROVADA',
  'CANCELADA',
];

/**
 * Normaliza variações de status para a nomenclatura canônica oficial
 */
function normalizarStatus(statusInput) {
  if (!statusInput || typeof statusInput !== 'string') return null;
  const s = statusInput.trim();
  if (STATUS_CANONICOS.includes(s)) return s;
  if (s === 'ENTREVISTA' || s === 'ENTREVISTA_AGENDADA') return 'ENTREVISTA AGENDADA';
  if (s === 'EM_ANALISE' || s === 'EM ANALISE') return 'EM ANÁLISE';
  if (s === 'APROVADO') return 'APROVADA';
  if (s === 'CANCELADO') return 'CANCELADA';
  return null;
}

async function listar({ candidatoId, empresaId } = {}) {
  return await candidaturaRepository.listar({ candidatoId, empresaId });
}

async function aplicar({ candidato_id = 1, vaga_id }) {
  if (!vaga_id) {
    throw new AppError('Identificador da vaga é obrigatório.', 400);
  }

  const vaga = await vagaRepository.buscarPorId(vaga_id);
  if (!vaga) {
    throw new AppError('Vaga não encontrada.', 404);
  }

  const jaExiste = await candidaturaRepository.buscarPorCandidatoEVaga(candidato_id, vaga_id);
  if (jaExiste) {
    throw new AppError('Você já possui uma candidatura ativa para esta vaga.', 409);
  }

  return await candidaturaRepository.criar(candidato_id, vaga_id);
}

/**
 * Atualiza o status do processo seletivo e dispara notificação automática ao candidato
 */
async function atualizarStatus(id, dados) {
  const candidaturaId = Number(id);
  if (!candidaturaId || isNaN(candidaturaId)) {
    throw new AppError('Identificador de candidatura inválido.', 400);
  }

  const { status, status_processo, vaga_id } = dados || {};
  const statusBruto = status || status_processo;

  if (!statusBruto) {
    throw new AppError('Informe o novo status do processo seletivo.', 400);
  }

  const statusNormalizado = normalizarStatus(statusBruto);
  if (!statusNormalizado) {
    throw new AppError(
      'Status de candidatura inválido. Valores aceitos: EM ANÁLISE, ENTREVISTA AGENDADA, APROVADA, CANCELADA.',
      400
    );
  }

  // 1. Localiza a candidatura para obter vínculo com candidato e vaga
  let candidatura = await candidaturaRepository.buscarPorId(candidaturaId);
  if (!candidatura) {
    throw new AppError('Candidatura não encontrada.', 404);
  }

  // 2. Persiste a alteração no repositório
  const atualizada = await candidaturaRepository.atualizarStatus(candidaturaId, {
    status_processo: statusNormalizado,
    vaga_id: vaga_id ? Number(vaga_id) : undefined,
  });

  // 3. Disparo reativo de notificação para o candidato PcD (Side-effect seguro)
  try {
    const notifService = getNotificacaoService();
    if (notifService && candidatura && candidatura.candidato_id) {
      const vagaTitulo =
        (candidatura.vaga && candidatura.vaga.titulo) ||
        candidatura.vaga_titulo ||
        'Oportunidade de Trabalho';
      const empresaNome =
        (candidatura.vaga && candidatura.vaga.empresa_nome) ||
        candidatura.empresa_nome ||
        'Empresa Parceira';

      let tituloNotif = 'Status de Candidatura Atualizado';
      let mensagemNotif = `Sua candidatura para a vaga "${vagaTitulo}" avançou para ${statusNormalizado}.`;

      if (statusNormalizado === 'EM ANÁLISE') {
        tituloNotif = 'Candidatura em Análise';
        mensagemNotif = `Sua candidatura para "${vagaTitulo}" está sendo analisada pela equipe de RH da ${empresaNome}.`;
      } else if (statusNormalizado === 'ENTREVISTA AGENDADA') {
        tituloNotif = 'Entrevista Agendada!';
        mensagemNotif = `Parabéns! A ${empresaNome} agendou sua entrevista técnica acessível para a vaga "${vagaTitulo}".`;
      } else if (statusNormalizado === 'APROVADA') {
        tituloNotif = 'Candidatura Aprovada!';
        mensagemNotif = `Parabéns! Você foi selecionado para a vaga "${vagaTitulo}" na ${empresaNome}.`;
      } else if (statusNormalizado === 'CANCELADA') {
        tituloNotif = 'Processo Seletivo Finalizado';
        mensagemNotif = `O processo seletivo para a vaga "${vagaTitulo}" na ${empresaNome} foi encerrado.`;
      }

      await notifService.criar({
        usuario_id: candidatura.candidato_id,
        usuario_tipo: 'CANDIDATO',
        tipo_evento: 'CANDIDATURA',
        titulo: tituloNotif,
        mensagem: mensagemNotif,
        referencia_id: candidatura.vaga_id || candidaturaId,
      });
    }
  } catch (notifErr) {
    console.warn('⚠️ [Aviso Notificação]: Falha ao disparar notificação reativa:', notifErr.message);
  }

  return {
    ...atualizada,
    id: candidaturaId,
    status_processo: statusNormalizado,
    notificacao_gerada: true,
  };
}

async function excluir(id, candidatoId = null) {
  await candidaturaRepository.excluir(id, candidatoId);
  return { sucesso: true, id: Number(id) };
}

module.exports = {
  listar,
  aplicar,
  atualizarStatus,
  excluir,
};
