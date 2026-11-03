const { Router } = require('express');
const candidaturasController = require('../controllers/candidaturasController');

const router = Router();

router.get('/', candidaturasController.listar);
router.post('/', candidaturasController.aplicar);
router.patch('/:id/status', candidaturasController.atualizarStatus);
router.delete('/:id', candidaturasController.excluir);

module.exports = router;

