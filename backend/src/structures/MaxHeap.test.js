const MaxHeap = require('./MaxHeap');

// pistas de peso fixo para testes determinísticos
const pistasFixas = [
  { id: 'p1',  nome: 'Frasco de arsênico',      peso: 10 },
  { id: 'p2',  nome: 'Testamento com rasura',    peso: 9  },
  { id: 'p3',  nome: 'Chave extra do cofre',      peso: 9  },
  { id: 'p4',  nome: 'Carta anônima',             peso: 8  },
  { id: 'p5',  nome: 'Planta colhida',            peso: 8  },
  { id: 'p6',  nome: 'Copo com resíduo',          peso: 7  },
  { id: 'p7',  nome: 'Pegadas no barro',          peso: 7  },
  { id: 'p8',  nome: 'Diário de Sir Edmund',      peso: 6  },
  { id: 'p9',  nome: 'Bilhete cancelado',         peso: 6  },
  { id: 'p10', nome: 'Foto rasgada',              peso: 5  },
  { id: 'p11', nome: 'Tesoura com resíduo',       peso: 6  },
  { id: 'p12', nome: 'Presença de Victor',        peso: 7  },
  { id: 'p13', nome: 'Victor no corredor',        peso: 8  },
  { id: 'p14', nome: 'Lista acesso ao cofre',     peso: 9  },
  { id: 'p15', nome: 'Rasura letra de Victor',    peso: 10 },
];

describe('MaxHeap — Issue #1', () => {
  it('insert mantém a propriedade do heap (raiz sempre é o maior)', () => {
    const heap = new MaxHeap();
    const ordem = [5, 10, 3, 8, 1, 9, 4];
    for (const peso of ordem) {
      heap.insert({ id: `p${peso}`, nome: `pista${peso}`, peso });
    }
    // raiz deve ser sempre o maior
    expect(heap.heap[0].peso).toBe(10);
  });

  it('extractMax retorna sempre o elemento de maior peso', () => {
    const heap = new MaxHeap();
    [3, 7, 1, 10, 5].forEach(p => heap.insert({ id: `p${p}`, nome: `pista`, peso: p }));

    const primeiro = heap.extractMax();
    expect(primeiro.peso).toBe(10);

    const segundo = heap.extractMax();
    expect(segundo.peso).toBe(7);
  });

  it('top3 retorna as 3 pistas de maior peso em ordem decrescente', () => {
    const heap = new MaxHeap();
    pistasFixas.forEach(p => heap.insert(p));

    const top = heap.top3();
    expect(top).toHaveLength(3);
    expect(top[0].peso).toBe(10);
    expect(top[1].peso).toBe(10);
    expect(top[2].peso).toBe(9);

    // top3 não deve modificar o heap original
    expect(heap.size()).toBe(15);
  });

  it('heap vazio retorna null sem lançar exceção', () => {
    const heap = new MaxHeap();
    expect(heap.extractMax()).toBeNull();
    expect(heap.top3()).toHaveLength(0);
  });

  it('funciona corretamente com 15 pistas em ordem aleatória', () => {
    const heap = new MaxHeap();

    // embaralha as pistas antes de inserir
    const embaralhadas = [...pistasFixas].sort(() => Math.random() - 0.5);
    embaralhadas.forEach(p => heap.insert(p));

    expect(heap.size()).toBe(15);
    expect(heap.heap[0].peso).toBe(10); // raiz sempre máxima

    // extraindo em ordem deve ser decrescente
    let ultimo = Infinity;
    while (heap.size() > 0) {
      const atual = heap.extractMax();
      expect(atual.peso).toBeLessThanOrEqual(ultimo);
      ultimo = atual.peso;
    }
  });
});