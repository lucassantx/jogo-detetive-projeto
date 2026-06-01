// distância euclidiana entre dois pontos do grid
function _dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function _custoTotal(rota) {
  let total = 0;
  for (let i = 0; i < rota.length - 1; i++) total += _dist(rota[i], rota[i + 1]);
  return total;
}

// constrói rota inicial partindo do local mais próximo a cada passo — O(n²)
function vizinhoMaisProximo(locais, origemId) {
  if (locais.length === 0) return [];
  if (locais.length === 1) return [...locais];

  const pendentes = [...locais];
  let atual = pendentes.find(l => l.id === origemId) || pendentes[0];
  pendentes.splice(pendentes.indexOf(atual), 1);

  const rota = [atual];

  while (pendentes.length > 0) {
    let melhor = null;
    let menorDist = Infinity;
    for (const candidato of pendentes) {
      const d = _dist(atual, candidato);
      if (d < menorDist) { menorDist = d; melhor = candidato; }
    }
    rota.push(melhor);
    pendentes.splice(pendentes.indexOf(melhor), 1);
    atual = melhor;
  }

  return rota;
}

// refina a rota revertendo segmentos que reduzem o custo — O(n²) por iteração
function doisOpt(rota) {
  if (rota.length < 3) return [...rota];

  let melhorRota = [...rota];
  let melhorou = true;

  while (melhorou) {
    melhorou = false;
    for (let i = 1; i < melhorRota.length - 1; i++) {
      for (let j = i + 1; j < melhorRota.length; j++) {
        const novaRota = [
          ...melhorRota.slice(0, i),
          ...melhorRota.slice(i, j + 1).reverse(),
          ...melhorRota.slice(j + 1),
        ];
        if (_custoTotal(novaRota) < _custoTotal(melhorRota)) {
          melhorRota = novaRota;
          melhorou = true;
        }
      }
    }
  }

  return melhorRota;
}

// ponto de entrada: recebe [{ id, x, y }] e retorna array na ordem de visitação
function calcularRotaTSP(locais, origemId = null) {
  const rotaInicial = vizinhoMaisProximo(locais, origemId);
  return doisOpt(rotaInicial);
}

module.exports = { calcularRotaTSP, vizinhoMaisProximo, doisOpt };