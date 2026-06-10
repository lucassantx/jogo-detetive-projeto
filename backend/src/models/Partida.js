// TODO Dev 2 — Sprint 1
// Model Mongoose para estado da partida
//
// Campos mínimos:
//   posicao: { x: Number, y: Number }   — posição atual do detetive
//   celulasReveladas: [{ x, y }]        — histórico de células visitadas
//   pistasColetadas: [PistaSchema]      — pistas no heap
//   xp: Number                          — pontuação acumulada
//   status: 'em_andamento' | 'vitoria' | 'derrota'
//
// Integração: usado por partidaController e mapaController

const mongoose = require('mongoose');

const PosicaoSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  y: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  }
}, { _id: false });

// Schema para célula visitada
const CelulaSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  }
}, { _id: false });

// Schema para pista coletada (armazenada para o MaxHeap)
const PistaColetadaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  peso: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  localizacao: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['evidencia_fisica', 'documento', 'testemunho', 'localizacao', 'suspeita'],
    default: 'evidencia_fisica'
  },
  obtidaEm: {
    type: Date,
    default: Date.now
  },
  origem: {
    type: String,
    default: null
  }
}, { _id: false });

// Schema principal da Partida
const PartidaSchema = new mongoose.Schema({
  // Posição atual do detetive no grid
  posicao: {
    type: PosicaoSchema,
    required: true,
    default: { x: 1, y: 1 }
  },

  // Histórico de células/quadrantes visitados
  celulasReveladas: {
    type: [CelulaSchema],
    default: []
  },

  // Pistas coletadas (ordenadas por peso decrescente - MaxHeap)
  pistasColetadas: {
    type: [PistaColetadaSchema],
    default: []
  },

  // Pontuação acumulada do jogador
  xp: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Estado atual da partida
  status: {
    type: String,
    enum: ['em_andamento', 'vitoria', 'derrota'],
    default: 'em_andamento'
  },

  // IDs dos diálogos já visitados (evita repetição)
  historicoDialogos: {
    type: [String],
    default: []
  },

  // Suspeitos que já foram interrogados
  suspeitosInterrogados: {
    type: [String],
    default: []
  },

  // Pistas que já foram coletadas (IDs)
  pistasIdsColetadas: {
    type: [String],
    default: []
  },

  // Data de início da partida
  iniciadaEm: {
    type: Date,
    default: Date.now
  },

  // Data de conclusão (vitória/derrota)
  concluidaEm: {
    type: Date,
    default: null
  },

  // Quem foi acusado (no final do jogo)
  acusado: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ==================== ÍNDICES ====================
PartidaSchema.index({ status: 1 });
PartidaSchema.index({ createdAt: -1 });
PartidaSchema.index({ xp: -1 });
PartidaSchema.index({ 'posicao.x': 1, 'posicao.y': 1 });

// ==================== MÉTODOS DE INSTÂNCIA ====================

// Adicionar XP
PartidaSchema.methods.adicionarXP = function (valor) {
  if (valor > 0) {
    this.xp += valor;
  }
  return this.save();
};

// Mover para nova posição
PartidaSchema.methods.moverPara = function (x, y) {
  this.posicao = { x, y };

  // Adicionar célula ao histórico se não existir
  const celulaExiste = this.celulasReveladas.some(c => c.x === x && c.y === y);
  if (!celulaExiste) {
    this.celulasReveladas.push({ x, y });
  }

  return this.save();
};

// Adicionar pista coletada (mantém ordenação por peso - MaxHeap)
PartidaSchema.methods.adicionarPista = function (pista, origem = null) {
  // Verificar se já tem a pista
  if (this.pistasIdsColetadas.includes(pista.id)) {
    return false;
  }

  // Adicionar pista
  this.pistasColetadas.push({
    id: pista.id,
    nome: pista.nome,
    descricao: pista.descricao,
    peso: pista.peso,
    localizacao: pista.localizacao,
    categoria: pista.categoria,
    origem: origem,
    obtidaEm: new Date()
  });

  // Adicionar ID ao histórico
  this.pistasIdsColetadas.push(pista.id);

  // Ordenar por peso decrescente (MaxHeap)
  this.pistasColetadas.sort((a, b) => b.peso - a.peso);

  return this.save();
};

// Obter pista mais pesada (topo do MaxHeap)
PartidaSchema.methods.getPistaMaisPesada = function () {
  if (this.pistasColetadas.length === 0) return null;
  return this.pistasColetadas[0];
};

// Remover pista (quando usada em confronto)
PartidaSchema.methods.removerPista = function (pistaId) {
  this.pistasColetadas = this.pistasColetadas.filter(p => p.id !== pistaId);
  this.pistasIdsColetadas = this.pistasIdsColetadas.filter(id => id !== pistaId);
  return this.save();
};

// Verificar se possui uma pista específica
PartidaSchema.methods.temPista = function (pistaId) {
  return this.pistasIdsColetadas.includes(pistaId);
};

// Verificar se possui alguma das pistas
PartidaSchema.methods.temAlgumaPista = function (pistaIds) {
  return pistaIds.some(id => this.temPista(id));
};

// Verificar se possui todas as pistas
PartidaSchema.methods.temTodasPistas = function (pistaIds) {
  return pistaIds.every(id => this.temPista(id));
};

// Obter todas as pistas ordenadas (MaxHeap)
PartidaSchema.methods.getPistasOrdenadas = function () {
  return [...this.pistasColetadas].sort((a, b) => b.peso - a.peso);
};

// Obter pistas por categoria
PartidaSchema.methods.getPistasPorCategoria = function (categoria) {
  return this.pistasColetadas.filter(p => p.categoria === categoria);
};

// Adicionar diálogo ao histórico
PartidaSchema.methods.adicionarDialogo = function (dialogoId) {
  if (!this.historicoDialogos.includes(dialogoId)) {
    this.historicoDialogos.push(dialogoId);
  }
  return this.save();
};

// Verificar se diálogo já foi visitado
PartidaSchema.methods.dialogoVisitado = function (dialogoId) {
  return this.historicoDialogos.includes(dialogoId);
};

// Adicionar suspeito interrogado
PartidaSchema.methods.adicionarSuspeitoInterrogado = function (suspeitoNome) {
  if (!this.suspeitosInterrogados.includes(suspeitoNome)) {
    this.suspeitosInterrogados.push(suspeitoNome);
  }
  return this.save();
};

// Verificar se suspeito já foi interrogado
PartidaSchema.methods.suspeitoInterrogado = function (suspeitoNome) {
  return this.suspeitosInterrogados.includes(suspeitoNome);
};

// Calcular pontuação total das pistas coletadas
PartidaSchema.methods.calcularPontuacaoPistas = function () {
  return this.pistasColetadas.reduce((total, pista) => total + pista.peso, 0);
};

// Finalizar partida com vitória
PartidaSchema.methods.finalizarVitoria = function (acusado) {
  this.status = 'vitoria';
  this.acusado = acusado;
  this.concluidaEm = new Date();
  return this.save();
};

// Finalizar partida com derrota
PartidaSchema.methods.finalizarDerrota = function () {
  this.status = 'derrota';
  this.concluidaEm = new Date();
  return this.save();
};

// Verificar se a partida está em andamento
PartidaSchema.methods.estaEmAndamento = function () {
  return this.status === 'em_andamento';
};

// ==================== MÉTODOS ESTÁTICOS ====================

// Criar nova partida
PartidaSchema.statics.novaPartida = function (posicaoInicial = { x: 1, y: 1 }) {
  return this.create({
    posicao: posicaoInicial,
    celulasReveladas: [{ ...posicaoInicial }],
    pistasColetadas: [],
    pistasIdsColetadas: [],
    xp: 0,
    status: 'em_andamento',
    historicoDialogos: [],
    suspeitosInterrogados: [],
    iniciadaEm: new Date()
  });
};

// Buscar partidas em andamento
PartidaSchema.statics.buscarEmAndamento = function () {
  return this.find({ status: 'em_andamento' }).sort({ createdAt: -1 });
};

// Buscar partidas finalizadas
PartidaSchema.statics.buscarFinalizadas = function () {
  return this.find({ status: { $ne: 'em_andamento' } }).sort({ concluidaEm: -1 });
};

// Buscar ranking por XP (apenas vitórias)
PartidaSchema.statics.getRanking = function (limit = 10) {
  return this.find({ status: 'vitoria' })
    .sort({ xp: -1, concluidaEm: 1 })
    .limit(limit)
    .select('xp concluidaEm acusado createdAt');
};

// Estatísticas do jogo
PartidaSchema.statics.getEstatisticas = async function () {
  const total = await this.countDocuments();
  const vitorias = await this.countDocuments({ status: 'vitoria' });
  const derrotas = await this.countDocuments({ status: 'derrota' });
  const andamento = await this.countDocuments({ status: 'em_andamento' });

  const avgXP = await this.aggregate([
    { $match: { status: 'vitoria' } },
    { $group: { _id: null, media: { $avg: '$xp' } } }
  ]);

  const maxXP = await this.findOne({ status: 'vitoria' })
    .sort({ xp: -1 })
    .select('xp');

  return {
    total,
    vitorias,
    derrotas,
    andamento,
    mediaXP: avgXP.length > 0 ? Math.round(avgXP[0].media) : 0,
    recordeXP: maxXP ? maxXP.xp : 0
  };
};

// ==================== MIDDLEWARES ====================

// Antes de salvar, garantir ordenação das pistas
PartidaSchema.pre('save', function (next) {
  if (this.pistasColetadas && this.pistasColetadas.length > 0) {
    this.pistasColetadas.sort((a, b) => b.peso - a.peso);
  }
  next();
});

// ==================== VIRTUAIS ====================

// Número total de pistas coletadas
PartidaSchema.virtual('totalPistas').get(function () {
  return this.pistasColetadas.length;
});

// Soma dos pesos das pistas
PartidaSchema.virtual('pesoTotalPistas').get(function () {
  return this.pistasColetadas.reduce((sum, p) => sum + p.peso, 0);
});

// Porcentagem de conclusão (baseado em pistas)
PartidaSchema.virtual('progresso').get(function () {
  const TOTAL_PISTAS_POSSIVEIS = 23; // Total de pistas do jogo
  return Math.round((this.pistasColetadas.length / TOTAL_PISTAS_POSSIVEIS) * 100);
});

// Tempo de jogo em minutos
PartidaSchema.virtual('tempoJogoMinutos').get(function () {
  if (!this.iniciadaEm) return 0;
  const fim = this.concluidaEm || new Date();
  const diffMs = fim - this.iniciadaEm;
  return Math.floor(diffMs / 60000);
});

// Formatar posição para exibição
PartidaSchema.virtual('posicaoFormatada').get(function () {
  return `(${this.posicao.x}, ${this.posicao.y})`;
});

// Garantir que virtuais sejam incluídos nos JSON
PartidaSchema.set('toJSON', { virtuals: true });
PartidaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Partida', PartidaSchema);