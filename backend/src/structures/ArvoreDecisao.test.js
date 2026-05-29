// TODO Dev 1 — Sprint 1 | Issue #3
// Testes Jest para ArvoreDecisao e BFS

const ArvoreDecisao = require('./ArvoreDecisao');
const { calcularVisao } = require('./BFS');

describe('ArvoreDecisao', () => {
  it('get deve retornar o nó correto por ID', () => {
    // TODO
  });

  it('get deve retornar null para ID inexistente sem quebrar', () => {
    // TODO
  });

  it('escolher deve navegar para o próximo nó corretamente', () => {
    // TODO
  });

  it('escolher deve retornar pistaBloqueada quando disponível', () => {
    // TODO
  });
});

describe('BFS - calcularVisao', () => {
  it('deve retornar células corretas a partir de (0,0) com raio 3', () => {
    // TODO
  });

  it('não deve incluir células fora do grid (coordenadas negativas ou >= 10)', () => {
    // TODO
  });

  it('deve funcionar nos cantos: (0,0), (9,9), (0,9), (9,0)', () => {
    // TODO
  });
});
