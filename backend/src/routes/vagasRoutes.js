const { Router } = require('express');
const vagasController = require('../controllers/vagasController');

const router = Router();

router.get('/', vagasController.listar);
router.get('/:id', vagasController.obter);
router.post('/', vagasController.criar);
router.put('/:id', vagasController.atualizar);
router.delete('/:id', vagasController.excluir);

module.exports = router;

