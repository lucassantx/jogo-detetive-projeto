// TODO Dev 1 — Sprint 1 | Issues #1 #2 #3
// Rotas da partida — montar após implementar os controllers

const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');
const dialogoController = require('../controllers/dialogoController');
const mapaController = require('../controllers/mapaController');

// Mapa
// router.post('/:id/mover',      mapaController.mover);
// router.get( '/:id/visao',      mapaController.getVisao);

// Inventário / MaxHeap
// router.get( '/:id/inventario', partidaController.getInventario);
// router.post('/:id/coletar',    partidaController.coletarPista);

// Rota TSP
// router.get( '/:id/rota',       partidaController.getRota);

// Acusação
// router.post('/:id/acusar',     partidaController.acusar);

// Diálogo
// router.post('/:id/interagir',  dialogoController.interagir);
// router.post('/:id/escolha',    dialogoController.escolha);

module.exports = router;
