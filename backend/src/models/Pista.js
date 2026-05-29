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
  // TODO
});

module.exports = mongoose.model('Pista', PistaSchema);
