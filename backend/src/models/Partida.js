const mongoose = require('mongoose');

const PosicaoSchema = new mongoose.Schema({
  x: { type: Number, required: true, default: 0, min: 0 },
  y: { type: Number, required: true, default: 0, min: 0 }
}, { _id: false });

const CelulaSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const PistaColetadaSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  nome:        { type: String, required: true },
  descricao:   { type: String, required: true },
  peso:        { type: Number, required: true, min: 1, max: 10 },
  localizacao: { type: String, default: 'Mansão Blackwood' },
  categoria:   { type: String, default: 'evidencia_fisica' },
  obtidaEm:    { type: Date,   default: Date.now },
  origem:      { type: String, default: null }
}, { _id: false });

const PartidaSchema = new mongoose.Schema({
  posicao:              { type: PosicaoSchema,       required: true, default: { x: 0, y: 0 } },
  celulasReveladas:     { type: [CelulaSchema],      default: [] },
  pistasColetadas:      { type: [PistaColetadaSchema], default: [] },
  xp:                   { type: Number, required: true, default: 0, min: 0 },
  status:               { type: String, enum: ['em_andamento', 'vitoria', 'derrota'], default: 'em_andamento' },
  historicoDialogos:    { type: [String], default: [] },
  suspeitosInterrogados:{ type: [String], default: [] },
  pistasIdsColetadas:   { type: [String], default: [] },
  iniciadaEm:           { type: Date, default: Date.now },
  concluidaEm:          { type: Date, default: null },
  acusado:              { type: String, default: null }
}, { timestamps: true });

PartidaSchema.index({ status: 1 });
PartidaSchema.index({ createdAt: -1 });

PartidaSchema.pre('save', function (next) {
  if (this.pistasColetadas && this.pistasColetadas.length > 0) {
    this.pistasColetadas.sort((a, b) => b.peso - a.peso);
  }
  next();
});

PartidaSchema.set('toJSON', { virtuals: true });
PartidaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Partida', PartidaSchema);