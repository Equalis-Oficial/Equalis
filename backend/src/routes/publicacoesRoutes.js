const { Router } = require('express');
const publicacoesController = require('../controllers/publicacoesController');

const router = Router();

router.get('/', publicacoesController.listar);
router.post('/', publicacoesController.criar);
router.put('/:id', publicacoesController.editar);
router.delete('/:id', publicacoesController.excluir);
router.post('/:id/curtir', publicacoesController.curtir);
router.get('/:id/comentarios', publicacoesController.listarComentarios);
router.post('/:id/comentarios', publicacoesController.comentar);
router.post('/:id/republicar', publicacoesController.republicar);

module.exports = router;

