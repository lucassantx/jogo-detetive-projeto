// retorna todas as células dentro do raio a partir da posição, usando BFS — O(V+E)
function calcularVisao(posicao, raio = 3, tamanhoGrid = 10) {
  const { x: ox, y: oy } = posicao;
  const visitados = new Set();
  const fila = [{ x: ox, y: oy, dist: 0 }];
  const visiveis = [];

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (fila.length > 0) {
    const { x, y, dist } = fila.shift();
    const key = `${x},${y}`;

    if (visitados.has(key) || dist > raio) continue;
    visitados.add(key);
    visiveis.push({ x, y });

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      // descarta células fora do grid
      if (nx >= 0 && nx < tamanhoGrid && ny >= 0 && ny < tamanhoGrid) {
        fila.push({ x: nx, y: ny, dist: dist + 1 });
      }
    }
  }

  return visiveis;
}

module.exports = { calcularVisao };