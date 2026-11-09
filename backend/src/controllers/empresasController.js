/**
 * Controller de Empresas — Equalis (Clean MVC)
 * Gerencia requisições HTTP para cadastro e perfil institucional de empresas.
 */
const empresaService = require('../services/empresaService');

async function cadastrar(req, res, next) {
  try {
    const resultado = await empresaService.cadastrar(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obterPerfil(req, res, next) {
  try {
    const empresa = await empresaService.obterPerfil(req.params.id);
    return res.status(200).json(empresa);
  } catch (err) {
    next(err);
  }
}

async function atualizarPerfil(req, res, next) {
  try {
    const empresaAtualizada = await empresaService.atualizarPerfil(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      sucesso: true,
      message: 'Perfil da empresa atualizado com sucesso.',
      empresa: empresaAtualizada,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  cadastrar,
  obterPerfil,
  atualizarPerfil,
};
