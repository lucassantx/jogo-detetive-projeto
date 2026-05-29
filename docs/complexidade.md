# Análise de Complexidade — Detective Blackwood

> **TODO Dev 2 — Sprint 2 | Issue #9**
> Preencher cada seção com a análise de complexidade dos algoritmos implementados.
> Consultar o `README.md` e o código finalizado pelos demais devs antes de escrever.

---

## 1. MaxHeap — Inventário de Pistas

**Justificativa de escolha:**
TODO — por que MaxHeap e não lista ordenada, árvore AVL ou outro?

**Complexidade:**

| Operação       | Complexidade | Justificativa |
|----------------|-------------|---------------|
| `insert`       | O(log n)    | TODO          |
| `extractMax`   | O(log n)    | TODO          |
| `top3`         | O(n log n)  | TODO          |
| Espaço         | O(n)        | TODO          |

**Comparação com alternativas:**
TODO

---

## 2. TSP — Rota de Investigação

**Justificativa de escolha:**
TODO — por que heurística e não Held-Karp exato?

**Complexidade:**

| Etapa                  | Complexidade      | Justificativa |
|------------------------|-------------------|---------------|
| Vizinho Mais Próximo   | O(n²)             | TODO          |
| 2-opt (por iteração)   | O(n²)             | TODO          |
| 2-opt (total)          | O(n² × iterações) | TODO          |
| Espaço                 | O(n)              | TODO          |

**Comparação com Held-Karp:** O(n² × 2ⁿ) — inviável para n > 20.
TODO — expandir

---

## 3. Árvore de Decisão — Diálogos

**Justificativa de escolha:**
TODO

**Complexidade:**

| Operação      | Complexidade | Justificativa |
|---------------|-------------|---------------|
| `get(id)`     | O(1)        | TODO — Map com chave direta |
| `escolher`    | O(1)        | TODO          |
| Construção    | O(n)        | TODO          |
| Espaço        | O(n)        | TODO          |

---

## 4. BFS — Campo de Visão

**Justificativa de escolha:**
TODO — por que BFS e não DFS ou flood fill direto?

**Complexidade:**

| Operação   | Complexidade | Justificativa |
|------------|-------------|---------------|
| BFS visão  | O(V+E)      | TODO          |
| Espaço     | O(V)        | TODO          |

Onde V = células do grid (máx. 100), E = arestas (máx. 4 por célula).

---

## 5. Diagrama de Arquitetura

```
TODO — inserir diagrama ASCII ou imagem do fluxo de dados
       entre Frontend ↔ API ↔ Estruturas ↔ MongoDB

Exemplo de fluxo:
  Dev 3: MapScreen → WASD → useMovimento
       → POST /api/partida/:id/mover
       → mapaController → BFS.calcularVisao
       → retorna { posicao, celulasVisiveis }
       → MapScreen atualiza grid
```

---

*Documento obrigatório — Issue #9 | Dev 2 | Sprint 2*
