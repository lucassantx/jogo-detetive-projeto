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
  id: { type: String, required: true },
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  peso: { type: Number, required: true, min: 1, max: 10 },
  localizacao: { type: String, default: 'Mansão Blackwood' },
  categoria: { type: String, default: 'evidencia_fisica' },
  obtidaEm: { type: Date, default: Date.now },
  origem: { type: String, default: null }
}, { _id: false });


const partidaSchema = new mongoose.Schema({
  posicao: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  celulasReveladas: {
    type: [String],
    default: ['0,0']
  },
  pistasColetadas: {
    type: [{
      id: String,
      nome: String,
      descricao: String,
      peso: Number,
      celula: { x: Number, y: Number },
      coletada: { type: Boolean, default: true },
      descobertaEm: { type: Date, default: Date.now }
    }],
    default: []
  },
  pistasIdsColetadas: {
    type: [String],
    default: []
  },
  xp: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['em_andamento', 'vitoria', 'derrota', 'concluida'],
    default: 'em_andamento'
  },
  npcAtual: {
    type: String,
    default: null
  },
  historicoDialogos: {
    type: [{
      npcId: String,
      npcNome: String,
      noId: String,
      escolhaIndex: Number,
      escolhaTexto: String,
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  },
  suspeitosInterrogados: {
    type: [{
      npcId: String,
      nome: String,
      primeiraVez: { type: Date, default: Date.now },
      ultimaVez: { type: Date, default: Date.now },
      nodesVisitados: [String],
      escolhasFeitas: [Number]
    }],
    default: []
  },
  concluidaEm: {
    type: Date,
    default: null
  },
  acusado: {
    type: {
      suspeitoId: String,
      nome: String,
      acertou: Boolean,
      argumento: String,
      evidencias: [String],
      timestamp: { type: Date, default: Date.now }
    },
    default: null
  },
  iniciadaEm: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Partida', partidaSchema);