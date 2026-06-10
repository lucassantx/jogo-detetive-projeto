// =============================================================
// TSP.js - Algoritmos para Problema do Caixeiro Viajante
// =============================================================

/**
 * Calcula a distância euclidiana entre dois pontos
 */
function distancia(a, b) {
  if (!a || !b) return 0;
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula o comprimento total de uma rota
 */
function comprimentoRota(rota) {
  if (!rota || rota.length === 0) return 0;
  if (rota.length === 1) return 0;

  let total = 0;
  for (let i = 0; i < rota.length - 1; i++) {
    total += distancia(rota[i], rota[i + 1]);
  }
  total += distancia(rota[rota.length - 1], rota[0]);

  return total;
}

/**
 * Valida se a rota visita todos os pontos exatamente uma vez
 */
function validarRota(rota, pontosOriginais) {
  if (!rota || !pontosOriginais) return false;
  if (rota.length !== pontosOriginais.length) return false;

  const idsNaRota = new Set(rota.map(p => p?.id));
  const idsOriginais = new Set(pontosOriginais.map(p => p?.id));

  if (idsNaRota.size !== idsOriginais.size) return false;

  for (const id of idsOriginais) {
    if (!idsNaRota.has(id)) return false;
  }

  return true;
}

// =============================================================
// HELD-KARP (para n ≤ 10)
// =============================================================

function heldKarp(pontos) {
  const n = pontos.length;

  if (n === 0) return [];
  if (n === 1) return [pontos[0]];
  if (n === 2) return [pontos[0], pontos[1]];
  if (n === 3) {
    // Para triângulo, retorna ordem direta
    return [pontos[0], pontos[1], pontos[2]];
  }

  // Pré-calcular matriz de distâncias
  const dist = Array(n).fill().map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dist[i][j] = distancia(pontos[i], pontos[j]);
    }
  }

  // DP: dp[mask][i] = menor distância para visitar máscara 'mask' terminando em i
  const dp = Array(1 << n).fill().map(() => Array(n).fill(Infinity));
  const parent = Array(1 << n).fill().map(() => Array(n).fill(-1));

  // Inicialização: começar do vértice 0
  dp[1][0] = 0;

  // Preencher DP
  for (let mask = 1; mask < (1 << n); mask++) {
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === Infinity) continue;

      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;

        const newMask = mask | (1 << j);
        const newDist = dp[mask][i] + dist[i][j];

        if (newDist < dp[newMask][j]) {
          dp[newMask][j] = newDist;
          parent[newMask][j] = i;
        }
      }
    }
  }

  // Encontrar melhor rota de volta ao início
  const fullMask = (1 << n) - 1;
  let bestDist = Infinity;
  let lastNode = 0;

  for (let i = 0; i < n; i++) {
    if (dp[fullMask][i] === Infinity) continue;
    const total = dp[fullMask][i] + dist[i][0];
    if (total < bestDist) {
      bestDist = total;
      lastNode = i;
    }
  }

  // Reconstruir caminho
  const path = [];
  let mask = fullMask;
  let current = lastNode;

  while (current !== 0 && current !== -1) {
    path.unshift(current);
    const prev = parent[mask][current];
    if (prev === -1) break;
    mask &= ~(1 << current);
    current = prev;
  }
  path.unshift(0);

  // Remover duplicatas se houver
  const uniquePath = [];
  for (const idx of path) {
    if (!uniquePath.includes(idx)) {
      uniquePath.push(idx);
    }
  }

  // Converter índices para objetos
  return uniquePath.map(idx => pontos[idx]);
}

// =============================================================
// VIZINHO MAIS PRÓXIMO (Heurística)
// =============================================================

function vizinhoMaisProximo(locais) {
  if (!locais || locais.length === 0) return [];
  if (locais.length === 1) return [locais[0]];

  const n = locais.length;
  const visitados = new Array(n).fill(false);
  const rota = [];

  let atual = 0;
  rota.push(locais[atual]);
  visitados[atual] = true;

  for (let passo = 1; passo < n; passo++) {
    let melhorIdx = -1;
    let menorDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visitados[i]) {
        const d = distancia(locais[atual], locais[i]);
        if (d < menorDist) {
          menorDist = d;
          melhorIdx = i;
        }
      }
    }

    if (melhorIdx !== -1) {
      rota.push(locais[melhorIdx]);
      visitados[melhorIdx] = true;
      atual = melhorIdx;
    }
  }

  return rota;
}

function vizinhoMaisProximoMelhorado(locais) {
  if (!locais || locais.length === 0) return [];
  if (locais.length === 1) return [locais[0]];
  if (locais.length === 2) return [locais[0], locais[1]];

  let melhorRota = null;
  let menorDist = Infinity;

  // Testar apenas os primeiros 10 pontos como início para performance
  const maxStart = Math.min(locais.length, 10);

  for (let start = 0; start < maxStart; start++) {
    const n = locais.length;
    const visitados = new Array(n).fill(false);
    const rota = [];

    let atual = start;
    rota.push(locais[atual]);
    visitados[atual] = true;

    for (let passo = 1; passo < n; passo++) {
      let melhorIdx = -1;
      let menor = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visitados[i]) {
          const d = distancia(locais[atual], locais[i]);
          if (d < menor) {
            menor = d;
            melhorIdx = i;
          }
        }
      }

      if (melhorIdx !== -1) {
        rota.push(locais[melhorIdx]);
        visitados[melhorIdx] = true;
        atual = melhorIdx;
      }
    }

    const distAtual = comprimentoRota(rota);
    if (distAtual < menorDist) {
      menorDist = distAtual;
      melhorRota = rota;
    }
  }

  return melhorRota || vizinhoMaisProximo(locais);
}

// =============================================================
// 2-OPT (Refinamento)
// =============================================================

function doisOpt(rotaInicial, maxIteracoes = 100) {
  if (!rotaInicial || rotaInicial.length === 0) return [];
  if (rotaInicial.length <= 3) return rotaInicial;

  let melhorRota = [...rotaInicial];
  let melhorado = true;
  let iter = 0;

  while (melhorado && iter < maxIteracoes) {
    melhorado = false;
    iter++;

    for (let i = 0; i < melhorRota.length - 2; i++) {
      for (let k = i + 2; k < melhorRota.length - 1; k++) {
        const a = melhorRota[i];
        const b = melhorRota[i + 1];
        const c = melhorRota[k];
        const d = melhorRota[(k + 1) % melhorRota.length];

        const atual = distancia(a, b) + distancia(c, d);
        const nova = distancia(a, c) + distancia(b, d);

        if (nova < atual) {
          // Reverter o segmento entre i+1 e k
          const novaRota = [...melhorRota];
          let left = i + 1;
          let right = k;
          while (left < right) {
            [novaRota[left], novaRota[right]] = [novaRota[right], novaRota[left]];
            left++;
            right--;
          }
          melhorRota = novaRota;
          melhorado = true;
          break;
        }
      }
      if (melhorado) break;
    }
  }

  return melhorRota;
}

// =============================================================
// FUNÇÃO PRINCIPAL
// =============================================================

function calcularRotaTSP(locais, options = {}) {
  // Validação de entrada
  if (!locais || locais.length === 0) return [];
  if (locais.length === 1) return [locais[0]];
  if (locais.length === 2) return [locais[0], locais[1]];

  const { forceHeuristic = false } = options;

  // Usar Held-Karp para n ≤ 10 (exato)
  if (!forceHeuristic && locais.length <= 10) {
    return heldKarp(locais);
  }

  // Heurística para n > 10
  let rota = vizinhoMaisProximoMelhorado(locais);
  rota = doisOpt(rota, 50);
  return rota;
}

function calcularRotaTSPComDetalhes(locais) {
  // Validação de entrada
  if (!locais || locais.length === 0) {
    return {
      rota: [],
      idsRota: [],
      distanciaTotal: 0,
      numPontos: 0,
      algoritmo: "Nenhum",
      tempoExecucaoMs: 0
    };
  }

  const inicio = Date.now();
  const rota = calcularRotaTSP(locais);
  const tempo = Date.now() - inicio;

  const algoritmo = (locais.length <= 10 && locais.length > 0)
    ? "Held-Karp (exato)"
    : "Vizinho Mais Próximo + 2-opt (heurístico)";

  return {
    rota: rota,
    idsRota: rota.map(p => p.id),
    distanciaTotal: comprimentoRota(rota),
    numPontos: locais.length,
    algoritmo: algoritmo,
    tempoExecucaoMs: tempo
  };
}

// =============================================================
// EXPORTS
// =============================================================

module.exports = {
  calcularRotaTSP,
  calcularRotaTSPComDetalhes,
  heldKarp,
  vizinhoMaisProximo,
  vizinhoMaisProximoMelhorado,
  doisOpt,
  distancia,
  comprimentoRota,
  validarRota
};