import { COLS } from './board.js';

export class Renderer {
  constructor(board, settings, bus) {
    this._board = board;
    this._settings = settings;
    this._bus = bus;
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

    let dropBeforeId = null;
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';

    const getNearestCard = y => {
      const els = [...cardsEl.querySelectorAll('.card:not(.dragging)')];
      for (const c of els) {
        const { top, height } = c.getBoundingClientRect();
        if (y < top + height / 2) return c;
      }
      return null;
    };

    cardsEl.addEventListener('dragover', e => {
      e.preventDefault();
      cardsEl.classList.add('drag-over');
      const nearest = getNearestCard(e.clientY);
      dropBeforeId = nearest ? nearest.dataset.id : null;
      if (nearest) cardsEl.insertBefore(indicator, nearest);
      else cardsEl.appendChild(indicator);
    });

    cardsEl.addEventListener('dragleave', e => {
      if (!cardsEl.contains(e.relatedTarget)) {
        cardsEl.classList.remove('drag-over');
        indicator.remove();
        dropBeforeId = null;
      }
    });

    cardsEl.addEventListener('drop', e => {
      e.preventDefault();
      cardsEl.classList.remove('drag-over');
      indicator.remove();
      const id = e.dataTransfer.getData('cardId');
      const card = this._board.getCard(id);
      if (!card) return;
      const wasntDone = card.s !== 3;
      this._board.insertCard(id, col.id, dropBeforeId);
      if (col.id === 3 && wasntDone) this._bus.emit('card:celebrate');
      this._bus.emit('board:changed');
      dropBeforeId = null;
    });

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

    const acts = document.createElement('div');
    acts.className = 'card-actions';

    if (card.s === 0) {
      acts.appendChild(this._mkBtn('✏️', 'btn-edit', 'Edit card',    () => this._bus.emit('modal:open', card.i)));
      acts.appendChild(this._mkBtn('🗑',  'btn-del',  'Delete card', () => this._showDelPop(el)));
    } else if (card.s === 1 || card.s === 2) {
      acts.appendChild(this._mkBtn('⛔', 'btn-block', 'Block this task', () => this._moveCard(card.i, 0)));
      acts.appendChild(this._mkBtn('✏️', 'btn-edit',  'Edit card',       () => this._bus.emit('modal:open', card.i)));
      acts.appendChild(this._mkBtn('🗑',  'btn-del',  'Delete card',     () => this._showDelPop(el)));
      acts.appendChild(this._mkBtn('✅', 'btn-done',  'Mark as done',    () => this._moveCard(card.i, 3, true)));
    }

    foot.appendChild(acts);

    const dotsEl = document.createElement('div');
    dotsEl.className = 'size-dots';
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i < card.z ? ' on' : '');
      dotsEl.appendChild(d);
    }
    foot.appendChild(dotsEl);
    el.appendChild(foot);

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
    el.appendChild(pop);

    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('cardId', card.i);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));

    el.addEventListener('click', e => {
      if (e.target === el || e.target.classList.contains('card-name') || e.target.classList.contains('size-dots') || e.target.classList.contains('dot')) {
        el.focus();
      }
    });

    el.addEventListener('keydown', e => {
      if (e.target !== el) return;
      if (document.querySelector('.del-pop.open')) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const colCards = [...document.querySelectorAll(`.col-cards[data-col="${card.s}"] .card`)];
        const idx = colCards.indexOf(el);
        (e.key === 'ArrowUp' ? colCards[idx - 1] : colCards[idx + 1])?.focus();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        for (let col = card.s + dir; col >= 0 && col <= 3; col += dir) {
          const first = document.querySelector(`.col-cards[data-col="${col}"] .card`);
          if (first) { first.focus(); break; }
        }
        return;
      }

      if (card.s === 3) return;

      const id = card.i;
      if (e.key === 'e' || e.key === 'Enter') {
        e.preventDefault();
        this._bus.emit('modal:open', id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this._showDelPop(el);
      } else if (e.key === 'b' && card.s !== 0) {
        e.preventDefault();
        this._moveCard(id, 0);
      } else if (e.key === 'd' && (card.s === 1 || card.s === 2)) {
        e.preventDefault();
        this._moveCard(id, 3, true);
      }
    });

    return el;
  }

  _moveCard(id, toCol, celebrate = false) {
    this._board.moveCard(id, toCol);
    if (celebrate) this._bus.emit('card:celebrate');
    this._bus.emit('board:changed');
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
