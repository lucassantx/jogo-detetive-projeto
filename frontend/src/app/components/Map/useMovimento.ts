// TODO Dev 3 — Sprint 1 | Issue #4
// Hook para movimentação do detetive no grid
//
// Responsabilidades:
//   - Ouvir eventos de teclado (WASD + setas)
//   - Validar limites do grid (0–9)
//   - Bloquear movimento quando dialogoAtivo === true
//   - Chamar POST /api/partida/:id/mover na Sprint 2
//
// Estado retornado: posicao { x, y }

import { useState, useEffect } from 'react';

export function useMovimento(dialogoAtivo: boolean) {
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // TODO — adicionar listener de keydown
    return () => {
      // TODO — remover listener
    };
  }, [dialogoAtivo]);

  return { posicao };
}
