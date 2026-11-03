/**
 * Configuração da Aplicação Express — Equalis
 * Arquitetura em Camadas (Routes ➔ Controllers ➔ Services ➔ Repositories)
 * com middlewares de CORS, parser JSON, tratamento global de erros e persistência MySQL 8.
 */
const express = require('express');
const { isMySQLConnected } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Serviços e Repositórios para Bootstrap
const vagaService = require('./services/vagaService');
const candidatoRepository = require('./repositories/candidatoRepository');
const empresaRepository = require('./repositories/empresaRepository');
const deficienciaService = require('./services/deficienciaService');
const publicacaoService = require('./services/publicacaoService');
const redeService = require('./services/redeService');

// Importação das Rotas Modulares
const authRoutes = require('./routes/authRoutes');
const candidatosRoutes = require('./routes/candidatosRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const vagasRoutes = require('./routes/vagasRoutes');
const candidaturasRoutes = require('./routes/candidaturasRoutes');
const publicacoesRoutes = require('./routes/publicacoesRoutes');
const redeRoutes = require('./routes/redeRoutes');
const deficienciasRoutes = require('./routes/deficienciasRoutes');

const candidatosController = require('./controllers/candidatosController');

const app = express();

// Middlewares Globais
app.use(express.json());

// Middleware de CORS manual e flexível
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    projeto: 'Equalis - UNICEPLAC 2026',
    arquitetura: 'Clean Layered Architecture (Routes ➔ Controllers ➔ Services ➔ Repositories)',
    mysqlConnected: isMySQLConnected(),
    database: 'equalis_db (MySQL 8)',
    tabelas_mer: [
      'Empresa',
      'Candidato',
      'Deficiencia',
      'Candidato_Deficiencia',
      'Vaga',
      'Vaga_Acessibilidade',
      'Candidatura',
      'Formacao_Academica',
      'Experiencia_Profissional',
      'Publicacao',
      'Conexao',
      'Mensagem',
    ],
  });
});

// 2. Sincronização Global Bootstrap
app.get('/api/bootstrap', async (req, res, next) => {
  try {
    const [vagas, candidatos, empresas, deficiencias, publicacoes, conexoes] = await Promise.all([
      vagaService.listar(),
      candidatoRepository.listarTodos(),
      empresaRepository.listarTodas(),
      deficienciaService.listar(),
      publicacaoService.listar(),
      redeService.listarConexoes(),
    ]);

    res.status(200).json({
      vagas,
      candidatos,
      empresas,
      deficiencias,
      publicacoes,
      conexoes,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Montagem dos Módulos de Rotas
app.use('/api/auth', authRoutes);
app.use('/api/candidatos', candidatosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/vagas', vagasRoutes);
app.use('/api/candidaturas', candidaturasRoutes);
app.use('/api/publicacoes', publicacoesRoutes);
app.use('/api/deficiencias', deficienciasRoutes);
app.use('/api', redeRoutes);

// Rotas de atalho para compatibilidade
app.post('/api/formacoes', candidatosController.adicionarFormacao);
app.post('/api/experiencias', candidatosController.adicionarExperiencia);

// Tratamento 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada na API Equalis.' });
});

// Tratamento Centralizado de Erros (AppError + Unhandled)
app.use(errorHandler);

module.exports = app;
