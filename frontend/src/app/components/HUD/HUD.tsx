// TODO Dev 4 — Sprint 1
// HUD (Heads-Up Display): exibe XP, inventário de pistas e botão "Sugerir rota"
//
// Elementos:
//   - XP atual do jogador (atualiza em tempo real)
//   - Lista de pistas coletadas, ordenadas por peso (reflexo do MaxHeap)
//   - Indicador de cor: peso ≥ 9 → vermelho | 7–8 → amarelo | < 7 → verde
//   - Card de notificação deslizante ao coletar pista (Issue #5)
//   - Botão "Sugerir rota" → chama GET /api/partida/:id/rota (Issue #8)
//
// Ver store/gameStore.ts para estado global

import React from 'react';

const HUD: React.FC = () => {
  // TODO
  return <div className="hud">{ /* TODO */ }</div>;
};

export default HUD;
