const ArvoreDecisao = require('../structures/ArvoreDecisao');
const Partida = require('../models/Partida');
const dialogos = require('../seed/dialogos');

// mapa NPC por célula: qual nó raiz disparar ao entrar na célula
const NPC_POR_CELULA = {
  '1,1': 'A0', // Biblioteca — Adelaide Cross
  '0,1': 'B0', // Escritório — Victor Blackwood
  '0,2': 'C0', // Quarto do Guarda — Fynn O'Brien
};

const arvore = new ArvoreDecisao(dialogos);

// POST /api/partida/:id/interagir — inicia diálogo da célula, retorna nó raiz
const interagir = async (req, res) => {
  try {
    const { celula } = req.body; // { x: number, y: number }
    const key = `${celula.x},${celula.y}`;
    const noRaizId = NPC_POR_CELULA[key];

    if (!noRaizId) {
      return res.status(404).json({ erro: 'Nenhum NPC nesta célula' });
    }

    const no = arvore.get(noRaizId);
    if (!no) return res.status(404).json({ erro: 'Nó de diálogo não encontrado' });

    res.json({ no });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /api/partida/:id/escolha — avança na árvore e retorna próximo nó
const escolha = async (req, res) => {
  try {
    const { noAtualId, index } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const resultado = arvore.escolher(noAtualId, index);
    if (!resultado) return res.status(404).json({ erro: 'Escolha inválida' });

    // concede XP ao jogador
    partida.xp += resultado.xp || 0;

    // se a escolha desbloqueia pista, anota no estado
    let pistaBloqueada = null;
    if (resultado.pistaBloqueada) {
      pistaBloqueada = resultado.pistaBloqueada;
      // a coleta efetiva ocorre via /coletar; aqui só sinalizamos
    }

    await partida.save();

    const proximoNo = resultado.proximoId ? arvore.get(resultado.proximoId) : null;
    res.json({ proximoNo, pistaBloqueada, xpGanho: resultado.xp || 0, xpTotal: partida.xp });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { interagir, escolha };