import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { useGameStore, Notificacao } from '../../store/gameStore';
import Inventario from './Inventario';
import './HUD.css';

const XP_POR_LEVEL = 100;

const corNotificacao = (peso: number) => {
  if (peso >= 9) return 'notificacao--alta';
  if (peso >= 7) return 'notificacao--media';
  return 'notificacao--baixa';
};

const NotificacaoCard = ({ notif }: { notif: Notificacao }) => {
  const remover = useGameStore(s => s.removerNotificacao);

  useEffect(() => {
    const t = setTimeout(() => remover(notif.id), 3000);
    return () => clearTimeout(t);
  }, [notif.id, remover]);

  return (
    <div className={`pista-notification ${corNotificacao(notif.peso)}`} role="alert">
      <span className="notificacao-icone">✦</span>
      <div className="notificacao-texto">
        <span className="notificacao-nome">{notif.nome}</span>
        <span className="notificacao-peso">Peso: {notif.peso}</span>
      </div>
    </div>
  );
};

const HUD = () => {
  const xp            = useGameStore(s => s.xp);
  const notificacoes  = useGameStore(s => s.notificacoes);
  const setStatusJogo = useGameStore(s => s.setStatusJogo);

  const level      = Math.floor(xp / XP_POR_LEVEL) + 1;
  const xpNoLevel  = xp % XP_POR_LEVEL;
  const percentXP  = (xpNoLevel / XP_POR_LEVEL) * 100;

  const [mostrarLevelUp, setMostrarLevelUp] = useState(false);
  const levelAnterior = useRef(level);

  useEffect(() => {
    if (level > levelAnterior.current) {
      setMostrarLevelUp(true);
      const t = setTimeout(() => setMostrarLevelUp(false), 2000);
      levelAnterior.current = level;
      return () => clearTimeout(t);
    }
    levelAnterior.current = level;
  }, [level]);

  return (
    <div className="hud">
      {/* ── XP e level ─────────────────────────────────────────────────── */}
      <div className="hud-xp">
        <div className="hud-level">
          <span className="level-label">Nível</span>
          <span className="level-valor">{level}</span>
        </div>
        <div className="xp-barra-fundo">
          <div className="xp-barra-preenchimento" style={{ width: `${percentXP}%` }} />
        </div>
        <span className="xp-texto">{xpNoLevel} / {XP_POR_LEVEL} XP</span>
      </div>

      {mostrarLevelUp && (
        <div className="levelup-badge" role="alert">LEVEL UP!</div>
      )}

      {/* ── inventário ──────────────────────────────────────────────────── */}
      <Inventario />

      {/* ── botão acusar ────────────────────────────────────────────────── */}
      <div className="hud-acusar">
        <button className="btn-acusar" onClick={() => setStatusJogo('acusando')}>
          ⚖ Acusar Suspeito
        </button>
      </div>

      {/* ── notificações deslizantes ────────────────────────────────────── */}
      <div className="notificacoes-container">
        {notificacoes.map(n => (
          <NotificacaoCard key={n.id} notif={n} />
        ))}
      </div>
    </div>
  );
};

export default HUD;