import { create } from 'zustand';

const API = '/api/partida';

// ─── Tipos exportados ────────────────────────────────────────────────────────

export interface Pista {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
  celula: { x: number; y: number };
  coletada: boolean;
}

export interface NPC {
  id: string;
  nome: string;
  celula: { x: number; y: number };
  dialogoInicial: string;
}

export interface Escolha {
  texto: string;
  proximoId: string | null;
  pistaBloqueada: string | null;
  xp: number;
  visitado?: boolean; // tomada pelo menos uma vez — visual ✓, ainda clicável se há ramos abaixo
  usado?: boolean;    // subárvore inteiramente explorada — desabilitado
}

export interface NoDialogo {
  id: string;
  npc: string;
  texto: string;
  escolhas: Escolha[];
}

export interface Notificacao {
  id: string;
  nome: string;
  peso: number;
}

export interface RotaTSPItem {
  id: string;
  x: number;
  y: number;
}

export type StatusJogo = 'titulo' | 'jogando' | 'acusando' | 'fim';

// Quantidade de escolhas no nó raiz de cada NPC (= nº máximo de visitas distintas)
// Derivado de DIALOGOS_LOCAL — deve ser atualizado se o backend mudar o seed.
export const MAX_INTERACOES_NPC: Record<string, number> = {
  adelaide: 3, // A0 tem 3 escolhas raiz
  victor:   3, // B0 tem 3 escolhas raiz
  fynn:     3, // C0 tem 3 escolhas raiz
  harlow:   3, // D0 tem 3 escolhas raiz
};

interface GameState {
  partidaId: string | null;
  posicao: { x: number; y: number };
  celulasReveladas: Set<string>;
  pistas: Pista[];
  npcs: NPC[];
  pistasColetadas: Pista[];
  xp: number;
  dialogoAtivo: boolean;
  noDialogoAtual: string | null;
  noAtualData: NoDialogo | null;
  npcAtual: string | null;
  statusJogo: StatusJogo;
  notificacoes: Notificacao[];
  rotaTSP: RotaTSPItem[];
  mostrandoRota: boolean;
  // npcId → nodeId → índices de escolhas já tomadas naquele nó
  npcVisitedChoices: Record<string, Record<string, number[]>>;
  // índices das escolhas raiz COMPLETAMENTE exploradas por NPC (subárvore toda percorrida)
  escolhasRaizUsadas: Record<string, number[]>;
  // ids dos NPCs com quem o jogador já iniciou uma conversa pelo menos uma vez
  npcsInterrogados: Set<string>;

  mover: (dx: number, dy: number) => void;
  coletarPista: (pistaId: string) => void;
  iniciarDialogo: (npcId: string) => void;
  fecharDialogo: () => void;
  avancarDialogo: (noAtualId: string, index: number) => void;
  removerNotificacao: (id: string) => void;
  setStatusJogo: (status: StatusJogo) => void;
  carregarRota: () => void;
  toggleRota: () => void;
}

// ─── BFS local — otimista (espelha backend/src/structures/BFS.js) ─────────────

function bfsReveal(pos: { x: number; y: number }, raio = 3): { x: number; y: number }[] {
  const resultado: { x: number; y: number }[] = [];
  const visitado = new Set<string>();
  const fila: { x: number; y: number; dist: number }[] = [{ ...pos, dist: 0 }];

  while (fila.length > 0) {
    const { x, y, dist } = fila.shift()!;
    const key = `${x},${y}`;
    if (visitado.has(key) || x < 0 || y < 0 || x >= 10 || y >= 10) continue;
    visitado.add(key);
    resultado.push({ x, y });
    if (dist < raio) {
      fila.push({ x: x + 1, y, dist: dist + 1 });
      fila.push({ x: x - 1, y, dist: dist + 1 });
      fila.push({ x, y: y + 1, dist: dist + 1 });
      fila.push({ x, y: y - 1, dist: dist + 1 });
    }
  }
  return resultado;
}

// ─── Diálogos locais — fallback quando backend não está disponível ────────────
// Conteúdo espelha backend/src/seed/dialogos.js e o roteiro narrativo completo

const DIALOGOS_LOCAL: Record<string, NoDialogo> = {

  // ── Adelaide Cross ─────────────────────────────────────────────────────────
  A0: { id: 'A0', npc: 'Adelaide Cross',
    texto: 'Eu sabia que alguém viria. Sabia desde o momento em que encontrei ele.',
    escolhas: [
      { texto: 'Onde estava às 23h de ontem?',            proximoId: 'A1',  pistaBloqueada: null, xp: 10 },
      { texto: 'O senhor tinha inimigos?',                proximoId: 'A2',  pistaBloqueada: null, xp: 10 },
      { texto: 'Vi um frasco estranho aqui. O que era?',  proximoId: 'A3',  pistaBloqueada: null, xp: 15 },
    ]},

  A1: { id: 'A1', npc: 'Adelaide Cross',
    texto: 'Na cozinha, preparando o chá das onze. Como todas as noites. Subi com a bandeja por volta das 22h30. O senhor estava na escrivaninha, escrevendo.',
    escolhas: [
      { texto: 'Mais alguém entrou na cozinha nessa hora?', proximoId: 'A1a', pistaBloqueada: null, xp: 20 },
      { texto: 'O chá tinha alguma coisa de diferente?',    proximoId: 'A1b', pistaBloqueada: null, xp: 10 },
      { texto: 'Deixa pra lá. Obrigado.',                   proximoId: null,  pistaBloqueada: null, xp:  5 },
    ]},
  A1a: { id: 'A1a', npc: 'Adelaide Cross',
    texto: "O Victor passou por lá. Disse que queria um copo d'água. Ficou uns dois minutos, não mais. Eu estava de costas, descascando as maçãs. Achei estranho na hora. Ele nunca vai à cozinha.",
    escolhas: [
      { texto: 'Ele mexeu em alguma coisa?',                 proximoId: 'A1aa', pistaBloqueada: null, xp: 20 },
      { texto: 'Quanto tempo ficou sozinho perto do chá?',   proximoId: 'A1ab', pistaBloqueada: null, xp: 25 },
      { texto: 'Obrigado, isso é suficiente.',               proximoId: null,   pistaBloqueada: null, xp:  5 },
    ]},
  A1aa: { id: 'A1aa', npc: 'Adelaide Cross',
    texto: 'Não vi. Mas... podia ter mexido. Eu estava de costas o tempo todo.',
    escolhas: [{ texto: 'Entendido.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A1ab: { id: 'A1ab', npc: 'Adelaide Cross',
    texto: 'Talvez um minuto. Não mais que isso. Mas um minuto é tempo suficiente, não é?',
    escolhas: [{ texto: 'É sim. Obrigado.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A1b: { id: 'A1b', npc: 'Adelaide Cross',
    texto: 'Não que eu tenha notado. Mas eu não provei. Nunca provei o chá do senhor.',
    escolhas: [{ texto: 'Entendido.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  A2: { id: 'A2', npc: 'Adelaide Cross',
    texto: 'Inimigos... ou pessoas que ele decepcionou. É diferente. Edmund não era cruel — era... inconveniente. Prometia coisas e esquecia. Ou fingia esquecer.',
    escolhas: [
      { texto: 'Quem ele decepcionou mais recentemente?', proximoId: 'A2a', pistaBloqueada: null, xp: 15 },
      { texto: 'E você? Ele decepcionou você também?',    proximoId: 'A2b', pistaBloqueada: null, xp: 15 },
      { texto: 'Há quanto tempo trabalha aqui?',          proximoId: 'A2c', pistaBloqueada: null, xp: 10 },
    ]},
  A2a: { id: 'A2a', npc: 'Adelaide Cross',
    texto: 'O Victor chegou na segunda-feira. Quatro dias antes de... isso. Nunca vinha visitar. Só aparece quando precisa de dinheiro. E desta vez chegou logo depois que o advogado Dr. Wren esteve aqui. Dois mais dois, detetive.',
    escolhas: [{ texto: 'Entendido.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A2b: { id: 'A2b', npc: 'Adelaide Cross',
    texto: 'Isso não é relevante.',
    escolhas: [{ texto: 'Como quiser.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A2c: { id: 'A2c', npc: 'Adelaide Cross',
    texto: 'Vinte anos. Desde que a senhora Blackwood ainda estava viva. Esta mansão é minha vida.',
    escolhas: [{ texto: 'Obrigado.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  A3: { id: 'A3', npc: 'Adelaide Cross',
    texto: 'Meu Deus. Eu vi esse frasco no cofre, semana passada. O senhor me pediu para não contar a ninguém. Disse que era para os ratos.',
    escolhas: [
      { texto: 'Quem mais sabia da combinação do cofre?',    proximoId: 'A3a', pistaBloqueada: null,          xp: 25 },
      { texto: 'Havia ratos na mansão?',                     proximoId: 'A3b', pistaBloqueada: null,          xp: 20 },
      { texto: 'Você escreveu uma carta anônima para ele?',  proximoId: 'A3c', pistaBloqueada: null,          xp: 30 },
    ]},
  A3a: { id: 'A3a', npc: 'Adelaide Cross',
    texto: 'O senhor Edmund, claro. O Victor — Sir Edmund lhe deu a combinação quando ele tinha vinte e poucos anos, numa época em que havia confiança entre eles. E o Fynn guarda uma chave sobressalente para emergências. Três pessoas. E agora o senhor faz quatro.',
    escolhas: [{ texto: 'Muito obrigado.', proximoId: null, pistaBloqueada: null, xp: 10 }]},
  A3b: { id: 'A3b', npc: 'Adelaide Cross',
    texto: 'Não há ratos aqui há anos. Eu não deixaria. Então para que o arsênico?',
    escolhas: [{ texto: 'Boa pergunta.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3c: { id: 'A3c', npc: 'Adelaide Cross',
    texto: 'Eu não o matei. Juro. Escrevi a carta porque estava com raiva. Vinte anos, detetive. Vinte anos servindo essa mansão, e ele ia me deixar de fora de novo. Mas não... eu nunca faria isso.',
    escolhas: [
      { texto: 'O que você fez em 1987?',         proximoId: 'A3ca', pistaBloqueada: 'carta_anonima', xp: 20 },
      { texto: 'Posso acreditar em você?',         proximoId: 'A3cb', pistaBloqueada: null,            xp: 10 },
      { texto: 'Quem você acha que fez isso?',     proximoId: 'A3cc', pistaBloqueada: null,            xp: 15 },
    ]},
  A3ca: { id: 'A3ca', npc: 'Adelaide Cross',
    texto: 'Edmund e eu... tivemos um relacionamento. Antes do casamento dele. Ele prometeu que nunca me abandonaria. E bem, aqui estou. Vinte anos depois, ainda varrendo os mesmos corredores.',
    escolhas: [{ texto: 'Entendo.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3cb: { id: 'A3cb', npc: 'Adelaide Cross',
    texto: 'Não sei. Mas é a verdade.',
    escolhas: [{ texto: 'Obrigado.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  A3cc: { id: 'A3cc', npc: 'Adelaide Cross',
    texto: '[ Adelaide olha em silêncio para a direção do escritório. ]',
    escolhas: [{ texto: 'Entendido.', proximoId: null, pistaBloqueada: null, xp: 10 }]},

  // ── Victor Blackwood ───────────────────────────────────────────────────────
  B0: { id: 'B0', npc: 'Victor Blackwood',
    texto: 'Detetive. Espero que seja rápido. Tenho advogados para contatar e um funeral para organizar.',
    escolhas: [
      { texto: 'Onde estava às 23h de ontem?',           proximoId: 'B1', pistaBloqueada: null, xp: 15 },
      { texto: 'Soube que o testamento seria alterado?', proximoId: 'B2', pistaBloqueada: null, xp: 15 },
      { texto: 'Conhece a estufa da propriedade?',       proximoId: 'B3', pistaBloqueada: null, xp: 20 },
    ]},

  B1: { id: 'B1', npc: 'Victor Blackwood',
    texto: "No meu quarto. Lendo. Ninguém pode confirmar isso — prefiro privacidade quando estou em casa de família.",
    escolhas: [
      { texto: 'Alguém o viu circulando depois das 22h?', proximoId: 'B1a', pistaBloqueada: null, xp: 20 },
      { texto: 'Seu quarto fica no corredor leste?',       proximoId: 'B1b', pistaBloqueada: null, xp: 15 },
      { texto: 'Tem certeza?',                             proximoId: 'B1c', pistaBloqueada: null, xp: 10 },
    ]},
  B1a: { id: 'B1a', npc: 'Victor Blackwood',
    texto: 'Absolutamente não.',
    escolhas: [{ texto: 'Curioso.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B1b: { id: 'B1b', npc: 'Victor Blackwood',
    texto: 'Sim. O que tem isso?',
    escolhas: [{ texto: 'Nada. Por enquanto.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B1c: { id: 'B1c', npc: 'Victor Blackwood',
    texto: 'Tenho dito.',
    escolhas: [{ texto: 'Certo.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  B2: { id: 'B2', npc: 'Victor Blackwood',
    texto: 'Rumores de empregada. Meu tio era excêntrico mas não idiota — não jogaria fora vinte anos de família por capricho.',
    escolhas: [
      { texto: 'Tenho o testamento com anotações em sua caligrafia.', proximoId: 'B2a', pistaBloqueada: 'testamento_rasura', xp: 30 },
      { texto: 'Entendido. Por enquanto.',                            proximoId: null,  pistaBloqueada: null,                 xp:  5 },
    ]},
  B2a: { id: 'B2a', npc: 'Victor Blackwood',
    texto: 'Isso é... particular. Eu apenas anotei algumas considerações pessoais. Não é crime fazer anotações.',
    escolhas: [{ texto: 'Claro que não.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  B3: { id: 'B3', npc: 'Victor Blackwood',
    texto: 'A estufa? Claro que conheço. Passei por lá ontem à tarde. Meu tio cultivava coisas interessantes. Era um hobby antigo dele.',
    escolhas: [
      { texto: 'O que você notou na estufa?',          proximoId: 'B3a', pistaBloqueada: null,             xp: 15 },
      { texto: 'Você colheu alguma coisa?',             proximoId: 'B3b', pistaBloqueada: null,             xp: 20 },
      { texto: 'Sabe identificar plantas medicinais?',  proximoId: 'B3c', pistaBloqueada: 'planta_arsenico', xp: 30 },
    ]},
  B3a: { id: 'B3a', npc: 'Victor Blackwood',
    texto: 'Plantas. Muitas plantas. Meu tio tinha gosto para isso. Nada que eu não esperasse encontrar.',
    escolhas: [{ texto: 'Hmm.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B3b: { id: 'B3b', npc: 'Victor Blackwood',
    texto: 'Por que faria isso?',
    escolhas: [{ texto: 'Boa pergunta.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  B3c: { id: 'B3c', npc: 'Victor Blackwood',
    texto: 'Algumas. Meu tio me ensinou quando eu era criança. O Arsenicum album, por exemplo — parece inofensivo mas é extremamente concentrado. Edmund cultivava por tradição homeopática. Isso é... de conhecimento público. Qualquer livro de botânica menciona.',
    escolhas: [{ texto: '[ Silêncio. ]', proximoId: null, pistaBloqueada: null, xp: 10 }]},

  // ── Fynn O'Brien ──────────────────────────────────────────────────────────
  C0: { id: 'C0', npc: "Fynn O'Brien",
    texto: 'Era. Portas trancadas às 22h, como toda noite. Nada de anormal.',
    escolhas: [
      { texto: "Você tem uma chave extra do cofre da biblioteca?", proximoId: 'C1', pistaBloqueada: null, xp: 25 },
      { texto: 'Viu alguém circulando depois das 22h?',            proximoId: 'C2', pistaBloqueada: null, xp: 20 },
      { texto: 'Você está com medo de alguma coisa?',              proximoId: 'C3', pistaBloqueada: null, xp: 15 },
    ]},

  C1: { id: 'C1', npc: "Fynn O'Brien",
    texto: 'Eu... sim. O senhor Edmund me deu uma para emergências. Fica no meu chaveiro.',
    escolhas: [
      { texto: 'Alguém pegou essa chave emprestada?',        proximoId: 'C1a', pistaBloqueada: null, xp: 30 },
      { texto: 'Quando usou essa chave pela última vez?',     proximoId: 'C1b', pistaBloqueada: null, xp: 15 },
      { texto: 'Deixa estar.',                                proximoId: null,  pistaBloqueada: null, xp:  5 },
    ]},
  C1a: { id: 'C1a', npc: "Fynn O'Brien",
    texto: 'O Victor me pediu ontem à tarde. Disse que precisava pegar uns documentos pessoais que estavam no cofre — cartas da mãe dele, disse. Eu... deixei. Não pensei que fosse problema. Ele devolveu a chave duas horas depois. Eu não sabia que ia... eu não sabia.',
    escolhas: [{ texto: 'Obrigado por me contar.', proximoId: null, pistaBloqueada: 'chave_extra', xp: 35 }]},
  C1b: { id: 'C1b', npc: "Fynn O'Brien",
    texto: "Faz meses. Acho que faz meses.",
    escolhas: [{ texto: 'Entendido.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  C2: { id: 'C2', npc: "Fynn O'Brien",
    texto: 'O Victor. Passou pelo corredor leste umas 22h45. Disse que tinha esquecido alguma coisa no andar de baixo. Eu deveria ter dito isso antes, eu sei.',
    escolhas: [
      { texto: 'Por que não disse antes?',      proximoId: 'C2a', pistaBloqueada: null,            xp: 15 },
      { texto: 'Qual a direção que ele foi?',    proximoId: 'C2b', pistaBloqueada: 'pegadas_barro', xp: 20 },
      { texto: 'Quanto tempo ficou fora?',       proximoId: 'C2c', pistaBloqueada: null,            xp: 10 },
    ]},
  C2a: { id: 'C2a', npc: "Fynn O'Brien",
    texto: 'Porque sei como isso parece. E não quero problema com a família.',
    escolhas: [{ texto: 'Entendo.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  C2b: { id: 'C2b', npc: "Fynn O'Brien",
    texto: 'Em direção à cozinha e à biblioteca. O caminho exato.',
    escolhas: [{ texto: 'Obrigado.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  C2c: { id: 'C2c', npc: "Fynn O'Brien",
    texto: 'Não vi voltar. Fui dormir.',
    escolhas: [{ texto: 'Certo.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  C3: { id: 'C3', npc: "Fynn O'Brien",
    texto: 'Não. Por que estaria? Só... se eu soubesse que a chave ia ser usada pra isso. Se soubesse.',
    escolhas: [{ texto: 'O que quer dizer com isso?', proximoId: null, pistaBloqueada: null, xp: 15 }]},

  // ── Dr. Reginald Harlow ───────────────────────────────────────────────────
  D0: { id: 'D0', npc: 'Dr. Harlow',
    texto: 'Sim. Parada cardíaca. Edmund tinha histórico de problemas cardíacos — menos graves, mas presentes.',
    escolhas: [
      { texto: 'O senhor examinou o corpo com cuidado?',                                           proximoId: 'D1', pistaBloqueada: null, xp: 15 },
      { texto: 'Edmund te contou que estava doente?',                                              proximoId: 'D2', pistaBloqueada: null, xp: 20 },
      { texto: 'Por que assinou parada cardíaca se havia resíduo suspeito na cozinha?',            proximoId: 'D3', pistaBloqueada: null, xp: 30 },
    ]},

  D1: { id: 'D1', npc: 'Dr. Harlow',
    texto: 'Examinei com toda a diligência devida. Os sinais eram consistentes com parada cardíaca. Edmund tinha histórico documentado. Não havia razão para suspeitar de outra coisa.',
    escolhas: [{ texto: 'Havia sim.', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  D2: { id: 'D2', npc: 'Dr. Harlow',
    texto: 'Edmund tinha câncer pancreático em estágio avançado. Diagnosticado em março. Três a seis meses, no máximo. Ele me pediu para não contar a ninguém. Isso não justifica o que aconteceu com ele. Mas você precisa entender — mesmo sem isso, ele não passaria do verão.',
    escolhas: [
      { texto: 'Então o assassino matou um moribundo?', proximoId: 'D2a', pistaBloqueada: null, xp: 15 },
      { texto: 'Quem mais sabia do diagnóstico?',        proximoId: 'D2b', pistaBloqueada: null, xp: 15 },
      { texto: 'Você encobriu o crime por isso?',        proximoId: 'D3',  pistaBloqueada: null, xp: 25 },
    ]},
  D2a: { id: 'D2a', npc: 'Dr. Harlow',
    texto: 'Ironicamente, sim. E por herança que já receberia em meses de qualquer forma.',
    escolhas: [{ texto: 'A pressa foi a ruína dele.', proximoId: null, pistaBloqueada: null, xp: 5 }]},
  D2b: { id: 'D2b', npc: 'Dr. Harlow',
    texto: 'Ninguém. Só eu.',
    escolhas: [{ texto: 'Tem certeza?', proximoId: null, pistaBloqueada: null, xp: 5 }]},

  D3: { id: 'D3', npc: 'Dr. Harlow',
    texto: 'Edmund ia morrer de qualquer forma. Pensei que... que deixar isso em paz seria mais piedoso. Para ele. Para a memória dele. Eu errei. Eu sei que errei.',
    escolhas: [{ texto: 'Sim. Errou.', proximoId: null, pistaBloqueada: 'frasco_arsenico', xp: 30 }]},
};

// ─── Dados estáticos do mapa (posições conforme backend/src/seed/) ────────────

const PISTAS_MOCK: Pista[] = [
  { id: 'frasco_arsenico',   nome: 'Frasco de arsênico vazio',    descricao: 'Frasco de vidro com resíduos de arsênico.',   peso: 10, celula: { x: 2, y: 1 }, coletada: false },
  { id: 'carta_anonima',     nome: 'Carta anônima rasgada',       descricao: 'Pedaços de carta com letra disfarçada.',       peso: 8,  celula: { x: 4, y: 0 }, coletada: false },
  { id: 'testamento_rasura', nome: 'Testamento com rasura',       descricao: 'Testamento oficial com uma linha rasurada.',   peso: 9,  celula: { x: 7, y: 2 }, coletada: false },
  { id: 'copo_residuo',      nome: 'Copo com resíduo de chá',     descricao: 'Copo com sedimento suspeito no fundo.',        peso: 7,  celula: { x: 1, y: 4 }, coletada: false },
  { id: 'planta_arsenico',   nome: 'Planta de arsênico colhida',  descricao: 'Ramo fresco de planta venenosa.',              peso: 8,  celula: { x: 5, y: 3 }, coletada: false },
  { id: 'diario_edmund',     nome: 'Diário de Sir Edmund',        descricao: 'Diário pessoal com entradas suspeitas.',       peso: 6,  celula: { x: 0, y: 6 }, coletada: false },
  { id: 'foto_rasgada',      nome: 'Foto rasgada',                descricao: 'Fotografia rasgada ao meio.',                  peso: 5,  celula: { x: 3, y: 7 }, coletada: false },
  { id: 'pegadas_barro',     nome: 'Pegadas no barro',            descricao: 'Marcas de botas grandes na estufa.',           peso: 7,  celula: { x: 8, y: 5 }, coletada: false },
  { id: 'chave_extra',       nome: 'Chave extra do cofre',        descricao: 'Cópia não autorizada da chave do cofre.',      peso: 9,  celula: { x: 6, y: 8 }, coletada: false },
  { id: 'bilhete_trem',      nome: 'Bilhete de trem cancelado',   descricao: 'Bilhete com data da noite do crime.',          peso: 6,  celula: { x: 9, y: 1 }, coletada: false },
];

const NPCS_MOCK: NPC[] = [
  { id: 'adelaide', nome: 'Adelaide Cross',   celula: { x: 3, y: 4 }, dialogoInicial: 'A0' },
  { id: 'victor',   nome: 'Victor Blackwood', celula: { x: 7, y: 6 }, dialogoInicial: 'B0' },
  { id: 'fynn',     nome: "Fynn O'Brien",     celula: { x: 1, y: 9 }, dialogoInicial: 'C0' },
  { id: 'harlow',   nome: 'Dr. Harlow',       celula: { x: 9, y: 4 }, dialogoInicial: 'D0' },
];

// ─── Helpers para rastreamento de subárvores de diálogo ──────────────────────

function isNodeFullyExplored(
  nodeId: string | null,
  npcVisited: Record<string, number[]>,
  dialogs: Record<string, NoDialogo>
): boolean {
  if (!nodeId) return true;
  const node = dialogs[nodeId];
  if (!node) return true;
  const taken = npcVisited[nodeId] ?? [];
  for (let i = 0; i < node.escolhas.length; i++) {
    if (!taken.includes(i)) return false;
    if (!isNodeFullyExplored(node.escolhas[i].proximoId, npcVisited, dialogs)) return false;
  }
  return true;
}

function prepareNodeChoices(
  node: NoDialogo,
  npcVisited: Record<string, number[]>,
  dialogs: Record<string, NoDialogo>
): NoDialogo {
  return {
    ...node,
    escolhas: node.escolhas.map((e, i) => {
      const taken     = (npcVisited[node.id] ?? []).includes(i);
      const exhausted = taken && isNodeFullyExplored(e.proximoId, npcVisited, dialogs);
      return { ...e, visitado: taken, usado: exhausted };
    }),
  };
}

function computeExhaustedRootChoices(
  rootNodeId: string,
  npcVisited: Record<string, number[]>,
  dialogs: Record<string, NoDialogo>
): number[] {
  const root = dialogs[rootNodeId];
  if (!root) return [];
  const rootTaken = npcVisited[rootNodeId] ?? [];
  return root.escolhas
    .map((_, i) => i)
    .filter(i => rootTaken.includes(i) && isNodeFullyExplored(root.escolhas[i].proximoId, npcVisited, dialogs));
}

// ─── Store ────────────────────────────────────────────────────────────────────

const POS_INICIAL      = { x: 0, y: 0 };
const CELULAS_INICIAIS = new Set(bfsReveal(POS_INICIAL).map(c => `${c.x},${c.y}`));

export const useGameStore = create<GameState>((set, get) => ({
  partidaId:           null,
  posicao:             POS_INICIAL,
  celulasReveladas:    CELULAS_INICIAIS,
  pistas:              PISTAS_MOCK,
  npcs:                NPCS_MOCK,
  pistasColetadas:     [],
  xp:                  0,
  dialogoAtivo:        false,
  noDialogoAtual:      null,
  noAtualData:         null,
  npcAtual:            null,
  statusJogo:          'titulo',
  notificacoes:        [],
  rotaTSP:             [],
  mostrandoRota:       false,
  npcVisitedChoices:   {},
  escolhasRaizUsadas:  {},
  npcsInterrogados:    new Set(),

  setStatusJogo: (status) => {
    set({ statusJogo: status });
    if (status === 'jogando') {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.partidaId) set({ partidaId: data.partidaId });
        })
        .catch(() => { /* sem backend — estado local apenas */ });
    }
  },

  mover: (dx, dy) => {
    const state = get();
    if (state.dialogoAtivo) return;

    const nx = Math.max(0, Math.min(9, state.posicao.x + dx));
    const ny = Math.max(0, Math.min(9, state.posicao.y + dy));
    if (nx === state.posicao.x && ny === state.posicao.y) return;

    const novasCelulas = new Set(state.celulasReveladas);
    bfsReveal({ x: nx, y: ny }, 3).forEach(c => novasCelulas.add(`${c.x},${c.y}`));
    set({ posicao: { x: nx, y: ny }, celulasReveladas: novasCelulas });

    if (!state.partidaId) return;

    const DIRS: Record<string, string> = { '0,-1': 'N', '0,1': 'S', '1,0': 'L', '-1,0': 'O' };
    const direcao = DIRS[`${dx},${dy}`];
    if (!direcao) return;

    fetch(`${API}/${state.partidaId}/mover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direcao }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        set(s => {
          const celulas = new Set(s.celulasReveladas);
          (data.visao as { x: number; y: number }[]).forEach(c => celulas.add(`${c.x},${c.y}`));
          return { posicao: data.posicao, celulasReveladas: celulas };
        });
      })
      .catch(() => { /* mantém posição otimista */ });
  },

  coletarPista: (pistaId) => {
    const state = get();
    const pista = state.pistas.find(p => p.id === pistaId && !p.coletada);
    if (!pista) return;

    const notifId = `notif-${Date.now()}`;
    set(s => ({
      pistas:          s.pistas.map(p => p.id === pistaId ? { ...p, coletada: true } : p),
      pistasColetadas: [...s.pistasColetadas, { ...pista, coletada: true }],
      xp:              s.xp + pista.peso * 10,
      notificacoes:    [...s.notificacoes, { id: notifId, nome: pista.nome, peso: pista.peso }],
    }));

    if (!state.partidaId) return;

    fetch(`${API}/${state.partidaId}/coletar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pistaId }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.xpTotal !== undefined) set({ xp: data.xpTotal });
        if (get().mostrandoRota) get().carregarRota();
      })
      .catch(() => { /* mantém XP otimista */ });
  },

  iniciarDialogo: (npcId) => {
    const { partidaId, npcs, escolhasRaizUsadas } = get();
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    // Modo offline
    if (!partidaId) {
      const raw = DIALOGOS_LOCAL[npc.dialogoInicial] ?? null;
      if (!raw) return;
      const npcVisited = get().npcVisitedChoices[npcId] ?? {};
      const noMarcado  = prepareNodeChoices(raw, npcVisited, DIALOGOS_LOCAL);
      if (noMarcado.escolhas.every(e => e.usado)) return;
      set(s => ({
        dialogoAtivo: true, npcAtual: npcId, noDialogoAtual: noMarcado.id, noAtualData: noMarcado,
        npcsInterrogados: new Set(s.npcsInterrogados).add(npcId),
      }));
      return;
    }

    // Modo online — RESET antes do fetch evita mostrar nó do NPC anterior
    set(s => ({
      dialogoAtivo: true, npcAtual: npcId, noDialogoAtual: npc.dialogoInicial, noAtualData: null,
      npcsInterrogados: new Set(s.npcsInterrogados).add(npcId),
    }));

    const usadas = escolhasRaizUsadas[npcId] ?? [];
    const prepararNoOnline = (no: NoDialogo): NoDialogo | null => {
      const noMarcado: NoDialogo = {
        ...no,
        escolhas: no.escolhas.map((e, i) => ({ ...e, usado: usadas.includes(i) })),
      };
      return noMarcado.escolhas.every(e => e.usado) ? null : noMarcado;
    };

    fetch(`${API}/${partidaId}/interagir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ celula: npc.celula }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.no) {
          const no = prepararNoOnline(data.no as NoDialogo);
          if (!no) {
            set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
            return;
          }
          set({ noAtualData: no, noDialogoAtual: no.id });
        } else {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
        }
      })
      .catch(() => {
        // fallback local se backend falhar — evita trava em loading
        const raw = DIALOGOS_LOCAL[npc.dialogoInicial] ?? null;
        if (!raw) {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
          return;
        }
        const npcVisited = get().npcVisitedChoices[npcId] ?? {};
        const no = prepareNodeChoices(raw, npcVisited, DIALOGOS_LOCAL);
        if (no.escolhas.every(e => e.usado)) {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
          return;
        }
        set({ noAtualData: no, noDialogoAtual: no.id });
      });
  },

  fecharDialogo: () => set({
    dialogoAtivo:   false,
    noDialogoAtual: null,
    npcAtual:       null,
    noAtualData:    null,
  }),

  avancarDialogo: (noAtualId, index) => {
    const { partidaId } = get();

    if (!partidaId) {
      const { npcAtual, npcs, npcVisitedChoices } = get();
      const no = DIALOGOS_LOCAL[noAtualId];
      if (!no) return;
      const escolha = no.escolhas[index];
      if (!escolha || escolha.usado) return;

      const prevVisited    = npcVisitedChoices[npcAtual ?? ''] ?? {};
      const prevTaken      = prevVisited[noAtualId] ?? [];
      const newTaken       = prevTaken.includes(index) ? prevTaken : [...prevTaken, index];
      const newNodeVisited = { ...prevVisited, [noAtualId]: newTaken };
      const newNpcVisited  = { ...npcVisitedChoices, [npcAtual ?? '']: newNodeVisited };

      const thisNpc = npcs.find(n => n.id === npcAtual);
      const exhaustedRoots = thisNpc
        ? computeExhaustedRootChoices(thisNpc.dialogoInicial, newNodeVisited, DIALOGOS_LOCAL)
        : [];

      set(s => ({
        npcVisitedChoices:  newNpcVisited,
        escolhasRaizUsadas: { ...s.escolhasRaizUsadas, ...(npcAtual ? { [npcAtual]: exhaustedRoots } : {}) },
      }));

      if (escolha.pistaBloqueada) get().coletarPista(escolha.pistaBloqueada);

      if (escolha.proximoId) {
        const rawProximo = DIALOGOS_LOCAL[escolha.proximoId] ?? null;
        const proximo = rawProximo ? prepareNodeChoices(rawProximo, newNodeVisited, DIALOGOS_LOCAL) : null;
        set(s => ({ xp: s.xp + escolha.xp, noDialogoAtual: escolha.proximoId, noAtualData: proximo }));
      } else {
        set(s => ({
          xp:             s.xp + escolha.xp,
          dialogoAtivo:   false,
          noDialogoAtual: null,
          npcAtual:       null,
          noAtualData:    null,
        }));
      }
      return;
    }

    // Modo online: registra escolha raiz otimisticamente
    const npcAtualOnline = get().npcAtual;
    const npcOnline = npcAtualOnline ? get().npcs.find(n => n.id === npcAtualOnline) : null;
    if (npcOnline && noAtualId === npcOnline.dialogoInicial) {
      set(s => ({
        escolhasRaizUsadas: {
          ...s.escolhasRaizUsadas,
          [npcAtualOnline!]: [...(s.escolhasRaizUsadas[npcAtualOnline!] ?? []), index],
        },
      }));
    }

    fetch(`${API}/${partidaId}/escolha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noAtualId, index }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const { proximoNo, pistaBloqueada, xpTotal } = data;
        if (xpTotal !== undefined) set({ xp: xpTotal });
        if (pistaBloqueada) get().coletarPista(pistaBloqueada as string);
        if (proximoNo) {
          const no = proximoNo as NoDialogo;
          set({ noDialogoAtual: no.id, noAtualData: no });
        } else {
          set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null });
        }
      })
      .catch(() => set({ dialogoAtivo: false, noDialogoAtual: null, npcAtual: null, noAtualData: null }));
  },

  removerNotificacao: (id) => set(state => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id),
  })),

  carregarRota: () => {
    const { partidaId, pistas, posicao } = get();

    if (!partidaId) {
      const pendentes = pistas.filter(p => !p.coletada);
      const rota: RotaTSPItem[] = [];
      const restantes = pendentes.map(p => ({ id: p.id, x: p.celula.x, y: p.celula.y }));
      let atual = posicao;
      while (restantes.length > 0) {
        let idx = 0, minD = Infinity;
        restantes.forEach((r, i) => {
          const d = Math.abs(r.x - atual.x) + Math.abs(r.y - atual.y);
          if (d < minD) { minD = d; idx = i; }
        });
        const proximo = restantes.splice(idx, 1)[0];
        rota.push(proximo);
        atual = proximo;
      }
      set({ rotaTSP: rota, mostrandoRota: true });
      return;
    }

    fetch(`${API}/${partidaId}/rota`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data?.rota)) {
          set({ rotaTSP: data.rota as RotaTSPItem[], mostrandoRota: true });
        }
      })
      .catch(() => { /* silencioso */ });
  },

  toggleRota: () => {
    const { mostrandoRota } = get();
    if (mostrandoRota) {
      set({ mostrandoRota: false });
    } else {
      get().carregarRota();
    }
  },
}));