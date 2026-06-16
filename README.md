# Detective Blackwood

Jogo de mistério vitoriano no browser: investigue o assassinato de Sir Edmund Blackwood coletando pistas em um grid 10×10, interrogando suspeitos e acusando o culpado. Construído para demonstrar na prática quatro estruturas de dados clássicas.

*Stack:* React 18 + TypeScript + Vite · Node.js + Express · MongoDB  
*Time:* 4 Devs · 2 Sprints · 14 dias

---

## Índice

1. [O Caso](#o-caso)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação e execução](#instalação)
4. [Arquitetura](#arquitetura)
5. [API REST](#api)
6. [Estruturas de dados e algoritmos](#algoritmos)
7. [Frontend — componentes e store](#frontend)
8. [Modo offline](#offline)
9. [Divisão de responsabilidades](#responsabilidades)
10. [GitHub Issues / Sprints](#sprints)

---

## O Caso <a name="o-caso"></a>

Sir Edmund Blackwood, 67 anos, foi encontrado morto em sua biblioteca. Causa: envenenamento por arsênico. Três suspeitos, dez pistas espalhadas pela mansão, quatro NPCs para interrogar.

*Loop de jogo:*

1. *Mover* — WASD ou setas revelam células adjacentes via BFS (névoa de guerra, raio 3)
2. *Coletar pistas* — ao pisar em uma célula com pista, ela é inserida no inventário (MaxHeap)
3. *Interrogar NPCs* — diálogos em árvore; escolhas bloqueadas por pistas ainda não coletadas
4. *Sugerir rota* — TSP calcula a ordem ótima de visita às pistas restantes e exibe linha pontilhada no grid
5. *Acusar* — seleciona suspeito; tela de resultado com cadeia de evidências e veredicto

*Máquina de estados (statusJogo):*


titulo ──► jogando ──► acusando ──► fim


---

## Pré-requisitos <a name="pré-requisitos"></a>

- Node.js >= 20
- MongoDB >= 7 (local ou Atlas)
- npm >= 10

---

## Instalação e execução <a name="instalação"></a>

bash
# 1. Clonar
git clone https://github.com/lucassantx/jogo-detetive-projeto.git
cd jogo-detetive-projeto

# 2. Backend
cd backend
# criar .env com:  MONGODB_URI=mongodb://localhost:27017/blackwood  PORT=3001
npm install
npm run seed        # insere pistas, diálogos e suspeitos no banco
npm run dev         # → http://localhost:3001

# 3. Frontend (novo terminal)
cd ../frontend
npm install
npm run dev         # → http://localhost:5173


O Vite faz proxy de /api para http://localhost:3001 (configurado em vite.config.ts).  
Se o backend estiver offline, o jogo funciona em *modo offline* com fallbacks locais.

---

## Arquitetura <a name="arquitetura"></a>


┌─────────────────────────────────────────────────────┐
│  Browser — React + Zustand                          │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐  │
│  │  MapScreen   │    │  DialogueScreen          │  │
│  │              │    │                          │  │
│  │ useMovimento │    │  noAtualData (Zustand)  │  │
│  │ gameStore.   │    │                          │  │
│  │ mover()      │    │  HUD (MaxHeap)          │  │
│  │              │    │  Accusation             │  │
│  └──────────────┘    └──────────────────────────┘  │
│         │                        │                  │
│         └────────┬───────────────┘                  │
│                  │ HTTP JSON (/api/*)               │
└──────────────────┼──────────────────────────────────┘
                             
┌────────────────────────────▼────────────────────────┐
│  Express — Node.js                                  │
│                                                     │
│  /api/partida/:id/mover    → mapaController         │
│  /api/partida/:id/interagir → dialogoController     │
│  /api/partida/:id/escolha  → dialogoController      │
│  /api/partida/:id/coletar  → partidaController      │
│  /api/partida/:id/rota     → partidaController      │
│  /api/partida/:id/acusar   → partidaController      │
│                                                     │
│  Estruturas: BFS · MaxHeap · ArvoreDecisao · TSP    │
└────────────────────────────┬────────────────────────┘
                             │ Mongoose
┌────────────────────────────▼────────────────────────┐
│  MongoDB — coleção Partida                          │
│  { posicao, celulasReveladas, pistasColetadas,      │
│    xp, dialogoAtual, rota, acusacao }               │
└─────────────────────────────────────────────────────┘


---

## API REST <a name="api"></a>

Base URL: http://localhost:3001/api/partida

| Método | Rota | Corpo | Resposta |
|--------|------|-------|----------|
| POST | / | — | { partidaId } |
| GET | /:id | — | estado completo da partida |
| POST | /:id/mover | { direcao: "N"\|"S"\|"L"\|"O" } | { posicao, visao[] } |
| GET | /:id/visao | — | { celulasVisiveis[] } |
| POST | /:id/coletar | { pistaId } | { xpTotal, inventario } |
| GET | /:id/inventario | — | { pistas[] } ordenadas por peso |
| GET | /:id/rota | — | { rota: [{ id, x, y }] } |
| POST | /:id/interagir | { celula: { x, y } } | { no: NoDialogo } |
| POST | /:id/escolha | { noAtualId, index } | { proximoNo, pistaBloqueada, xpTotal } |
| POST | /:id/acusar | { suspeitoId } | { acertou, argumento, top3 } |
| GET | /health | — | { status: "ok" } |

---

## Estruturas de dados e algoritmos <a name="algoritmos"></a>

### MaxHeap — Inventário de pistas

*Onde:* backend/src/structures/MaxHeap.js · backend/src/controllers/partidaController.js

Cada pista coletada é inserida em um MaxHeap ordenado por peso (1–10). Isso garante que top3 (pistas mais relevantes exibidas na tela de acusação) seja sempre recuperado sem reordenar o array inteiro.

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| insert | O(log n) | bubble-up pelo heap até posição correta |
| extractMax | O(log n) | remove raiz, sink-down restaura propriedade |
| top3 | O(n log n) | extrai 3× o máximo — equivalente a heapsort parcial |
| Espaço | O(n) | array linear com índices 2i+1, 2i+2 |

*Alternativas descartadas:* lista ordenada teria insert em O(n); árvore BST balanceada (AVL) adicionaria complexidade de implementação sem ganho para n ≤ 10.

---

### BFS — Campo de visão (névoa de guerra)

*Onde:* backend/src/structures/BFS.js · frontend/src/app/store/gameStore.ts

Ao mover para uma célula, a BFS expande a partir da nova posição com raio 3, marcando todas as células atingíveis como reveladas. O frontend replica o algoritmo localmente para atualização otimista da UI sem aguardar resposta do backend.

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| BFS visão (raio r) | O(r²) | no grid quadrado, área máxima = (2r+1)² ≈ 49 células |
| Espaço | O(r²) | fila + conjunto de visitados proporcional à área |

Grid limitado a 10×10 = 100 células, portanto na prática O(1) com constante ≤ 100.

---

### Árvore de Decisão — Sistema de diálogos

*Onde:* backend/src/structures/ArvoreDecisao.js · frontend/src/app/store/gameStore.ts (DIALOGOS_LOCAL)

Os diálogos de cada NPC formam uma árvore n-ária. Cada nó contém o texto da fala e uma lista de escolhas; cada escolha aponta para o nó filho (proximoId) ou null (fim da conversa). O backend armazena a árvore em um Map<id, NoDialogo> para acesso direto.

| Operação | Complexidade | Justificativa |
|----------|-------------|---------------|
| get(id) | O(1) | Map com chave direta |
| escolher(index) | O(1) | acesso por índice na lista de escolhas |
| Construção | O(n) | n = número total de nós da árvore |
| Espaço | O(n) | um registro por nó |

*Sistema de travamento em cadeia reversa (frontend):*  
isNodeFullyExplored(nodeId) percorre a subárvore recursivamente (O(n) uma vez por visita ao NPC). Uma escolha só é marcada como esgotada quando *todos* os ramos abaixo dela foram percorridos; o bloqueio propaga de baixo para cima até a raiz.

*Diálogos travados por pista:* cinco escolhas têm pistaRequerida — ficam bloqueadas (🔒) até que o detetive colete a evidência correspondente no mapa.

---

### TSP — Rota de investigação

*Onde:* backend/src/structures/TSP.js · frontend/src/app/store/gameStore.ts (tspHeldKarp)

Dado o conjunto de pistas ainda não coletadas e a posição atual do detetive, calcula a ordem de visita que minimiza a distância total percorrida (distância Manhattan no grid).

*Backend* implementa vizinho-mais-próximo + 2-opt (heurística):

| Etapa | Complexidade |
|-------|-------------|
| Vizinho mais próximo | O(n²) |
| 2-opt (por iteração) | O(n²) |
| 2-opt (total) | O(n² × iterações) — converge tipicamente em < 10 |
| Espaço | O(n) |

*Frontend (modo offline)* implementa *Held-Karp exato* (tspHeldKarp):

| Etapa | Complexidade |
|-------|-------------|
| DP + reconstrução | O(n² × 2ⁿ) |
| Espaço | O(n × 2ⁿ) |

Para n = 10 pistas: ~100 K operações e ~10 KB de memória — trivial no browser. Garante a rota ótima, sem aproximação.

---

## Frontend — componentes e store <a name="frontend"></a>

### gameStore.ts — Zustand

Estado global único. Todas as ações do jogo são métodos do store.

| Fatia de estado | Tipo | Descrição |
|----------------|------|-----------|
| posicao | { x, y } | posição do detetive no grid |
| celulasReveladas | Set<string> | chaves "x,y" visíveis |
| pistas | Pista[] | todas as 10 pistas com flag coletada |
| pistasColetadas | Pista[] | subconjunto coletado, ordenado por peso |
| npcs | NPC[] | posição e diálogo inicial de cada NPC |
| noAtualData | NoDialogo \| null | nó do diálogo sendo exibido |
| npcVisitedChoices | Record<npcId, Record<nodeId, number[]>> | quais índices de escolha foram tomados em cada nó |
| escolhasRaizUsadas | Record<npcId, number[]> | índices raiz completamente explorados |
| rotaTSP | RotaTSPItem[] | waypoints ordenados pelo TSP |
| statusJogo | 'titulo' \| 'jogando' \| 'acusando' \| 'fim' | máquina de estados |

### Componentes

| Componente | Responsabilidade |
|-----------|-----------------|
| MapScreen | grid 10×10 + overlay SVG com linha pontilhada da rota TSP |
| useMovimento | captura WASD/setas, chama gameStore.mover() |
| DialogueScreen | painel de diálogo com efeito typewriter, estados visitado/bloqueado/esgotado |
| HUD | barra XP/nível, inventário retrátil, botão Acusar |
| Inventario | lista de pistas coletadas ordenadas por peso (MaxHeap) |
| Accusation | tela de acusação; chama API ou usa fallback com argumentos por suspeito |

### Comunicação frontend ↔️ backend

Todas as chamadas usam atualização *otimista*: o estado local é atualizado imediatamente e sincronizado com o backend em background. Em caso de falha, o estado local é mantido (ver modo offline).

---

## Modo offline <a name="offline"></a>

O jogo é totalmente jogável sem backend. Quando partidaId é null (backend indisponível), cada ação usa uma implementação local:

| Ação | Fallback |
|------|---------|
| Criar partida | estado inicial hardcoded (PISTAS_MOCK, NPCS_MOCK) |
| Mover | BFS local em gameStore.ts |
| Coletar pista | atualização de estado local |
| Iniciar/avançar diálogo | DIALOGOS_LOCAL (árvore completa em TypeScript) |
| Calcular rota | tspHeldKarp — Held-Karp exato no browser |
| Acusar | argumentos por suspeito hardcoded com cadeia de evidências |

---

## Divisão de responsabilidades <a name="responsabilidades"></a>

| Dev | Sprint 1 | Sprint 2 |
|-----|----------|----------|
| Dev 1 | MaxHeap, TSP, BFS, ArvoreDecisao, controllers, rotas Express | Integração, fixes de movimentação |
| Dev 2 | Models Mongoose, Seed (pistas/diálogos/suspeitos), setup MongoDB | README técnico, docs/complexidade.md |
| Dev 3 | MapScreen, useMovimento, DialogueScreen, gameStore | Rota TSP no mapa (Issue #8), diálogos completos, TSP Held-Karp, diálogos travados por pista |
| Dev 4 | HUD, Inventario, pages, roteamento React | Tela de acusação (Issue #7), sistema de travamento em cadeia de diálogos |

---

## GitHub Issues / Sprints <a name="sprints"></a>

| # | Título | Dev | Sprint |
|---|--------|-----|--------|
| 1 | MaxHeap para inventário de pistas | Dev 1 | Sprint 1 |
| 2 | TSP: vizinho mais próximo + 2-opt | Dev 1 | Sprint 1 |
| 3 | Árvore de Decisão + BFS | Dev 1 | Sprint 1 |
| 4 | Mecânica de movimento + névoa de guerra | Dev 3 | Sprint 1 |
| 5 | Coleta de pistas e inserção no MaxHeap | Dev 3 | Sprint 1 |
| 6 | Sistema de diálogos (árvore de decisão) | Dev 3 | Sprint 1 |
| 7 | Tela de acusação usando top 3 do heap | Dev 1 | Sprint 2 |
| 8 | Visualização da rota TSP no mapa | Dev 3 | Sprint 2 |
| 9 | README técnico + justificativa algorítmica | Dev 2 | Sprint 2 |
|10 | Implementar models e seed (MongoDB) | Dev 2| Sprint 1 | 
|11 | Implemenatr Held-Karp para TSP com n =< 15 | Dev 2 | Sprint 2 |

---

Projeto acadêmico — Estruturas de Dados e Algoritmos
