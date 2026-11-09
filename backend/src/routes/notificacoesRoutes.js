/**
 * Rotas da Central de Notificações — Equalis (UC-22 & RN-031)
 */
const { Router } = require('express');
const notificacoesController = require('../controllers/notificacoesController');

const router = Router();

// 1. Listagem e Criação
router.get('/', notificacoesController.listar);
router.post('/', notificacoesController.criar);

// 2. Rotas Estáticas de Ação em Lote (Devem preceder rotas com parâmetro :id)
router.patch('/marcar-todas-lidas', notificacoesController.marcarTodasComoLidas);
router.put('/marcar-todas-lidas', notificacoesController.marcarTodasComoLidas);
router.patch('/todas-lidas', notificacoesController.marcarTodasComoLidas);

// 3. Rotas Parametrizadas de Ação Individual
router.patch('/:id/lida', notificacoesController.marcarComoLida);
router.put('/:id/lida', notificacoesController.marcarComoLida);
router.delete('/:id', notificacoesController.excluir);

module.exports = router;
