const ArvoreDecisao = require('../structures/ArvoreDecisao');
const Partida = require('../models/Partida');
const dialogos = require('../seed/dialogos');

const NPC_POR_CELULA = {
  '3,4': 'A0', // Adelaide Cross
  '7,6': 'B0', // Victor Blackwood
  '1,9': 'C0', // Fynn O'Brien
};

const arvore = new ArvoreDecisao(dialogos);

const interagir = async (req, res) => {
  try {
    const { celula } = req.body;
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

const escolha = async (req, res) => {
  try {
    const { noAtualId, index } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const resultado = arvore.escolher(noAtualId, index);
    if (!resultado) return res.status(404).json({ erro: 'Escolha inválida' });

    partida.xp += resultado.xp || 0;

    let pistaBloqueada = null;
    if (resultado.pistaBloqueada) {
      pistaBloqueada = resultado.pistaBloqueada;
    }

    await partida.save();

    const proximoNo = resultado.proximoId ? arvore.get(resultado.proximoId) : null;
    res.json({ proximoNo, pistaBloqueada, xpGanho: resultado.xp || 0, xpTotal: partida.xp });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { interagir, escolha };