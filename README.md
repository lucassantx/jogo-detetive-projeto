# 🔍 Detective Blackwood

> **TODO Dev 2 — Sprint 2 | Issue #9**
> Preencher todas as seções marcadas com TODO após as sprints.
> Este README é entrega obrigatória do professor.

Um jogo de mistério vitoriano onde você investiga o assassinato de Sir Edmund Blackwood
usando algoritmos clássicos: MaxHeap, TSP, Árvore de Decisão e BFS.

**Stack:** React + Vite · Node.js + Express · MongoDB  
**Time:** 4 Devs · 2 Sprints · 14 dias

---

## 📋 Índice

1. [O Caso Blackwood](#o-caso)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação e execução](#instalação)
4. [Estrutura de pastas](#estrutura)
5. [Algoritmos implementados](#algoritmos)
6. [Divisão de responsabilidades](#responsabilidades)
7. [GitHub Issues / Sprints](#sprints)

---

## 🏚 O Caso Blackwood <a name="o-caso"></a>

Sir Edmund Blackwood, 67 anos, foi encontrado morto em sua biblioteca particular.
Causa: envenenamento por arsênico. Três suspeitos, dez locais para investigar,
uma janela de 14 dias para resolver o caso.

TODO — resumo do gameplay (movimento, coleta de pistas, diálogos, acusação)

---

## 🛠 Pré-requisitos <a name="pré-requisitos"></a>

- Node.js >= 20
- MongoDB >= 7 (local ou Atlas)
- npm >= 10

---

## 🚀 Instalação e execução <a name="instalação"></a>

```bash
# 1. Clonar o repositório
git clone https://github.com/<org>/detective-blackwood.git
cd detective-blackwood

# 2. Backend
cd backend
cp .env.example .env        # ajustar MONGODB_URI
npm install
npm run seed                # popular banco com pistas e diálogos
npm run dev                 # http://localhost:3001

# 3. Frontend (novo terminal)
cd ../frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## 📁 Estrutura de pastas <a name="estrutura"></a>

```
detective-blackwood/
├── backend/
│   ├── src/
│   │   ├── structures/     ← MaxHeap, TSP, BFS, ArvoreDecisao (Dev 1)
│   │   ├── controllers/    ← partida, dialogo, mapa (Dev 1)
│   │   ├── routes/         ← rotas Express (Dev 1)
│   │   ├── models/         ← Mongoose: Partida, Pista, Suspeito (Dev 2)
│   │   └── seed/           ← dados iniciais: pistas, diálogos, suspeitos (Dev 2)
│   └── package.json
│
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── Map/        ← MapScreen, useMovimento (Dev 3)
│   │   │   ├── Dialog/     ← DialogueScreen (Dev 3)
│   │   │   ├── HUD/        ← HUD, Inventario (Dev 4)
│   │   │   └── Accusation/ ← Accusation (Dev 4)
│   │   ├── pages/          ← MapPage, TitlePage, AccusationPage (Dev 4)
│   │   ├── store/          ← gameStore Zustand (Dev 3 + Dev 4)
│   │   └── styles/         ← theme.css, fonts.css (Figma → Dev 3)
│   └── package.json
│
├── docs/
│   └── complexidade.md     ← análise algorítmica (Dev 2)
├── README.md               ← este arquivo (Dev 2)
└── .github/
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 🧮 Algoritmos implementados <a name="algoritmos"></a>

### MaxHeap — Inventário de Pistas
TODO — justificativa + complexidade (insert O(log n), top3 O(n log n))

### TSP — Rota de Investigação
TODO — justificativa + complexidade O(n²) + comparação com Held-Karp

### Árvore de Decisão — Diálogos
TODO — justificativa + complexidade get O(1), navegação O(1)

### BFS — Campo de Visão
TODO — justificativa + complexidade O(V+E)

---

## 👥 Divisão de responsabilidades <a name="responsabilidades"></a>

| Dev   | Sprint 1                                     | Sprint 2                    |
|-------|----------------------------------------------|-----------------------------|
| Dev 1 | MaxHeap, TSP, BFS, ArvoreDecisao, controllers| Integração com frontend      |
| Dev 2 | Models, Seed, setup MongoDB                  | README, complexidade.md      |
| Dev 3 | MapScreen, DialogueScreen, useMovimento      | Rota TSP no mapa (Issue #8)  |
| Dev 4 | HUD, Inventario, pages, store                | AccusationScreen (Issue #7)  |

---

## 📌 GitHub Issues / Sprints <a name="sprints"></a>

| # | Título | Dev | Sprint |
|---|--------|-----|--------|
| #1 | MaxHeap para inventário de pistas | Dev 1 | Sprint 1 |
| #2 | TSP: vizinho mais próximo + 2-opt | Dev 1 | Sprint 1 |
| #3 | Árvore de Decisão + BFS | Dev 1 | Sprint 1 |
| #4 | Mecânica de movimento + névoa de guerra | Dev 3 | Sprint 1 |
| #5 | Coleta de pistas e inserção no MaxHeap | Dev 3 | Sprint 1 |
| #6 | Sistema de diálogos (árvore de decisão) | Dev 3 | Sprint 1 |
| #7 | Tela de acusação usando top 3 do heap | Dev 4 | Sprint 2 |
| #8 | Visualização da rota TSP no mapa | Dev 3 | Sprint 2 |
| #9 | README técnico + justificativa algorítmica | Dev 2 | Sprint 2 |

---

*Projeto acadêmico — Estruturas de Dados e Algoritmos*
