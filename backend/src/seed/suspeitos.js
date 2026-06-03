// TODO Dev 2 — Sprint 1
// Seed: suspeitos do caso Blackwood
//
// Victor Blackwood — É o assassino
// Adelaide Cross   — Não matou; escreveu carta anônima
// Dr. Harlow       — Sabia do veneno; ficou calado por lealdade

const suspeitos = [
  {
    id: 'victor_blackwood',
    nome: 'Victor Blackwood',
    relacao: 'Sobrinho da vítima',
    motivo: 'Desejava o controle da fortuna da família. Seria deserdado por Lorde Blackwood.',
    segredo: 'Estava com dívidas de jogo e precisava da herança desesperadamente. Alterou o testamento do tio.',
    ehAssassino: true,
    nivelSuspeita: 0,
    interrogado: false,
    depoimento: null,
    pistasIncriminadoras: [
      'presenca_victor',
      'motivo_victor',
      'testamento_rasura',
      'rasura_victor',
      'victor_estufa',
      'victor_corredor',
      'bilhete_trem'
    ],
    pistasInocentadoras: [],
    localizacao: { x: 0, y: 1 },
    fraseAcusacao: 'Victor Blackwood, em nome da lei, você está sendo acusado do assassinato de Lorde Blackwood.',
    fraseConfissao: 'Você me pegou, detetive. Sim, fui eu. Mas ele merecia! Ia me deserdar depois de tudo que fiz por ele. O veneno foi rápido... mais do que ele merecia.',
    fraseInocencia: 'O quê? Isso é um absurdo! Eu nunca faria isso com meu tio. Vocês estão plantando evidências!'
  },
  {
    id: 'adelaide_cross',
    nome: 'Adelaide Cross',
    relacao: 'Governanta da mansão',
    motivo: 'Amor não correspondido por Lorde Blackwood. Ele a rejeitava constantemente e a tratava como invisível.',
    segredo: 'Escrevia cartas anônimas apaixonadas para Lorde Blackwood, mas ele as rasgava sem ler.',
    ehAssassino: false,
    nivelSuspeita: 0,
    interrogado: false,
    depoimento: null,
    pistasIncriminadoras: [
      'carta_anonima',
      'carta_anonima_adelaide',
      'frasco_arsenico'
    ],
    pistasInocentadoras: [
      'alibi_adelaide'
    ],
    localizacao: { x: 1, y: 1 },
    fraseAcusacao: 'Adelaide Cross, você está sendo acusada do assassinato de Lorde Blackwood.',
    fraseConfissao: null,
    fraseInocencia: 'Detetive, eu amava aquele homem. Por mais que ele me ignorasse, eu nunca faria mal a ele. A carta foi apenas um desabafo de uma mulher solitária...'
  },
  {
    id: 'dr_harlow',
    nome: 'Dr. Harlow',
    relacao: 'Médico pessoal da família Blackwood',
    motivo: 'Sabia do veneno e de quem o comprou, mas ficou calado por lealdade à família.',
    segredo: 'Falsificava receitas médicas para Lorde Blackwood, incluindo a receita do arsênico.',
    ehAssassino: false,
    nivelSuspeita: 0,
    interrogado: false,
    depoimento: null,
    pistasIncriminadoras: [
      'arsenico_cofre',
      'planta_arsenico'
    ],
    pistasInocentadoras: [
      'relatorio_toxicologico'
    ],
    localizacao: { x: 2, y: 2 },
    fraseAcusacao: 'Dr. Harlow, você está sendo acusado do assassinato de Lorde Blackwood.',
    fraseConfissao: null,
    fraseInocencia: 'Meu Deus, detetive! Eu sou médico, jurei salvar vidas. Sim, sabia do veneno, mas nunca imaginei que alguém o usaria para matar. Fiquei calado por medo de perder meu cargo... Perdoe-me.'
  },
  {
    id: 'fynn_obrien',
    nome: 'Fynn O\'Brien',
    relacao: 'Segurança da propriedade',
    motivo: 'Foi humilhado publicamente por Lorde Blackwood na semana anterior ao crime.',
    segredo: 'Tinha uma chave extra do cofre e acesso a todos os cômodos da mansão.',
    ehAssassino: false,
    nivelSuspeita: 0,
    interrogado: false,
    depoimento: null,
    pistasIncriminadoras: [
      'humilhacao_fynn',
      'chave_extra'
    ],
    pistasInocentadoras: [
      'cameras_fynn',
      'alibi_fynn'
    ],
    localizacao: { x: 0, y: 2 },
    fraseAcusacao: 'Fynn O\'Brien, você está sendo acusado do assassinato de Lorde Blackwood.',
    fraseConfissao: null,
    fraseInocencia: 'Com todo respeito, detetive, mas tenho provas de que estava em meu quarto a noite toda. As câmeras não mentem.'
  }
];

// ==================== MÉTODOS UTILITÁRIOS ====================

// Buscar suspeito por ID
suspeitos.porId = function (id) {
  return this.find(s => s.id === id);
};

// Buscar suspeito por nome
suspeitos.porNome = function (nome) {
  return this.find(s => s.nome === nome);
};

// Buscar o assassino
suspeitos.getAssassino = function () {
  return this.find(s => s.ehAssassino === true)[0];
};

// Buscar suspeitos inocentes
suspeitos.getInocentes = function () {
  return this.filter(s => s.ehAssassino === false);
};

// Buscar suspeitos por nível mínimo
suspeitos.porNivelMinimo = function (nivel) {
  return this.filter(s => s.nivelSuspeita >= nivel);
};

// Atualizar nível de suspeita de um suspeito
suspeitos.atualizarNivel = function (id, novoNivel) {
  const suspeito = this.find(s => s.id === id);
  if (suspeito) {
    suspeito.nivelSuspeita = Math.min(10, Math.max(0, novoNivel));
  }
  return suspeito;
};

// Adicionar pista incriminadora a um suspeito
suspeitos.adicionarPistaIncriminadora = function (suspeitoId, pistaId) {
  const suspeito = this.find(s => s.id === suspeitoId);
  if (suspeito && !suspeito.pistasIncriminadoras.includes(pistaId)) {
    suspeito.pistasIncriminadoras.push(pistaId);
    suspeito.nivelSuspeita = Math.min(10, suspeito.nivelSuspeita + 2);
  }
  return suspeito;
};

// Adicionar pista inocentadora a um suspeito
suspeitos.adicionarPistaInocentadora = function (suspeitoId, pistaId) {
  const suspeito = this.find(s => s.id === suspeitoId);
  if (suspeito && !suspeito.pistasInocentadoras.includes(pistaId)) {
    suspeito.pistasInocentadoras.push(pistaId);
    suspeito.nivelSuspeita = Math.max(0, suspeito.nivelSuspeita - 2);
  }
  return suspeito;
};

// Marcar suspeito como interrogado
suspeitos.marcarInterrogado = function (id, depoimento = null) {
  const suspeito = this.find(s => s.id === id);
  if (suspeito) {
    suspeito.interrogado = true;
    if (depoimento) suspeito.depoimento = depoimento;
  }
  return suspeito;
};

// Resetar todos os níveis de suspeita (para nova partida)
suspeitos.resetarNiveis = function () {
  this.forEach(suspeito => {
    suspeito.nivelSuspeita = 0;
    suspeito.interrogado = false;
    suspeito.depoimento = null;
  });
};

// Estatísticas dos suspeitos
suspeitos.estatisticas = function () {
  return {
    total: this.length,
    assassino: this.getAssassino()?.nome,
    inocentes: this.getInocentes().length,
    porNivel: {
      alto: this.filter(s => s.nivelSuspeita >= 7).length,
      medio: this.filter(s => s.nivelSuspeita >= 4 && s.nivelSuspeita < 7).length,
      baixo: this.filter(s => s.nivelSuspeita > 0 && s.nivelSuspeita < 4).length,
      zero: this.filter(s => s.nivelSuspeita === 0).length
    }
  };
};

module.exports = suspeitos;