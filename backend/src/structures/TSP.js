// tsp_heuristic.js
// Implementação heurística para TSP: Vizinho Mais Próximo + refinamento 2-opt
// Complexidade: O(n²) para vizinho mais próximo, O(n²) por iteração do 2-opt
// Uso: endpoint GET /api/partida/:id/rota

/**
 * Calcula a distância euclidiana entre dois pontos
 * @param {Object} a - Ponto com coordenadas {x, y}
 * @param {Object} b - Ponto com coordenadas {x, y}
 * @returns {number} Distância euclidiana
 */
function distancia(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula o comprimento total de uma rota
 * @param {Array} rota - Array de pontos na ordem de visitação
 * @returns {number} Comprimento total da rota
 */
function comprimentoRota(rota) {
  let total = 0;
  for (let i = 0; i < rota.length - 1; i++) {
    total += distancia(rota[i], rota[i + 1]);
  }
  // Fechar o ciclo (voltar ao início)
  if (rota.length > 0) {
    total += distancia(rota[rota.length - 1], rota[0]);
  }
  return total;
}

/**
 * Algoritmo do Vizinho Mais Próximo (Nearest Neighbor)
 * Constrói uma rota inicial greedy
 * 
 * Complexidade: O(n²)
 * 
 * @param {Array} locais - Array de pontos com {id, x, y}
 * @returns {Array} Rota inicial (ordem de visitação)
 */
function vizinhoMaisProximo(locais) {
  if (!locais || locais.length === 0) return [];
  if (locais.length === 1) return [locais[0]];

  const n = locais.length;
  const visitados = new Array(n).fill(false);
  const rota = [];

  // Começar pelo primeiro local (ou pelo mais central, opcional)
  let atual = 0;
  rota.push(locais[atual]);
  visitados[atual] = true;

  for (let passo = 1; passo < n; passo++) {
    let vizinhoMaisProximo = -1;
    let menorDistancia = Infinity;

    // Encontrar o vizinho não visitado mais próximo
    for (let i = 0; i < n; i++) {
      if (!visitados[i]) {
        const dist = distancia(locais[atual], locais[i]);
        if (dist < menorDistancia) {
          menorDistancia = dist;
          vizinhoMaisProximo = i;
        }
      }
    }

    if (vizinhoMaisProximo !== -1) {
      rota.push(locais[vizinhoMaisProximo]);
      visitados[vizinhoMaisProximo] = true;
      atual = vizinhoMaisProximo;
    }
  }

  return rota;
}

/**
 * Versão melhorada do Vizinho Mais Próximo
 * Tenta todos os pontos como início e escolhe a melhor rota
 * 
 * Complexidade: O(n³) - melhor qualidade, mas mais lenta
 * 
 * @param {Array} locais - Array de pontos com {id, x, y}
 * @returns {Array} Melhor rota encontrada
 */
function vizinhoMaisProximoMelhorado(locais) {
  if (!locais || locais.length <= 1) return vizinhoMaisProximo(locais);

  let melhorRota = null;
  let menorComprimento = Infinity;

  // Tentar cada ponto como ponto de partida
  for (let start = 0; start < locais.length; start++) {
    const n = locais.length;
    const visitados = new Array(n).fill(false);
    const rota = [];

    let atual = start;
    rota.push(locais[atual]);
    visitados[atual] = true;

    for (let passo = 1; passo < n; passo++) {
      let vizinhoMaisProximo = -1;
      let menorDistancia = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visitados[i]) {
          const dist = distancia(locais[atual], locais[i]);
          if (dist < menorDistancia) {
            menorDistancia = dist;
            vizinhoMaisProximo = i;
          }
        }
      }

      if (vizinhoMaisProximo !== -1) {
        rota.push(locais[vizinhoMaisProximo]);
        visitados[vizinhoMaisProximo] = true;
        atual = vizinhoMaisProximo;
      }
    }

    const comprimento = comprimentoRota(rota);
    if (comprimento < menorComprimento) {
      menorComprimento = comprimento;
      melhorRota = rota;
    }
  }

  return melhorRota;
}

/**
 * Verifica se uma troca 2-opt melhora a rota
 * 
 * @param {Array} rota - Rota atual
 * @param {number} i - Primeiro índice
 * @param {number} k - Segundo índice
 * @returns {boolean} True se a troca melhora a rota
 */
function improvesTwoOpt(rota, i, k) {
  const n = rota.length;

  // Distâncias atuais
  const a = rota[i];
  const b = rota[(i + 1) % n];
  const c = rota[k];
  const d = rota[(k + 1) % n];

  const atual = distancia(a, b) + distancia(c, d);

  // Distâncias após a troca
  const nova = distancia(a, c) + distancia(b, d);

  return nova < atual;
}

/**
 * Aplica uma troca 2-opt na rota
 * 
 * @param {Array} rota - Rota atual
 * @param {number} i - Primeiro índice
 * @param {number} k - Segundo índice
 * @returns {Array} Nova rota com o segmento invertido
 */
function swapTwoOpt(rota, i, k) {
  const novaRota = [...rota];

  // Inverter o segmento entre i+1 e k
  let left = i + 1;
  let right = k;

  while (left < right) {
    [novaRota[left], novaRota[right]] = [novaRota[right], novaRota[left]];
    left++;
    right--;
  }

  return novaRota;
}

/**
 * Algoritmo 2-opt para melhorar uma rota existente
 * Elimina cruzamentos e reduz o comprimento total
 * 
 * Complexidade: O(n²) por iteração
 * 
 * @param {Array} rotaInicial - Rota inicial a ser refinada
 * @param {number} maxIteracoes - Número máximo de iterações (padrão: 100)
 * @returns {Array} Rota refinada
 */
function doisOpt(rotaInicial, maxIteracoes = 100) {
  if (!rotaInicial || rotaInicial.length <= 3) return rotaInicial;

  let melhorRota = [...rotaInicial];
  let melhorado = true;
  let iteracao = 0;

  while (melhorado && iteracao < maxIteracoes) {
    melhorado = false;
    iteracao++;

    for (let i = 0; i < melhorRota.length - 2; i++) {
      for (let k = i + 2; k < melhorRota.length - 1; k++) {
        if (improvesTwoOpt(melhorRota, i, k)) {
          melhorRota = swapTwoOpt(melhorRota, i, k);
          melhorado = true;
          // Pequena otimização: reiniciar após melhoria
          break;
        }
      }
      if (melhorado) break;
    }
  }

  return melhorRota;
}

/**
 * Algoritmo 2-opt com verificação completa (mais lento, mas melhor qualidade)
 * 
 * @param {Array} rotaInicial - Rota inicial
 * @returns {Array} Rota refinada (ótimo local)
 */
function doisOptCompleto(rotaInicial) {
  if (!rotaInicial || rotaInicial.length <= 3) return rotaInicial;

  let melhorRota = [...rotaInicial];
  let melhorado = true;

  while (melhorado) {
    melhorado = false;

    for (let i = 0; i < melhorRota.length - 2; i++) {
      for (let k = i + 2; k < melhorRota.length - 1; k++) {
        if (improvesTwoOpt(melhorRota, i, k)) {
          melhorRota = swapTwoOpt(melhorRota, i, k);
          melhorado = true;
        }
      }
    }
  }

  return melhorRota;
}

/**
 * Calcula a rota ótima usando heurística: Vizinho Mais Próximo + 2-opt
 * 
 * @param {Array} locais - Array de pontos com {id, x, y}
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.useImprovedStart - Usar versão melhorada do vizinho mais próximo (padrão: true)
 * @param {boolean} options.useFullTwoOpt - Usar 2-opt completo (padrão: false)
 * @param {number} options.maxTwoOptIter - Máximo de iterações do 2-opt (padrão: 100)
 * @returns {Array} Rota na ordem de visitação
 */
function calcularRotaTSP(locais, options = {}) {
  // Validação de entrada
  if (!locais || locais.length === 0) {
    return [];
  }

  if (locais.length === 1) {
    return [locais[0]];
  }

  const {
    useImprovedStart = true,
    useFullTwoOpt = false,
    maxTwoOptIter = 100
  } = options;

  // Passo 1: Construir rota inicial com Vizinho Mais Próximo
  let rota;
  if (useImprovedStart) {
    rota = vizinhoMaisProximoMelhorado(locais);
  } else {
    rota = vizinhoMaisProximo(locais);
  }

  // Passo 2: Refinar com 2-opt
  if (useFullTwoOpt) {
    rota = doisOptCompleto(rota);
  } else {
    rota = doisOpt(rota, maxTwoOptIter);
  }

  return rota;
}

/**
 * Calcula rota e retorna com IDs (para integração com API)
 * 
 * @param {Array} locais - Array de pontos com {id, x, y}
 * @returns {Object} Objeto com rota, distância total e IDs
 */
function calcularRotaTSPComDetalhes(locais) {
  const rota = calcularRotaTSP(locais);
  const distanciaTotal = comprimentoRota(rota);
  const idsRota = rota.map(local => local.id);

  return {
    rota: rota,
    idsRota: idsRota,
    distanciaTotal: distanciaTotal,
    numPontos: locais.length
  };
}

// ============================================================
// FUNÇÕES DE VISUALIZAÇÃO E UTILITÁRIOS
// ============================================================

/**
 * Calcula estatísticas da rota
 * @param {Array} rota - Rota calculada
 * @returns {Object} Estatísticas da rota
 */
function estatisticasRota(rota) {
  if (!rota || rota.length === 0) {
    return { comprimento: 0, numPontos: 0, segmentos: [] };
  }

  const segmentos = [];
  let comprimentoTotal = 0;

  for (let i = 0; i < rota.length - 1; i++) {
    const dist = distancia(rota[i], rota[i + 1]);
    segmentos.push({
      de: rota[i].id,
      para: rota[i + 1].id,
      distancia: dist
    });
    comprimentoTotal += dist;
  }

  // Fechar ciclo
  const distFinal = distancia(rota[rota.length - 1], rota[0]);
  segmentos.push({
    de: rota[rota.length - 1].id,
    para: rota[0].id,
    distancia: distFinal
  });
  comprimentoTotal += distFinal;

  return {
    comprimentoTotal,
    numPontos: rota.length,
    segmentos,
    comprimentoMedio: comprimentoTotal / rota.length
  };
}

/**
 * Valida se a rota visita todos os pontos exatamente uma vez
 * @param {Array} rota - Rota a ser validada
 * @param {Array} locaisOriginais - Pontos originais
 * @returns {boolean} True se a rota é válida
 */
function validarRota(rota, locaisOriginais) {
  if (rota.length !== locaisOriginais.length) {
    return false;
  }

  const idsNaRota = new Set(rota.map(p => p.id));
  const idsOriginais = new Set(locaisOriginais.map(p => p.id));

  if (idsNaRota.size !== idsOriginais.size) {
    return false;
  }

  for (const id of idsOriginais) {
    if (!idsNaRota.has(id)) {
      return false;
    }
  }

  return true;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Função principal
  calcularRotaTSP,
  calcularRotaTSPComDetalhes,

  // Heurísticas
  vizinhoMaisProximo,
  vizinhoMaisProximoMelhorado,
  doisOpt,
  doisOptCompleto,

  // Utilitários
  distancia,
  comprimentoRota,
  estatisticasRota,
  validarRota,

  // Funções internas (exportadas para teste)
  improvesTwoOpt,
  swapTwoOpt
};

