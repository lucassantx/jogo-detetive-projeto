// TODO Dev 2 — Sprint 1
// Seed: todas as pistas do caso Blackwood conforme manual
//
// Referência (detective_manual_blackwood.docx — seção 1.3):
//   (1,1) Frasco de arsênico vazio      peso 10
//   (1,0) Carta anônima rasgada         peso 8
//   (0,1) Testamento com rasura         peso 9
//   (3,0) Copo com resíduo de chá       peso 7
//   (3,1) Planta de arsênico colhida    peso 8
//   (2,0) Diário de Sir Edmund          peso 6
//   (2,1) Foto rasgada                  peso 5
//   (5,0) Pegadas no barro              peso 7
//   (0,2) Chave extra do cofre          peso 9
//   (1,2) Bilhete de trem cancelado     peso 6

const pistas = [
  // Biblioteca (1,1)
  {
    id: 'frasco_arsenico',
    nome: 'Frasco de arsênico vazio',
    descricao: 'Um pequeno frasco de vidro escuro, completamente vazio, mas com resíduos brancos no fundo. O rótulo desbotado indica "Arsenicum album". Encontrado atrás de livros na biblioteca.',
    peso: 10,
    localizacao: '(1,1) Biblioteca',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Sala de Estar (1,0)
  {
    id: 'carta_anonima',
    nome: 'Carta anônima rasgada',
    descricao: 'Carta rasgada em vários pedaços, encontrada atrás do sofá. O conteúdo sugere uma ameaça velada: "Você vai pagar pelo que fez. A verdade vai vir à tona." A caligrafia é feminina, nervosa.',
    peso: 8,
    localizacao: '(1,0) Sala de Estar',
    categoria: 'documento',
    encontrada: false,
    dataDescoberta: null
  },

  // Escritório (0,1)
  {
    id: 'testamento_rasura',
    nome: 'Testamento com rasura',
    descricao: 'Testamento oficial de Lorde Blackwood encontrado na gaveta da escrivaninha. Há anotações à mão nas margens, alterando beneficiários. A caligrafia parece nervosa, com rasuras e correções.',
    peso: 9,
    localizacao: '(0,1) Escritório',
    categoria: 'documento',
    encontrada: false,
    dataDescoberta: null
  },

  // Cozinha (3,0)
  {
    id: 'copo_residuo',
    nome: 'Copo com resíduo de chá',
    descricao: 'Copo de porcelana fina com resíduo escuro no fundo. O líquido evaporou, mas a mancha escura sugere que algo foi adicionado ao chá. Cheiro levemente amargo ainda perceptível.',
    peso: 7,
    localizacao: '(3,0) Cozinha',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Estufa (3,1)
  {
    id: 'planta_arsenico',
    nome: 'Planta de arsênico colhida',
    descricao: 'Canteiro de Arsenicum album na estufa. Várias folhas foram arrancadas recentemente - os caules estão frescos e a terra ainda está revirada. Planta extremamente tóxica se ingerida.',
    peso: 8,
    localizacao: '(3,1) Estufa',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Quarto de Hóspedes (2,0)
  {
    id: 'diario_edmund',
    nome: 'Diário de Sir Edmund',
    descricao: 'Diário antigo de Sir Edmund Blackwood, tio-avô da vítima. Encontrado no criado-mudo do quarto de hóspedes. Contém passagens sobre rituais obscuros e "o preço do poder". Páginas recentes foram arrancadas.',
    peso: 6,
    localizacao: '(2,0) Quarto de Hóspedes',
    categoria: 'documento',
    encontrada: false,
    dataDescoberta: null
  },

  // Sala de Jantar (2,1)
  {
    id: 'foto_rasgada',
    nome: 'Foto rasgada',
    descricao: 'Fotografia antiga rasgada ao meio, encontrada atrás do aparador. Mostra Lorde Blackwood jovem ao lado de uma mulher cujo rosto foi arrancado. Atrás da foto, escrito a lápis: "Perdão? Jamais."',
    peso: 5,
    localizacao: '(2,1) Sala de Jantar',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Jardim (5,0)
  {
    id: 'pegadas_barro',
    nome: 'Pegadas no barro',
    descricao: 'Pegadas frescas na lama do jardim, próximas à janela do escritório. Solo estava molhado devido à chuva da noite anterior. Pegadas sugerem alguém de estatura média, sapato social tamanho 42.',
    peso: 7,
    localizacao: '(5,0) Jardim',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Quarto do Guarda (0,2)
  {
    id: 'chave_extra',
    nome: 'Chave extra do cofre',
    descricao: 'Chave reserva do cofre da biblioteca, encontrada no bolso de uma jaqueta pendurada no guarda-roupa. O cofre continha documentos importantes e o frasco de arsênico.',
    peso: 9,
    localizacao: '(0,2) Quarto do Guarda',
    categoria: 'evidencia_fisica',
    encontrada: false,
    dataDescoberta: null
  },

  // Biblioteca - Segundo Andar (1,2)
  {
    id: 'bilhete_trem',
    nome: 'Bilhete de trem cancelado',
    descricao: 'Bilhete de trem para Londres com data do dia do crime, encontrado entre as páginas de um livro. O bilhete foi cancelado - alguém comprou mas não embarcou. Nome do passageiro: "V. Blackwood".',
    peso: 6,
    localizacao: '(1,2) Biblioteca - Segundo Andar',
    categoria: 'documento',
    encontrada: false,
    dataDescoberta: null
  }
];

// Método utilitário para filtrar pistas por localização
pistas.porLocalizacao = function (coord) {
  return this.filter(pista => pista.localizacao === coord);
};

// Método utilitário para obter pistas por peso (ordem decrescente)
pistas.ordenadasPorPeso = function () {
  return [...this].sort((a, b) => b.peso - a.peso);
};

// Método utilitário para calcular pontuação total disponível
pistas.pontuacaoTotal = function () {
  return this.reduce((total, pista) => total + pista.peso, 0);
};

// Método utilitário para pistas não encontradas
pistas.naoEncontradas = function () {
  return this.filter(pista => !pista.encontrada);
};

module.exports = pistas;