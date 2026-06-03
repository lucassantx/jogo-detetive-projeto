// TODO Dev 2 — Sprint 1
// Sub-documento ou model para pistas do caso Blackwood
//
// Campos:
//   id: String           — identificador único (ex: 'pista_01')
//   nome: String         — nome curto exibido no inventário
//   descricao: String    — texto completo revelado ao coletar
//   peso: Number (1–10)  — relevância para o MaxHeap
//   celula: { x, y }     — localização no grid
//   coletada: Boolean

const mongoose = require('mongoose');

const PistaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
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

  // Localização no grid (formato string ou objeto)
  localizacao: {
    type: String,
    required: true
  },

  categoria: {
    type: String,
    enum: ['testemunho', 'evidencia_fisica', 'documento', 'localizacao', 'suspeita'],
    required: true
  },

  // Se a pista já foi encontrada/coletada
  encontrada: {
    type: Boolean,
    default: false
  },

  // Data em que foi descoberta
  dataDescoberta: {
    type: Date,
    default: null
  },

  // Opcional: referência ao diálogo que a revelou
  origemDialogo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ==================== ÍNDICES ====================
PistaSchema.index({ peso: -1 });           // Para ordenação (MaxHeap)
PistaSchema.index({ localizacao: 1 });      // Buscar por local
PistaSchema.index({ encontrada: 1 });       // Buscar não encontradas
PistaSchema.index({ categoria: 1 });        // Buscar por categoria

// ==================== MÉTODOS DE INSTÂNCIA ====================

// Marcar pista como encontrada
PistaSchema.methods.marcarComoEncontrada = function (origem = null) {
  this.encontrada = true;
  this.dataDescoberta = new Date();
  if (origem) this.origemDialogo = origem;
  return this.save();
};

// Verificar se já foi encontrada
PistaSchema.methods.estaEncontrada = function () {
  return this.encontrada === true;
};

// ==================== MÉTODOS ESTÁTICOS ====================

// Buscar pistas não encontradas, ordenadas por peso (para MaxHeap)
PistaSchema.statics.buscarNaoEncontradasPorPeso = function () {
  return this.find({ encontrada: false }).sort({ peso: -1 });
};

// Buscar pistas por localização
PistaSchema.statics.buscarPorLocalizacao = function (localizacao) {
  return this.find({ localizacao, encontrada: false });
};

// Buscar pistas por categoria
PistaSchema.statics.buscarPorCategoria = function (categoria) {
  return this.find({ categoria, encontrada: false });
};

// Contar pistas encontradas
PistaSchema.statics.contarEncontradas = function () {
  return this.countDocuments({ encontrada: true });
};

// Calcular pontuação máxima total
PistaSchema.statics.pontuacaoMaxima = async function () {
  const result = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$peso' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// ==================== VIRTUAIS ====================

// Status formatado
PistaSchema.virtual('status').get(function () {
  return this.encontrada ? 'Coletada' : 'Não coletada';
});

// Garantir que virtuais sejam incluídos
PistaSchema.set('toJSON', { virtuals: true });
PistaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pista', PistaSchema);