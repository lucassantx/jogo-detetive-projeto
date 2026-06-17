// TODO Dev 2 — Sprint 1
// Executa o seed no MongoDB: limpa coleções e insere dados iniciais
// Rodar com: node src/seed/index.js

require('dotenv').config();
const mongoose = require('mongoose');

// Importa os dados
const dialogos = require('./dialogos');
const pistas = require('./pistas');
const suspeitos = require('./suspeitos');
const npcs = require('./npcs');

// Models
const Partida = require('../models/Partida');
const Pista = require('../models/Pista');
const Suspeito = require('../models/Suspeito');
const NPC = require('../models/NPC');
const Dialogo = require('../models/Dialogo');

// Configuração do banco de dados
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackwood';
console.log(`Conectando ao MongoDB: ${MONGODB_URI}`);

async function connectDB() {
  console.log('[1/7] Conectando ao MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('[1/7] Conectado com sucesso!');
}

async function clearCollections() {
  console.log('\n[2/7] Limpando coleções existentes...');

  const collections = ['Partida', 'Pista', 'Suspeito', 'NPC', 'Dialogo'];
  for (const collection of collections) {
    try {
      await mongoose.connection.collection(collection).deleteMany({});
      console.log(`  - ${collection} removida`);
    } catch (err) {
      console.log(`  - ${collection} não existe ou já está vazia`);
    }
  }

  console.log('[2/7] Todas as coleções foram limpas!');
}

async function insertPistas() {
  console.log('\n[3/7] Inserindo pistas...');

  let count = 0;
  for (const pista of pistas) {
    try {
      await Pista.create({
        ...pista,
        encontrada: false,
        dataDescoberta: null,
        coletada: false,
      });
      count++;
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

  console.log(`\nEstatísticas das pistas:`);
  console.log(`  - Total: ${totalPistas}`);
  console.log(`  - Peso total disponível: ${pesoTotal} pontos`);
  console.log(`  - Média de peso: ${(pesoTotal / totalPistas).toFixed(2)}`);
  console.log(`  - Pista mais pesada: ${Math.max(...pistas.map(p => p.peso))}`);
  console.log(`  - Pista mais leve: ${Math.min(...pistas.map(p => p.peso))}`);

  console.log(`\nPistas por localização:`);
  Object.entries(pistasPorLocal).forEach(([local, count]) => {
    console.log(`  - ${local}: ${count} pista(s)`);
  });
}

async function insertSuspeitos() {
  console.log('\n[4/7] Inserindo suspeitos...');

  let count = 0;
  for (const suspeito of suspeitos) {
    try {
      await Suspeito.create(suspeito);
      count++;
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

async function insertNPCs() {
  console.log('\n[5/7] Inserindo NPCs...');

  let count = 0;
  for (const npc of npcs) {
    try {
      await NPC.create(npc);
      count++;
    } catch (err) {
      console.error(`  Erro ao inserir NPC "${npc.nome}":`, err.message);
    }
  }

  console.log(`  Total de NPCs inseridos: ${count}`);

  const todosNPCs = await NPC.find();
  console.log(`\nLista de NPCs:`);
  for (const npc of todosNPCs) {
    console.log(`  - ${npc.nome} (${npc.id}) - Posição: (${npc.celula.x}, ${npc.celula.y})`);
    console.log(`    Diálogo inicial: ${npc.dialogoInicial}`);
  }
}

async function insertDialogos() {
  console.log('\n[6/7] Inserindo diálogos...');

  let count = 0;
  for (const dialogo of dialogos) {
    try {
      await Dialogo.create(dialogo);
      count++;
    } catch (err) {
      console.error(`  Erro ao inserir diálogo "${dialogo.id}":`, err.message);
    }
  }

  console.log(`  Total de nós de diálogo inseridos: ${count}`);

  // Estatísticas dos diálogos
  const todosDialogos = await Dialogo.find();
  const npcsDialogo = [...new Set(todosDialogos.map(d => d.npc).filter(npc => npc !== null))];
  const dialogosPorNPC = npcsDialogo.map(npc => ({
    npc,
    count: todosDialogos.filter(d => d.npc === npc).length
  }));

  console.log(`\nEstatísticas dos diálogos:`);
  console.log(`  - Total de nós: ${todosDialogos.length}`);
  console.log(`  - NPCs com diálogo: ${npcsDialogo.length}`);

  console.log(`\nDiálogos por NPC:`);
  dialogosPorNPC.forEach(({ npc, count }) => {
    console.log(`  - ${npc}: ${count} nós`);
  });

  const ambientais = todosDialogos.filter(d => d.npc === null);
  if (ambientais.length > 0) {
    console.log(`  - Investigações ambientais: ${ambientais.length} nós`);
  }

  // Conta escolhas bloqueadas
  let escolhasBloqueadas = 0;
  let escolhasComPista = 0;
  for (const d of todosDialogos) {
    for (const escolha of d.escolhas || []) {
      if (escolha.pistaBloqueada) escolhasBloqueadas++;
      if (escolha.pistaRequerida) escolhasComPista++;
    }
  }
  console.log(`\nEstatísticas das escolhas:`);
  console.log(`  - Escolhas que desbloqueiam pistas: ${escolhasBloqueadas}`);
  console.log(`  - Escolhas que requerem pistas: ${escolhasComPista}`);
}

async function criarIndices() {
  console.log('\n[7/7] Criando índices no banco de dados...');

  try {
    await Pista.collection.createIndex({ peso: -1 });
    await Pista.collection.createIndex({ localizacao: 1 });
    await Pista.collection.createIndex({ encontrada: 1 });
    await Pista.collection.createIndex({ categoria: 1 });
    console.log('  - Índices criados para Pistas');
  } catch (err) {
    console.log('  - Erro ao criar índices para Pistas:', err.message);
  }

  try {
    await Suspeito.collection.createIndex({ nome: 1 });
    await Suspeito.collection.createIndex({ nivelSuspeita: -1 });
    await Suspeito.collection.createIndex({ ehAssassino: 1 });
    console.log('  - Índices criados para Suspeitos');
  } catch (err) {
    console.log('  - Erro ao criar índices para Suspeitos:', err.message);
  }

  try {
    await Partida.collection.createIndex({ status: 1 });
    await Partida.collection.createIndex({ xp: -1 });
    await Partida.collection.createIndex({ createdAt: -1 });
    console.log('  - Índices criados para Partidas');
  } catch (err) {
    console.log('  - Erro ao criar índices para Partidas:', err.message);
  }

  try {
    await NPC.collection.createIndex({ id: 1 }, { unique: true });
    await NPC.collection.createIndex({ 'celula.x': 1, 'celula.y': 1 });
    console.log('  - Índices criados para NPCs');
  } catch (err) {
    console.log('  - Erro ao criar índices para NPCs:', err.message);
  }

  try {
    await Dialogo.collection.createIndex({ id: 1 }, { unique: true });
    await Dialogo.collection.createIndex({ npc: 1 });
    console.log('  - Índices criados para Diálogos');
  } catch (err) {
    console.log('  - Erro ao criar índices para Diálogos:', err.message);
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
  const totalNPCs = await NPC.countDocuments();
  const totalDialogos = await Dialogo.countDocuments();

  console.log(`\nBanco de dados populado com sucesso!`);
  console.log(`\nDados inseridos:`);
  console.log(`  - Pistas: ${totalPistas} (${pistasNaoEncontradas} disponíveis para coleta)`);
  console.log(`  - Suspeitos: ${totalSuspeitos}`);
  console.log(`  - NPCs: ${totalNPCs}`);
  console.log(`  - Nós de Diálogo: ${totalDialogos}`);

  console.log(`\nO assassino é: ${assassino?.nome || 'Desconhecido'}`);

  const topPistas = await Pista.find().sort({ peso: -1 }).limit(5);
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
    console.log('🚀 Iniciando seed do banco de dados...\n');

    await connectDB();
    connection = mongoose.connection;

    await clearCollections();
    await insertNPCs();
    await insertDialogos();
    await insertPistas();
    await insertSuspeitos();
    await criarIndices();
    await mostrarResumo();

    console.log('\n✅ Seed concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 Conexão com MongoDB encerrada');
    }
  }

  process.exit(0);
}

// Executa o seed
seed().catch(err => {
  console.error('\n💥 Erro fatal:', err);
  process.exit(1);
});