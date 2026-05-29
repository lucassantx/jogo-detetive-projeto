// TODO Dev 3 + Dev 4 — Dia 1 (definir juntos antes de codar)
// Store global com Zustand para estado do jogo
//
// Estado mínimo a definir em conjunto no Dia 1:
//   posicao:          { x: number; y: number }
//   celulasReveladas: { x: number; y: number }[]
//   pistasColetadas:  Pista[]
//   xp:               number
//   dialogoAtivo:     boolean
//   noDialogoAtual:   string | null
//   rotaTSP:          { x: number; y: number }[] | null
//   statusJogo:       'titulo' | 'jogando' | 'acusando' | 'fim'
//
// Ações mínimas:
//   mover, revelarCelula, coletarPista, iniciarDialogo, fecharDialogo,
//   setRotaTSP, fazerAcusacao, reiniciarPartida

import { create } from 'zustand';

interface GameState {
  // TODO — definir tipos completos no Dia 1
  posicao: { x: number; y: number };
  dialogoAtivo: boolean;
  xp: number;

  // Ações
  mover: (dx: number, dy: number) => void;
  iniciarDialogo: () => void;
  fecharDialogo: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  posicao: { x: 0, y: 0 },
  dialogoAtivo: false,
  xp: 0,

  mover: (dx, dy) => set((state) => ({
    posicao: {
      x: Math.max(0, Math.min(9, state.posicao.x + dx)),
      y: Math.max(0, Math.min(9, state.posicao.y + dy)),
    },
  })),

  iniciarDialogo: () => set({ dialogoAtivo: true }),
  fecharDialogo:  () => set({ dialogoAtivo: false }),
}));
