// TODO Dev 2 — Sprint 1
// Seed: árvore de diálogos completa do caso Blackwood
//
// Popular com TODOS os nós documentados no detective_manual_blackwood.docx:
//   Biblioteca (Adelaide): A0, A1, A1a, A1b, A2, A3, A3c ...
//   Escritório (Victor):   B0, B1, B2, B2-confronto, B3 ...
//   Quarto do Guarda (Fynn): C0 ...
//   Sala de Estar, Cozinha, Estufa, etc.
//
// Formato de cada nó:
// {
//   id: 'A0',
//   npc: 'Adelaide Cross',
//   texto: '...',
//   escolhas: [
//     { texto: '...', proximoId: 'A1', pistaBloqueada: null, xp: 10 },
//     { texto: '...', proximoId: 'A2', pistaBloqueada: 'pista_carta', xp: 15 },
//   ]
// }

const dialogos = [
  // ==================== BIBLIOTECA (1,1) - ADELAIDE CROSS ====================
  {
    id: 'A0',
    npc: 'Adelaide Cross',
    texto: 'Senhora Cross... posso fazer algumas perguntas sobre ontem a noite?\n\nAdelaide para de varrer. Vira lentamente.\n"Eu sabia que alguem viria. Sabia desde o momento em que encontrei ele."',
    escolhas: [
      { texto: '"Onde estava na hora da morte?"', proximoId: 'A1', pistaBloqueada: null, xp: 10 },
      { texto: '"O senhor tinha inimigos?"', proximoId: 'A2', pistaBloqueada: null, xp: 10 },
      { texto: '"Vi um frasco estranho aqui. O que era?"', proximoId: 'A3', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'A1',
    npc: 'Adelaide Cross',
    texto: '"O cha foi entregue para o senhor por volta das 22h30. Eu mesma subi. Ele estava escrevendo na escrivaninha."',
    escolhas: [
      { texto: '"Mais alguem entrou na cozinha?"', proximoId: 'A1a', pistaBloqueada: null, xp: 20 },
      { texto: '"O cha tinha alguma coisa diferente?"', proximoId: 'A1b', pistaBloqueada: null, xp: 10 },
      { texto: '"Obrigado, isso e tudo por ora."', proximoId: null, pistaBloqueada: null, xp: 5 }
    ]
  },

  {
    id: 'A1a',
    npc: 'Adelaide Cross',
    texto: '"O Victor passou por la. Disse que queria um copo d\'agua."',
    escolhas: [
      { texto: 'Anotar informacao.', proximoId: null, pistaBloqueada: null, xp: 20 }
    ],
    pistaRevelada: 'presenca_victor',
    pesoPista: 7
  },

  {
    id: 'A1b',
    npc: 'Adelaide Cross',
    texto: '"Nao que eu tenha notado. Mas eu nao provei."',
    escolhas: [
      { texto: 'Agradecer e sair.', proximoId: null, pistaBloqueada: null, xp: 10 }
    ]
  },

  {
    id: 'A2',
    npc: 'Adelaide Cross',
    texto: 'Suspira fundo. "Inimigos... ou pessoas que ele decepcionou. E diferente."',
    escolhas: [
      { texto: '"Pode me dar um exemplo?"', proximoId: 'A2a', pistaBloqueada: null, xp: 15 },
      { texto: '"Quem mais teria motivos?"', proximoId: 'A2b', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'A2a',
    npc: 'Adelaide Cross',
    texto: '"O sobrinho Victor sempre quis controle da fortuna. Lorde Blackwood ameacou deserda-lo."',
    escolhas: [
      { texto: 'Entender...', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'motivo_victor',
    pesoPista: 8
  },

  {
    id: 'A2b',
    npc: 'Adelaide Cross',
    texto: '"O guarda Fynn foi humilhado publicamente semana passada. Lorde Blackwood o chamou de incompetente."',
    escolhas: [
      { texto: 'Interessante...', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'humilhacao_fynn',
    pesoPista: 7
  },

  {
    id: 'A3',
    npc: 'Adelaide Cross',
    texto: 'Os olhos dela arregalaram. "Que frasco? Eu... nao sei do que fala."',
    escolhas: [
      {
        texto: '"Adelaide... encontrei um frasco de arsenico vazio na biblioteca. Voce o viu antes?"',
        proximoId: 'A3a',
        pistaBloqueada: 'frasco_arsenico',
        xp: 25
      }
    ]
  },

  {
    id: 'A3a',
    npc: 'Adelaide Cross',
    texto: 'Ela deixa cair a vassoura.\n\n"Meu Deus. Eu vi esse frasco no cofre semana passada. O senhor me pediu para nao contar a ninguem."',
    escolhas: [
      {
        texto: '"Quem mais sabia da combinacao do cofre?"',
        proximoId: 'A3a_opcaoA',
        pistaBloqueada: null,
        xp: 25
      },
      {
        texto: '"Por que ele guardava arsenico?"',
        proximoId: 'A3a_opcaoB',
        pistaBloqueada: null,
        xp: 20
      },
      {
        texto: '"Voce escreveu uma carta anonima para ele?"',
        proximoId: 'A3c',
        pistaBloqueada: 'carta_anonima_adelaide',
        xp: 30
      }
    ]
  },

  {
    id: 'A3a_opcaoA',
    npc: 'Adelaide Cross',
    texto: '"Sir Edmund, o Victor... e o Fynn. O guarda."',
    escolhas: [
      { texto: 'Anotar', proximoId: null, pistaBloqueada: null, xp: 25 }
    ],
    pistaRevelada: 'lista_acesso_cofre',
    pesoPista: 9
  },

  {
    id: 'A3a_opcaoB',
    npc: 'Adelaide Cross',
    texto: '"Disse que era para os ratos. Mas nao havia ratos aqui ha anos."',
    escolhas: [
      { texto: 'Suspeito...', proximoId: null, pistaBloqueada: null, xp: 20 }
    ],
    pistaRevelada: 'arsenico_cofre',
    pesoPista: 8
  },

  {
    id: 'A3c',
    npc: 'Adelaide Cross',
    texto: 'Ela cora violentamente. Silencio longo.\n\n"Como sabe disso?"',
    escolhas: [
      {
        texto: '"A carta foi encontrada. Quer explicar?"',
        proximoId: 'A3d',
        pistaBloqueada: null,
        xp: 30,
        requerPista: 'carta_anonima'
      }
    ]
  },

  {
    id: 'A3d',
    npc: 'Adelaide Cross',
    texto: 'Adelaide desaba em lagrimas.\n\n"Eu... eu o amava. Mas ele nunca me correspondeu. A carta foi um desabafo, nada mais. Por favor, nao conte a ninguem!"',
    escolhas: [
      { texto: 'Aceitar sua versao', proximoId: null, pistaBloqueada: null, xp: 30 }
    ],
    pistaRevelada: 'carta_anonima_adelaide',
    pesoPista: 10
  },

  // ==================== ESCRITORIO (0,1) - VICTOR BLACKWOOD ====================
  {
    id: 'B0',
    npc: 'Victor Blackwood',
    texto: 'Victor Blackwood. Agradeco sua disponibilidade.\n\n"Detetive. Espero que isso seja rapido. Tenho advogados para contatar."',
    escolhas: [
      { texto: '"Onde estava as 23h?"', proximoId: 'B1', pistaBloqueada: null, xp: 15 },
      { texto: '"Soube que o testamento seria alterado?"', proximoId: 'B2', pistaBloqueada: null, xp: 15 },
      { texto: '"Conhece a estufa da propriedade?"', proximoId: 'B3', pistaBloqueada: null, xp: 20 }
    ]
  },

  {
    id: 'B1',
    npc: 'Victor Blackwood',
    texto: '"No meu quarto. Lendo. Ninguem pode confirmar isso."',
    escolhas: [
      { texto: '"Que livro estava lendo?"', proximoId: 'B1a', pistaBloqueada: null, xp: 15 },
      { texto: '"Nao parece muito convincente..."', proximoId: 'B1b', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'B1a',
    npc: 'Victor Blackwood',
    texto: 'Ele hesita. "Um livro de contabilidade. Negocios da familia."',
    escolhas: [
      { texto: 'Anotar alibi fraco', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'alibi_victor',
    pesoPista: 5
  },

  {
    id: 'B1b',
    npc: 'Victor Blackwood',
    texto: 'Ele se irrita. "Estou sendo acusado? Detetive, isso e um absurdo!"',
    escolhas: [
      { texto: 'Acalmar a situacao', proximoId: null, pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'B2',
    npc: 'Victor Blackwood',
    texto: 'Pausa longa. "Rumores de empregada. Nao levo a serio."',
    escolhas: [
      {
        texto: '"Tenho aqui o testamento com sua caligrafia nas margens, Victor. Quer reconsiderar?"',
        proximoId: 'B2_confronto',
        pistaBloqueada: null,
        xp: 35,
        requerPista: 'testamento_rasura'
      },
      {
        texto: '"Posso dar uma olhada nos documentos do seu tio?"',
        proximoId: 'B2a',
        pistaBloqueada: null,
        xp: 20
      }
    ]
  },

  {
    id: 'B2_confronto',
    npc: 'Victor Blackwood',
    texto: 'Victor se levanta abruptamente.\n\n"Isso e... particular. Eu apenas anotei algumas... consideracoes. Nao e crime."',
    escolhas: [
      { texto: '"Por que anotaria mudancas no testamento?"', proximoId: null, pistaBloqueada: null, xp: 35 }
    ],
    pistaRevelada: 'rasura_victor',
    pesoPista: 10
  },

  {
    id: 'B2a',
    npc: 'Victor Blackwood',
    texto: '"Nao vejo problema. Mas vai precisar de autorizacao judicial."',
    escolhas: [
      { texto: 'Agradecer e sair', proximoId: null, pistaBloqueada: null, xp: 20 }
    ]
  },

  {
    id: 'B3',
    npc: 'Victor Blackwood',
    texto: '"A estufa? Claro. Passeei por la ontem a tarde."',
    escolhas: [
      { texto: '"Viu algo estranho?"', proximoId: 'B3a', pistaBloqueada: null, xp: 20 }
    ]
  },

  {
    id: 'B3a',
    npc: 'Victor Blackwood',
    texto: '"Nada. Apenas o jardineiro trabalhando. Por que tanta curiosidade sobre a estufa?"',
    escolhas: [
      { texto: 'Apenas investigacao de rotina.', proximoId: null, pistaBloqueada: null, xp: 20 }
    ],
    pistaRevelada: 'victor_estufa',
    pesoPista: 8
  },

  // ==================== QUARTO DO GUARDA (0,2) - FYNN O'BRIEN ====================
  {
    id: 'C0',
    npc: 'Fynn O\'Brien',
    texto: 'Fynn. Voce era o seguranca. Devia estar de plantao ontem a noite.\n\n"Estava. Nada de anormal. Portas trancadas as 22h, como todo dia."',
    escolhas: [
      { texto: '"Quem tinha chave extra do cofre?"', proximoId: 'C1', pistaBloqueada: null, xp: 25 },
      { texto: '"Viu alguem circular a noite?"', proximoId: 'C2', pistaBloqueada: null, xp: 20 },
      { texto: '"Voce esta com medo de alguma coisa?"', proximoId: 'C3', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'C1',
    npc: 'Fynn O\'Brien',
    texto: 'Hesita. "Eu tinha uma. O senhor me deu para emergencias. Mas juro que nao abri."',
    escolhas: [
      { texto: '"Onde esta a chave agora?"', proximoId: 'C1a', pistaBloqueada: null, xp: 25 }
    ]
  },

  {
    id: 'C1a',
    npc: 'Fynn O\'Brien',
    texto: '"Esta... no meu cofre pessoal. Mas posso provar que nao a usei."',
    escolhas: [
      { texto: '"Como pode provar?"', proximoId: 'C1b', pistaBloqueada: null, xp: 25 }
    ],
    pistaRevelada: 'chave_extra_cofre',
    pesoPista: 9
  },

  {
    id: 'C1b',
    npc: 'Fynn O\'Brien',
    texto: '"Porque a chave estava no meu cofre a noite toda. E tenho cameras de seguranca no meu quarto."',
    escolhas: [
      { texto: 'Conferir as imagens depois', proximoId: null, pistaBloqueada: null, xp: 25 }
    ],
    pistaRevelada: 'cameras_fynn',
    pesoPista: 7
  },

  {
    id: 'C2',
    npc: 'Fynn O\'Brien',
    texto: '"O Victor passou pelo corredor umas 22h45. Disse que esqueceu algo."',
    escolhas: [
      { texto: '"Onde ele estava indo?"', proximoId: 'C2a', pistaBloqueada: null, xp: 20 }
    ]
  },

  {
    id: 'C2a',
    npc: 'Fynn O\'Brien',
    texto: '"Para os fundos, direcao da biblioteca. Nao achei estranho na hora."',
    escolhas: [
      { texto: 'Importante informacao.', proximoId: null, pistaBloqueada: null, xp: 20 }
    ],
    pistaRevelada: 'victor_corredor',
    pesoPista: 8
  },

  {
    id: 'C3',
    npc: 'Fynn O\'Brien',
    texto: 'Ele para de polir. "Nao. Por que estaria?" — muito rapido.',
    escolhas: [
      { texto: '"Achei sua resposta um pouco defensiva..."', proximoId: 'C3a', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'C3a',
    npc: 'Fynn O\'Brien',
    texto: '"Olha, detetive... eu so faco meu trabalho. Se o senhor quer respostas, procure quem tinha motivo."',
    escolhas: [
      { texto: '"E quem teria motivo?"', proximoId: 'C3b', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'C3b',
    npc: 'Fynn O\'Brien',
    texto: '"Victor. Sempre Victor. Ele queria o controle de tudo. Agora conseguiu."',
    escolhas: [
      { texto: 'Anotar suspeita', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'suspeita_fynn',
    pesoPista: 6
  },

  // ==================== COZINHA (3,0) - INVESTIGACAO AMBIENTAL ====================
  {
    id: 'COZINHA',
    npc: null,
    texto: 'O cheiro de cha ainda paira no ar. Um unico copo foi separado. Dentro — um residuo escuro no fundo.',
    escolhas: [
      { texto: 'Coletar o copo como evidencia', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'copo_residuo',
    pesoPista: 7
  },

  // ==================== ESTUFA (3,1) - INVESTIGACAO AMBIENTAL ====================
  {
    id: 'ESTUFA_A',
    npc: null,
    texto: 'Plantas de todos os tipos. Mas uma secao chama atencao: um canteiro com folhas cinza-esverdeadas, parcialmente colhidas.\n\nUma placa desbotada: "Arsenicum album". Voce reconhece — e uma planta medicinal homeopatica, mas em concentracao alta... letal.',
    escolhas: [
      { texto: 'Examinar o canteiro', proximoId: 'ESTUFA_B', pistaBloqueada: null, xp: 20 },
      { texto: 'Procurar ferramentas', proximoId: 'ESTUFA_C', pistaBloqueada: null, xp: 15 }
    ]
  },

  {
    id: 'ESTUFA_B',
    npc: null,
    texto: 'Folhas colhidas recentemente. A terra ainda esta revirada.',
    escolhas: [
      { texto: 'Anotar evidencia', proximoId: null, pistaBloqueada: null, xp: 20 }
    ],
    pistaRelevada: 'planta_arsenico',
    pesoPista: 8
  },

  {
    id: 'ESTUFA_C',
    npc: null,
    texto: 'Uma tesoura de jardinagem com residuo orgânico. Recem-usada.',
    escolhas: [
      { texto: 'Coletar a tesoura', proximoId: null, pistaBloqueada: null, xp: 15 }
    ],
    pistaRevelada: 'tesoura_usada',
    pesoPista: 6
  }
];

module.exports = dialogos;