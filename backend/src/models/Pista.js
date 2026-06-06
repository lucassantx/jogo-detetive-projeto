const mongoose = require('mongoose');

const PistaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  peso: { type: Number, required: true, min: 1, max: 10 },

  // campo adicionado para integração com TSP (endpoint /rota)
  celula: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },

  localizacao: { type: String, required: true },
  categoria: {
    type: String,
    enum: ['testemunho', 'evidencia_fisica', 'documento', 'localizacao', 'suspeita'],
    required: true
  },
  encontrada: { type: Boolean, default: false },
  dataDescoberta: { type: Date, default: null },
  origemDialogo: { type: String, default: null }
}, { timestamps: true });

PistaSchema.index({ peso: -1 });
PistaSchema.index({ localizacao: 1 });
PistaSchema.index({ encontrada: 1 });
PistaSchema.index({ categoria: 1 });

PistaSchema.methods.marcarComoEncontrada = function(origem = null) {
  this.encontrada = true;
  this.dataDescoberta = new Date();
  if (origem) this.origemDialogo = origem;
  return this.save();
};

PistaSchema.methods.estaEncontrada = function() {
  return this.encontrada === true;
};

PistaSchema.statics.buscarNaoEncontradasPorPeso = function() {
  return this.find({ encontrada: false }).sort({ peso: -1 });
};

PistaSchema.statics.buscarPorLocalizacao = function(localizacao) {
  return this.find({ localizacao, encontrada: false });
};

PistaSchema.statics.buscarPorCategoria = function(categoria) {
  return this.find({ categoria, encontrada: false });
};

PistaSchema.statics.contarEncontradas = function() {
  return this.countDocuments({ encontrada: true });
};

PistaSchema.statics.pontuacaoMaxima = async function() {
  const result = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$peso' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

PistaSchema.virtual('status').get(function() {
  return this.encontrada ? 'Coletada' : 'Não coletada';
});

PistaSchema.set('toJSON', { virtuals: true });
PistaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pista', PistaSchema);