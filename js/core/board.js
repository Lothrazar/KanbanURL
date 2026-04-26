export const COLS = [
  { id: 0, name: 'Blocked' },
  { id: 1, name: 'To Do' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'Done' },
];

export const SIZES = [
  { v: 0, label: 'Tiny' },
  { v: 1, label: 'Small' },
  { v: 2, label: 'Medium' },
  { v: 3, label: 'Large' },
];

const DEFAULT_NAME = 'My Project';

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

export class Card {
  constructor({ i, n, z, s } = {}) {
    this.i = i ?? uid();
    this.n = n ?? '';
    this.z = z ?? 1;
    this.s = s ?? 1;
  }
}

export class Board {
  constructor() {
    this.title = DEFAULT_NAME;
    this.cards = [];
  }

  addCard(name, col, size) {
    const card = new Card({ n: name, z: size, s: col });
    this.cards.push(card);
    return card;
  }

  removeCard(id) {
    this.cards = this.cards.filter(c => c.i !== id);
  }

  clearDone() {
    this.cards = this.cards.filter(c => c.s !== 3);
  }

  moveCard(id, toCol) {
    const card = this.cards.find(c => c.i === id);
    if (card) card.s = toCol;
    return card || null;
  }

  insertCard(id, toCol, beforeId) {
    const card = this.cards.find(c => c.i === id);
    if (!card) return null;
    card.s = toCol;
    this.cards = this.cards.filter(c => c.i !== id);
    if (beforeId == null) {
      this.cards.push(card);
    } else {
      const idx = this.cards.findIndex(c => c.i === beforeId);
      this.cards.splice(idx === -1 ? this.cards.length : idx, 0, card);
    }
    return card;
  }

  updateCard(id, name, size, col) {
    const card = this.cards.find(c => c.i === id);
    if (card) { card.n = name; card.z = size; card.s = col; }
    return card || null;
  }

  getCard(id) {
    return this.cards.find(c => c.i === id) || null;
  }

  loadFromData(data) {
    this.title = data.title || DEFAULT_NAME;
    this.cards = (data.cards || []).map(c => new Card(c));
  }

  toJSON() {
    return { title: this.title, cards: this.cards };
  }
}
