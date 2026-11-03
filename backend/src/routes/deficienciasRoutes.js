const { Router } = require('express');
const deficienciasController = require('../controllers/deficienciasController');

const router = Router();

router.get('/', deficienciasController.listar);

module.exports = router;

