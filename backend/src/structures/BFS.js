// TODO Dev 1 — Sprint 1 | Issue #3
// BFS para calcular campo de visão do detetive no grid 10×10
//
// Input:  posicao { x, y }, raio (default 3), tamanhoGrid (default 10)
// Output: Array de { x, y } das células dentro do raio de visão
//
// Restrições:
//   - Não incluir células com x < 0, y < 0, x >= tamanhoGrid, y >= tamanhoGrid
//   - Testar cantos: (0,0), (9,9), (0,9), (9,0)
//
// Complexidade: O(V+E) no grid
//
// Integração: usado por mapaController → endpoint GET /api/partida/:id/visao

function calcularVisao(posicao, raio = 3, tamanhoGrid = 10) {
  // TODO
}

module.exports = { calcularVisao };
