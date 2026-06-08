const dialogos = [
  // ══ ADELAIDE CROSS — Biblioteca (1,1) ══
  {
    id: 'A0',
    npc: 'Adelaide Cross',
    texto: 'Eu sabia que alguém viria. Sabia desde o momento em que encontrei ele.',
    escolhas: [
      { texto: 'Onde estava na hora da morte?', proximoId: 'A1', pistaBloqueada: null, xp: 10 },
      { texto: 'O senhor tinha inimigos?',       proximoId: 'A2', pistaBloqueada: null, xp: 10 },
      { texto: 'Vi um frasco estranho aqui.',    proximoId: 'A3', pistaBloqueada: null, xp: 15 }
    ]
  },
  {
    id: 'A1',
    npc: 'Adelaide Cross',
    texto: 'O chá foi entregue por volta das 22h30. Eu mesma subi. Ele estava escrevendo na escrivaninha.',
    escolhas: [
      { texto: 'Mais alguém entrou na cozinha?', proximoId: 'A1a', pistaBloqueada: null, xp: 20 },
      { texto: 'O chá tinha algo diferente?',    proximoId: 'A1b', pistaBloqueada: null, xp: 10 },
      { texto: 'Obrigado, isso é tudo.',         proximoId: null,  pistaBloqueada: null, xp: 5  }
    ]
  },
  {
    id: 'A1a',
    npc: 'Adelaide Cross',
    texto: 'O Victor passou por lá. Queria um copo d\'água.',
    escolhas: [
      { texto: 'Anotar informação.', proximoId: null, pistaBloqueada: 'presenca_victor', xp: 20 }
    ]
  },
  {
    id: 'A1b',
    npc: 'Adelaide Cross',
    texto: 'Não que eu tenha notado. Mas eu não provei.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'A2',
    npc: 'Adelaide Cross',
    texto: 'Inimigos... ou pessoas que ele decepcionou. É diferente.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'A3',
    npc: 'Adelaide Cross',
    texto: 'Meu Deus. Eu vi esse frasco no cofre semana passada.',
    escolhas: [
      { texto: 'Quem mais sabia da combinação?', proximoId: 'A3a', pistaBloqueada: 'chave_extra',      xp: 25 },
      { texto: 'Por que guardava arsênico?',     proximoId: 'A3b', pistaBloqueada: null,              xp: 20 },
      { texto: 'Você escreveu uma carta?',       proximoId: 'A3c', pistaBloqueada: null,              xp: 30 }
    ]
  },
  {
    id: 'A3a',
    npc: 'Adelaide Cross',
    texto: 'Só ele, eu e o guarda Fynn. O cofre ficava na biblioteca.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'A3b',
    npc: 'Adelaide Cross',
    texto: 'Ele dizia que era para ratos. Mas nunca havia ratos aqui.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'A3c',
    npc: 'Adelaide Cross',
    texto: 'Como sabe disso? Eu... escrevi sim. Mas foi só um desabafo.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: 'carta_anonima', xp: 30 }
    ]
  },

  // ══ VICTOR BLACKWOOD — Escritório (0,1) ══
  {
    id: 'B0',
    npc: 'Victor Blackwood',
    texto: 'Detetive. Espero que isso seja rápido.',
    escolhas: [
      { texto: 'Onde estava às 23h?',          proximoId: 'B1', pistaBloqueada: null,             xp: 15 },
      { texto: 'O testamento seria alterado?', proximoId: 'B2', pistaBloqueada: null,             xp: 15 },
      { texto: 'Conhece a estufa?',            proximoId: 'B3', pistaBloqueada: 'victor_estufa',  xp: 20 }
    ]
  },
  {
    id: 'B1',
    npc: 'Victor Blackwood',
    texto: 'Estava no meu quarto. Sozinho. Não preciso provar nada.',
    escolhas: [
      { texto: 'Alguém pode confirmar?',      proximoId: 'B1a', pistaBloqueada: null,               xp: 20 },
      { texto: 'Vi você no corredor.',        proximoId: 'B1b', pistaBloqueada: 'victor_corredor',  xp: 25 },
      { texto: 'Encerrar conversa.',          proximoId: null,  pistaBloqueada: null,               xp: 5  }
    ]
  },
  {
    id: 'B1a',
    npc: 'Victor Blackwood',
    texto: 'Não. E isso não significa nada.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'B1b',
    npc: 'Victor Blackwood',
    texto: 'Eu... fui buscar água. Isso é crime agora?',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'B2',
    npc: 'Victor Blackwood',
    texto: 'Que pergunta ridícula. O testamento era justo.',
    escolhas: [
      { texto: 'Há rasuras no documento.',  proximoId: 'B2a', pistaBloqueada: 'testamento_rasura', xp: 30 },
      { texto: 'Encerrar conversa.',        proximoId: null,  pistaBloqueada: null,                xp: 5  }
    ]
  },
  {
    id: 'B2a',
    npc: 'Victor Blackwood',
    texto: 'Isso é mentira. Vocês estão plantando evidências.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'B3',
    npc: 'Victor Blackwood',
    texto: 'A estufa? Passei por lá ontem de manhã. Nada demais.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: 'planta_arsenico', xp: 20 }
    ]
  },

  // ══ FYNN O'BRIEN — Quarto do Guarda (0,2) ══
  {
    id: 'C0',
    npc: 'Fynn O\'Brien',
    texto: 'Estava de plantão. Nada de anormal.',
    escolhas: [
      { texto: 'Quem tinha chave extra do cofre?', proximoId: 'C1', pistaBloqueada: 'chave_extra',     xp: 25 },
      { texto: 'Viu alguém circular?',             proximoId: 'C2', pistaBloqueada: 'victor_corredor', xp: 20 },
      { texto: 'Está com medo de alguma coisa?',   proximoId: 'C3', pistaBloqueada: null,              xp: 15 }
    ]
  },
  {
    id: 'C1',
    npc: 'Fynn O\'Brien',
    texto: 'Só o Lorde e eu tínhamos cópia. Mas eu nunca abri sem autorização.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'C2',
    npc: 'Fynn O\'Brien',
    texto: 'O Victor passou pelo corredor por volta das 23h. Achei estranho.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },
  {
    id: 'C3',
    npc: 'Fynn O\'Brien',
    texto: 'Não. Só quero que isso acabe logo.',
    escolhas: [
      { texto: 'Encerrar conversa.', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  }
];

module.exports = dialogos;