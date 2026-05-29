// TODO Dev 3 — Sprint 1 | Issue #6
// Componente de diálogo com NPCs — baseado no protótipo Figma (DialogueScreen.tsx)
//
// Comportamento:
//   - Abre automaticamente ao entrar em célula com NPC
//   - Efeito typewriter: 30ms por caractere
//   - Botões de escolha aparecem apenas após texto completo
//   - Fade-out do nó atual → chamada a /escolha → fade-in do próximo nó
//   - Se escolha revelar pista: dispara animação de coleta (integração Issue #5)
//   - Nó terminal: exibe botão "Encerrar conversa"
//   - XP ganho reflete no HUD imediatamente
//
// Integração:
//   - POST /api/partida/:id/interagir
//   - POST /api/partida/:id/escolha

import React from 'react';

interface DialogueScreenProps {
  celulaAtiva: { x: number; y: number } | null;
  onFechar: () => void;
}

const DialogueScreen: React.FC<DialogueScreenProps> = ({ celulaAtiva, onFechar }) => {
  // TODO
  return <div className="dialogue-screen">{ /* TODO */ }</div>;
};

export default DialogueScreen;
