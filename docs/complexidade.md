# Análise de Complexidade — Detective Blackwood


> Análise completa dos algoritmos implementados no projeto Detective Blackwood.

---

## 1. MaxHeap — Inventário de Pistas

**Justificativa de escolha:**
MaxHeap foi selecionado por oferecer o melhor equilíbrio entre operações de inserção e extração. Com no máximo 10 pistas no jogo, o heap mantém a propriedade de máximo na raiz, permitindo recuperar as 3 pistas mais relevantes de forma eficiente sem reordenar todo o array. Alternativas como lista ordenada exigiriam `O(n)` para inserção, e AVL adicionaria complexidade desnecessária para `n ≤ 10`.

**Complexidade:**

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| `insert` | O(log n) | **Bubble-up**: elemento sobe comparando com o pai (índice `(i-1)/2`) até posição correta. Máximo de `log₂(n)` trocas. |
| `extractMax` | O(log n) | **Remove raiz** → último elemento vira raiz → **Sink-down**: elemento desce comparando com filhos (2i+1, 2i+2) até posição correta. Máximo `log₂(n)` trocas. |
| `top3` | O(n log n) | Extrai o máximo 3 vezes, cada extração custa O(log n). Equivale a um heapsort parcial: `3 * log₂(n)`. |
| `top3` (otimizado) | O(n) | Alternativa: percorre o array uma vez mantendo os 3 maiores (`O(n)`), mas como heap é ordem parcial, perde a propriedade. |
| `peekMax` | O(1) | Acesso direto ao índice 0 do array. |
| Espaço | O(n) | Array dinâmico com `n` elementos. Heap completo representado como árvore binária em array contíguo. |

**Comparação com alternativas:**

| Estrutura | Inserção | Extração Máx | Top 3 | Espaço | Justificativa |
|-----------|----------|--------------|-------|--------|---------------|
| **MaxHeap** | O(log n) | O(log n) | O(n log n) | O(n) |  Escolhido — melhor equilíbrio para n ≤ 10 |
| Lista Ordenada | O(n) | O(1) | O(1) | O(n) |  Inserção lenta, não justifica para 10 itens |
| AVL Tree | O(log n) | O(log n) | O(log n) | O(n) | Overkill — complexidade excessiva para n fixo |
| Array Não Ordenado | O(1) | O(n) | O(n) | O(n) |  Extração muito lenta |

**Aplicação no jogo:** O MaxHeap é implementado no backend (`partidaController.js`) para gerenciar as pistas coletadas. Quando o jogador coleta uma pista, ela é inserida com `heap.insert(pista, pista.peso)`. Na tela de acusação, o frontend chama `heap.top3()` para obter as 3 pistas mais relevantes como evidências.

---

## 2. TSP — Rota de Investigação

**Justificativa de escolha:**
O jogo utiliza **heurística (Vizinho Mais Próximo + 2-opt)** no backend para calcular a rota aproximada em tempo real. Held-Karp exato (`O(n² × 2ⁿ)`) seria inviável para `n > 20`, mas como temos no máximo 10 pistas, poderíamos usar o exato. Optamos pela heurística porque:
1. **Resposta rápida** — a rota é recalculada a cada movimento do jogador
2. **Aproximação aceitável** — erro médio < 10% para n ≤ 10
3. **2-opt melhora significativamente** a rota inicial

**Complexidade:**

| Etapa | Complexidade | Justificativa |
|-------|-------------|---------------|
| Vizinho Mais Próximo | O(n²) | Para cada pista (n), percorre todas as não visitadas (n-1, n-2...) buscando a mais próxima. Soma: n(n+1)/2 = O(n²). |
| 2-opt (por iteração) | O(n²) | Para cada par de arestas (i, j) — combinação O(n²) — verifica se inverter a subrota reduz distância. |
| 2-opt (total) | O(n² × iterações) | Cada iteração é O(n²). Converge tipicamente em < 10 iterações. Pior caso: O(n³) se houver muitas iterações. |
| Espaço | O(n) | Array de waypoints ordenados. |

**Comparação com Held-Karp:**

| Algoritmo | Complexidade | Quando usar | Vantagem |
|-----------|-------------|-------------|----------|
| **Vizinho + 2-opt** | O(n² × k) | Backend (tempo real) |  Rápido, fácil implementar |
| **Held-Karp** | O(n² × 2ⁿ) | Frontend (modo offline) |  Garante rota ótima para n ≤ 10 |
| Força Bruta | O(n!) | Somente para n ≤ 6 |  Inviável para n > 8 |

**Aplicação no jogo:**
- **Backend:** Calcula rota aproximada via `TSP.calcularRota()` usando vizinho mais próximo + 2-opt. Retorna array de pistas em ordem de visita.
- **Frontend (offline):** Implementa Held-Karp exato via `tspHeldKarp()` para garantir rota ótima quando backend está indisponível. Para n = 10: 10 × 2¹⁰ = 10.240 estados, cada estado processa ~10 operações = ~100k operações — trivial no browser.

---

## 3. Árvore de Decisão — Diálogos

**Justificativa de escolha:**
Árvore n-ária foi escolhida por modelar naturalmente o fluxo de diálogos ramificados. Cada escolha do jogador direciona para um novo nó, criando uma estrutura hierárquica que suporta:
- **Bloqueio por pista** (`pistaRequerida`)
- **Reversão de ramos explorados** (sistema de travamento em cadeia)
- **Diálogos não lineares** — o jogador pode explorar diferentes caminhos

Alternativas:
- **Máquina de estados finitos:** Seria engessada para fluxos ramificados
- **Grafo geral:** Mais flexível, mas com mais complexidade para gerenciar bloqueios

**Complexidade:**

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| `get(id)` | O(1) | Backend: Map com chave `nodeId`. Frontend: `dialogoMap.get(id)`. |
| `escolher(index)` | O(1) | Acesso direto ao array `escolhas[index]` do nó atual. |
| `isNodeFullyExplored(nodeId)` | O(n) | Percorre subárvore recursivamente para verificar se todos os ramos foram explorados. Feito apenas uma vez por visita ao NPC. |
| `getCaminhoRaiz(nodeId)` | O(h) | Sobe na árvore até a raiz para propagar bloqueios. h = altura da árvore ≤ 5 na prática. |
| Construção | O(n) | Percorre todos os nós uma vez para construir o Map. n = total de nós. |
| Espaço | O(n) | Um objeto por nó no Map. |

**Aplicação no jogo:**
```typescript
// Exemplo de nó com bloqueio por pista
{
  id: "mr_brown",
  fala: "Eu estava no jardim...",
  escolhas: [
    { texto: "Perguntar sobre a chave", proximoId: "brown_chave", pistaRequerida: "carta_amor" },
    { texto: "Ir embora", proximoId: null }
  ]
}
```
Sistema de travamento: quando o jogador explora TODOS os ramos de um nó, o nó é marcado como "esgotado" e o pai recebe notificação para verificar se todos os seus filhos também estão esgotados, propagando o bloqueio de baixo para cima.

---

## 4. BFS — Campo de Visão

**Justificativa de escolha:**
BFS foi escolhido para expansão uniforme da visão a partir da posição do jogador. Diferente de DFS, que pode gerar padrões irregulares, BFS garante que todas as células a uma distância `d` sejam reveladas antes das de distância `d+1`, criando um campo de visão circular natural. Alternativas:
- **Flood Fill:** Equivalente a BFS sem distância, revelaria toda a área conectada (muito larga)
- **Raycasting:** Revelaria apenas linhas retas (não natural para o jogo)

**Complexidade:**

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| BFS visão (raio r) | O(V+E) | Explora todas as células alcançáveis em até `r` passos. V = células visitadas, E = arestas (4 por célula). Raio 3: V ≤ (2×3+1)² = 49, E ≤ 4×49 = 196. |
| BFS visão (grid 10×10) | O(100) | Na prática, grid fixo de 100 células. O(1) com constante ≤ 100. |
| Espaço | O(V) | Fila + conjunto de visitados. No pior caso, V = 100 células. |

**Prova da complexidade O(r²):**
A BFS expande em camadas. Para raio r, a área máxima é:
```
(2r+1)² = 4r² + 4r + 1
```
Para r = 3: 49 células. Para r = 5: 121 células (um pouco mais que o grid total de 100).

**Aplicação no jogo:**
```javascript
function calcularVisao(posicao, grid, raio) {
  // BFS a partir de posicao
  // Marca todas as células com distância <= raio como reveladas
  // Retorna array de {x, y, revelada}
}
```
O frontend replica o algoritmo para atualização otimista da UI sem aguardar resposta do backend.

---

## 5. Diagrama de Arquitetura — Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (React + Zustand)                   │
│                                                                 │
│  ┌──────────────┐   WASD/setas   ┌──────────────────────────┐ │
│  │  MapScreen   │ ──────────────→ │  useMovimento (hook)    │ │
│  │  (grid SVG)  │                 │  → gameStore.mover()    │ │
│  └──────────────┘                 └────────────┬─────────────┘ │
│         ↑                                      │                │
│         │ atualiza grid                         ▼                │
│  ┌──────┴──────┐                     ┌────────────────────────┐ │
│  │ gameStore   │ ←────────────────── │ POST /api/mover        │ │
│  │ (Zustand)   │   resposta JSON     │ (com atualização       │ │
│  │             │                     │  otimista local)       │ │
│  │ - posicao   │                     └────────────────────────┘ │
│  │ - celulas   │                                                │
│  │ - pistas    │     POST /api/coletar  ┌──────────────────┐   │
│  │ - dialogo   │ ─────────────────────→ │ MaxHeap.insert() │   │
│  │ - rotaTSP   │                         └──────────────────┘   │
│  └─────────────┘                                                │
│         │                                                       │
│         │ GET /api/rota            ┌──────────────────────────┐ │
│         └────────────────────────→ │ TSP.calcularRota()       │ │
│                                     │ - Vizinho + 2-opt       │ │
│                                     └──────────────────────────┘ │
│         │                                                       │
│         │ POST /api/interagir       ┌──────────────────────────┐ │
│         └────────────────────────→ │ ArvoreDecisao.get(id)     │ │
│                                     │ + valida pistaRequerida  │ │
│                                     └──────────────────────────┘ │
│                                                                 │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP/JSON
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  /api/partida/:id/mover                                   ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │  1. BFS.calcularVisao(posicao, grid, raio=3)       │ ││
│  │  │  2. Atualiza celulasReveladas no MongoDB            │ ││
│  │  │  3. Retorna { posicao, celulasVisiveis }            │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  /api/partida/:id/coletar (pistaId)                     ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │  1. MaxHeap.insert(pista, pista.peso)              │ ││
│  │  │  2. Atualiza pistasColetadas no MongoDB             │ ││
│  │  │  3. Retorna { xpTotal, inventario }                 │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  /api/partida/:id/rota                                   ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │  1. TSP.calcularRota()                              │ ││
│  │  │  2. Vizinho + 2-opt                                 │ ││
│  │  │  3. Retorna { rota: [{id, x, y}] }                 │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  /api/partida/:id/interagir ({ celula: {x, y} })        ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │  1. Busca NPC na posição                           │ ││
│  │  │  2. ArvoreDecisao.get(npc.dialogoInicial)          │ ││
│  │  │  3. Verifica pistaRequerida                        │ ││
│  │  │  4. Retorna { no: NoDialogo }                      │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  /api/partida/:id/acusar ({ suspeitoId })               ││
│  │  ┌──────────────────────────────────────────────────────┐ ││
│  │  │  1. top3 = MaxHeap.extractMax() × 3                 │ ││
│  │  │  2. Compara suspeitoId com culpado real             │ ││
│  │  │  3. Retorna { acertou, argumento, top3 }            │ ││
│  │  └──────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ Mongoose ODM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB — Banco de Dados                     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Coleção: Partida                                         ││
│  │  {                                                        ││
│  │    posicao: { x: 0, y: 0 },                               ││
│  │    celulasReveladas: ["0,0", "1,0", ...],                 ││
│  │    pistasColetadas: [{ id, nome, peso, coletada }],       ││
│  │    xp: 0,                                                 ││
│  │    dialogoAtual: { npcId, nodeId },                       ││
│  │    rota: [{ id, x, y }],                                  ││
│  │    acusacao: { suspeitoId, acertou }                      ││
│  │  }                                                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo Completo do Jogo:

1. **Movimento (Dev 3):** 
   - Jogador pressiona WASD → `useMovimento` → `gameStore.mover()`
   - Atualização otimista local via `BFS.calcularVisaoLocal()`
   - `POST /api/partida/:id/mover` → backend recalcula via BFS e persiste
   - UI atualizada com o grid e nova posição

2. **Coleta de Pista (Dev 1 & 3):**
   - Jogador pisa na célula com pista → `gameStore.coletarPista(pistaId)`
   - Atualização local via `MaxHeap.insert()`
   - `POST /api/partida/:id/coletar` → heap atualizado no banco
   - Inventário retrátil mostra pistas ordenadas por peso

3. **Diálogo (Dev 1 & 3):**
   - Jogador pressiona "E" perto de NPC → `gameStore.iniciarDialogo(npcId)`
   - `POST /api/partida/:id/interagir` → retorna nó do diálogo via `ArvoreDecisao.get()`
   - Escolhas bloqueadas por pista são exibidas como 
   - Sistema de travamento: ramos esgotados propagam até a raiz

4. **Rota TSP (Dev 1 & 3):**
   - Após coletar pistas, frontend chama `GET /api/partida/:id/rota`
   - Backend: `TSP.calcularRota()` (Vizinho + 2-opt)
   - Offline: `tspHeldKarp()` (Held-Karp exato)
   - MapScreen desenha overlay SVG com linha pontilhada

5. **Acusação (Dev 1 & 3):**
   - Jogador clica "Acusar" → `POST /api/partida/:id/acusar`
   - Backend extrai top 3 do MaxHeap, compara com culpado real
   - Frontend exibe veredicto e cadeia de evidências

-
