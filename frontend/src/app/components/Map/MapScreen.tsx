import React, { useEffect, useRef } from 'react';
import { useGameStore, Notificacao } from '../../store/gameStore';
import { useMovimento } from './useMovimento';
import './Map.css';

// ─── Notification card (Issue #5) ────────────────────────────────────────────

const NotificacaoCard: React.FC<{
  notif: Notificacao;
  onDismiss: (id: string) => void;
}> = ({ notif, onDismiss }) => {
  const cor = notif.peso >= 9 ? 'high' : notif.peso >= 7 ? 'medium' : 'low';

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notif.id), 3200);
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  return (
    <div className={`notificacao notificacao--${cor}`} role="alert">
      <span className="notificacao-icone" aria-hidden="true">✦</span>
      <div className="notificacao-info">
        <span className="notificacao-nome">{notif.nome}</span>
        <span className="notificacao-peso">Peso: {notif.peso}</span>
      </div>
    </div>
  );
};

// ─── MapScreen ────────────────────────────────────────────────────────────────

const MapScreen: React.FC = () => {
  useMovimento();

  const posicao         = useGameStore(s => s.posicao);
  const celulasReveladas = useGameStore(s => s.celulasReveladas);
  const pistas          = useGameStore(s => s.pistas);
  const npcs            = useGameStore(s => s.npcs);
  const notificacoes    = useGameStore(s => s.notificacoes);
  const dialogoAtivo    = useGameStore(s => s.dialogoAtivo);
  const xp              = useGameStore(s => s.xp);
  const coletarPista    = useGameStore(s => s.coletarPista);
  const iniciarDialogo  = useGameStore(s => s.iniciarDialogo);
  const removerNotif    = useGameStore(s => s.removerNotificacao);

  // Detecta pista/NPC ao entrar em nova célula
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
      {/* HUD mínimo de XP — Dev 4 substituirá por componente completo */}
      <div className="map-xp-badge" aria-label={`XP: ${xp}`}>
        ✦ {xp} XP
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
          const npc   = npcs.find(n => n.celula.x === x && n.celula.y === y);
          const hasClue = isRevealed && !!pista;
          const hasNpc  = isRevealed && !!npc;

          return (
            <div
              key={key}
              className={[
                'cell',
                isRevealed  ? 'cell--revealed'  : 'cell--fog',
                hasClue     ? 'cell--clue'       : '',
                hasNpc      ? 'cell--npc'        : '',
                isDetective ? 'cell--detective'  : '',
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
                <span className="cell-icon npc-icon" aria-hidden="true">◈</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Teclas de ajuda */}
      <p className="map-hint">WASD ou ↑↓←→ para mover</p>

      {/* Cards de notificação de pista coletada */}
      <div className="notificacoes-container" aria-live="polite">
        {notificacoes.map(n => (
          <NotificacaoCard key={n.id} notif={n} onDismiss={removerNotif} />
        ))}
      </div>
    </div>
  );
};

export default MapScreen;
