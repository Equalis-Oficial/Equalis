/**
 * Modelos e Dados Iniciais — Equalis Mobile
 */

export const INITIAL_DEFICIENCIAS = [
  {
    id: 1,
    categoria: 'Deficiência Física',
    descricao:
      'Alteração completa ou parcial de um ou mais segmentos do corpo humano, com suporte de mobilidade e ergonomia.',
  },
  {
    id: 2,
    categoria: 'Deficiência Visual',
    descricao:
      'Cegueira, baixa visão ou visão monocular, com suporte de leitores de tela, braille e alto contraste.',
  },
  {
    id: 3,
    categoria: 'Deficiência Auditiva',
    descricao:
      'Perda bilateral, parcial ou total da audição, com suporte em Libras e comunicação visual.',
  },
  {
    id: 4,
    categoria: 'Deficiência Intelectual',
    descricao:
      'Limitações adaptativas com suporte de comunicação simples, rotinas estruturadas e mentoria inclusiva.',
  },
  {
    id: 5,
    categoria: 'Deficiência Psicossocial / Mental',
    descricao:
      'Condições neurodivergentes ou psicossociais (TEA, TDAH, etc.) com ambiente sensorialmente adaptado e horário flexível.',
  },
];

export const INITIAL_VAGAS = [];

export const EMPTY_CANDIDATO = {
  id: null,
  nome: '',
  email: '',
  cpf: '',
  area_atuacao: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  conexoesCount: 0,
  resumo_profissional: '',
  servicos: [],
  competencias: [],
  deficiencias_ids: [],
  prefiroNaoInformar: false,
  url_laudo_medico: null,
  url_curriculo: null,
  disponivelPara: '',
};

export const MARIA_PERFIL = {
  id: 1,
  nome: 'Maria Ledentsova',
  email: 'maria@equalis.com.br',
  cpf: '529.982.247-25',
  area_atuacao: 'Marketing',
  cidade: 'Guarulhos',
  estado: 'São Paulo',
  pais: 'Brasil',
  conexoesCount: 42,
  resumo_profissional:
    'Profissional de Marketing Digital e Comunicação Acessível com foco em campanhas inclusivas, gestão de mídias sociais e atendimento humanizado.',
  servicos: [
    'Marketing Digital Inclusivo',
    'Gestão de Mídias Sociais (#PraCegoVer)',
    'Atendimento e Experiência do Cliente',
  ],
  competencias: ['Comunicação Acessível', 'Copywriting', 'Gestão de Comunidades', 'Design Inclusivo'],
  deficiencias_ids: [1],
  prefiroNaoInformar: false,
  url_laudo_medico: null,
  url_curriculo: null,
  disponivelPara: 'Vagas Presenciais, Híbridas e Home-Office',
};

export const MARIA_FORMACOES = [
  {
    id: 1,
    candidato_id: 1,
    instituicao: 'Centro Universitário UNICEPLAC',
    diploma: 'Graduação / Tecnólogo',
    area_estudo: 'Marketing e Mídias Digitais',
    mes_inicio: 'Fevereiro',
    ano_inicio: '2024',
    mes_termino: 'Dezembro',
    ano_termino: '2026',
    atividades_grupos: 'Núcleo de Acessibilidade e Inclusão (NICE)',
    descricao: 'Projetos práticos voltados à comunicação inclusiva e redução de barreiras.',
    competencias: ['Marketing Digital', 'Acessibilidade'],
    notificarRede: true,
  },
];

export const MARIA_EXPERIENCIAS = [
  {
    id: 1,
    candidato_id: 1,
    cargo: 'Assistente de Marketing e Relacionamento',
    organizacao: 'Agência Conecta Inclusão',
    localidade: 'São Paulo, Guarulhos, Brasil',
    tipo_localidade: 'Híbrido',
    tipo_emprego: 'Meio período',
    mes_inicio: 'Março',
    ano_inicio: '2024',
    descricao:
      'Criação de campanhas digitais acessíveis, descrição de imagens para leitores de tela e suporte ao cliente.',
    competencias: ['Atendimento ao Cliente', 'Marketing'],
    compartilharRede: true,
  },
];

export const MARIA_CANDIDATURAS = [
  {
    id: 1,
    candidato_id: 1,
    vaga_id: 3,
    status_processo: 'EM ANÁLISE',
    created_at: '18/10/2026',
  },
];

export const DEFAULT_EMPRESA = {
  id: 1,
  nome_fantasia: 'Centro Universitário UNICEPLAC',
  cnpj: '00.394.460/0058-87',
  area_atuacao: 'Ensino Superior e Saúde',
  cidade: 'Gama',
  estado: 'DF',
  pais: 'Brasil',
  descricao:
    'Instituição com mais de 50 anos de excelência no DF, pioneira na inclusão acadêmica e corporativa de pessoas com deficiência.',
  recursos_acessibilidade: [
    'Rampas de acesso em todos os blocos',
    'Intérprete de Libras presencial',
    'Elevadores adaptados com sinalização sonora',
    'Mobiliário ajustável e piso tátil',
    'Softwares de leitura de tela homologados',
  ],
};

export const INITIAL_CONEXOES = [];
export const INITIAL_PUBLICACOES = [];
export const INITIAL_MENSAGENS = [];

