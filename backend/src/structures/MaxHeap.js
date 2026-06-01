class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(pista) {
    this.heap.push(pista);
    this._heapifyUp(this.heap.length - 1);
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._heapifyDown(0);
    }
    return max;
  }

  top3() {
    // cria cópia para não destruir o heap original
    const copia = new MaxHeap();
    copia.heap = [...this.heap];
    const resultado = [];
    for (let i = 0; i < 3 && copia.heap.length > 0; i++) {
      resultado.push(copia.extractMax());
    }
    return resultado;
  }

  size() {
    return this.heap.length;
  }

  _heapifyUp(i) {
    const pai = Math.floor((i - 1) / 2);
    if (i > 0 && this.heap[i].peso > this.heap[pai].peso) {
      [this.heap[i], this.heap[pai]] = [this.heap[pai], this.heap[i]];
      this._heapifyUp(pai);
    }
  }

  _heapifyDown(i) {
    const esq = 2 * i + 1;
    const dir = 2 * i + 2;
    let maior = i;

    if (esq < this.heap.length && this.heap[esq].peso > this.heap[maior].peso) maior = esq;
    if (dir < this.heap.length && this.heap[dir].peso > this.heap[maior].peso) maior = dir;

    if (maior !== i) {
      [this.heap[i], this.heap[maior]] = [this.heap[maior], this.heap[i]];
      this._heapifyDown(maior);
    }
  }
}

module.exports = MaxHeap;