const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.post('/login', authController.login);
router.post('/recuperar-senha', authController.recuperarSenha);
router.post('/sso', authController.sso);

module.exports = router;

