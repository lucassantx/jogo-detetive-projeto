// TODO Dev 2 — Sprint 1
// Executa o seed no MongoDB: limpa coleções e insere dados iniciais
// Rodar com: node src/seed/index.js

const mongoose = require('mongoose');
// const dialogos  = require('./dialogos');
// const pistas    = require('./pistas');
// const suspeitos = require('./suspeitos');

async function seed() {
  // TODO — conectar ao Mongo, limpar e inserir
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
