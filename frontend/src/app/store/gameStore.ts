import { create } from 'zustand';

// ─── Tipos exportados (contrato compartilhado com Dev 4) ──────────────────────

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

export type StatusJogo = 'titulo' | 'jogando' | 'acusando' | 'fim';

interface GameState {
  posicao: { x: number; y: number };
  celulasReveladas: Set<string>;
  pistas: Pista[];
  npcs: NPC[];
  dialogos: Record<string, NoDialogo>;
  pistasColetadas: Pista[];
  xp: number;
  dialogoAtivo: boolean;
  noDialogoAtual: string | null;
  npcAtual: string | null;
  statusJogo: StatusJogo;
  notificacoes: Notificacao[];

  mover: (dx: number, dy: number) => void;
  coletarPista: (pistaId: string) => void;
  iniciarDialogo: (npcId: string) => void;
  fecharDialogo: () => void;
  avancarDialogo: (proximoId: string | null, xp: number, pistaBloqueada: string | null) => void;
  removerNotificacao: (id: string) => void;
}

// ─── BFS local (espelha backend/src/structures/BFS.js — integrar na Sprint 2) ─

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

// ─── Mock data — Sprint 1 (substituir por chamadas de API na Sprint 2) ─────────
// Posições e pesos conforme backend/src/seed/pistas.js

const PISTAS_MOCK: Pista[] = [
  { id: 'frasco_arsenico',  nome: 'Frasco de arsênico vazio',   descricao: 'Frasco de vidro com resíduos de arsênico.',   peso: 10, celula: { x: 1, y: 1 }, coletada: false },
  { id: 'carta_anonima',    nome: 'Carta anônima rasgada',      descricao: 'Pedaços de carta com letra disfarçada.',       peso: 8,  celula: { x: 1, y: 0 }, coletada: false },
  { id: 'testamento',       nome: 'Testamento com rasura',      descricao: 'Testamento oficial com uma linha rasurada.',   peso: 9,  celula: { x: 0, y: 1 }, coletada: false },
  { id: 'copo_cha',         nome: 'Copo com resíduo de chá',    descricao: 'Copo com sedimento suspeito no fundo.',        peso: 7,  celula: { x: 3, y: 0 }, coletada: false },
  { id: 'planta_arsenico',  nome: 'Planta de arsênico colhida', descricao: 'Ramo fresco de planta venenosa.',              peso: 8,  celula: { x: 3, y: 1 }, coletada: false },
  { id: 'diario_edmund',    nome: 'Diário de Sir Edmund',       descricao: 'Diário pessoal com entradas suspeitas.',       peso: 6,  celula: { x: 2, y: 0 }, coletada: false },
  { id: 'foto_rasgada',     nome: 'Foto rasgada',               descricao: 'Fotografia rasgada ao meio.',                 peso: 5,  celula: { x: 2, y: 1 }, coletada: false },
  { id: 'pegadas_barro',    nome: 'Pegadas no barro',           descricao: 'Marcas de botas grandes na estufa.',          peso: 7,  celula: { x: 5, y: 0 }, coletada: false },
  { id: 'chave_cofre',      nome: 'Chave extra do cofre',       descricao: 'Cópia não autorizada da chave do cofre.',     peso: 9,  celula: { x: 0, y: 2 }, coletada: false },
  { id: 'bilhete_trem',     nome: 'Bilhete de trem cancelado',  descricao: 'Bilhete com data da noite do crime.',         peso: 6,  celula: { x: 1, y: 2 }, coletada: false },
];

const NPCS_MOCK: NPC[] = [
  { id: 'adelaide', nome: 'Adelaide Cross',   celula: { x: 6, y: 3 }, dialogoInicial: 'A0' },
  { id: 'victor',   nome: 'Victor Blackwood', celula: { x: 8, y: 1 }, dialogoInicial: 'B0' },
  { id: 'fynn',     nome: 'Fynn (Guarda)',    celula: { x: 7, y: 7 }, dialogoInicial: 'C0' },
];

// Nós conforme backend/src/seed/dialogos.js (A0-A2, B0-B3, C0-C1)
const DIALOGOS_MOCK: Record<string, NoDialogo> = {
  A0: {
    id: 'A0', npc: 'Adelaide Cross',
    texto: 'Eu estava na biblioteca toda a tarde, como sempre. Nunca saio desta sala antes do jantar.',
    escolhas: [
      { texto: 'O que sabe sobre a morte de Blackwood?', proximoId: 'A1',  pistaBloqueada: null,          xp: 10 },
      { texto: 'Notou algo estranho ultimamente?',       proximoId: 'A2',  pistaBloqueada: null,          xp: 10 },
    ],
  },
  A1: {
    id: 'A1', npc: 'Adelaide Cross',
    texto: 'Blackwood? Morreu? Isso é… chocante. Vi uma carta rasgada perto da escrivaninha dele ontem.',
    escolhas: [
      { texto: 'Quando foi a última vez que o viu?', proximoId: 'A1b', pistaBloqueada: null,          xp: 10 },
      { texto: 'Ele tinha inimigos na família?',     proximoId: 'A1a', pistaBloqueada: 'carta_anonima', xp: 15 },
    ],
  },
  A1a: {
    id: 'A1a', npc: 'Adelaide Cross',
    texto: 'Victor sempre cobrou sua parte da herança com muita insistência. Havia brigas constantes.',
    escolhas: [],
  },
  A1b: {
    id: 'A1b', npc: 'Adelaide Cross',
    texto: 'No café da manhã. Ele parecia nervoso — tomou o chá mas mal tocou na comida.',
    escolhas: [],
  },
  A2: {
    id: 'A2', npc: 'Adelaide Cross',
    texto: 'Esta casa sempre teve seus segredos. Ultimamente o Victor entra e sai da estufa à noite.',
    escolhas: [],
  },
  B0: {
    id: 'B0', npc: 'Victor Blackwood',
    texto: 'Não tenho nada a dizer ao senhor. Quem o mandou aqui?',
    escolhas: [
      { texto: 'Estou investigando a morte de seu tio.',  proximoId: 'B1', pistaBloqueada: null, xp: 10 },
      { texto: 'Vi seu nome no testamento com uma rasura.', proximoId: 'B2', pistaBloqueada: null, xp: 15 },
    ],
  },
  B1: {
    id: 'B1', npc: 'Victor Blackwood',
    texto: 'Morte acidental. Ele bebia, já estava doente. Não há mistério aqui.',
    escolhas: [
      { texto: 'E o testamento com rasura?',  proximoId: 'B2', pistaBloqueada: null, xp: 20 },
      { texto: 'Onde estava ontem à noite?',  proximoId: 'B3', pistaBloqueada: null, xp: 10 },
    ],
  },
  B2: {
    id: 'B2', npc: 'Victor Blackwood',
    texto: 'Esse testamento é invenção sua! Meu irmão me deixaria tudo — como sempre prometeu!',
    escolhas: [],
  },
  B3: {
    id: 'B3', npc: 'Victor Blackwood',
    texto: 'No escritório. Trabalhando. Como sempre.',
    escolhas: [],
  },
  C0: {
    id: 'C0', npc: 'Fynn (Guarda)',
    texto: 'Eu… eu não devia falar. Mas vi algo naquela noite que não me sai da cabeça.',
    escolhas: [
      { texto: 'Pode confiar em mim. O que viu?',      proximoId: 'C1', pistaBloqueada: null, xp: 20 },
      { texto: 'Não precisa ter medo. Sou detetive.',  proximoId: 'C1', pistaBloqueada: null, xp: 15 },
    ],
  },
  C1: {
    id: 'C1', npc: 'Fynn (Guarda)',
    texto: 'Vi o Victor saindo da estufa tarde da noite. Carregava algo embrulhado. Não sei o quê — mas ele estava com pressa.',
    escolhas: [],
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

const POS_INICIAL = { x: 0, y: 0 };
const CELULAS_INICIAIS = new Set(bfsReveal(POS_INICIAL).map(c => `${c.x},${c.y}`));

export const useGameStore = create<GameState>((set, get) => ({
  posicao: POS_INICIAL,
  celulasReveladas: CELULAS_INICIAIS,
  pistas: PISTAS_MOCK,
  npcs: NPCS_MOCK,
  dialogos: DIALOGOS_MOCK,
  pistasColetadas: [],
  xp: 0,
  dialogoAtivo: false,
  noDialogoAtual: null,
  npcAtual: null,
  statusJogo: 'jogando',
  notificacoes: [],

  mover: (dx, dy) => set(state => {
    if (state.dialogoAtivo) return state;
    const nx = Math.max(0, Math.min(9, state.posicao.x + dx));
    const ny = Math.max(0, Math.min(9, state.posicao.y + dy));
    if (nx === state.posicao.x && ny === state.posicao.y) return state;
    const novasCelulas = new Set(state.celulasReveladas);
    bfsReveal({ x: nx, y: ny }, 3).forEach(c => novasCelulas.add(`${c.x},${c.y}`));
    return { posicao: { x: nx, y: ny }, celulasReveladas: novasCelulas };
  }),

  coletarPista: (pistaId) => set(state => {
    const pista = state.pistas.find(p => p.id === pistaId && !p.coletada);
    if (!pista) return state;
    const notifId = `notif-${Date.now()}`;
    return {
      pistas: state.pistas.map(p => p.id === pistaId ? { ...p, coletada: true } : p),
      pistasColetadas: [...state.pistasColetadas, { ...pista, coletada: true }],
      xp: state.xp + pista.peso * 10,
      notificacoes: [...state.notificacoes, { id: notifId, nome: pista.nome, peso: pista.peso }],
    };
  }),

  iniciarDialogo: (npcId) => {
    const npc = get().npcs.find(n => n.id === npcId);
    if (!npc) return;
    set({ dialogoAtivo: true, noDialogoAtual: npc.dialogoInicial, npcAtual: npcId });
  },

  fecharDialogo: () => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null }),

  avancarDialogo: (proximoId, xpGanho, pistaBloqueada) => set(state => {
    const updates: Partial<GameState> = { xp: state.xp + xpGanho };

    if (pistaBloqueada) {
      const pista = state.pistas.find(p => p.id === pistaBloqueada && !p.coletada);
      if (pista) {
        const notifId = `notif-${Date.now()}`;
        Object.assign(updates, {
          pistas: state.pistas.map(p => p.id === pistaBloqueada ? { ...p, coletada: true } : p),
          pistasColetadas: [...state.pistasColetadas, { ...pista, coletada: true }],
          xp: state.xp + xpGanho + pista.peso * 10,
          notificacoes: [...state.notificacoes, { id: notifId, nome: pista.nome, peso: pista.peso }],
        });
      }
    }

    if (proximoId) {
      updates.noDialogoAtual = proximoId;
    } else {
      updates.dialogoAtivo = false;
      updates.noDialogoAtual = null;
      updates.npcAtual = null;
    }

    return updates;
  }),

  removerNotificacao: (id) => set(state => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id),
  })),
}));
