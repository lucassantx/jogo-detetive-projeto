import React from 'react';
import { useGameStore, Pista } from '../../store/gameStore';

const corClasse = (peso: number) => {
  if (peso >= 9) return 'pista-card--alta';
  if (peso >= 7) return 'pista-card--media';
  return 'pista-card--baixa';
};

// ordena pistas por peso decrescente — reflexo do MaxHeap do backend
const ordenarPorPeso = (pistas: Pista[]) =>
  [...pistas].sort((a, b) => b.peso - a.peso);

const Inventario = () => {
  const pistasColetadas = useGameStore(s => s.pistasColetadas);
  const ordenadas = ordenarPorPeso(pistasColetadas);

  return (
    <aside className="inventario">
      <h2 className="inventario-titulo">Pistas</h2>

      {ordenadas.length === 0 ? (
        <p className="inventario-vazio">Nenhuma pista coletada ainda.</p>
      ) : (
        <ul className="inventario-lista">
          {ordenadas.map(p => (
            <li key={p.id} className={`pista-card ${corClasse(p.peso)}`}>
              <div className="pista-card-topo">
                <span className="pista-nome">{p.nome}</span>
                <span className="pista-peso">{p.peso}</span>
              </div>
              {p.descricao && (
                <p className="pista-descricao">{p.descricao}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Inventario;