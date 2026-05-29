// TODO Dev 1 — Sprint 1 | Issue #3
// Implementar Árvore de Decisão para os diálogos dos NPCs
//
// Estrutura de um nó:
// {
//   id: string,           // ex: 'A0', 'A1a', 'B3'
//   npc: string,
//   texto: string,
//   escolhas: [
//     { texto: string, proximoId: string, pistaBloqueada?: string, xp: number }
//   ]
// }
//
// Complexidade: get O(1) via Map | escolher O(1)
//
// Integração: usado por dialogoController → /interagir e /escolha

class ArvoreDecisao {
  constructor(nos) {
    // TODO — armazenar em Map<id, no>
  }

  get(id) {
    // TODO — retorna nó ou null
  }

  escolher(noAtualId, index) {
    // TODO — retorna { proximoNo, pistaBloqueada, xp } ou null
  }
}

module.exports = ArvoreDecisao;
