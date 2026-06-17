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
  pistaRequerida?: string | null;
  xp: number;
  visitado?: boolean;
  usado?: boolean;
  bloqueadaPorPista?: boolean;
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
  npcVisitedChoices: Record<string, Record<string, number[]>>;
  escolhasRaizUsadas: Record<string, number[]>;
  npcsInterrogados: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Ações
  criarPartida: () => Promise<void>;
  carregarPartida: (id: string) => Promise<void>;
  mover: (dx: number, dy: number) => Promise<void>;
  coletarPista: (pistaId: string) => Promise<void>;
  iniciarDialogo: (npcId: string) => Promise<void>;
  fecharDialogo: () => void;
  avancarDialogo: (noAtualId: string, index: number) => Promise<void>;
  removerNotificacao: (id: string) => void;
  setStatusJogo: (status: StatusJogo) => void;
  carregarRota: () => Promise<void>;
  toggleRota: () => void;
  acusar: (suspeitoId: string) => Promise<any>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const POS_INICIAL = { x: 0, y: 0 };

export const useGameStore = create<GameState>((set, get) => ({
  // ─── Estado Inicial ──────────────────────────────────────────────────────
  partidaId: null,
  posicao: POS_INICIAL,
  celulasReveladas: new Set<string>(),
  pistas: [],
  npcs: [],
  pistasColetadas: [],
  xp: 0,
  dialogoAtivo: false,
  noDialogoAtual: null,
  noAtualData: null,
  npcAtual: null,
  statusJogo: 'titulo',
  notificacoes: [],
  rotaTSP: [],
  mostrandoRota: false,
  npcVisitedChoices: {},
  escolhasRaizUsadas: {},
  npcsInterrogados: new Set(),
  isLoading: false,
  error: null,

  // ─── Ações ──────────────────────────────────────────────────────────────────

  // Cria a partida no backend ao iniciar o jogo
  setStatusJogo: (status) => {
    set({ statusJogo: status });
    if (status === 'jogando') {
      get().criarPartida();
    }
  },

  criarPartida: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Falha ao criar partida');

      const data = await response.json();
      if (data?.partidaId) {
        await get().carregarPartida(data.partidaId);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao criar partida' });
    } finally {
      set({ isLoading: false });
    }
  },

  carregarPartida: async (id: string) => {
    set({ isLoading: true, error: null, partidaId: id });
    try {
      const response = await fetch(`${API}/${id}`);
      if (!response.ok) throw new Error('Falha ao carregar partida');

      const data = await response.json();

      set({
        posicao: data.posicao || POS_INICIAL,
        celulasReveladas: new Set(data.celulasReveladas || []),
        pistas: data.pistas || [],
        npcs: data.npcs || [],
        pistasColetadas: data.pistasColetadas || [],
        xp: data.xp || 0,
        statusJogo: data.statusJogo || 'jogando',
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar partida' });
    } finally {
      set({ isLoading: false });
    }
  },

  mover: async (dx, dy) => {
    const state = get();
    if (state.dialogoAtivo || !state.partidaId) return;

    const nx = Math.max(0, Math.min(9, state.posicao.x + dx));
    const ny = Math.max(0, Math.min(9, state.posicao.y + dy));
    if (nx === state.posicao.x && ny === state.posicao.y) return;

    // Atualização otimista
    set({ posicao: { x: nx, y: ny } });

    const DIRS: Record<string, string> = { '0,-1': 'N', '0,1': 'S', '1,0': 'L', '-1,0': 'O' };
    const direcao = DIRS[`${dx},${dy}`];
    if (!direcao) return;

    try {
      const response = await fetch(`${API}/${state.partidaId}/mover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direcao }),
      });

      if (!response.ok) throw new Error('Falha ao mover');

      const data = await response.json();

      // Sincroniza com o backend
      set(s => {
        const celulas = new Set(s.celulasReveladas);
        if (data.visao) {
          (data.visao as { x: number; y: number }[]).forEach(c => celulas.add(`${c.x},${c.y}`));
        }
        return {
          posicao: data.posicao || s.posicao,
          celulasReveladas: celulas
        };
      });
    } catch (error) {
      // Rollback em caso de erro
      set({ error: error instanceof Error ? error.message : 'Erro ao mover' });
      // Recarrega o estado do backend para garantir consistência
      if (state.partidaId) await get().carregarPartida(state.partidaId);
    }
  },

  coletarPista: async (pistaId) => {
    const state = get();
    if (!state.partidaId) return;

    const pista = state.pistas.find(p => p.id === pistaId && !p.coletada);
    if (!pista) return;

    // Atualização otimista
    const notifId = `notif-${Date.now()}`;
    set(s => ({
      pistas: s.pistas.map(p => p.id === pistaId ? { ...p, coletada: true } : p),
      pistasColetadas: [...s.pistasColetadas, { ...pista, coletada: true }],
      xp: s.xp + pista.peso * 10,
      notificacoes: [...s.notificacoes, { id: notifId, nome: pista.nome, peso: pista.peso }],
    }));

    try {
      const response = await fetch(`${API}/${state.partidaId}/coletar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pistaId }),
      });

      if (!response.ok) throw new Error('Falha ao coletar pista');

      const data = await response.json();

      if (data?.xpTotal !== undefined) set({ xp: data.xpTotal });
      if (data?.inventario) set({ pistasColetadas: data.inventario });

      // Recarrega rota se estiver visível
      if (get().mostrandoRota) await get().carregarRota();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao coletar pista' });
      // Recarrega estado do backend
      if (state.partidaId) await get().carregarPartida(state.partidaId);
    }
  },

  iniciarDialogo: async (npcId) => {
    const state = get();
    if (!state.partidaId) return;

    const npc = state.npcs.find(n => n.id === npcId);
    if (!npc) return;

    set({
      dialogoAtivo: true,
      npcAtual: npcId,
      noDialogoAtual: npc.dialogoInicial,
      noAtualData: null,
      isLoading: true,
      npcsInterrogados: new Set(state.npcsInterrogados).add(npcId),
    });

    try {
      const response = await fetch(`${API}/${state.partidaId}/interagir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celula: npc.celula }),
      });

      if (!response.ok) throw new Error('Falha ao iniciar diálogo');

      const data = await response.json();

      if (data?.no) {
        set({
          noAtualData: data.no as NoDialogo,
          noDialogoAtual: data.no.id,
          isLoading: false,
        });
      } else {
        set({
          dialogoAtivo: false,
          noDialogoAtual: null,
          npcAtual: null,
          noAtualData: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao iniciar diálogo',
        dialogoAtivo: false,
        noDialogoAtual: null,
        npcAtual: null,
        noAtualData: null,
        isLoading: false,
      });
    }
  },

  fecharDialogo: () => set({
    dialogoAtivo: false,
    noDialogoAtual: null,
    npcAtual: null,
    noAtualData: null,
  }),

  avancarDialogo: async (noAtualId, index) => {
    const state = get();
    if (!state.partidaId) return;

    const no = state.noAtualData;
    if (!no) return;

    const escolha = no.escolhas[index];
    if (!escolha || escolha.usado) return;

    // Marca escolha raiz como usada (otimista)
    const npcAtualOnline = state.npcAtual;
    const npcOnline = npcAtualOnline ? state.npcs.find(n => n.id === npcAtualOnline) : null;
    if (npcOnline && noAtualId === npcOnline.dialogoInicial) {
      set(s => ({
        escolhasRaizUsadas: {
          ...s.escolhasRaizUsadas,
          [npcAtualOnline!]: [...(s.escolhasRaizUsadas[npcAtualOnline!] ?? []), index],
        },
      }));
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`${API}/${state.partidaId}/escolha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noAtualId, index }),
      });

      if (!response.ok) throw new Error('Falha ao avançar diálogo');

      const data = await response.json();

      if (data?.xpTotal !== undefined) set({ xp: data.xpTotal });

      if (data?.pistaBloqueada) {
        await get().coletarPista(data.pistaBloqueada as string);
      }

      if (data?.proximoNo) {
        set({
          noDialogoAtual: data.proximoNo.id,
          noAtualData: data.proximoNo as NoDialogo,
          isLoading: false,
        });
      } else {
        set({
          dialogoAtivo: false,
          noDialogoAtual: null,
          npcAtual: null,
          noAtualData: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao avançar diálogo',
        dialogoAtivo: false,
        noDialogoAtual: null,
        npcAtual: null,
        noAtualData: null,
        isLoading: false,
      });
    }
  },

  removerNotificacao: (id) => set(state => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id),
  })),

  carregarRota: async () => {
    const state = get();
    if (!state.partidaId) return;

    set({ isLoading: true });

    try {
      const response = await fetch(`${API}/${state.partidaId}/rota`);
      if (!response.ok) throw new Error('Falha ao carregar rota');

      const data = await response.json();

      if (Array.isArray(data?.rota)) {
        set({ rotaTSP: data.rota as RotaTSPItem[], mostrandoRota: true });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar rota' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleRota: () => {
    const { mostrandoRota } = get();
    if (mostrandoRota) {
      set({ mostrandoRota: false });
    } else {
      get().carregarRota(); // sempre re-fetcha para garantir rota atualizada
    }
  },

  acusar: async (suspeitoId: string) => {
    const state = get();
    if (!state.partidaId) return;

    set({ isLoading: true, statusJogo: 'acusando' });

    try {
      const response = await fetch(`${API}/${state.partidaId}/acusar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspeitoId }),
      });

      if (!response.ok) throw new Error('Falha ao acusar');

      const data = await response.json();

      set({ statusJogo: 'fim', isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao acusar',
        statusJogo: 'jogando',
        isLoading: false,
      });
      return null;
    }
  },
}));