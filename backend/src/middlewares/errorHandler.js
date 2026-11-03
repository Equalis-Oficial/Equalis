/**
 * Middleware Centralizado de Tratamento de Erros — Equalis
 * Intercepta exceções de negócio (AppError) e erros não previstos.
 */
const AppError = require('../errors/AppError');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  console.error('[Equalis Backend Error]:', err);
  return res.status(500).json({
    erro: err.message || 'Erro interno no servidor Equalis.',
  });
}

module.exports = errorHandler;
