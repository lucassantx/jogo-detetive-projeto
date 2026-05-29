// TODO Dev 3 — Sprint 1 | Issues #4 #5 #8
// Componente principal do mapa — baseado no protótipo Figma (MapScreen.tsx)
//
// Responsabilidades:
//   - Grid 10×10 com CSS Grid, células 48×48px
//   - Névoa de guerra: overlay escuro em células não reveladas
//   - Movimentação: WASD / teclas de seta
//   - Ícone ✦ com pulse nas células com pista
//   - Animação fade-in 300ms ao revelar célula
//   - Linha pontilhada TSP (Issue #8, Sprint 2)
//   - Bloquear movimento durante diálogo ativo
//
// Integração:
//   - POST /api/partida/:id/mover   (Sprint 2)
//   - GET  /api/partida/:id/visao   via BFS (Dev 1)
//   - GET  /api/partida/:id/rota    para linha TSP (Sprint 2)
//
// Ver store/gameStore.ts para estado global (Dev 3 + Dev 4, Dia 1)

import React from 'react';

const MapScreen: React.FC = () => {
  // TODO
  return <div className="map-screen">{ /* TODO */ }</div>;
};

export default MapScreen;
