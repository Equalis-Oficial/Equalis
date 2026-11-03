/**
 * Controller de Autenticação — Equalis (Clean MVC)
 * Gerencia requisições HTTP para login, SSO e recuperação de senha.
 */
const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body || {});
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function recuperarSenha(req, res, next) {
  try {
    const resultado = await authService.recuperarSenha(req.body?.email);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function loginSSO(req, res, next) {
  try {
    const resultado = await authService.loginSSO(req.body || {});
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  recuperarSenha,
  loginSSO,
  sso: loginSSO,
};
