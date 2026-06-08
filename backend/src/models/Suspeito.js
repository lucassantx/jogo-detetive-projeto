// TODO Dev 2 — Sprint 1
// Model para os suspeitos do caso Blackwood
//
// Suspeitos: Victor Blackwood, Adelaide Cross, Dr. Harlow
// Campos: id, nome, relacao, motivo, segredo, ehAssassino (Boolean)
// Usado pela tela de Acusação (Dev 4) e pelo endpoint /acusar

const mongoose = require('mongoose');

const SuspeitoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  relacao: {
    type: String,
    required: true,
    enum: ['Sobrinho', 'Governanta', 'Segurança', 'Médico Pessoal', 'Sobrinho da vítima', 'Governanta da mansão', 'Segurança da propriedade', 'Médico pessoal da família Blackwood', 'Outro']
    // OU remova o enum para aceitar qualquer valor
  },
  motivo: { type: String, required: true },
  segredo: { type: String, default: null },
  ehAssassino: { type: Boolean, default: false },
  nivelSuspeita: { type: Number, default: 0 },
  interrogado: { type: Boolean, default: false },
  depoimento: { type: String, default: null },
  pistasIncriminadoras: { type: [String], default: [] },
  pistasInocentadoras: { type: [String], default: [] },
  localizacao: {
    x: { type: Number, default: null },
    y: { type: Number, default: null }
  },
  fraseAcusacao: { type: String, default: null },
  fraseConfissao: { type: String, default: null },
  fraseInocencia: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Suspeito', SuspeitoSchema);