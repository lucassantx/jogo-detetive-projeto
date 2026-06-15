const MaxHeap = require('../structures/MaxHeap');
const { calcularRotaTSP } = require('../structures/TSP');
const { calcularVisao }   = require('../structures/BFS');
const Partida   = require('../models/Partida');
const Pista     = require('../models/Pista');
const Suspeito  = require('../models/Suspeito');

const criarPartida = async (req, res) => {
  try {
    const partida = await Partida.create({
      posicao: { x: 0, y: 0 },
      celulasReveladas: [{ x: 0, y: 0 }],
      pistasColetadas: [],
      xp: 0,
      status: 'em_andamento', // corrigido: era 'ativa'
    });
    res.status(201).json({ partidaId: partida._id });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const getPartida = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    res.json(partida);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const getInventario = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const heap = new MaxHeap();
    for (const pista of partida.pistasColetadas) heap.insert(pista);

    const ordenadas = [];
    const copia = new MaxHeap();
    copia.heap = [...heap.heap];
    while (copia.heap.length > 0) ordenadas.push(copia.extractMax());

    res.json({ inventario: ordenadas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const coletarPista = async (req, res) => {
  try {
    const { pistaId } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const pista = await Pista.findOne({ id: pistaId });
    if (!pista) return res.status(404).json({ erro: 'Pista não encontrada' });

    const jaColetada = partida.pistasColetadas.some(p => p.id === pistaId);
    if (jaColetada) return res.status(409).json({ erro: 'Pista já coletada' });

    partida.pistasColetadas.push({
      id:          pista.id,
      nome:        pista.nome,
      descricao:   pista.descricao,
      peso:        pista.peso,
      localizacao: pista.localizacao ?? pista.local ?? 'Mansão Blackwood', // compatível com seed do João
      categoria:   pista.categoria  ?? 'evidencia_fisica',
    });
    partida.xp += pista.peso * 10;
    await partida.save();

    const heap = new MaxHeap();
    for (const p of partida.pistasColetadas) heap.insert(p);

    res.json({ pistaColetada: pista, top3: heap.top3(), xpTotal: partida.xp });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const getRota = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const todasPistas = await Pista.find({});
    const idsColetadas = new Set(partida.pistasColetadas.map(p => p.id));
    const locaisPendentes = todasPistas
      .filter(p => !idsColetadas.has(p.id))
      .map(p => ({ id: p.id, x: p.celula.x, y: p.celula.y }));

    if (locaisPendentes.length === 0) {
      return res.json({ rota: [], mensagem: 'Todas as pistas coletadas' });
    }

    const rota = calcularRotaTSP(locaisPendentes);
    res.json({ rota, algoritmo: locaisPendentes.length <= 15 ? 'held-karp' : 'heuristica' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const acusar = async (req, res) => {
  try {
    const { suspeitoId } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const heap = new MaxHeap();
    for (const p of partida.pistasColetadas) heap.insert(p);
    const top3 = heap.top3();

    const suspeito = await Suspeito.findOne({ id: suspeitoId });
    if (!suspeito) return res.status(404).json({ erro: 'Suspeito não encontrado' });

    const acertou = suspeito.ehAssassino;
    partida.status = acertou ? 'vitoria' : 'derrota';
    await partida.save();

    res.json({
      acertou,
      suspeitoAcusado: suspeito.nome,
      top3,
      argumento: acertou
        ? `Com base nas ${top3.length} pistas mais relevantes, a acusação é conclusiva.`
        : `${suspeito.nome} não é o assassino. ${suspeito.motivo}`,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const getVisao = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });
    const celulas = calcularVisao(partida.posicao);
    res.json({ visao: celulas });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { criarPartida, getPartida, getInventario, coletarPista, getRota, acusar, getVisao };