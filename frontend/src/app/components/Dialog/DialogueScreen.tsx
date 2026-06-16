import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import './Dialog.css';

const TYPEWRITER_MS = 30;

const DialogueScreen: React.FC = () => {
  const dialogoAtivo   = useGameStore(s => s.dialogoAtivo);
  const noAtualData    = useGameStore(s => s.noAtualData);
  const npcAtual       = useGameStore(s => s.npcAtual);
  const avancarDialogo = useGameStore(s => s.avancarDialogo);
  const fecharDialogo  = useGameStore(s => s.fecharDialogo);

  const [displayText,   setDisplayText]   = useState('');
  const [textoCompleto, setTextoCompleto] = useState(false);
  const [visivel,       setVisivel]       = useState(false);
  const [aguardando,    setAguardando]    = useState(false);

  const npcDoNo     = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // abre o painel quando diálogo inicia; fecha quando termina
  useEffect(() => {
    if (dialogoAtivo) {
      setVisivel(true);
      setAguardando(false);
    } else {
      // dialogo encerrado pelo store — fecha o painel
      setVisivel(false);
      setAguardando(false);
      setDisplayText('');
      setTextoCompleto(false);
    }
  }, [dialogoAtivo]);

  // limpa texto ao trocar de NPC
  useEffect(() => {
    if (!dialogoAtivo) return;
    if (npcAtual !== npcDoNo.current) {
      setDisplayText('');
      setTextoCompleto(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [npcAtual, dialogoAtivo]);

  // typewriter dispara quando noAtualData chega
  useEffect(() => {
    if (!noAtualData) return;
    npcDoNo.current = npcAtual;
    setAguardando(false);
    setDisplayText('');
    setTextoCompleto(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayText(noAtualData.texto.slice(0, idx));
      if (idx >= noAtualData.texto.length) {
        clearInterval(intervalRef.current!);
        setTextoCompleto(true);
      }
    }, TYPEWRITER_MS);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [noAtualData]);

  const skipTypewriter = useCallback(() => {
    if (!noAtualData || textoCompleto) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(noAtualData.texto);
    setTextoCompleto(true);
  }, [noAtualData, textoCompleto]);

  const handleEscolha = useCallback((noId: string, index: number) => {
    if (aguardando) return;
    setAguardando(true);
    setTextoCompleto(false);
    setDisplayText('');
    avancarDialogo(noId, index);
  }, [aguardando, avancarDialogo]);

  const handleEncerrar = useCallback(() => {
    fecharDialogo();
  }, [fecharDialogo]);

  if (!visivel) return null;

  const no = noAtualData;

  return (
    <div
      className={`dialogue-overlay dialogue-overlay--visible`}
      role="dialog"
      aria-modal="true"
      aria-label={no ? `Diálogo com ${no.npc}` : 'Diálogo'}
    >
      <div className="dialogue-screen">
        {no && !aguardando ? (
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
                      className={[
                        'dialogue-choice-btn',
                        escolha.usado            ? 'dialogue-choice-btn--usado'    : '',
                        escolha.bloqueadaPorPista ? 'dialogue-choice-btn--bloqueada' : '',
                        escolha.visitado && !escolha.usado && !escolha.bloqueadaPorPista
                          ? 'dialogue-choice-btn--visitado' : '',
                      ].filter(Boolean).join(' ')}
                      disabled={escolha.usado || escolha.bloqueadaPorPista || aguardando}
                      onClick={() => !escolha.usado && !escolha.bloqueadaPorPista && handleEscolha(no.id, i)}
                    >
                      <span className="choice-xp">
                        {escolha.usado            ? '✓'
                          : escolha.bloqueadaPorPista ? '🔒'
                          : escolha.visitado       ? '↩'
                          : `+${escolha.xp} XP`}
                      </span>
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
        ) : aguardando ? (
          <div className="dialogue-carregando" aria-live="polite">
            Carregando…
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DialogueScreen;