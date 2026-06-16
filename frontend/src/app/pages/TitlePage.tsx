import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './TitlePage.css';

const TitlePage = () => {
  const setStatus = useGameStore(s => s.setStatusJogo);
  const [animando, setAnimando] = useState(false);

  const iniciarJogo = () => {
    setAnimando(true);
    setTimeout(() => setStatus('jogando'), 800);
  };

  return (
    <div className={`title-page ${animando ? 'title-page--saindo' : ''}`}>
      <div className="title-content">
        <p className="title-subtitulo">Detective's Manual</p>
        <h1 className="title-titulo">Caso Blackwood</h1>
        <p className="title-descricao">
          Lorde Edmund Blackwood foi encontrado morto em sua mansão.<br />
          As evidências apontam para assassinato. Encontre o culpado.
        </p>
        <button className="title-btn" onClick={iniciarJogo}>
          Iniciar Investigação
        </button>
      </div>
      <p className="title-rodape">Blackwood Manor, Inglaterra — 1923</p>
    </div>
  );
};

export default TitlePage;