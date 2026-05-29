// TODO Dev 1 — Sprint 1 | Issue #3
// Controller de diálogo: navega na ArvoreDecisao
//
// Endpoints cobertos:
//   POST /api/partida/:id/interagir  → inicia diálogo (retorna nó raiz do NPC)
//   POST /api/partida/:id/escolha    → avança para próximo nó conforme escolha

const ArvoreDecisao = require('../structures/ArvoreDecisao');

// TODO: importar seed de diálogos (Dev 2)

const interagir = async (req, res) => {
  // TODO — req.body: { celula: { x, y } }
};

const escolha = async (req, res) => {
  // TODO — req.body: { noAtualId: string, index: number }
};

module.exports = { interagir, escolha };
