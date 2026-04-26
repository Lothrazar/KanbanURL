import { COLS } from '../core/board.js';
import { DragDrop } from '../interaction/dragdrop.js';

export class Renderer {
  constructor(board, bus) {
    this._board = board;
    this._bus = bus;
    this._dragDrop = new DragDrop(board, bus);
  }

  render() {
    $('board-title').value = this._board.title;
    const boardEl = $('board');
    boardEl.innerHTML = '';
    COLS.forEach(col => this._buildColumn(col, boardEl));
  }

  _buildColumn(col, boardEl) {
    const colCards = this._board.cards.filter(c => c.s === col.id);
    const colEl = document.createElement('div');
    colEl.className = 'column';

    const hdr = document.createElement('div');
    hdr.className = 'col-header';
    hdr.dataset.col = col.id;
    hdr.innerHTML =
      `<div class="col-pip"></div>` +
      `<span class="col-name">${col.name}</span>` +
      (col.id === 3 && colCards.length > 0
        ? `<button class="clear-done-btn" title="Delete all done cards" tabindex="-1">Clear done</button>`
        : '') +
      `<span class="col-count">${colCards.length}</span>`;
    colEl.appendChild(hdr);

    const clearBtn = hdr.querySelector('.clear-done-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this._board.clearDone();
        this._bus.emit('board:changed');
      });
    }

    const cardsEl = document.createElement('div');
    cardsEl.className = 'col-cards';
    cardsEl.dataset.col = col.id;
    colCards.forEach(card => cardsEl.appendChild(this._buildCard(card)));

    this._dragDrop.wireColumn(cardsEl, col.id);

    colEl.appendChild(cardsEl);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-card-btn';
    addBtn.tabIndex = col.id + 1;
    addBtn.innerHTML = '<span>+</span> Add card';
    addBtn.addEventListener('click', () => this._bus.emit('modal:open', null, col.id));
    colEl.appendChild(addBtn);

    boardEl.appendChild(colEl);
  }

  _buildCard(card) {
    const el = document.createElement('div');
    el.className = 'card';
    el.draggable = true;
    el.tabIndex = 0;
    el.dataset.id = card.i;

    const nm = document.createElement('div');
    nm.className = 'card-name';
    nm.textContent = card.n;
    el.appendChild(nm);

    const foot = document.createElement('div');
    foot.className = 'card-footer';
    foot.appendChild(this._buildActions(card, el));
    foot.appendChild(this._buildSizeDots(card));
    el.appendChild(foot);

    el.appendChild(this._buildDelPop(card));

    this._dragDrop.wireCard(el, card.i);

    el.addEventListener('click', e => {
      if (e.target === el || e.target.classList.contains('card-name') || e.target.classList.contains('size-dots') || e.target.classList.contains('dot')) {
        el.focus();
      }
    });

    return el;
  }

  _buildActions(card, el) {
    const acts = document.createElement('div');
    acts.className = 'card-actions';

    if (card.s === 0) {
      acts.appendChild(this._mkBtn('✏️', 'btn-edit', 'Edit card',    () => this._bus.emit('modal:open', card.i)));
      acts.appendChild(this._mkBtn('🗑',  'btn-del',  'Delete card', () => this._showDelPop(el)));
    } else if (card.s === 1 || card.s === 2) {
      acts.appendChild(this._mkBtn('⛔', 'btn-block', 'Block this task', () => { this._board.moveCard(card.i, 0); this._bus.emit('board:changed'); }));
      acts.appendChild(this._mkBtn('✏️', 'btn-edit',  'Edit card',       () => this._bus.emit('modal:open', card.i)));
      acts.appendChild(this._mkBtn('🗑',  'btn-del',  'Delete card',     () => this._showDelPop(el)));
      acts.appendChild(this._mkBtn('✅', 'btn-done',  'Mark as done',    () => { this._board.moveCard(card.i, 3); this._bus.emit('card:celebrate'); this._bus.emit('board:changed'); }));
    }

    return acts;
  }

  _buildSizeDots(card) {
    const dotsEl = document.createElement('div');
    dotsEl.className = 'size-dots';
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i < card.z ? ' on' : '');
      dotsEl.appendChild(d);
    }
    return dotsEl;
  }

  _buildDelPop(card) {
    const pop = document.createElement('div');
    pop.className = 'del-pop';
    pop.innerHTML =
      `<span>Delete?</span>` +
      `<button class="pop-yes">Yes</button>` +
      `<button class="pop-no">No</button>`;
    pop.querySelector('.pop-yes').addEventListener('click', e => {
      e.stopPropagation();
      this._board.removeCard(card.i);
      this._bus.emit('board:changed');
    });
    pop.querySelector('.pop-no').addEventListener('click', e => {
      e.stopPropagation();
      pop.classList.remove('open');
    });
    return pop;
  }

  _mkBtn(icon, cls, title, handler) {
    const b = document.createElement('button');
    b.className = 'card-btn ' + cls;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.tabIndex = -1;
    b.textContent = icon;
    b.addEventListener('click', e => { e.stopPropagation(); handler(e); });
    return b;
  }

  _showDelPop(cardEl) {
    document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
    cardEl.querySelector('.del-pop').classList.add('open');
  }
}
