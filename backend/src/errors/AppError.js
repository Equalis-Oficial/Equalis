/**
 * Classe de Erro Operacional da Aplicação — Equalis
 * Permite lançar erros de negócio com código de status HTTP explícito.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

