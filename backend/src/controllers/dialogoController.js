const ArvoreDecisao = require('../structures/ArvoreDecisao');
const Partida = require('../models/Partida');
const Pista = require('../models/Pista');
const dialogos = require('../seed/dialogos');

// ─── Mapeamento NPC → Nó raiz do diálogo ──────────────────────────────────

const NPC_POR_CELULA = {
  '3,4': 'A0', // Adelaide Cross
  '7,6': 'B0', // Victor Blackwood
  '1,9': 'C0', // Fynn O'Brien
  '9,4': 'D0', // Dr. Harlow
};

const NOME_POR_NPC = {
  'A0': 'Adelaide Cross',
  'B0': 'Victor Blackwood',
  'C0': "Fynn O'Brien",
  'D0': 'Dr. Harlow'
};

// Inicializa a árvore de decisão
const arvore = new ArvoreDecisao(dialogos);

// ─── Iniciar Diálogo ──────────────────────────────────────────────────────

const iniciarDialogo = async (req, res) => {
  try {
    const { id } = req.params;
    const { celula } = req.body;

    const partida = await Partida.findById(id);
    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    const key = `${celula.x},${celula.y}`;
    const noRaizId = NPC_POR_CELULA[key];

    if (!noRaizId) {
      return res.status(404).json({ erro: 'Nenhum NPC nesta célula' });
    }

    const no = arvore.get(noRaizId);
    if (!no) {
      return res.status(404).json({ erro: 'Nó de diálogo não encontrado' });
    }

    // Registra que o NPC foi interrogado
    const npcNome = NOME_POR_NPC[noRaizId] || 'NPC Desconhecido';
    const npcId = Object.keys(NPC_POR_CELULA).find(k => NPC_POR_CELULA[k] === noRaizId) || 'desconhecido';

    // Inicializa arrays se não existirem
    if (!partida.suspeitosInterrogados) {
      partida.suspeitosInterrogados = [];
    }

    const suspeitoExistente = partida.suspeitosInterrogados.find(
      s => s.npcId === npcId
    );

    if (!suspeitoExistente) {
      partida.suspeitosInterrogados.push({
        npcId: npcId,
        nome: npcNome,
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

    // Salva o NPC atual na partida
    partida.npcAtual = npcId;
    await partida.save();

    // Prepara o nó com informações de bloqueio
    const pistasColetadas = new Set(partida.pistasIdsColetadas || []);
    const noComBloqueios = prepararNoComBloqueios(no, pistasColetadas);

    res.json({
      no: noComBloqueios,
      npcId: npcId,
      npcNome: npcNome,
      totalInterrogacoes: partida.suspeitosInterrogados.length
    });

  } catch (err) {
    console.error('[iniciarDialogo]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Escolher Opção de Diálogo ────────────────────────────────────────────

const escolherOpcao = async (req, res) => {
  try {
    const { id } = req.params;
    const { noAtualId, index } = req.body;

    const partida = await Partida.findById(id);
    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    // Processa a escolha na árvore
    const resultado = arvore.escolher(noAtualId, index);
    if (!resultado) {
      return res.status(404).json({ erro: 'Escolha inválida' });
    }

    const xpGanho = resultado.xp || 5;

    // ─── Registra no histórico de diálogos ──────────────────────────────
    if (!partida.historicoDialogos) {
      partida.historicoDialogos = [];
    }

    const noAtual = arvore.get(noAtualId);
    partida.historicoDialogos.push({
      npcId: partida.npcAtual || 'desconhecido',
      npcNome: noAtual?.npc || 'NPC',
      noId: noAtualId,
      escolhaIndex: index,
      escolhaTexto: resultado.texto || 'Escolha realizada',
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
        if (resultado.proximoId) {
          suspeito.nodesVisitados.push(resultado.proximoId);
        }
      }
    }

    // ─── Adiciona XP ──────────────────────────────────────────────────────
    partida.xp += xpGanho;

    // ─── Verifica se a escolha desbloqueia uma pista ────────────────────
    let pistaDesbloqueada = null;
    if (resultado.pistaBloqueada) {
      if (!partida.pistasIdsColetadas) {
        partida.pistasIdsColetadas = [];
      }

      if (!partida.pistasIdsColetadas.includes(resultado.pistaBloqueada)) {
        const pista = await Pista.findOne({ id: resultado.pistaBloqueada });
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
    if (resultado.proximoId) {
      const noProximo = arvore.get(resultado.proximoId);
      if (noProximo) {
        const pistasColetadas = new Set(partida.pistasIdsColetadas || []);
        proximoNo = prepararNoComBloqueios(noProximo, pistasColetadas);
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
      dialogoConcluido: !resultado.proximoId
    });

  } catch (err) {
    console.error('[escolherOpcao]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Função auxiliar: preparar nó com bloqueios ──────────────────────────

function prepararNoComBloqueios(no, pistasColetadas) {
  return {
    id: no.id,
    npc: no.npc,
    texto: no.texto,
    escolhas: no.escolhas.map(escolha => ({
      texto: escolha.texto,
      proximoId: escolha.proximoId,
      pistaBloqueada: escolha.pistaBloqueada || null,
      pistaRequerida: escolha.pistaRequerida || null,
      xp: escolha.xp || 5,
      bloqueadaPorPista: escolha.pistaRequerida ? !pistasColetadas.has(escolha.pistaRequerida) : false,
      visitado: false,
      usado: false
    }))
  };
}

// ─── Obter Histórico de Diálogos ─────────────────────────────────────────

const getHistorico = async (req, res) => {
  try {
    const { id } = req.params;
    const partida = await Partida.findById(id);

    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    res.json({
      historicoDialogos: partida.historicoDialogos || [],
      totalInteracoes: partida.historicoDialogos?.length || 0,
      suspeitosInterrogados: partida.suspeitosInterrogados || [],
      totalSuspeitos: partida.suspeitosInterrogados?.length || 0
    });
  } catch (err) {
    console.error('[getHistorico]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Obter Status de Interrogação ────────────────────────────────────────

const getStatusInterrogacao = async (req, res) => {
  try {
    const { id } = req.params;
    const partida = await Partida.findById(id);

    if (!partida) {
      return res.status(404).json({ erro: 'Partida não encontrada' });
    }

    const todosNPCs = Object.keys(NPC_POR_CELULA).map(key => {
      const [x, y] = key.split(',').map(Number);
      const noId = NPC_POR_CELULA[key];
      return {
        id: key,
        nome: NOME_POR_NPC[noId] || 'NPC Desconhecido',
        celula: { x, y },
        noId: noId
      };
    });

    const status = todosNPCs.map(npc => {
      const interrogado = partida.suspeitosInterrogados?.find(
        s => s.npcId === npc.id
      );
      return {
        npcId: npc.id,
        nome: npc.nome,
        celula: npc.celula,
        interrogado: !!interrogado,
        primeiraVez: interrogado?.primeiraVez || null,
        ultimaVez: interrogado?.ultimaVez || null,
        totalEscolhas: interrogado?.escolhasFeitas?.length || 0,
        nodesVisitados: interrogado?.nodesVisitados?.length || 0
      };
    });

    res.json({
      status,
      totalInterrogados: status.filter(s => s.interrogado).length,
      totalNPCs: todosNPCs.length
    });
  } catch (err) {
    console.error('[getStatusInterrogacao]', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// ─── Exporta os controllers ───────────────────────────────────────────────

module.exports = {
  iniciarDialogo,
  escolherOpcao,
  getHistorico,
  getStatusInterrogacao
};