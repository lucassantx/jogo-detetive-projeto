// TODO Dev 4 — Sprint 2 | Issue #7
// Tela de acusação final
//
// Fluxo:
//   1. Lista 3 suspeitos com nome, ícone e motivo resumido
//   2. Tela de confirmação: "Tem certeza?"
//   3. POST /api/partida/:id/acusar com suspeitoId
//   4. Backend retorna top3() do MaxHeap + veredicto
//   5. Acerto: tela verde + confetes CSS + argumento
//      Erro:   tela vermelha + shake + explicação
//   6. As 3 pistas usadas são exibidas com nome e peso
//   7. Botão "Jogar novamente" reinicia a partida
//
// Integração: POST /api/partida/:id/acusar

import React from 'react';

const Accusation: React.FC = () => {
  // TODO
  return <div className="accusation-screen">{ /* TODO */ }</div>;
};

export default Accusation;
