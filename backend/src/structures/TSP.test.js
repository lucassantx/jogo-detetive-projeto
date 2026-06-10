const { calcularRotaTSP, vizinhoMaisProximo, doisOpt } = require('./TSP');

// locais baseados no grid 10×10 do caso Blackwood
const locaisCaso = [
  { id: 'biblioteca',        x: 1, y: 1 },
  { id: 'hall',              x: 1, y: 0 },
  { id: 'escritorio',        x: 0, y: 1 },
  { id: 'cozinha',           x: 3, y: 0 },
  { id: 'estufa',            x: 3, y: 1 },
  { id: 'sala_jantar',       x: 2, y: 0 },
  { id: 'sala_estar',        x: 2, y: 1 },
  { id: 'jardim',            x: 5, y: 0 },
  { id: 'quarto_guarda',     x: 0, y: 2 },
  { id: 'quarto_convidados', x: 1, y: 2 },
];

function custoTotal(rota) {
  let total = 0;
  for (let i = 0; i < rota.length - 1; i++) {
    total += Math.sqrt((rota[i].x - rota[i+1].x) ** 2 + (rota[i].y - rota[i+1].y) ** 2);
  }
  return total;
}

describe('TSP — Issue #2', () => {
  it('funciona com array de 1 local (retorna lista de 1 elemento)', () => {
    const resultado = calcularRotaTSP([{ id: 'unico', x: 2, y: 3 }]);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('unico');
  });

  it('rota retornada é mais curta ou igual à ordem aleatória original', () => {
    // ordem aleatória como baseline
    const ordemAleatoria = [...locaisCaso].sort(() => Math.random() - 0.5);
    const custoAleatorio = custoTotal(ordemAleatoria);

    const rotaOtimizada = calcularRotaTSP([...locaisCaso]);
    const custoOtimizado = custoTotal(rotaOtimizada);

    expect(custoOtimizado).toBeLessThanOrEqual(custoAleatorio + 0.001);
  });

  it('vizinhoMaisProximo constrói rota passando por todos os locais', () => {
    const rota = vizinhoMaisProximo(locaisCaso, 'escritorio');
    expect(rota).toHaveLength(locaisCaso.length);

    // todos os locais devem estar presentes
    const ids = rota.map(l => l.id).sort();
    const esperados = locaisCaso.map(l => l.id).sort();
    expect(ids).toEqual(esperados);
  });

  it('doisOpt não piora o custo total da rota recebida', () => {
    const rotaInicial = vizinhoMaisProximo(locaisCaso);
    const custoAntes = custoTotal(rotaInicial);

    const rotaRefinada = doisOpt(rotaInicial);
    const custoDepois = custoTotal(rotaRefinada);

    expect(custoDepois).toBeLessThanOrEqual(custoAntes + 0.001);
  });

  it('preserva todos os locais após 2-opt (sem perder ou duplicar)', () => {
    const rotaInicial = vizinhoMaisProximo(locaisCaso);
    const rotaRefinada = doisOpt(rotaInicial);

    expect(rotaRefinada).toHaveLength(locaisCaso.length);
    const ids = rotaRefinada.map(l => l.id).sort();
    const esperados = locaisCaso.map(l => l.id).sort();
    expect(ids).toEqual(esperados);
  });

  it('funciona com array vazio sem quebrar', () => {
    const resultado = calcularRotaTSP([]);
    expect(resultado).toEqual([]);
  });
});