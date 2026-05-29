// TODO Dev 1 — Sprint 1 | Issue #2
// Implementar TSP heurístico: Vizinho Mais Próximo + refinamento 2-opt
//
// Input:  Array de { id: string, x: number, y: number }
// Output: Array na ordem de visitação ótima
//
// Etapas:
//   1. vizinhoMaisProximo(locais) → rota inicial              O(n²)
//   2. doisOpt(rota)              → elimina cruzamentos       O(n²) / iteração
//
// Integração: usado por partidaController → endpoint GET /api/partida/:id/rota

function calcularRotaTSP(locais) {
  // TODO
}

// Funções auxiliares (podem ser exportadas para teste unitário)
function vizinhoMaisProximo(locais) {
  // TODO
}

function doisOpt(rota) {
  // TODO
}

module.exports = { calcularRotaTSP, vizinhoMaisProximo, doisOpt };
