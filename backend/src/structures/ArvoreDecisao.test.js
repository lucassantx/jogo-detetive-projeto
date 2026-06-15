const ArvoreDecisao = require('./ArvoreDecisao');
const { calcularVisao } = require('./BFS');

// árvore mínima baseada nos diálogos reais do caso Blackwood
const nosDialogo = [
  {
    id: 'A0',
    npc: 'Adelaide Cross',
    texto: 'Eu sabia que alguém viria...',
    escolhas: [
      { texto: 'Onde estava na hora da morte?', proximoId: 'A1', pistaBloqueada: null, xp: 10 },
      { texto: 'O senhor tinha inimigos?',       proximoId: 'A2', pistaBloqueada: null, xp: 10 },
      { texto: 'Vi um frasco estranho aqui.',    proximoId: 'A3', pistaBloqueada: 'frasco_arsenico', xp: 15 },
    ],
  },
  {
    id: 'A1',
    npc: 'Adelaide Cross',
    texto: 'O chá foi entregue por volta das 22h30.',
    escolhas: [
      { texto: 'Mais alguém entrou na cozinha?', proximoId: 'A1a', pistaBloqueada: 'presenca_victor', xp: 20 },
      { texto: 'O chá tinha algo diferente?',    proximoId: 'A1b', pistaBloqueada: null, xp: 10 },
      { texto: 'Obrigado, isso é tudo.',         proximoId: null,  pistaBloqueada: null, xp: 5 },
    ],
  },
  {
    id: 'A1a',
    npc: 'Adelaide Cross',
    texto: 'O Victor passou por lá. Queria um copo d\'água.',
    escolhas: [],
  },
  {
    id: 'A1b',
    npc: 'Adelaide Cross',
    texto: 'Não que eu tenha notado. Mas eu não provei.',
    escolhas: [],
  },
  {
    id: 'A2',
    npc: 'Adelaide Cross',
    texto: 'Inimigos... ou pessoas que ele decepcionou. É diferente.',
    escolhas: [],
  },
  {
    id: 'A3',
    npc: 'Adelaide Cross',
    texto: 'Meu Deus. Eu vi esse frasco no cofre semana passada.',
    escolhas: [
      { texto: 'Quem mais sabia da combinação?', proximoId: 'A3', pistaBloqueada: 'lista_acesso_cofre', xp: 25 },
      { texto: 'Por que guardava arsênico?',     proximoId: 'A3', pistaBloqueada: 'arsenico_no_cofre',  xp: 20 },
      { texto: 'Você escreveu uma carta?',       proximoId: 'A3c', pistaBloqueada: null, xp: 30 },
    ],
  },
  {
    id: 'A3c',
    npc: 'Adelaide Cross',
    texto: 'Como sabe disso?',
    escolhas: [],
  },
  {
    id: 'B0',
    npc: 'Victor Blackwood',
    texto: 'Detetive. Espero que isso seja rápido.',
    escolhas: [
      { texto: 'Onde estava às 23h?',              proximoId: 'B1', pistaBloqueada: null, xp: 15 },
      { texto: 'O testamento seria alterado?',     proximoId: 'B2', pistaBloqueada: null, xp: 15 },
      { texto: 'Conhece a estufa?',                proximoId: 'B3', pistaBloqueada: 'victor_estufa', xp: 20 },
    ],
  },
  {
    id: 'C0',
    npc: 'Fynn O\'Brien',
    texto: 'Estava de plantão. Nada de anormal.',
    escolhas: [
      { texto: 'Quem tinha chave extra do cofre?', proximoId: null, pistaBloqueada: 'chave_extra', xp: 25 },
      { texto: 'Viu alguém circular?',             proximoId: null, pistaBloqueada: 'victor_corredor', xp: 20 },
      { texto: 'Está com medo de alguma coisa?',   proximoId: 'C1', pistaBloqueada: null, xp: 15 },
    ],
  },
];

describe('ArvoreDecisao — Issue #3', () => {
  let arvore;

  beforeEach(() => {
    arvore = new ArvoreDecisao(nosDialogo);
  });

  it('get retorna o nó correto por ID', () => {
    const no = arvore.get('A0');
    expect(no).not.toBeNull();
    expect(no.id).toBe('A0');
    expect(no.npc).toBe('Adelaide Cross');
  });

  it('get retorna null para ID inexistente sem quebrar', () => {
    expect(arvore.get('Z99')).toBeNull();
    expect(arvore.get('')).toBeNull();
    expect(arvore.get(undefined)).toBeNull();
  });

  it('escolher navega para o próximo nó corretamente', () => {
    const escolha = arvore.escolher('A0', 0);
    expect(escolha).not.toBeNull();
    expect(escolha.proximoId).toBe('A1');
    expect(escolha.xp).toBe(10);
  });

  it('escolher retorna pistaBloqueada quando disponível', () => {
    const escolha = arvore.escolher('A0', 2);
    expect(escolha.pistaBloqueada).toBe('frasco_arsenico');
    expect(escolha.xp).toBe(15);
  });

  it('escolher retorna null para nó sem escolhas', () => {
    expect(arvore.escolher('A1a', 0)).toBeNull();
  });

  it('escolher retorna null para index fora do range', () => {
    expect(arvore.escolher('A0', 10)).toBeNull();
  });
});

describe('BFS — calcularVisao — Issue #3', () => {
  it('retorna células corretas a partir de (0,0) com raio 3', () => {
    const visao = calcularVisao({ x: 0, y: 0 }, 3);
    // BFS a partir da origem, raio 3: só células com x+y <= 3 e dentro do grid
    expect(visao.length).toBeGreaterThan(0);
    for (const cel of visao) {
      expect(cel.x).toBeGreaterThanOrEqual(0);
      expect(cel.y).toBeGreaterThanOrEqual(0);
      // distância de Manhattan <= raio para grid ortogonal
      expect(cel.x + cel.y).toBeLessThanOrEqual(3);
    }
  });

  it('não inclui células fora do grid (negativas ou >= 10)', () => {
    const visao = calcularVisao({ x: 0, y: 0 }, 3);
    for (const cel of visao) {
      expect(cel.x).toBeGreaterThanOrEqual(0);
      expect(cel.y).toBeGreaterThanOrEqual(0);
      expect(cel.x).toBeLessThan(10);
      expect(cel.y).toBeLessThan(10);
    }
  });

  it('funciona no canto (9,9) sem sair do grid', () => {
    const visao = calcularVisao({ x: 9, y: 9 }, 3);
    for (const cel of visao) {
      expect(cel.x).toBeLessThan(10);
      expect(cel.y).toBeLessThan(10);
    }
    expect(visao.some(c => c.x === 9 && c.y === 9)).toBe(true);
  });

  it('funciona no canto (0,9) sem coordenadas negativas', () => {
    const visao = calcularVisao({ x: 0, y: 9 }, 3);
    for (const cel of visao) {
      expect(cel.x).toBeGreaterThanOrEqual(0);
      expect(cel.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('funciona no canto (9,0) sem sair do grid', () => {
    const visao = calcularVisao({ x: 9, y: 0 }, 3);
    for (const cel of visao) {
      expect(cel.x).toBeLessThan(10);
      expect(cel.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('origem sempre está incluída na visão', () => {
    const posicao = { x: 5, y: 5 };
    const visao = calcularVisao(posicao);
    expect(visao.some(c => c.x === 5 && c.y === 5)).toBe(true);
  });

  it('não repete células no resultado', () => {
    const visao = calcularVisao({ x: 5, y: 5 }, 3);
    const keys = visao.map(c => `${c.x},${c.y}`);
    const unicos = new Set(keys);
    expect(unicos.size).toBe(keys.length);
  });
});