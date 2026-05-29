// TODO Dev 1 — Sprint 1 | Issue #3
// Controller de mapa: movimento e campo de visão
//
// Endpoints cobertos:
//   POST /api/partida/:id/mover  → move o detetive (valida limites do grid)
//   GET  /api/partida/:id/visao  → retorna células visíveis via BFS

const { calcularVisao } = require('../structures/BFS');

const mover = async (req, res) => {
  // TODO — req.body: { direcao: 'N' | 'S' | 'L' | 'O' }
  // validar limites 0–9, retornar nova posição + visao atualizada
};

const getVisao = async (req, res) => {
  // TODO
};

module.exports = { mover, getVisao };
