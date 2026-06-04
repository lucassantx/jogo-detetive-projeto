import { useState } from 'react';
import { useGameStore, Pista } from '../../store/gameStore';
import './Accusation.css';

interface Suspeito {
  id: string;
  nome: string;
  icone: string;
  motivo: string;
}

interface ResultadoAcusacao {
  acertou: boolean;
  suspeitoAcusado: string;
  top3: Pista[];
  argumento: string;
}

const SUSPEITOS: Suspeito[] = [
  { id: 'victor',   nome: 'Victor Blackwood', icone: '🎩', motivo: 'Herdeiro do testamento alterado' },
  { id: 'adelaide', nome: 'Adelaide Cross',   icone: '🍵', motivo: 'Governanta com acesso à cozinha' },
  { id: 'harlow',   nome: 'Dr. Harlow',       icone: '🩺', motivo: 'Médico que prescreveu o remédio' },
];

const PARTIDA_ID_MOCK = 'mock-partida-001';

type Etapa = 'lista' | 'confirmacao' | 'resultado';

const corPista = (peso: number) => {
  if (peso >= 9) return 'pista-card--alta';
  if (peso >= 7) return 'pista-card--media';
  return 'pista-card--baixa';
};

const Accusation = () => {
  const pistasColetadas = useGameStore(s => s.pistasColetadas);

  const [etapa, setEtapa]                  = useState<Etapa>('lista');
  const [suspeitoSelecionado, setSuspeito] = useState<Suspeito | null>(null);
  const [resultado, setResultado]          = useState<ResultadoAcusacao | null>(null);
  const [carregando, setCarregando]        = useState(false);

  const selecionarSuspeito = (s: Suspeito) => {
    setSuspeito(s);
    setEtapa('confirmacao');
  };

  const confirmarAcusacao = async () => {
    if (!suspeitoSelecionado) return;
    setCarregando(true);

    try {
      const res = await fetch(`/api/partida/${PARTIDA_ID_MOCK}/acusar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspeitoId: suspeitoSelecionado.id }),
      });
      if (!res.ok) throw new Error();
      const data: ResultadoAcusacao = await res.json();
      setResultado(data);
    } catch {
      // mock local para Sprint 1 sem banco
      const top3 = [...pistasColetadas]
        .sort((a, b) => b.peso - a.peso)
        .slice(0, 3);

      setResultado({
        acertou: suspeitoSelecionado.id === 'victor',
        suspeitoAcusado: suspeitoSelecionado.nome,
        top3,
        argumento: suspeitoSelecionado.id === 'victor'
          ? 'As evidências apontam para Victor Blackwood como o assassino de Sir Edmund.'
          : `${suspeitoSelecionado.nome} não é o assassino. As pistas indicam outra direção.`,
      });
    } finally {
      setCarregando(false);
      setEtapa('resultado');
    }
  };

  // ── lista de suspeitos ───────────────────────────────────────────────────
  if (etapa === 'lista') {
    return (
      <div className="accusation-screen">
        <h1 className="accusation-titulo">Quem é o Assassino?</h1>
        <p className="accusation-subtitulo">Escolha o suspeito que você acredita ser o culpado.</p>
        <div className="accusation-suspeitos">
          {SUSPEITOS.map(s => (
            <button key={s.id} className="suspeito-card" onClick={() => selecionarSuspeito(s)}>
              <span className="suspeito-icone">{s.icone}</span>
              <span className="suspeito-nome">{s.nome}</span>
              <span className="suspeito-motivo">{s.motivo}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── confirmação ──────────────────────────────────────────────────────────
  if (etapa === 'confirmacao' && suspeitoSelecionado) {
    return (
      <div className="accusation-screen accusation-screen--confirmacao">
        <h2 className="accusation-titulo">Tem certeza?</h2>
        <p className="accusation-subtitulo">
          Você está prestes a acusar <strong>{suspeitoSelecionado.nome}</strong> pelo assassinato de Sir Edmund Blackwood.
        </p>
        <div className="accusation-acoes">
          <button className="btn btn--confirmar" onClick={confirmarAcusacao} disabled={carregando}>
            {carregando ? 'Enviando...' : 'Acusar'}
          </button>
          <button className="btn btn--cancelar" onClick={() => setEtapa('lista')} disabled={carregando}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ── resultado ────────────────────────────────────────────────────────────
  if (etapa === 'resultado' && resultado) {
    const classeResultado = resultado.acertou
      ? 'accusation-screen--vitoria'
      : 'accusation-screen--derrota';

    return (
      <div className={`accusation-screen ${classeResultado}`}>
        {resultado.acertou && (
          <div className="confetes" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="confete" style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        )}
        <h2 className="accusation-titulo">
          {resultado.acertou ? 'Caso Resolvido!' : 'Acusação Errada'}
        </h2>
        <p className="accusation-veredicto">{resultado.argumento}</p>
        <div className="accusation-pistas">
          <h3 className="pistas-titulo">Pistas usadas pelo detetive</h3>
          {resultado.top3.map(p => (
            <div key={p.id} className={`pista-card ${corPista(p.peso)}`}>
              <span className="pista-nome">{p.nome}</span>
              <span className="pista-peso">Peso: {p.peso}</span>
            </div>
          ))}
        </div>
        <button className="btn btn--reiniciar" onClick={() => window.location.reload()}>
          Jogar novamente
        </button>
      </div>
    );
  }

  return null;
};

export default Accusation;