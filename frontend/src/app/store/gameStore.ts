import { create } from 'zustand';

const API = '/api/partida';

// ─── Tipos exportados ────────────────────────────────────────────────────────

export interface Pista {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
  celula: { x: number; y: number };
  coletada: boolean;
}

export interface NPC {
  id: string;
  nome: string;
  celula: { x: number; y: number };
  dialogoInicial: string;
}

export interface Escolha {
  texto: string;
  proximoId: string | null;
  pistaBloqueada: string | null;
  xp: number;
  usado?: boolean; // marcado dinamicamente — não vem do backend
}

export interface NoDialogo {
  id: string;
  npc: string;
  texto: string;
  escolhas: Escolha[];
}

export interface Notificacao {
  id: string;
  nome: string;
  peso: number;
}

export interface RotaTSPItem {
  id: string;
  x: number;
  y: number;
}

export type StatusJogo = 'titulo' | 'jogando' | 'acusando' | 'fim';

// Quantidade de escolhas no nó raiz de cada NPC (= nº máximo de visitas distintas)
// Derivado de DIALOGOS_LOCAL — deve ser atualizado se o backend mudar o seed.
export const MAX_INTERACOES_NPC: Record<string, number> = {
  adelaide: 3, // A0 tem 3 escolhas raiz
  victor:   3, // B0 tem 3 escolhas raiz
  fynn:     3, // C0 tem 3 escolhas raiz
};

interface GameState {
  partidaId: string | null;
  posicao: { x: number; y: number };
  celulasReveladas: Set<string>;
  pistas: Pista[];
  npcs: NPC[];
  pistasColetadas: Pista[];
  xp: number;
  dialogoAtivo: boolean;
  noDialogoAtual: string | null;
  noAtualData: NoDialogo | null;
  npcAtual: string | null;
  statusJogo: StatusJogo;
  notificacoes: Notificacao[];
  rotaTSP: RotaTSPItem[];
  mostrandoRota: boolean;
  // índices das escolhas raiz já usadas por NPC — impede repetição de rota
  escolhasRaizUsadas: Record<string, number[]>;

  mover: (dx: number, dy: number) => void;
  coletarPista: (pistaId: string) => void;
  iniciarDialogo: (npcId: string) => void;
  fecharDialogo: () => void;
  avancarDialogo: (noAtualId: string, index: number) => void;
  removerNotificacao: (id: string) => void;
  setStatusJogo: (status: StatusJogo) => void;
  carregarRota: () => void;
  toggleRota: () => void;
}

// ─── BFS local — otimista (espelha backend/src/structures/BFS.js) ─────────────

function bfsReveal(pos: { x: number; y: number }, raio = 3): { x: number; y: number }[] {
  const resultado: { x: number; y: number }[] = [];
  const visitado = new Set<string>();
  const fila: { x: number; y: number; dist: number }[] = [{ ...pos, dist: 0 }];

  while (fila.length > 0) {
    const { x, y, dist } = fila.shift()!;
    const key = `${x},${y}`;
    if (visitado.has(key) || x < 0 || y < 0 || x >= 10 || y >= 10) continue;
    visitado.add(key);
    resultado.push({ x, y });
    if (dist < raio) {
      fila.push({ x: x + 1, y, dist: dist + 1 });
      fila.push({ x: x - 1, y, dist: dist + 1 });
      fila.push({ x, y: y + 1, dist: dist + 1 });
      fila.push({ x, y: y - 1, dist: dist + 1 });
    }
  }
  return resultado;
}

// ─── Diálogos locais — fallback quando backend não está disponível ────────────
// Conteúdo espelha backend/src/seed/dialogos.js

const DIALOGOS_LOCAL: Record<string, NoDialogo> = {
  A0:  { id: 'A0',  npc: 'Adelaide Cross',   texto: 'Eu sabia que alguém viria. Sabia desde o momento em que encontrei ele.',
    escolhas: [
      { texto: 'Onde estava na hora da morte?', proximoId: 'A1',  pistaBloqueada: null,          xp: 10 },
      { texto: 'O senhor tinha inimigos?',       proximoId: 'A2',  pistaBloqueada: null,          xp: 10 },
      { texto: 'Vi um frasco estranho aqui.',    proximoId: 'A3',  pistaBloqueada: null,          xp: 15 },
    ]},
  A1:  { id: 'A1',  npc: 'Adelaide Cross',   texto: 'O chá foi entregue por volta das 22h30. Eu mesma subi. Ele estava escrevendo na escrivaninha.',
    escolhas: [
      { texto: 'Mais alguém entrou na cozinha?', proximoId: 'A1a', pistaBloqueada: null,          xp: 20 },
      { texto: 'O chá tinha algo diferente?',    proximoId: 'A1b', pistaBloqueada: null,          xp: 10 },
      { texto: 'Obrigado, isso é tudo.',          proximoId: null,  pistaBloqueada: null,          xp:  5 },
    ]},
  A1a: { id: 'A1a', npc: 'Adelaide Cross',   texto: "O Victor passou por lá. Queria um copo d'água.",
    escolhas: [{ texto: 'Anotar informação.', proximoId: null, pistaBloqueada: null, xp: 20 }]},
  A1b: { id: 'A1b', npc: 'Adelaide Cross',   texto: 'Não que eu tenha notado. Mas eu não provei.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A2:  { id: 'A2',  npc: 'Adelaide Cross',   texto: 'Inimigos... ou pessoas que ele decepcionou. É diferente.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3:  { id: 'A3',  npc: 'Adelaide Cross',   texto: 'Meu Deus. Eu vi esse frasco no cofre semana passada.',
    escolhas: [
      { texto: 'Quem mais sabia da combinação?', proximoId: 'A3a', pistaBloqueada: 'chave_extra',  xp: 25 },
      { texto: 'Por que guardava arsênico?',     proximoId: 'A3b', pistaBloqueada: null,            xp: 20 },
      { texto: 'Você escreveu uma carta?',       proximoId: 'A3c', pistaBloqueada: null,            xp: 30 },
    ]},
  A3a: { id: 'A3a', npc: 'Adelaide Cross',   texto: 'Só ele, eu e o guarda Fynn. O cofre ficava na biblioteca.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3b: { id: 'A3b', npc: 'Adelaide Cross',   texto: 'Ele dizia que era para ratos. Mas nunca havia ratos aqui.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3c: { id: 'A3c', npc: 'Adelaide Cross',   texto: 'Como sabe disso? Eu... escrevi sim. Mas foi só um desabafo.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: 'carta_anonima', xp: 30 }]},

  B0:  { id: 'B0',  npc: 'Victor Blackwood', texto: 'Detetive. Espero que isso seja rápido.',
    escolhas: [
      { texto: 'Onde estava às 23h?',          proximoId: 'B1', pistaBloqueada: null,            xp: 15 },
      { texto: 'O testamento seria alterado?', proximoId: 'B2', pistaBloqueada: null,            xp: 15 },
      { texto: 'Conhece a estufa?',            proximoId: 'B3', pistaBloqueada: null,            xp: 20 },
    ]},
  B1:  { id: 'B1',  npc: 'Victor Blackwood', texto: 'Estava no meu quarto. Sozinho. Não preciso provar nada.',
    escolhas: [
      { texto: 'Alguém pode confirmar?', proximoId: 'B1a', pistaBloqueada: null, xp: 20 },
      { texto: 'Vi você no corredor.',   proximoId: 'B1b', pistaBloqueada: null, xp: 25 },
      { texto: 'Encerrar conversa.',     proximoId: null,  pistaBloqueada: null, xp:  5 },
    ]},
  B1a: { id: 'B1a', npc: 'Victor Blackwood', texto: 'Não. E isso não significa nada.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B1b: { id: 'B1b', npc: 'Victor Blackwood', texto: 'Eu... fui buscar água. Isso é crime agora?',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B2:  { id: 'B2',  npc: 'Victor Blackwood', texto: 'Que pergunta ridícula. O testamento era justo.',
    escolhas: [
      { texto: 'Há rasuras no documento.', proximoId: 'B2a', pistaBloqueada: 'testamento_rasura', xp: 30 },
      { texto: 'Encerrar conversa.',       proximoId: null,  pistaBloqueada: null,                xp:  5 },
    ]},
  B2a: { id: 'B2a', npc: 'Victor Blackwood', texto: 'Isso é mentira. Vocês estão plantando evidências.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B3:  { id: 'B3',  npc: 'Victor Blackwood', texto: 'A estufa? Passei por lá ontem de manhã. Nada demais.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: 'planta_arsenico', xp: 20 }]},

  C0:  { id: 'C0',  npc: "Fynn O'Brien",     texto: 'Estava de plantão. Nada de anormal.',
    escolhas: [
      { texto: 'Quem tinha chave extra do cofre?', proximoId: 'C1', pistaBloqueada: 'chave_extra', xp: 25 },
      { texto: 'Viu alguém circular?',             proximoId: 'C2', pistaBloqueada: null,           xp: 20 },
      { texto: 'Está com medo de alguma coisa?',   proximoId: 'C3', pistaBloqueada: null,           xp: 15 },
    ]},
  C1:  { id: 'C1',  npc: "Fynn O'Brien",     texto: 'Só o Lorde e eu tínhamos cópia. Mas eu nunca abri sem autorização.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  C2:  { id: 'C2',  npc: "Fynn O'Brien",     texto: 'O Victor passou pelo corredor por volta das 23h. Achei estranho.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  C3:  { id: 'C3',  npc: "Fynn O'Brien",     texto: 'Não. Só quero que isso acabe logo.',
    escolhas: [{ texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
};

// ─── Dados estáticos do mapa (posições conforme backend/src/seed/) ────────────

// Pistas espalhadas pelo grid (10×10) — sem sobreposição com NPCs
// Nota: backend/src/controllers/dialogoController.js precisa de update correspondente.
const PISTAS_MOCK: Pista[] = [
  { id: 'frasco_arsenico',   nome: 'Frasco de arsênico vazio',    descricao: 'Frasco de vidro com resíduos de arsênico.',   peso: 10, celula: { x: 2, y: 1 }, coletada: false },
  { id: 'carta_anonima',     nome: 'Carta anônima rasgada',       descricao: 'Pedaços de carta com letra disfarçada.',       peso: 8,  celula: { x: 4, y: 0 }, coletada: false },
  { id: 'testamento_rasura', nome: 'Testamento com rasura',       descricao: 'Testamento oficial com uma linha rasurada.',   peso: 9,  celula: { x: 7, y: 2 }, coletada: false },
  { id: 'copo_residuo',      nome: 'Copo com resíduo de chá',     descricao: 'Copo com sedimento suspeito no fundo.',        peso: 7,  celula: { x: 1, y: 4 }, coletada: false },
  { id: 'planta_arsenico',   nome: 'Planta de arsênico colhida',  descricao: 'Ramo fresco de planta venenosa.',              peso: 8,  celula: { x: 5, y: 3 }, coletada: false },
  { id: 'diario_edmund',     nome: 'Diário de Sir Edmund',        descricao: 'Diário pessoal com entradas suspeitas.',       peso: 6,  celula: { x: 0, y: 6 }, coletada: false },
  { id: 'foto_rasgada',      nome: 'Foto rasgada',                descricao: 'Fotografia rasgada ao meio.',                  peso: 5,  celula: { x: 3, y: 7 }, coletada: false },
  { id: 'pegadas_barro',     nome: 'Pegadas no barro',            descricao: 'Marcas de botas grandes na estufa.',           peso: 7,  celula: { x: 8, y: 5 }, coletada: false },
  { id: 'chave_extra',       nome: 'Chave extra do cofre',        descricao: 'Cópia não autorizada da chave do cofre.',      peso: 9,  celula: { x: 6, y: 8 }, coletada: false },
  { id: 'bilhete_trem',      nome: 'Bilhete de trem cancelado',   descricao: 'Bilhete com data da noite do crime.',          peso: 6,  celula: { x: 9, y: 1 }, coletada: false },
];

// NPCs distribuídos no grid, sem sobreposição com pistas
const NPCS_MOCK: NPC[] = [
  { id: 'adelaide', nome: 'Adelaide Cross',   celula: { x: 3, y: 4 }, dialogoInicial: 'A0' },
  { id: 'victor',   nome: 'Victor Blackwood', celula: { x: 7, y: 6 }, dialogoInicial: 'B0' },
  { id: 'fynn',     nome: "Fynn O'Brien",     celula: { x: 1, y: 9 }, dialogoInicial: 'C0' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

const POS_INICIAL      = { x: 0, y: 0 };
const CELULAS_INICIAIS = new Set(bfsReveal(POS_INICIAL).map(c => `${c.x},${c.y}`));

export const useGameStore = create<GameState>((set, get) => ({
  partidaId:        null,
  posicao:          POS_INICIAL,
  celulasReveladas: CELULAS_INICIAIS,
  pistas:           PISTAS_MOCK,
  npcs:             NPCS_MOCK,
  pistasColetadas:  [],
  xp:               0,
  dialogoAtivo:     false,
  noDialogoAtual:   null,
  noAtualData:      null,
  npcAtual:         null,
  statusJogo:       'titulo',
  notificacoes:     [],
  rotaTSP:             [],
  mostrandoRota:       false,
  escolhasRaizUsadas:  {},

  // Cria a partida no backend ao iniciar o jogo
  setStatusJogo: (status) => {
    set({ statusJogo: status });
    if (status === 'jogando') {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.partidaId) set({ partidaId: data.partidaId });
        })
        .catch(() => { /* sem backend — estado local apenas */ });
    }
  },

  // Movimento com update otimista + sync via API
  mover: (dx, dy) => {
    const state = get();
    if (state.dialogoAtivo) return;

    const nx = Math.max(0, Math.min(9, state.posicao.x + dx));
    const ny = Math.max(0, Math.min(9, state.posicao.y + dy));
    if (nx === state.posicao.x && ny === state.posicao.y) return;

    const novasCelulas = new Set(state.celulasReveladas);
    bfsReveal({ x: nx, y: ny }, 3).forEach(c => novasCelulas.add(`${c.x},${c.y}`));
    set({ posicao: { x: nx, y: ny }, celulasReveladas: novasCelulas });

    if (!state.partidaId) return;

    const DIRS: Record<string, string> = { '0,-1': 'N', '0,1': 'S', '1,0': 'L', '-1,0': 'O' };
    const direcao = DIRS[`${dx},${dy}`];
    if (!direcao) return;

    fetch(`${API}/${state.partidaId}/mover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direcao }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        set(s => {
          const celulas = new Set(s.celulasReveladas);
          (data.visao as { x: number; y: number }[]).forEach(c => celulas.add(`${c.x},${c.y}`));
          return { posicao: data.posicao, celulasReveladas: celulas };
        });
      })
      .catch(() => { /* mantém posição otimista */ });
  },

  // Coleta pista com update otimista + sync de XP via API
  coletarPista: (pistaId) => {
    const state = get();
    const pista = state.pistas.find(p => p.id === pistaId && !p.coletada);
    if (!pista) return;

    const notifId = `notif-${Date.now()}`;
    set(s => ({
      pistas:          s.pistas.map(p => p.id === pistaId ? { ...p, coletada: true } : p),
      pistasColetadas: [...s.pistasColetadas, { ...pista, coletada: true }],
      xp:              s.xp + pista.peso * 10,
      notificacoes:    [...s.notificacoes, { id: notifId, nome: pista.nome, peso: pista.peso }],
    }));

    if (!state.partidaId) return;

    fetch(`${API}/${state.partidaId}/coletar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pistaId }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.xpTotal !== undefined) set({ xp: data.xpTotal });
      })
      .catch(() => { /* mantém XP otimista */ });
  },

  // Inicia diálogo — carrega nó raiz, bloqueia rotas já usadas
  iniciarDialogo: (npcId) => {
    const { partidaId, npcs, escolhasRaizUsadas } = get();
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    const usadas = escolhasRaizUsadas[npcId] ?? [];

    // Aplica marcação de escolhas usadas e verifica esgotamento
    const prepararNo = (no: NoDialogo): NoDialogo | null => {
      const noMarcado: NoDialogo = {
        ...no,
        escolhas: no.escolhas.map((e, i) => ({ ...e, usado: usadas.includes(i) })),
      };
      const todasUsadas = noMarcado.escolhas.every(e => e.usado);
      return todasUsadas ? null : noMarcado;
    };

    if (!partidaId) {
      const raw = DIALOGOS_LOCAL[npc.dialogoInicial] ?? null;
      if (!raw) return;
      const no = prepararNo(raw);
      if (!no) return; // NPC esgotado
      set({ dialogoAtivo: true, npcAtual: npcId, noDialogoAtual: no.id, noAtualData: no });
      return;
    }

    set({ dialogoAtivo: true, npcAtual: npcId, noDialogoAtual: npc.dialogoInicial, noAtualData: null });

    fetch(`${API}/${partidaId}/interagir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celula: npc.celula }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.no) {
          const no = prepararNo(data.no as NoDialogo);
          if (!no) {
            set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
            return;
          }
          set({ noAtualData: no, noDialogoAtual: no.id });
        } else {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null });
        }
      })
      .catch(() => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null }));
  },

  fecharDialogo: () => set({
    dialogoAtivo:   false,
    noDialogoAtual: null,
    npcAtual:       null,
    noAtualData:    null,
  }),

  // Avança na árvore de diálogos via API (Issue #6 — Árvore de Decisão)
  avancarDialogo: (noAtualId, index) => {
    const { partidaId } = get();

    // Regista escolha raiz se estamos no nó inicial do NPC
    const registrarRaiz = (npcAtual: string | null, index: number) => {
      if (!npcAtual) return;
      const npc = get().npcs.find(n => n.id === npcAtual);
      if (npc && noAtualId === npc.dialogoInicial) {
        set(s => ({
          escolhasRaizUsadas: {
            ...s.escolhasRaizUsadas,
            [npcAtual]: [...(s.escolhasRaizUsadas[npcAtual] ?? []), index],
          },
        }));
      }
    };

    if (!partidaId) {
      const { npcAtual } = get();
      const no = DIALOGOS_LOCAL[noAtualId];
      if (!no) return;
      const escolha = no.escolhas[index];
      if (!escolha || escolha.usado) return;

      registrarRaiz(npcAtual, index);
      if (escolha.pistaBloqueada) get().coletarPista(escolha.pistaBloqueada);

      if (escolha.proximoId) {
        const proximo = DIALOGOS_LOCAL[escolha.proximoId] ?? null;
        set(s => ({ xp: s.xp + escolha.xp, noDialogoAtual: escolha.proximoId, noAtualData: proximo }));
      } else {
        set(s => ({
          xp:             s.xp + escolha.xp,
          dialogoAtivo:   false,
          noDialogoAtual: null,
          npcAtual:       null,
          noAtualData:    null,
        }));
      }
      return;
    }

    // Registra imediatamente a escolha raiz (antes da resposta da API)
    registrarRaiz(get().npcAtual, index);

    fetch(`${API}/${partidaId}/escolha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noAtualId, index }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;

        const { proximoNo, pistaBloqueada, xpTotal } = data;

        if (xpTotal !== undefined) set({ xp: xpTotal });

        // coleta automática de pista desbloqueada pelo diálogo
        if (pistaBloqueada) get().coletarPista(pistaBloqueada as string);

        if (proximoNo) {
          const no = proximoNo as NoDialogo;
          set({ noDialogoAtual: no.id, noAtualData: no });
        } else {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
        }
      })
      .catch(() => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null }));
  },

  removerNotificacao: (id) => set(state => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id),
  })),

  // Carrega rota TSP das pistas pendentes (Issue #8)
  carregarRota: () => {
    const { partidaId } = get();
    if (!partidaId) return;

    fetch(`${API}/${partidaId}/rota`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.rota) {
          set({ rotaTSP: data.rota as RotaTSPItem[], mostrandoRota: true });
        }
      })
      .catch(() => { /* silencioso */ });
  },

  toggleRota: () => {
    const { mostrandoRota, rotaTSP } = get();
    if (!mostrandoRota && rotaTSP.length === 0) {
      get().carregarRota();
    } else {
      set({ mostrandoRota: !mostrandoRota });
    }
  },
}));
