import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { useGameStore, Notificacao } from '../../store/gameStore';
import Inventario from './Inventario';
import './HUD.css';

const XP_POR_LEVEL = 100;
const NIVEL_MAXIMO = 10; // reservado para investigação completa (todas pistas + todos NPCs)

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
  const xp                = useGameStore(s => s.xp);
  const notificacoes      = useGameStore(s => s.notificacoes);
  const setStatusJogo     = useGameStore(s => s.setStatusJogo);
  const pistas            = useGameStore(s => s.pistas);
  const pistasColetadas   = useGameStore(s => s.pistasColetadas);
  const npcs              = useGameStore(s => s.npcs);
  const npcsInterrogados  = useGameStore(s => s.npcsInterrogados);

  // ── Condição de investigação completa ──────────────────────────────────
  // Nível 10 é reservado exclusivamente para esse estado — não é alcançável
  // só acumulando XP de diálogo, garantindo que "acusar" só libera quando
  // o jogador de fato coletou tudo e falou com todos os suspeitos.
  const todasPistasColetadas  = pistasColetadas.length >= pistas.length;
  const suspeitosFalados      = npcs.filter(n => npcsInterrogados.has(n.id)).length;
  const todosNpcsInterrogados = suspeitosFalados >= npcs.length;
  const investigacaoCompleta  = todasPistasColetadas && todosNpcsInterrogados;

  const levelBruto = Math.floor(xp / XP_POR_LEVEL) + 1;
  const level      = investigacaoCompleta ? NIVEL_MAXIMO : Math.min(levelBruto, NIVEL_MAXIMO - 1);
  const xpNoLevel  = xp % XP_POR_LEVEL;
  const percentXP  = investigacaoCompleta ? 100 : (xpNoLevel / XP_POR_LEVEL) * 100;

  // ── Painel retrátil (estilo Resident Evil 4) ───────────────────────────
  const [inventarioAberto, setInventarioAberto] = useState(false);

  const [mostrarLevelUp, setMostrarLevelUp] = useState(false);
  const levelAnterior = useRef(level);

  useEffect(() => {
    if (level > levelAnterior.current) {
      setMostrarLevelUp(true);
      setInventarioAberto(true); // abre automaticamente para o jogador ver a conquista
      const t = setTimeout(() => setMostrarLevelUp(false), 2500);
      levelAnterior.current = level;
      return () => clearTimeout(t);
    }
    levelAnterior.current = level;
  }, [level]);

  return (
    <>
      {/* ── aba retrátil — sempre visível, independente do painel estar aberto ── */}
      <button
        className="hud-toggle-tab"
        onClick={() => setInventarioAberto(o => !o)}
        aria-label={inventarioAberto ? 'Fechar painel de investigação' : 'Abrir painel de investigação'}
        title={inventarioAberto ? 'Fechar painel' : 'Abrir painel de pistas e nível'}
      >
        🗒<span className="hud-toggle-count">{pistasColetadas.length}</span>
      </button>

      <div className={`hud ${inventarioAberto ? 'hud--aberto' : 'hud--fechado'}`}>
        <div className="hud-header">
          <span className="hud-header-titulo">Investigação</span>
          <button
            className="hud-close-btn"
            onClick={() => setInventarioAberto(false)}
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </div>

        {/* ── XP e level ─────────────────────────────────────────────────── */}
        <div className="hud-xp">
          <div className="hud-level">
            <span className="level-label">Nível</span>
            <span className="level-valor">{level}</span>
          </div>
          <div className="xp-barra-fundo">
            <div className="xp-barra-preenchimento" style={{ width: `${percentXP}%` }} />
          </div>
          <span className="xp-texto">
            {investigacaoCompleta ? 'Investigação completa' : `${xpNoLevel} / ${XP_POR_LEVEL} XP`}
          </span>
        </div>

        {mostrarLevelUp && (
          <div className="levelup-badge" role="alert">
            {level === NIVEL_MAXIMO ? 'INVESTIGAÇÃO COMPLETA — PRONTO PARA ACUSAR' : 'LEVEL UP!'}
          </div>
        )}

        {/* ── inventário ──────────────────────────────────────────────────── */}
        <Inventario />

        {/* ── botão acusar — liberado apenas no Nível 10 ────────────────────── */}
        <div className="hud-acusar">
          <button
            className="btn-acusar"
            onClick={() => investigacaoCompleta && setStatusJogo('acusando')}
            disabled={!investigacaoCompleta}
            title={
              investigacaoCompleta
                ? 'Fazer acusação final'
                : 'Disponível apenas no Nível 10 — colete todas as pistas e converse com todos os suspeitos'
            }
          >
            ⚖ Acusar Suspeito
          </button>
          {!investigacaoCompleta && (
            <p className="hud-progresso">
              Pistas {pistasColetadas.length}/{pistas.length} · Suspeitos {suspeitosFalados}/{npcs.length}
            </p>
          )}
        </div>
      </div>

      {/* ── notificações deslizantes — fora do painel para não sofrer o     */}
      {/* transform de abrir/fechar (transform cria containing block para  */}
      {/* descendentes fixed, o que faria os toasts somarem off-screen)    */}
      <div className={`notificacoes-container ${inventarioAberto ? 'notificacoes-container--recuado' : ''}`}>
        {notificacoes.map(n => (
          <NotificacaoCard key={n.id} notif={n} />
        ))}
      </div>
    </>
  );
};

export default HUD;