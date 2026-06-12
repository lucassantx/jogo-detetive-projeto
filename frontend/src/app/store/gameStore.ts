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

// ─── Dados estáticos do mapa (posições conforme backend/src/seed/) ────────────

const PISTAS_MOCK: Pista[] = [
  { id: 'frasco_arsenico',   nome: 'Frasco de arsênico vazio',    descricao: 'Frasco de vidro com resíduos de arsênico.',   peso: 10, celula: { x: 1, y: 1 }, coletada: false },
  { id: 'carta_anonima',     nome: 'Carta anônima rasgada',       descricao: 'Pedaços de carta com letra disfarçada.',       peso: 8,  celula: { x: 1, y: 0 }, coletada: false },
  { id: 'testamento_rasura', nome: 'Testamento com rasura',       descricao: 'Testamento oficial com uma linha rasurada.',   peso: 9,  celula: { x: 0, y: 1 }, coletada: false },
  { id: 'copo_residuo',      nome: 'Copo com resíduo de chá',     descricao: 'Copo com sedimento suspeito no fundo.',        peso: 7,  celula: { x: 3, y: 0 }, coletada: false },
  { id: 'planta_arsenico',   nome: 'Planta de arsênico colhida',  descricao: 'Ramo fresco de planta venenosa.',              peso: 8,  celula: { x: 3, y: 1 }, coletada: false },
  { id: 'diario_edmund',     nome: 'Diário de Sir Edmund',        descricao: 'Diário pessoal com entradas suspeitas.',       peso: 6,  celula: { x: 2, y: 0 }, coletada: false },
  { id: 'foto_rasgada',      nome: 'Foto rasgada',                descricao: 'Fotografia rasgada ao meio.',                  peso: 5,  celula: { x: 2, y: 1 }, coletada: false },
  { id: 'pegadas_barro',     nome: 'Pegadas no barro',            descricao: 'Marcas de botas grandes na estufa.',           peso: 7,  celula: { x: 5, y: 0 }, coletada: false },
  { id: 'chave_extra',       nome: 'Chave extra do cofre',        descricao: 'Cópia não autorizada da chave do cofre.',      peso: 9,  celula: { x: 0, y: 2 }, coletada: false },
  { id: 'bilhete_trem',      nome: 'Bilhete de trem cancelado',   descricao: 'Bilhete com data da noite do crime.',          peso: 6,  celula: { x: 1, y: 2 }, coletada: false },
];

// Posições alinhadas com dialogoController.js → NPC_POR_CELULA
const NPCS_MOCK: NPC[] = [
  { id: 'adelaide', nome: 'Adelaide Cross',   celula: { x: 1, y: 1 }, dialogoInicial: 'A0' },
  { id: 'victor',   nome: 'Victor Blackwood', celula: { x: 0, y: 1 }, dialogoInicial: 'B0' },
  { id: 'fynn',     nome: "Fynn O'Brien",     celula: { x: 0, y: 2 }, dialogoInicial: 'C0' },
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
  rotaTSP:          [],
  mostrandoRota:    false,

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

  // Inicia diálogo — carrega nó raiz via API
  iniciarDialogo: (npcId) => {
    const { partidaId, npcs } = get();
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    set({ dialogoAtivo: true, npcAtual: npcId, noDialogoAtual: npc.dialogoInicial, noAtualData: null });

    if (!partidaId) return;

    fetch(`${API}/${partidaId}/interagir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celula: npc.celula }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.no) {
          const no = data.no as NoDialogo;
          set({ noAtualData: no, noDialogoAtual: no.id });
        } else {
          // NPC não mapeado no backend — fecha diálogo
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null });
        }
      })
      .catch(() => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null }));
  },

  fecharDialogo: () => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null }),

  // Avança na árvore de diálogos via API (Issue #6 — Árvore de Decisão)
  avancarDialogo: (noAtualId, index) => {
    const { partidaId } = get();
    if (!partidaId) return;

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
