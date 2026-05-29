// TODO Dev 1 — Sprint 1/2 | Issues #1 #2
// Controller de partida: gerencia estado do jogo e integra MaxHeap + TSP
//
// Endpoints cobertos por este controller:
//   GET  /api/partida/:id/inventario  → retorna heap ordenado (MaxHeap)
//   POST /api/partida/:id/coletar     → insere pista no MaxHeap
//   GET  /api/partida/:id/rota        → retorna rota TSP com locais pendentes
//   POST /api/partida/:id/acusar      → top3() do heap + veredicto
//   GET  /api/partida/:id/visao       → campo de visão BFS

const MaxHeap = require('../structures/MaxHeap');
const { calcularRotaTSP } = require('../structures/TSP');
const { calcularVisao } = require('../structures/BFS');

// TODO: importar model Partida (Dev 2)

const getInventario = async (req, res) => {
  // TODO
};

const coletarPista = async (req, res) => {
  // TODO
};

const getRota = async (req, res) => {
  // TODO
};

const acusar = async (req, res) => {
  // TODO — chamar MaxHeap.top3() e retornar veredicto
};

const getVisao = async (req, res) => {
  // TODO
};

module.exports = { getInventario, coletarPista, getRota, acusar, getVisao };
