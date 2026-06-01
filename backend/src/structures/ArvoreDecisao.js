class ArvoreDecisao {
  constructor(nos) {
    // armazena nós em Map para acesso O(1) por id
    this.nos = new Map(nos.map(n => [n.id, n]));
  }

  // retorna o nó pelo id ou null se não existir
  get(id) {
    return this.nos.get(id) || null;
  }

  // navega para o próximo nó conforme a escolha do jogador
  escolher(noAtualId, index) {
    const no = this.get(noAtualId);
    if (!no || !no.escolhas || index >= no.escolhas.length) return null;
    return no.escolhas[index];
  }
}

module.exports = ArvoreDecisao;