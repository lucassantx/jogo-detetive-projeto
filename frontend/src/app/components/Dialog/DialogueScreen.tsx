import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import './Dialog.css';

const TYPEWRITER_MS = 30;

const DialogueScreen: React.FC = () => {
  const dialogoAtivo   = useGameStore(s => s.dialogoAtivo);
  const noDialogoAtual = useGameStore(s => s.noDialogoAtual);
  const dialogos       = useGameStore(s => s.dialogos);
  const avancarDialogo = useGameStore(s => s.avancarDialogo);
  const fecharDialogo  = useGameStore(s => s.fecharDialogo);

  const [displayText,   setDisplayText]   = useState('');
  const [textoCompleto, setTextoCompleto] = useState(false);
  const [visivel,       setVisivel]       = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const no = noDialogoAtual ? dialogos[noDialogoAtual] : null;

  // Exibe/esconde o painel
  useEffect(() => {
    if (dialogoAtivo) setVisivel(true);
  }, [dialogoAtivo]);

  // Typewriter: reinicia a cada nó novo
  useEffect(() => {
    if (!no) return;
    setDisplayText('');
    setTextoCompleto(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayText(no.texto.slice(0, idx));
      if (idx >= no.texto.length) {
        clearInterval(intervalRef.current!);
        setTextoCompleto(true);
      }
    }, TYPEWRITER_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [noDialogoAtual]);

  // Clique no texto avança o typewriter
  const skipTypewriter = useCallback(() => {
    if (!no || textoCompleto) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(no.texto);
    setTextoCompleto(true);
  }, [no, textoCompleto]);

  const handleEscolha = (proximoId: string | null, xpGanho: number, pistaBloqueada: string | null) => {
    setVisivel(false);
    setTimeout(() => {
      avancarDialogo(proximoId, xpGanho, pistaBloqueada);
      if (proximoId) setVisivel(true);
    }, 260);
  };

  const handleEncerrar = () => {
    setVisivel(false);
    setTimeout(() => fecharDialogo(), 260);
  };

  if (!dialogoAtivo && !visivel) return null;

  return (
    <div
      className={`dialogue-overlay ${visivel ? 'dialogue-overlay--visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={no ? `Diálogo com ${no.npc}` : 'Diálogo'}
    >
      <div className="dialogue-screen">
        {no && (
          <>
            <div className="dialogue-npc-nome">{no.npc}</div>

            <div
              className="dialogue-text"
              onClick={skipTypewriter}
              title={textoCompleto ? undefined : 'Clique para avançar o texto'}
            >
              {displayText}
              {!textoCompleto && (
                <span className="typewriter-cursor" aria-hidden="true">▌</span>
              )}
            </div>

            {textoCompleto && (
              <div className="dialogue-choices">
                {no.escolhas.length > 0 ? (
                  no.escolhas.map((escolha, i) => (
                    <button
                      key={i}
                      className="dialogue-choice-btn"
                      onClick={() =>
                        handleEscolha(escolha.proximoId, escolha.xp, escolha.pistaBloqueada)
                      }
                    >
                      <span className="choice-xp">+{escolha.xp} XP</span>
                      {escolha.texto}
                    </button>
                  ))
                ) : (
                  <button
                    className="dialogue-choice-btn dialogue-choice-btn--end"
                    onClick={handleEncerrar}
                  >
                    Encerrar conversa
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DialogueScreen;
