import React, { useEffect, useRef } from 'react';
import { useGameStore, MAX_INTERACOES_NPC } from '../../store/gameStore';
import { useMovimento } from './useMovimento';
import './Map.css';

// Constantes derivadas de theme.css (--cell-size: 48px) e Map.css (gap: 2px, border: 2px)
const CELL = 48;
const GAP  = 2;
const BORD = 2;
const cx   = (n: number) => BORD + n * (CELL + GAP) + CELL / 2;
const GRID_PX = BORD * 2 + 10 * CELL + 9 * GAP; // 502

const MapScreen: React.FC = () => {
  useMovimento();

  const posicao            = useGameStore(s => s.posicao);
  const celulasReveladas   = useGameStore(s => s.celulasReveladas);
  const pistas             = useGameStore(s => s.pistas);
  const npcs               = useGameStore(s => s.npcs);
  const dialogoAtivo       = useGameStore(s => s.dialogoAtivo);
  const coletarPista       = useGameStore(s => s.coletarPista);
  const iniciarDialogo     = useGameStore(s => s.iniciarDialogo);
  const rotaTSP            = useGameStore(s => s.rotaTSP);
  const mostrandoRota      = useGameStore(s => s.mostrandoRota);
  const toggleRota         = useGameStore(s => s.toggleRota);
  const escolhasRaizUsadas = useGameStore(s => s.escolhasRaizUsadas);
  const partidaId          = useGameStore(s => s.partidaId);

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

  // Pontos do trajeto: posição do detetive + waypoints TSP em ordem
  const rotaPontos = mostrandoRota && rotaTSP.length > 0
    ? [posicao, ...rotaTSP]
    : [];
  const todasColetadas = mostrandoRota && rotaTSP.length === 0;

  return (
    <div className="map-screen">
      {/* Controle da rota TSP — Issue #8 */}
      <div className="map-controls">
        <button
          className={`btn-rota ${mostrandoRota ? 'btn-rota--ativo' : ''}`}
          onClick={toggleRota}
          disabled={!partidaId}
          title={!partidaId ? 'Requer conexão com o servidor' : 'Calcular rota ótima de investigação (TSP)'}
        >
          {mostrandoRota ? '✕ Ocultar Rota' : '▶ Sugerir rota'}
        </button>
        {todasColetadas && (
          <span className="rota-msg">Todas as pistas coletadas</span>
        )}
      </div>

      {/* Wrapper relativo para posicionar o SVG sobre o grid */}
      <div className="grid-wrapper">
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

        {/* SVG: linha pontilhada conectando waypoints TSP na ordem retornada */}
        {mostrandoRota && rotaPontos.length > 1 && (
          <svg
            className="rota-svg"
            width={GRID_PX}
            height={GRID_PX}
            aria-hidden="true"
          >
            <polyline
              points={rotaPontos.map(p => `${cx(p.x)},${cx(p.y)}`).join(' ')}
              stroke="#d4a853"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Círculos nos waypoints para destacar os locais com pistas */}
            {rotaTSP.map((p, i) => (
              <circle
                key={i}
                cx={cx(p.x)}
                cy={cx(p.y)}
                r={5}
                fill="none"
                stroke="#d4a853"
                strokeWidth="1.5"
                opacity="0.7"
              />
            ))}
          </svg>
        )}
      </div>

      <p className="map-hint">WASD ou ↑↓←→ para mover</p>
    </div>
  );
};

export default MapScreen;
