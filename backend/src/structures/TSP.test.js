// TSP.test.js
// Testes Jest para o algoritmo TSP com seleção automática

const {
  calcularRotaTSP,
  calcularRotaTSPComDetalhes,
  heldKarp,
  vizinhoMaisProximo,
  vizinhoMaisProximoMelhorado,
  doisOpt,
  distancia,
  comprimentoRota,
  validarRota
} = require('./TSP');

describe('TSP - Testes de Funcionalidade Básica', () => {

  it('deve funcionar com array de 1 local', () => {
    const pontos = [{ id: "A", x: 0, y: 0 }];
    const rota = calcularRotaTSP(pontos);

    expect(rota).toHaveLength(1);
    expect(rota[0].id).toBe("A");
  });

  it('deve funcionar com array vazio', () => {
    const pontos = [];
    const rota = calcularRotaTSP(pontos);
    expect(rota).toHaveLength(0);
  });

  it('deve funcionar com 2 pontos', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 }
    ];

    const rota = calcularRotaTSP(pontos);
    expect(rota).toHaveLength(2);
  });

  it('deve visitar todos os pontos exatamente uma vez', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 },
      { id: "D", x: 0, y: 10 }
    ];

    const rota = calcularRotaTSP(pontos);
    const idsNaRota = rota.map(p => p.id);

    expect(idsNaRota).toHaveLength(4);
    expect(new Set(idsNaRota).size).toBe(4);
  });
});

describe('TSP - Held-Karp (Algoritmo Exato)', () => {

  it('deve retornar rota ótima para 3 pontos (triângulo)', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 5, y: 10 }
    ];

    const rota = heldKarp(pontos);
    const distanciaTotal = comprimentoRota(rota);

    expect(rota).toHaveLength(3);
    expect(distanciaTotal).toBeGreaterThan(30);
    expect(distanciaTotal).toBeLessThan(33);
  });

  it('deve retornar rota ótima para quadrado', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 },
      { id: "D", x: 0, y: 10 }
    ];

    const rota = heldKarp(pontos);
    const distancia = comprimentoRota(rota);

    expect(distancia).toBeCloseTo(40, 1);
  });

  it('deve funcionar com 5 pontos', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 },
      { id: "D", x: 0, y: 10 },
      { id: "E", x: 5, y: 5 }
    ];

    const rota = heldKarp(pontos);
    expect(rota).toHaveLength(5);
    expect(validarRota(rota, pontos)).toBe(true);
  });

  it('deve funcionar com 10 pontos', () => {
    const pontos = Array.from({ length: 10 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const rota = heldKarp(pontos);
    expect(rota).toHaveLength(10);
    expect(validarRota(rota, pontos)).toBe(true);
  });
});

describe('TSP - Seleção Automática do Algoritmo', () => {

  it('deve usar Held-Karp para n ≤ 10', () => {
    const pontos = Array.from({ length: 8 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const detalhes = calcularRotaTSPComDetalhes(pontos);

    expect(detalhes.algoritmo).toContain("Held-Karp");
    expect(detalhes.numPontos).toBe(8);
  });

  it('deve usar heurística para n > 10', () => {
    const pontos = Array.from({ length: 20 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const detalhes = calcularRotaTSPComDetalhes(pontos);

    expect(detalhes.algoritmo).toContain("heurístico");
    expect(detalhes.numPontos).toBe(20);
  });

  it('deve permitir forçar heurística mesmo com n ≤ 10', () => {
    const pontos = Array.from({ length: 8 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const rotaHeuristica = calcularRotaTSP(pontos, { forceHeuristic: true });
    const rotaExata = calcularRotaTSP(pontos);

    expect(validarRota(rotaHeuristica, pontos)).toBe(true);
    expect(validarRota(rotaExata, pontos)).toBe(true);
  });
});

describe('TSP - Comparação Exato vs Heurístico', () => {

  it('para n=5, Held-Karp deve ser igual ou melhor que heurística', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 100, y: 0 },
      { id: "C", x: 50, y: 1 },
      { id: "D", x: 50, y: 100 },
      { id: "E", x: 51, y: 99 }
    ];

    const rotaExata = heldKarp(pontos);
    const rotaHeuristica = vizinhoMaisProximoMelhorado(pontos);
    const rotaRefinada = doisOpt(rotaHeuristica);

    const distExata = comprimentoRota(rotaExata);
    const distHeuristica = comprimentoRota(rotaRefinada);

    expect(distExata).toBeLessThanOrEqual(distHeuristica);
  });
});

describe('TSP - Testes de Performance', () => {

  it('Held-Karp para n=10 deve executar em menos de 1 segundo', () => {
    const pontos = Array.from({ length: 10 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const inicio = Date.now();
    const rota = heldKarp(pontos);
    const tempo = Date.now() - inicio;

    expect(rota).toHaveLength(10);
    expect(tempo).toBeLessThan(1000);
  });

  it('Heurística para n=100 deve executar em menos de 200ms', () => {
    const pontos = Array.from({ length: 100 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 1000,
      y: Math.random() * 1000
    }));

    const inicio = Date.now();
    const rota = calcularRotaTSP(pontos, { forceHeuristic: true });
    const tempo = Date.now() - inicio;

    expect(rota).toHaveLength(100);
    expect(tempo).toBeLessThan(200);
  });
});

describe('TSP - Testes de Funções Auxiliares', () => {

  it('distancia deve calcular corretamente', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };

    expect(distancia(a, b)).toBe(5);
  });

  it('comprimentoRota deve calcular soma total com retorno', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 }
    ];

    const comprimento = comprimentoRota(pontos);
    expect(comprimento).toBeCloseTo(34.14, 1);
  });

  it('validarRota deve detectar rotas inválidas', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 }
    ];

    const rotaValida = [pontos[0], pontos[1], pontos[2]];
    const rotaInvalida = [pontos[0], pontos[0], pontos[1]];

    expect(validarRota(rotaValida, pontos)).toBe(true);
    expect(validarRota(rotaInvalida, pontos)).toBe(false);
  });
});

describe('TSP - Testes de Contrato (Endpoint)', () => {

  it('calcularRotaTSPComDetalhes deve retornar estrutura correta', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 }
    ];

    const resultado = calcularRotaTSPComDetalhes(pontos);

    expect(resultado).toHaveProperty('rota');
    expect(resultado).toHaveProperty('idsRota');
    expect(resultado).toHaveProperty('distanciaTotal');
    expect(resultado).toHaveProperty('numPontos');
    expect(resultado).toHaveProperty('algoritmo');
    expect(resultado).toHaveProperty('tempoExecucaoMs');

    expect(resultado.idsRota).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    expect(resultado.numPontos).toBe(3);
  });

  it('Endpoint deve continuar funcionando sem alteração de contrato', () => {
    const pontos = [
      { id: "ponto1", x: 0, y: 0 },
      { id: "ponto2", x: 10, y: 0 }
    ];

    const rota = calcularRotaTSP(pontos);
    const idsRota = rota.map(p => p.id);

    expect(Array.isArray(idsRota)).toBe(true);
    expect(idsRota.length).toBe(2);
    expect(idsRota).toContain('ponto1');
    expect(idsRota).toContain('ponto2');
  });
});

describe('TSP - Testes de Cobertura Adicional', () => {

  it('vizinhoMaisProximoMelhorado deve funcionar com array vazio', () => {
    const resultado = vizinhoMaisProximoMelhorado([]);
    expect(resultado).toEqual([]);
  });

  it('vizinhoMaisProximoMelhorado deve funcionar com 1 ponto', () => {
    const pontos = [{ id: "A", x: 0, y: 0 }];
    const resultado = vizinhoMaisProximoMelhorado(pontos);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("A");
  });

  it('vizinhoMaisProximoMelhorado deve funcionar com 2 pontos', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 }
    ];
    const resultado = vizinhoMaisProximoMelhorado(pontos);
    expect(resultado).toHaveLength(2);
  });

  it('doisOpt deve funcionar com array vazio', () => {
    const resultado = doisOpt([]);
    expect(resultado).toEqual([]);
  });

  it('doisOpt deve funcionar com 1 ponto', () => {
    const pontos = [{ id: "A", x: 0, y: 0 }];
    const resultado = doisOpt(pontos);
    expect(resultado).toHaveLength(1);
  });

  it('doisOpt deve funcionar com 2 pontos', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 }
    ];
    const resultado = doisOpt(pontos);
    expect(resultado).toHaveLength(2);
  });

  it('doisOpt deve funcionar com 3 pontos (não modifica)', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 5, y: 10 }
    ];
    const resultado = doisOpt(pontos);
    expect(resultado).toHaveLength(3);
  });

  it('heldKarp deve funcionar com n=3', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 5, y: 10 }
    ];
    const resultado = heldKarp(pontos);
    expect(resultado).toHaveLength(3);
  });

  it('calcularRotaTSP com forceHeuristic para n=3 deve usar heurística', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 5, y: 10 }
    ];
    const resultado = calcularRotaTSP(pontos, { forceHeuristic: true });
    expect(resultado).toHaveLength(3);
  });

  it('calcularRotaTSPComDetalhes com array vazio deve retornar estrutura correta', () => {
    const resultado = calcularRotaTSPComDetalhes([]);
    expect(resultado.rota).toEqual([]);
    expect(resultado.idsRota).toEqual([]);
    expect(resultado.distanciaTotal).toBe(0);
    expect(resultado.numPontos).toBe(0);
    expect(resultado.algoritmo).toBe("Nenhum");
    expect(resultado.tempoExecucaoMs).toBe(0);
  });

  it('calcularRotaTSPComDetalhes com null deve retornar estrutura correta', () => {
    const resultado = calcularRotaTSPComDetalhes(null);
    expect(resultado.rota).toEqual([]);
    expect(resultado.idsRota).toEqual([]);
    expect(resultado.distanciaTotal).toBe(0);
    expect(resultado.numPontos).toBe(0);
    expect(resultado.algoritmo).toBe("Nenhum");
    expect(resultado.tempoExecucaoMs).toBe(0);
  });

  it('distancia com parâmetros undefined deve retornar 0', () => {
    expect(distancia(null, null)).toBe(0);
    expect(distancia(undefined, undefined)).toBe(0);
    expect(distancia({ x: 0, y: 0 }, null)).toBe(0);
  });

  it('comprimentoRota com rota de 1 ponto deve retornar 0', () => {
    const pontos = [{ id: "A", x: 0, y: 0 }];
    expect(comprimentoRota(pontos)).toBe(0);
  });

  it('validarRota com parâmetros inválidos deve retornar false', () => {
    expect(validarRota(null, [])).toBe(false);
    expect(validarRota([], null)).toBe(false);
    expect(validarRota([], [])).toBe(true);  // Listas vazias são consideradas válidas
    expect(validarRota(null, null)).toBe(false);
  });

  it('vizinhoMaisProximo com array vazio deve retornar []', () => {
    expect(vizinhoMaisProximo([])).toEqual([]);
  });

  it('vizinhoMaisProximo com 1 ponto deve retornar o ponto', () => {
    const pontos = [{ id: "A", x: 0, y: 0 }];
    const resultado = vizinhoMaisProximo(pontos);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("A");
  });
});