const { Router } = require('express');
const redeController = require('../controllers/redeController');

const router = Router();

router.get('/conexoes', redeController.listarConexoes);
router.post('/conexoes/:id/conectar', redeController.alternarConexao);
router.get('/mensagens', redeController.listarMensagens);
router.post('/mensagens', redeController.enviarMensagem);
router.patch('/mensagens/:id/lida', redeController.marcarLida);
router.delete('/mensagens/:id', redeController.excluirMensagem);

module.exports = router;

