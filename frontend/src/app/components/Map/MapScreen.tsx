import React, { useEffect, useRef } from 'react';
import { useGameStore, MAX_INTERACOES_NPC } from '../../store/gameStore';
import { useMovimento } from './useMovimento';
import './Map.css';

const MapScreen: React.FC = () => {
  useMovimento();

  const posicao          = useGameStore(s => s.posicao);
  const celulasReveladas = useGameStore(s => s.celulasReveladas);
  const pistas           = useGameStore(s => s.pistas);
  const npcs             = useGameStore(s => s.npcs);
  const dialogoAtivo     = useGameStore(s => s.dialogoAtivo);
  const coletarPista     = useGameStore(s => s.coletarPista);
  const iniciarDialogo   = useGameStore(s => s.iniciarDialogo);
  const rotaTSP          = useGameStore(s => s.rotaTSP);
  const mostrandoRota    = useGameStore(s => s.mostrandoRota);
  const toggleRota       = useGameStore(s => s.toggleRota);
  const escolhasRaizUsadas = useGameStore(s => s.escolhasRaizUsadas);

  // Auto-coleta pista e inicia diálogo ao entrar em nova célula
  const prevPos = useRef({ x: -1, y: -1 });
  useEffect(() => {
    if (prevPos.current.x === posicao.x && prevPos.current.y === posicao.y) return;
    prevPos.current = { ...posicao };

    const pista = pistas.find(p =>
      p.celula.x === posicao.x && p.celula.y === posicao.y && !p.coletada
    );
    if (pista) coletarPista(pista.id);

    const npc = npcs.find(n => n.celula.x === posicao.x && n.celula.y === posicao.y);
    if (npc && !dialogoAtivo) iniciarDialogo(npc.id);
  }, [posicao.x, posicao.y]);

  return (
    <div className="map-screen">
      {/* Controle da rota TSP — Issue #8 */}
      <div className="map-controls">
        <button
          className={`btn-rota ${mostrandoRota ? 'btn-rota--ativo' : ''}`}
          onClick={toggleRota}
          title="Mostrar rota ótima de investigação calculada pelo TSP"
        >
          {mostrandoRota ? '✕ Ocultar Rota' : '▶ Ver Rota'}
        </button>
      </div>

      <div
        className="grid"
        role="grid"
        aria-label="Mapa — Mansão Blackwood"
      >
        {Array.from({ length: 100 }, (_, i) => {
          const x = i % 10;
          const y = Math.floor(i / 10);
          const key = `${x},${y}`;
          const isRevealed  = celulasReveladas.has(key);
          const isDetective = posicao.x === x && posicao.y === y;
          const pista = pistas.find(p => p.celula.x === x && p.celula.y === y && !p.coletada);
          const npc        = npcs.find(n => n.celula.x === x && n.celula.y === y);
          const npcEsgotado = !!npc && (escolhasRaizUsadas[npc.id]?.length ?? 0) >= (MAX_INTERACOES_NPC[npc.id] ?? Infinity);
          const hasClue = isRevealed && !!pista;
          const hasNpc  = isRevealed && !!npc;
          const tspIndex = mostrandoRota
            ? rotaTSP.findIndex(r => r.x === x && r.y === y)
            : -1;
          const hasTsp = tspIndex >= 0;

          return (
            <div
              key={key}
              className={[
                'cell',
                isRevealed  ? 'cell--revealed'  : 'cell--fog',
                hasClue      ? 'cell--clue'          : '',
                hasNpc       ? 'cell--npc'           : '',
                npcEsgotado  ? 'cell--npc-esgotado'  : '',
                isDetective  ? 'cell--detective'     : '',
                hasTsp       ? 'cell--tsp'           : '',
              ].filter(Boolean).join(' ')}
              aria-label={
                isDetective ? 'Detetive' :
                hasClue     ? `Pista: ${pista!.nome}` :
                hasNpc      ? `NPC: ${npc!.nome}` :
                isRevealed  ? 'Revelada' : 'Névoa'
              }
            >
              {isDetective && (
                <span className="cell-icon detective-icon" aria-hidden="true">◉</span>
              )}
              {!isDetective && hasNpc && (
                <span
                  className={`cell-icon npc-icon ${npcEsgotado ? 'npc-icon--esgotado' : ''}`}
                  aria-hidden="true"
                >
                  {npcEsgotado ? '◇' : '◈'}
                </span>
              )}
              {hasTsp && (
                <span className="cell-tsp-badge" aria-hidden="true">{tspIndex + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="map-hint">WASD ou ↑↓←→ para mover</p>
    </div>
  );
};

export default MapScreen;
