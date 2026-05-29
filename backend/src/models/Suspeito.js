// TODO Dev 2 — Sprint 1
// Model para os suspeitos do caso Blackwood
//
// Suspeitos: Victor Blackwood, Adelaide Cross, Dr. Harlow
// Campos: id, nome, relacao, motivo, segredo, ehAssassino (Boolean)
// Usado pela tela de Acusação (Dev 4) e pelo endpoint /acusar

const mongoose = require('mongoose');

const SuspeitoSchema = new mongoose.Schema({
  // TODO
});

module.exports = mongoose.model('Suspeito', SuspeitoSchema);
