const { Router } = require('express');
const candidatosController = require('../controllers/candidatosController');

const router = Router();

router.post('/', candidatosController.cadastrar);
router.get('/:id', candidatosController.obterPerfil);
router.put('/:id/perfil', candidatosController.atualizarPerfil);
router.post('/:id/documentos', candidatosController.uploadDocumento);
router.get('/:id/formacoes', candidatosController.listarFormacoes);
router.post('/:id/formacoes', candidatosController.adicionarFormacao);
router.delete('/:id/formacoes/:formId', candidatosController.excluirFormacao);
router.get('/:id/experiencias', candidatosController.listarExperiencias);
router.post('/:id/experiencias', candidatosController.adicionarExperiencia);
router.delete('/:id/experiencias/:expId', candidatosController.excluirExperiencia);

module.exports = router;

