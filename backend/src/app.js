/**
 * Configuração da Aplicação Express — Equalis
 * Arquitetura MVC com rotas modulares, middlewares de CORS, parser JSON
 * e endpoints de sincronização e healthcheck.
 */
const express = require('express');
const { isMySQLConnected } = require('./config/database');
const { loadStore } = require('./models/dataStore');

// Importação das Rotas Modulares (MVC)
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
    arquitetura: 'MVC (Model-View-Controller) com Express.js',
    mysqlConnected: isMySQLConnected(),
    database: 'equalis_db (MySQL 8 / Store Sincronizada)',
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
app.get('/api/bootstrap', (req, res) => {
  const store = loadStore();
  res.status(200).json(store);
});

// 3. Montagem dos Módulos de Rotas (MVC)
app.use('/api/auth', authRoutes);
app.use('/api/candidatos', candidatosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/vagas', vagasRoutes);
app.use('/api/candidaturas', candidaturasRoutes);
app.use('/api/publicacoes', publicacoesRoutes);
app.use('/api/deficiencias', deficienciasRoutes);
app.use('/api', redeRoutes);

// Rotas de atalho para compatibilidade com versões anteriores
app.post('/api/formacoes', candidatosController.adicionarFormacao);
app.post('/api/experiencias', candidatosController.adicionarExperiencia);

// Tratamento 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada na API Equalis.' });
});

// Tratamento de Erros Global
app.use((err, req, res, next) => {
  console.error('[Equalis API Error]:', err.message);
  res.status(500).json({ erro: err.message || 'Erro interno no servidor Equalis.' });
});

module.exports = app;

