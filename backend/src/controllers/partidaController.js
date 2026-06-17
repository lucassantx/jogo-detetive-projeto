const MaxHeap = require('../structures/MaxHeap');
const { calcularRotaTSP } = require('../structures/TSP');
const { calcularVisao } = require('../structures/BFS');
const Partida = require('../models/Partida');
const Pista = require('../models/Pista');
const Suspeito = require('../models/Suspeito');

// ─── Criar Partida ──────────────────────────────────────────────────────────

const criarPartida = async (req, res) => {
  try {
    // Calcula células iniciais reveladas com BFS
    const celulasIniciais = calcularVisao({ x: 0, y: 0 }, 3);

    const partida = await Partida.create({
      posicao: { x: 0, y: 0 },
      celulasReveladas: celulasIniciais.map(c => `${c.x},${c.y}`), // Formato string
      pistasColetadas: [],
      pistasIdsColetadas: [], // Array de IDs para facilitar consultas
      xp: 0,
      status: 'em_andamento',
      historicoDialogos: [],
      suspeitosInterrogados: [],
      concluidaEm: null,
      acusado: null,
    });

    res.status(201).json({ partidaId: partida._id });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// ─── Carregar Partida ──────────────────────────────────────────────────────

const getPartida = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    // Busca todas as pistas para enviar o estado completo
    const todasPistas = await Pista.find({});

    // Converte para o formato esperado pelo frontend
    const pistasComStatus = todasPistas.map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      peso: p.peso,
      celula: p.celula,
      coletada: partida.pistasIdsColetadas.includes(p.id)
    }));

    // Busca NPCs (assumindo que existem no seed ou em outra coleção)
    const NPCs = await getNPCs();

    const response = {
      partidaId: partida._id,
      posicao: partida.posicao,
      celulasReveladas: partida.celulasReveladas || [],
      pistas: pistasComStatus,
      pistasColetadas: partida.pistasColetadas || [],
      pistasIdsColetadas: partida.pistasIdsColetadas || [],
      npcs: NPCs,
      xp: partida.xp || 0,
      status: partida.status || 'em_andamento',
      historicoDialogos: partida.historicoDialogos || [],
      suspeitosInterrogados: partida.suspeitosInterrogados || [],
      concluidaEm: partida.concluidaEm || null,
      acusado: partida.acusado || null,
      iniciadaEm: partida.iniciadaEm || partida.createdAt
    };

    res.json(response);
  } catch (err) {
    console.error('[getPartida]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Função auxiliar para buscar NPCs ─────────────────────────────────────

async function getNPCs() {
  // Se tiver uma coleção NPC, busque do banco
  // Senão, retorne os dados estáticos
  try {
    const NPC = require('../models/NPC');
    const npcs = await NPC.find({});
    if (npcs.length > 0) return npcs;
  } catch (e) {
    // Fallback para dados estáticos
  }

  // Dados estáticos dos NPCs (do seed)
  return [
    { id: 'adelaide', nome: 'Adelaide Cross', celula: { x: 3, y: 4 }, dialogoInicial: 'A0' },
    { id: 'victor', nome: 'Victor Blackwood', celula: { x: 7, y: 6 }, dialogoInicial: 'B0' },
    { id: 'fynn', nome: "Fynn O'Brien", celula: { x: 1, y: 9 }, dialogoInicial: 'C0' },
    { id: 'harlow', nome: 'Dr. Harlow', celula: { x: 9, y: 4 }, dialogoInicial: 'D0' },
  ];
}

// ─── Inventário (ordenado por peso) ──────────────────────────────────────

const getInventario = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const heap = new MaxHeap();
    for (const pista of partida.pistasColetadas) {
      heap.insert(pista);
    }

    const ordenadas = [];
    const copia = new MaxHeap();
    copia.heap = [...heap.heap];
    while (copia.heap.length > 0) {
      ordenadas.push(copia.extractMax());
    }

    res.json({
      inventario: ordenadas,
      pistasIdsColetadas: partida.pistasIdsColetadas || []
    });
  } catch (err) {
    console.error('[getInventario]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Coletar Pista ────────────────────────────────────────────────────────

const coletarPista = async (req, res) => {
  try {
    const { pistaId } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const pista = await Pista.findOne({ id: pistaId });
    if (!pista) return res.status(404).json({ erro: 'Pista não encontrada' });

    const novaPista = {
      id: pista.id,
      nome: pista.nome,
      descricao: pista.descricao,
      peso: pista.peso,
      celula: pista.celula || { x: 0, y: 0 },
      coletada: true,
      categoria: pista.categoria || 'evidencia_fisica',
    };

    // Operação atômica
    const partida = await Partida.findOneAndUpdate(
      {
        _id: req.params.id,
        'pistasColetadas.id': { $ne: pistaId },
      },
      {
        $push: {
          pistasColetadas: novaPista,
          pistasIdsColetadas: pistaId
        },
        $inc: { xp: pista.peso * 10 },
      },
      { new: true }
    );

    if (!partida) {
      const existe = await Partida.findById(req.params.id);
      if (!existe) return res.status(404).json({ erro: 'Partida não encontrada' });
      return res.status(409).json({ erro: 'Pista já coletada' });
    }

    // Ordena inventário com MaxHeap para retornar top3
    const heap = new MaxHeap();
    for (const p of partida.pistasColetadas) heap.insert(p);

    res.json({
      pistaColetada: pista,
      top3: heap.top3(),
      xpTotal: partida.xp,
      pistasIdsColetadas: partida.pistasIdsColetadas,
      inventario: partida.pistasColetadas
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// ─── Rota TSP ─────────────────────────────────────────────────────────────

const getRota = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const todasPistas = await Pista.find({});
    const idsColetadas = new Set(partida.pistasIdsColetadas || []);

    const locaisPendentes = todasPistas
      .filter(p => !idsColetadas.has(p.id))
      .map(p => ({
        id: p.id,
        x: p.celula.x,
        y: p.celula.y
      }));

    if (locaisPendentes.length === 0) {
      return res.json({ rota: [], mensagem: 'Todas as pistas coletadas' });
    }

    // Inclui posição atual do detetive como ponto de partida
    const DETETIVE_ID = '__detetive__';
    const pontoDetetive = {
      id: DETETIVE_ID,
      x: partida.posicao.x,
      y: partida.posicao.y
    };
    const pontos = [pontoDetetive, ...locaisPendentes];

    const cicloCompleto = calcularRotaTSP(pontos);

    // Rotaciona para começar no detetive
    const idxDetetive = cicloCompleto.findIndex(p => p.id === DETETIVE_ID);
    const ciclo = idxDetetive > 0
      ? [...cicloCompleto.slice(idxDetetive), ...cicloCompleto.slice(0, idxDetetive)]
      : cicloCompleto;
    const rota = ciclo.slice(1);

    res.json({
      rota,
      algoritmo: pontos.length <= 15 ? 'held-karp' : 'heuristica',
      pistasPendentes: locaisPendentes.length
    });
  } catch (err) {
    console.error('[getRota]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Acusar ────────────────────────────────────────────────────────────────

// ─── Acusar ────────────────────────────────────────────────────────────────

const acusar = async (req, res) => {
  try {
    const { suspeitoId } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    // Pega top3 do heap
    const heap = new MaxHeap();
    for (const p of partida.pistasColetadas) heap.insert(p);
    const top3 = heap.top3();

    const suspeito = await Suspeito.findOne({ id: suspeitoId });
    if (!suspeito) return res.status(404).json({ erro: 'Suspeito não encontrado' });

    const acertou = suspeito.ehAssassino;

    // Gera argumento baseado nas evidências
    const argumento = gerarArgumento(suspeito, top3, acertou);

    // ATUALIZA DIRETAMENTE OS CAMPOS
    partida.status = acertou ? 'vitoria' : 'derrota';
    partida.acusado = {
      suspeitoId: suspeito.id,
      nome: suspeito.nome,
      acertou: acertou,
      argumento: argumento,
      evidencias: top3.map(p => p.nome),
      timestamp: new Date()
    };
    partida.concluidaEm = new Date();

    // SALVA A PARTIDA
    await partida.save();

    console.log('[acusar] Partida atualizada com sucesso!');
    console.log('[acusar] Status:', partida.status);
    console.log('[acusar] Acusado:', partida.acusado ? 'preenchido' : 'null');
    console.log('[acusar] ConcluidaEm:', partida.concluidaEm);

    res.json({
      acertou,
      suspeitoAcusado: suspeito.nome,
      top3: top3.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        peso: p.peso
      })),
      argumento,
      mensagem: acertou
        ? 'Parabens! Voce desvendou o misterio e prendeu o assassino!'
        : 'O verdadeiro assassino e Victor Blackwood. Continue investigando!',
      status: acertou ? 'vitoria' : 'derrota',
      statusJogo: 'fim'
    });
  } catch (err) {
    console.error('[acusar]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Função auxiliar: gerar argumento ──────────────────────────────────

function gerarArgumento(suspeito, evidencias, acertou) {
  if (acertou) {
    return `Excelente trabalho, detetive! Sua investigacao foi impecavel. 
As evidencias apontam claramente para ${suspeito.nome} como o assassino de Sir Edmund Blackwood.

Cadeia de evidencias:
${evidencias.map((e, i) => `  ${i + 1}. ${e.nome}: ${e.descricao}`).join('\n')}

O motivo? ${suspeito.motivo || 'Vinganca e ganancia.'}

Caso encerrado! O assassino esta preso.`;
  } else {
    return `Sua acusacao contra ${suspeito.nome} nao se sustenta.

Evidencias consideradas:
${evidencias.map((e, i) => `  ${i + 1}. ${e.nome}: ${e.descricao}`).join('\n')}

O verdadeiro assassino e Victor Blackwood, sobrinho da vitima.
Motivo: Heranca e ressentimento acumulado.

Continue investigando para encontrar o culpado!`;
  }
}

// ─── Função auxiliar: gerar argumento ──────────────────────────────────

function gerarArgumento(suspeito, evidencias, acertou) {
  if (acertou) {
    return `Excelente trabalho, detetive! Sua investigacao foi impecavel. 
As evidencias apontam claramente para ${suspeito.nome} como o assassino de Sir Edmund Blackwood.

Cadeia de evidencias:
${evidencias.map((e, i) => `  ${i + 1}. ${e.nome}: ${e.descricao}`).join('\n')}

O motivo? ${suspeito.motivo || 'Vinganca e ganancia.'}

Caso encerrado! O assassino esta preso.`;
  } else {
    return `Sua acusacao contra ${suspeito.nome} nao se sustenta.

Evidencias consideradas:
${evidencias.map((e, i) => `  ${i + 1}. ${e.nome}: ${e.descricao}`).join('\n')}

O verdadeiro assassino e Victor Blackwood, sobrinho da vitima.
Motivo: Heranca e ressentimento acumulado.

Continue investigando para encontrar o culpado!`;
  }
}

// ─── Visão (BFS) ─────────────────────────────────────────────────────────

const getVisao = async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const celulas = calcularVisao(partida.posicao, 3);

    // Converte para o formato esperado
    const visaoFormatada = celulas.map(c => ({
      x: c.x,
      y: c.y
    }));

    res.json({
      visao: visaoFormatada,
      posicao: partida.posicao
    });
  } catch (err) {
    console.error('[getVisao]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Mover ──────────────────────────────────────────────────────────────────

const mover = async (req, res) => {
  try {
    const { direcao } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ erro: 'Partida não encontrada' });

    const movimentos = {
      N: { x: 0, y: -1 },
      S: { x: 0, y: 1 },
      L: { x: 1, y: 0 },
      O: { x: -1, y: 0 }
    };
    const delta = movimentos[direcao];
    if (!delta) return res.status(400).json({ erro: 'Direção inválida' });

    const novaPosicao = {
      x: Math.max(0, Math.min(9, partida.posicao.x + delta.x)),
      y: Math.max(0, Math.min(9, partida.posicao.y + delta.y))
    };

    // Calcula visão com BFS
    const visao = calcularVisao(novaPosicao, 3);

    // Atualiza células reveladas
    const celulasAtuais = new Set(partida.celulasReveladas || []);
    visao.forEach(c => celulasAtuais.add(`${c.x},${c.y}`));

    partida.posicao = novaPosicao;
    partida.celulasReveladas = Array.from(celulasAtuais);
    partida.updatedAt = new Date();

    await partida.save();

    // Verifica se há pista na nova posição
    const todasPistas = await Pista.find({});
    const idsColetadas = new Set(partida.pistasIdsColetadas || []);
    const pistaAqui = todasPistas.find(p =>
      p.celula.x === novaPosicao.x &&
      p.celula.y === novaPosicao.y &&
      !idsColetadas.has(p.id)
    );

    res.json({
      posicao: partida.posicao,
      visao: visao.map(c => ({ x: c.x, y: c.y })),
      celulasReveladas: partida.celulasReveladas,
      pistaAqui: pistaAqui || null
    });
  } catch (err) {
    console.error('[mover]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Interagir com NPC ────────────────────────────────────────────────────

const interagir = async (req, res) => {
  try {
    const { celula } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    // Busca NPC na posição
    const npcs = await getNPCs();
    const npc = npcs.find(n => n.celula.x === celula.x && n.celula.y === celula.y);

    if (!npc) {
      return res.status(404).json({
        erro: 'Nenhum NPC encontrado nesta posição',
        posicao: celula
      });
    }

    // Importa a árvore de decisão e os diálogos diretamente
    const ArvoreDecisao = require('../structures/ArvoreDecisao');
    const dialogos = require('../seed/dialogos');
    const arvore = new ArvoreDecisao(dialogos);

    const no = arvore.get(npc.dialogoInicial);
    if (!no) {
      return res.status(404).json({
        erro: 'Diálogo não encontrado',
        dialogoInicial: npc.dialogoInicial
      });
    }

    // Registra interrogação
    if (!partida.suspeitosInterrogados) {
      partida.suspeitosInterrogados = [];
    }

    const suspeitoExistente = partida.suspeitosInterrogados.find(
      s => s.npcId === npc.id
    );

    if (!suspeitoExistente) {
      partida.suspeitosInterrogados.push({
        npcId: npc.id,
        nome: npc.nome,
        primeiraVez: new Date(),
        ultimaVez: new Date(),
        nodesVisitados: [no.id],
        escolhasFeitas: []
      });
    } else {
      suspeitoExistente.ultimaVez = new Date();
      if (!suspeitoExistente.nodesVisitados.includes(no.id)) {
        suspeitoExistente.nodesVisitados.push(no.id);
      }
    }

    partida.npcAtual = npc.id;
    await partida.save();

    // Prepara o nó com informações de bloqueio
    const pistasColetadas = new Set(partida.pistasIdsColetadas || []);
    const noComBloqueios = {
      id: no.id,
      npc: no.npc,
      texto: no.texto,
      escolhas: no.escolhas.map((escolha) => ({
        texto: escolha.texto,
        proximoId: escolha.proximoId || null,
        pistaBloqueada: escolha.pistaBloqueada || null,
        pistaRequerida: escolha.pistaRequerida || null,
        xp: escolha.xp || 5,
        bloqueadaPorPista: escolha.pistaRequerida ? !pistasColetadas.has(escolha.pistaRequerida) : false,
        visitado: false,
        usado: false
      }))
    };

    res.json({
      no: noComBloqueios,
      npcId: npc.id,
      npcNome: npc.nome,
      totalInterrogacoes: partida.suspeitosInterrogados.length
    });

  } catch (err) {
    console.error('[interagir]', err.message);
    res.status(500).json({ erro: err.message, stack: err.stack });
  }
};

// ─── Escolher opção de diálogo ──────────────────────────────────────────

const escolher = async (req, res) => {
  try {
    const { noAtualId, index } = req.body;
    const partida = await Partida.findById(req.params.id);
    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    // Importa a árvore de decisão e os diálogos diretamente
    const ArvoreDecisao = require('../structures/ArvoreDecisao');
    const dialogos = require('../seed/dialogos');
    const arvore = new ArvoreDecisao(dialogos);

    const noAtual = arvore.get(noAtualId);
    if (!noAtual) {
      return res.status(404).json({ erro: 'Nó de diálogo não encontrado' });
    }

    if (index < 0 || index >= noAtual.escolhas.length) {
      return res.status(400).json({
        erro: 'Escolha inválida',
        maxIndex: noAtual.escolhas.length - 1
      });
    }

    const escolha = noAtual.escolhas[index];
    const xpGanho = escolha.xp || 5;

    // ─── Verifica se a escolha requer uma pista ──────────────────────────
    if (escolha.pistaRequerida) {
      const idsColetadas = new Set(partida.pistasIdsColetadas || []);
      if (!idsColetadas.has(escolha.pistaRequerida)) {
        return res.status(403).json({
          erro: 'Pista requerida não coletada',
          pistaRequerida: escolha.pistaRequerida,
          mensagem: `Você precisa encontrar a pista "${escolha.pistaRequerida}" primeiro`
        });
      }
    }

    // ─── Registra no histórico de diálogos ──────────────────────────────
    if (!partida.historicoDialogos) {
      partida.historicoDialogos = [];
    }

    partida.historicoDialogos.push({
      npcId: partida.npcAtual || 'desconhecido',
      npcNome: noAtual.npc || 'NPC',
      noId: noAtualId,
      escolhaIndex: index,
      escolhaTexto: escolha.texto,
      timestamp: new Date()
    });

    // ─── Atualiza suspeitosInterrogados ──────────────────────────────────
    const npcId = partida.npcAtual;
    if (npcId) {
      if (!partida.suspeitosInterrogados) {
        partida.suspeitosInterrogados = [];
      }

      const suspeito = partida.suspeitosInterrogados.find(s => s.npcId === npcId);
      if (suspeito) {
        suspeito.escolhasFeitas.push(index);
        suspeito.ultimaVez = new Date();
        if (escolha.proximoId) {
          suspeito.nodesVisitados.push(escolha.proximoId);
        }
      }
    }

    // ─── Adiciona XP ──────────────────────────────────────────────────────
    partida.xp += xpGanho;

    // ─── Verifica se a escolha desbloqueia uma pista ────────────────────
    let pistaDesbloqueada = null;
    if (escolha.pistaBloqueada) {
      if (!partida.pistasIdsColetadas) {
        partida.pistasIdsColetadas = [];
      }

      if (!partida.pistasIdsColetadas.includes(escolha.pistaBloqueada)) {
        const pista = await Pista.findOne({ id: escolha.pistaBloqueada });
        if (pista) {
          partida.pistasIdsColetadas.push(pista.id);
          if (!partida.pistasColetadas) {
            partida.pistasColetadas = [];
          }
          partida.pistasColetadas.push({
            id: pista.id,
            nome: pista.nome,
            descricao: pista.descricao,
            peso: pista.peso,
            celula: pista.celula,
            coletada: true,
            descobertaEm: new Date()
          });
          pistaDesbloqueada = pista;
        }
      }
    }

    await partida.save();

    // ─── Busca próximo nó ──────────────────────────────────────────────────
    let proximoNo = null;
    if (escolha.proximoId) {
      const noProximo = arvore.get(escolha.proximoId);
      if (noProximo) {
        const pistasColetadas = new Set(partida.pistasIdsColetadas || []);
        proximoNo = {
          id: noProximo.id,
          npc: noProximo.npc,
          texto: noProximo.texto,
          escolhas: noProximo.escolhas.map((e) => ({
            texto: e.texto,
            proximoId: e.proximoId || null,
            pistaBloqueada: e.pistaBloqueada || null,
            pistaRequerida: e.pistaRequerida || null,
            xp: e.xp || 5,
            bloqueadaPorPista: e.pistaRequerida ? !pistasColetadas.has(e.pistaRequerida) : false,
            visitado: false,
            usado: false
          }))
        };
      }
    }

    res.json({
      proximoNo,
      xpTotal: partida.xp,
      xpGanho: xpGanho,
      pistaDesbloqueada: pistaDesbloqueada ? {
        id: pistaDesbloqueada.id,
        nome: pistaDesbloqueada.nome,
        descricao: pistaDesbloqueada.descricao,
        peso: pistaDesbloqueada.peso
      } : null,
      historicoAtualizado: partida.historicoDialogos.length,
      suspeitosInterrogados: partida.suspeitosInterrogados.length,
      dialogoConcluido: !escolha.proximoId
    });

  } catch (err) {
    console.error('[escolher]', err.message);
    res.status(500).json({ erro: err.message, stack: err.stack });
  }
};





// ─── Health Check ──────────────────────────────────────────────────────────

const health = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
};

// ─── Exporta todos os controllers ──────────────────────────────────────────

module.exports = {
  criarPartida,
  getPartida,
  getInventario,
  coletarPista,
  getRota,
  acusar,
  getVisao,
  mover,
  interagir,
  escolher,
  health
};