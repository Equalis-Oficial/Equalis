const { Router } = require('express');
const empresasController = require('../controllers/empresasController');

const router = Router();

router.post('/', empresasController.cadastrar);
router.get('/:id', empresasController.obterPerfil);
router.put('/:id/perfil', empresasController.atualizarPerfil);
router.patch('/:id/perfil', empresasController.atualizarPerfil);

module.exports = router;
