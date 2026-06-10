// TSP.test.js
// Testes Jest para o algoritmo TSP heurístico

const {
  calcularRotaTSP,
  vizinhoMaisProximo,
  vizinhoMaisProximoMelhorado,
  doisOpt,
  doisOptCompleto,
  distancia,
  comprimentoRota,
  validarRota
} = require('./TSP');

describe('TSP - Testes de Funcionalidade Básica', () => {

  it('deve funcionar com array de 1 local (retorna lista de 1 elemento)', () => {
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

  it('deve funcionar com 2 pontos (rota trivial de ida e volta)', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 }
    ];

    const rota = calcularRotaTSP(pontos);

    expect(rota).toHaveLength(2);
    expect(rota.map(p => p.id)).toEqual(expect.arrayContaining(["A", "B"]));
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
    expect(idsNaRota).toContain("A");
    expect(idsNaRota).toContain("B");
    expect(idsNaRota).toContain("C");
    expect(idsNaRota).toContain("D");
  });
});

describe('TSP - Testes de Qualidade da Rota', () => {

  it('rota retornada deve ser mais curta que ordem aleatória', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 20, y: 0 },
      { id: "D", x: 0, y: 10 },
      { id: "E", x: 20, y: 10 }
    ];

    const rotaOtimizada = calcularRotaTSP(pontos);
    const distanciaOtimizada = comprimentoRota(rotaOtimizada);

    // Ordem aleatória (mantendo primeiro ponto)
    const ordemAleatoria = [
      pontos[0],
      pontos[2],
      pontos[4],
      pontos[1],
      pontos[3]
    ];
    const distanciaAleatoria = comprimentoRota(ordemAleatoria);

    expect(distanciaOtimizada).toBeLessThanOrEqual(distanciaAleatoria);
  });

  it('deve encontrar rota melhor que o vizinho mais próximo básico', () => {
    // Configuração que favorece o improved start
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 100, y: 0 },
      { id: "C", x: 50, y: 1 },
      { id: "D", x: 50, y: 100 },
      { id: "E", x: 51, y: 99 }
    ];

    const rotaBasica = vizinhoMaisProximo(pontos);
    const rotaMelhorada = calcularRotaTSP(pontos, { useImprovedStart: true });

    const distBasica = comprimentoRota(rotaBasica);
    const distMelhorada = comprimentoRota(rotaMelhorada);

    expect(distMelhorada).toBeLessThanOrEqual(distBasica);
  });

  it('2-opt deve refinar rota sem piorar o custo total', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 5 },
      { id: "C", x: 20, y: 0 },
      { id: "D", x: 15, y: 15 },
      { id: "E", x: 5, y: 15 }
    ];

    const rotaInicial = vizinhoMaisProximo(pontos);
    const distanciaInicial = comprimentoRota(rotaInicial);

    const rotaRefinada = doisOpt(rotaInicial);
    const distanciaRefinada = comprimentoRota(rotaRefinada);

    expect(distanciaRefinada).toBeLessThanOrEqual(distanciaInicial);
  });
});

describe('TSP - Testes do Vizinho Mais Próximo', () => {

  it('vizinhoMaisProximo deve construir rota em O(n²)', () => {
    const n = 100;
    const pontos = Array.from({ length: n }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const inicio = Date.now();
    const rota = vizinhoMaisProximo(pontos);
    const tempo = Date.now() - inicio;

    expect(rota).toHaveLength(n);
    // Para n=100, deve levar menos de 100ms
    expect(tempo).toBeLessThan(100);
  });

  it('deve começar do primeiro ponto quando não especificado', () => {
    const pontos = [
      { id: "Z", x: 100, y: 100 },
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 1, y: 0 }
    ];

    const rota = vizinhoMaisProximo(pontos);

    // O primeiro ponto da rota deve ser o primeiro do array
    expect(rota[0].id).toBe("Z");
  });

  it('deve funcionar com pontos colineares', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 20, y: 0 },
      { id: "D", x: 30, y: 0 },
      { id: "E", x: 40, y: 0 }
    ];

    const rota = vizinhoMaisProximo(pontos);
    const valida = validarRota(rota, pontos);

    expect(valida).toBe(true);
    expect(rota).toHaveLength(5);
  });
});

describe('TSP - Testes do 2-opt', () => {

  it('doisOpt deve refinar rota sem piorar o custo total', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 10 },
      { id: "C", x: 20, y: 0 },
      { id: "D", x: 30, y: 10 },
      { id: "E", x: 40, y: 0 }
    ];

    const rotaInicial = vizinhoMaisProximo(pontos);
    const distanciaInicial = comprimentoRota(rotaInicial);

    const rotaRefinada = doisOpt(rotaInicial);
    const distanciaRefinada = comprimentoRota(rotaRefinada);

    expect(distanciaRefinada).toBeLessThanOrEqual(distanciaInicial);
  });

  it('deve manter o mesmo conjunto de pontos após refino', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 10 },
      { id: "C", x: 20, y: 0 },
      { id: "D", x: 30, y: 10 }
    ];

    const rotaInicial = vizinhoMaisProximo(pontos);
    const rotaRefinada = doisOpt(rotaInicial);

    const idsInicial = new Set(rotaInicial.map(p => p.id));
    const idsRefinada = new Set(rotaRefinada.map(p => p.id));

    expect(idsRefinada).toEqual(idsInicial);
  });

  it('deve identificar e eliminar cruzamentos', () => {
    // Criar rota com cruzamento proposital
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 10 },
      { id: "C", x: 0, y: 10 },
      { id: "D", x: 10, y: 0 }
    ];

    // Rota com cruzamento: A → B → C → D
    const rotaComCruzamento = [
      pontos[0], // A (0,0)
      pontos[1], // B (10,10)
      pontos[2], // C (0,10)
      pontos[3]  // D (10,0)
    ];

    const distanciaComCruzamento = comprimentoRota(rotaComCruzamento);
    const rotaSemCruzamento = doisOpt(rotaComCruzamento);
    const distanciaSemCruzamento = comprimentoRota(rotaSemCruzamento);

    expect(distanciaSemCruzamento).toBeLessThan(distanciaComCruzamento);
  });
});

describe('TSP - Testes de Performance', () => {

  it('deve processar 50 pontos em menos de 1 segundo', () => {
    const n = 50;
    const pontos = Array.from({ length: n }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 1000,
      y: Math.random() * 1000
    }));

    const inicio = Date.now();
    const rota = calcularRotaTSP(pontos);
    const tempo = Date.now() - inicio;

    expect(rota).toHaveLength(n);
    expect(tempo).toBeLessThan(1000);
  });

  it('deve processar 100 pontos em menos de 2 segundos', () => {
    const n = 100;
    const pontos = Array.from({ length: n }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 1000,
      y: Math.random() * 1000
    }));

    const inicio = Date.now();
    const rota = calcularRotaTSP(pontos, { useImprovedStart: false });
    const tempo = Date.now() - inicio;

    expect(rota).toHaveLength(n);
    expect(tempo).toBeLessThan(2000);
  });
});

describe('TSP - Testes de Funções Auxiliares', () => {

  it('distancia deve calcular corretamente', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };

    const dist = distancia(a, b);

    expect(dist).toBe(5);
  });

  it('comprimentoRota deve calcular soma total com retorno', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 10, y: 0 },
      { id: "C", x: 10, y: 10 }
    ];

    const comprimento = comprimentoRota(pontos);
    // A→B: 10, B→C: 10, C→A: ~14.14, total = ~34.14
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
    const rotaIncompleta = [pontos[0], pontos[1]];

    expect(validarRota(rotaValida, pontos)).toBe(true);
    expect(validarRota(rotaInvalida, pontos)).toBe(false);
    expect(validarRota(rotaIncompleta, pontos)).toBe(false);
  });
});

describe('TSP - Testes de Configuração', () => {

  it('deve respeitar opção useImprovedStart = false', () => {
    const pontos = [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 100, y: 0 },
      { id: "C", x: 50, y: 1 }
    ];

    const rotaBasica = calcularRotaTSP(pontos, { useImprovedStart: false });
    const rotaMelhorada = calcularRotaTSP(pontos, { useImprovedStart: true });

    // Ambas devem ser válidas
    expect(validarRota(rotaBasica, pontos)).toBe(true);
    expect(validarRota(rotaMelhorada, pontos)).toBe(true);
  });

  it('deve respeitar opção maxTwoOptIter', () => {
    const pontos = Array.from({ length: 20 }, (_, i) => ({
      id: `P${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));

    const inicioRapido = Date.now();
    const rotaRapida = calcularRotaTSP(pontos, { maxTwoOptIter: 10 });
    const tempoRapido = Date.now() - inicioRapido;

    const inicioCompleto = Date.now();
    const rotaCompleta = calcularRotaTSP(pontos, { maxTwoOptIter: 1000 });
    const tempoCompleto = Date.now() - inicioCompleto;

    expect(validarRota(rotaRapida, pontos)).toBe(true);
    expect(validarRota(rotaCompleta, pontos)).toBe(true);
    // Com menos iterações deve ser mais rápido
    expect(tempoRapido).toBeLessThanOrEqual(tempoCompleto + 10);
  });
});