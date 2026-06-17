const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');
const dialogoController = require('../controllers/dialogoController');
const mapaController = require('../controllers/mapaController');

router.post('/', partidaController.criarPartida);
router.get('/:id', partidaController.getPartida);
router.post('/:id/mover', mapaController.mover);
router.get('/:id/visao', mapaController.getVisao);
router.get('/:id/inventario', partidaController.getInventario);
router.post('/:id/coletar', partidaController.coletarPista);
router.get('/:id/rota', partidaController.getRota);
router.post('/:id/acusar', partidaController.acusar);
router.post('/:id/interagir', partidaController.interagir);
router.post('/:id/escolha', partidaController.escolher);
router.get('/:id/historico', dialogoController.getHistorico);
router.get('/:id/suspeitos', dialogoController.getStatusInterrogacao);
router.post('/:id/acusar', partidaController.acusar);
router.get('/health', partidaController.health);


module.exports = router;