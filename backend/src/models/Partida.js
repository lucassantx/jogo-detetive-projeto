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

const PartidaSchema = new mongoose.Schema({
  // TODO
}, { timestamps: true });

module.exports = mongoose.model('Partida', PartidaSchema);
