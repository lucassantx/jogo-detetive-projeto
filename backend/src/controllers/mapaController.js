const { calcularVisao } = require('../structures/BFS');
const Partida = require('../models/Partida');

const DIRECOES = {
  N: { dx: 0,  dy: -1 },
  S: { dx: 0,  dy: 1  },
  L: { dx: 1,  dy: 0  },
  O: { dx: -1, dy: 0  },
};

// POST /api/partida/:id/mover — move o detetive e retorna nova posição + visão
const mover = async (req, res) => {
  try {
    const { direcao } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const delta = DIRECOES[direcao];
    if (!delta) return res.status(400).json({ erro: 'Direção inválida. Use N, S, L ou O.' });

    const nx = partida.posicao.x + delta.dx;
    const ny = partida.posicao.y + delta.dy;

    // bloqueia movimento fora do grid 10×10
    if (nx < 0 || nx > 9 || ny < 0 || ny > 9) {
      return res.status(400).json({ erro: 'Movimento fora dos limites do grid' });
    }

    partida.posicao = { x: nx, y: ny };

    // registra célula revelada se ainda não visitada
    const jaRevelada = partida.celulasReveladas.some(c => c.x === nx && c.y === ny);
    if (!jaRevelada) partida.celulasReveladas.push({ x: nx, y: ny });

    await partida.save();

    const visao = calcularVisao(partida.posicao);
    res.json({ posicao: partida.posicao, visao, celulasReveladas: partida.celulasReveladas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /api/partida/:id/visao — BFS a partir da posição atual
const getVisao = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const visao = calcularVisao(partida.posicao);
    res.json({ posicao: partida.posicao, visao });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { mover, getVisao };