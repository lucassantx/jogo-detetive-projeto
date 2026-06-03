// TODO Dev 2 — Sprint 1
// Executa o seed no MongoDB: limpa coleções e insere dados iniciais
// Rodar com: node src/seed/index.js

const mongoose = require('mongoose');
const dialogos = require('./dialogos');
const pistas = require('./pistas');
const suspeitos = require('./suspeitos');

// Models
const Partida = require('../models/Partida');
const Pista = require('../models/Pista');
const Suspeito = require('../models/Suspeito');

// Configuracao do banco de dados
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackwood-detective';

async function connectDB() {
  console.log('[1/6] Conectando ao MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[1/6] Conectado com sucesso!');
}

async function clearCollections() {
  console.log('\n[2/6] Limpando colecoes existentes...');

  try {
    await Partida.deleteMany({});
    console.log('  - Partidas removidas');
  } catch (err) {
    console.log('  - Colecao Partidas nao existe ou ja esta vazia');
  }

  try {
    await Pista.deleteMany({});
    console.log('  - Pistas removidas');
  } catch (err) {
    console.log('  - Colecao Pistas nao existe ou ja esta vazia');
  }

  try {
    await Suspeito.deleteMany({});
    console.log('  - Suspeitos removidos');
  } catch (err) {
    console.log('  - Colecao Suspeitos nao existe ou ja esta vazia');
  }

  console.log('[2/6] Todas as colecoes foram limpas!');
}

async function insertPistas() {
  console.log('\n[3/6] Inserindo pistas...');

  let count = 0;
  for (const pista of pistas) {
    try {
      const exists = await Pista.findOne({ id: pista.id });
      if (!exists) {
        await Pista.create({
          ...pista,
          encontrada: false,
          dataDescoberta: null
        });
        count++;
      }
    } catch (err) {
      console.error(`  Erro ao inserir pista "${pista.nome}":`, err.message);
    }
  }

  console.log(`  Total de pistas inseridas: ${count}`);

  const totalPistas = await Pista.countDocuments();
  const pesoTotal = pistas.reduce((sum, p) => sum + p.peso, 0);
  const pistasPorLocal = pistas.reduce((acc, p) => {
    acc[p.localizacao] = (acc[p.localizacao] || 0) + 1;
    return acc;
  }, {});

  console.log(`\nEstatisticas das pistas:`);
  console.log(`  - Total: ${totalPistas}`);
  console.log(`  - Peso total disponivel: ${pesoTotal} pontos`);
  console.log(`  - Media de peso: ${(pesoTotal / totalPistas).toFixed(2)}`);
  console.log(`  - Pista mais pesada: ${Math.max(...pistas.map(p => p.peso))}`);
  console.log(`  - Pista mais leve: ${Math.min(...pistas.map(p => p.peso))}`);

  console.log(`\nPistas por localizacao:`);
  Object.entries(pistasPorLocal).forEach(([local, count]) => {
    console.log(`  - ${local}: ${count} pista(s)`);
  });
}

async function insertSuspeitos() {
  console.log('\n[4/6] Inserindo suspeitos...');

  let count = 0;
  for (const suspeito of suspeitos) {
    try {
      const exists = await Suspeito.findOne({ id: suspeito.id });
      if (!exists) {
        await Suspeito.create(suspeito);
        count++;
      }
    } catch (err) {
      console.error(`  Erro ao inserir suspeito "${suspeito.nome}":`, err.message);
    }
  }

  console.log(`  Total de suspeitos inseridos: ${count}`);

  const todosSuspeitos = await Suspeito.find();
  console.log(`\nLista de suspeitos:`);
  for (const suspeito of todosSuspeitos) {
    const assassino = suspeito.ehAssassino ? '[ASSASSINO]' : '[INOCENTE]';
    console.log(`  - ${suspeito.nome} (${suspeito.relacao}) - ${assassino}`);
  }
}

async function insertDialogos() {
  console.log('\n[5/6] Processando dialogos...');

  console.log(`  Total de nos de dialogo processados: ${dialogos.length}`);

  const npcs = [...new Set(dialogos.map(d => d.npc).filter(npc => npc !== null))];
  const dialogosPorNPC = npcs.map(npc => ({
    npc,
    count: dialogos.filter(d => d.npc === npc).length
  }));

  console.log(`\nEstatisticas dos dialogos:`);
  console.log(`  - Total de nos: ${dialogos.length}`);
  console.log(`  - NPCs disponiveis: ${npcs.length}`);

  console.log(`\nDialogos por NPC:`);
  dialogosPorNPC.forEach(({ npc, count }) => {
    console.log(`  - ${npc}: ${count} nos`);
  });

  const ambientais = dialogos.filter(d => d.npc === null);
  if (ambientais.length > 0) {
    console.log(`  - Investigacoes ambientais: ${ambientais.length} nos`);
  }
}

async function criarIndices() {
  console.log('\n[6/6] Criando indices no banco de dados...');

  try {
    await Pista.collection.createIndex({ peso: -1 });
    await Pista.collection.createIndex({ localizacao: 1 });
    await Pista.collection.createIndex({ encontrada: 1 });
    await Pista.collection.createIndex({ categoria: 1 });
    console.log('  - Indices criados para Pistas');
  } catch (err) {
    console.log('  - Erro ao criar indices para Pistas:', err.message);
  }

  try {
    await Suspeito.collection.createIndex({ nome: 1 });
    await Suspeito.collection.createIndex({ nivelSuspeita: -1 });
    await Suspeito.collection.createIndex({ ehAssassino: 1 });
    console.log('  - Indices criados para Suspeitos');
  } catch (err) {
    console.log('  - Erro ao criar indices para Suspeitos:', err.message);
  }

  try {
    await Partida.collection.createIndex({ status: 1 });
    await Partida.collection.createIndex({ xp: -1 });
    await Partida.collection.createIndex({ createdAt: -1 });
    console.log('  - Indices criados para Partidas');
  } catch (err) {
    console.log('  - Erro ao criar indices para Partidas:', err.message);
  }
}

async function mostrarResumo() {
  console.log('\n' + '='.repeat(60));
  console.log('RESUMO DO SEED');
  console.log('='.repeat(60));

  const totalPistas = await Pista.countDocuments();
  const pistasNaoEncontradas = await Pista.countDocuments({ encontrada: false });
  const totalSuspeitos = await Suspeito.countDocuments();
  const assassino = await Suspeito.findOne({ ehAssassino: true });

  console.log(`\nBanco de dados populado com sucesso!`);
  console.log(`\nDados inseridos:`);
  console.log(`  - Pistas: ${totalPistas} (${pistasNaoEncontradas} disponiveis para coleta)`);
  console.log(`  - Suspeitos: ${totalSuspeitos}`);
  console.log(`  - Dialogos: ${dialogos.length} nos`);

  console.log(`\nO assassino e: ${assassino?.nome || 'Desconhecido'}`);

  const topPistas = [...pistas].sort((a, b) => b.peso - a.peso).slice(0, 5);
  console.log(`\nTop 5 pistas mais valiosas:`);
  topPistas.forEach((pista, index) => {
    console.log(`  ${index + 1}. ${pista.nome} (${pista.peso} pts) - ${pista.localizacao}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Pronto para iniciar o jogo!');
  console.log('='.repeat(60));
}

async function seed() {
  let connection = null;

  try {
    console.log('Iniciando seed do banco de dados...\n');

    await connectDB();
    connection = mongoose.connection;

    await clearCollections();
    await insertPistas();
    await insertSuspeitos();
    await insertDialogos();
    await criarIndices();
    await mostrarResumo();

    console.log('\nSeed concluido com sucesso!');

  } catch (error) {
    console.error('\nErro durante o seed:', error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\nConexao com MongoDB encerrada');
    }
  }

  process.exit(0);
}

seed().catch(err => {
  console.error('\nErro fatal:', err);
  process.exit(1);
});