export class Keyboard {
  constructor(board, bus, modal, settingsPanel) {
    this._board = board;
    this._bus = bus;
    this._modal = modal;
    this._settingsPanel = settingsPanel;
  }

  wireEvents() {
    document.addEventListener('keydown', e => this._onKeyDown(e));
    document.addEventListener('click', e => {
      if (!e.target.closest('.del-pop') && !e.target.closest('.btn-del')) {
        document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
      }
    });
  }

  _onKeyDown(e) {
    const openPop = document.querySelector('.del-pop.open');
    if (openPop) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        openPop.querySelector('.pop-yes').click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        openPop.classList.remove('open');
      }
      return;
    }

    const cardEl = document.activeElement;
    if (cardEl?.classList.contains('card')) {
      this._onCardKey(e, cardEl);
      return;
    }

    const tag = document.activeElement?.tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
    const modalOpen = this._modal.isOpen() || this._settingsPanel.isOpen();
    if (!inInput && !modalOpen && e.key === 'n') {
      e.preventDefault();
      this._bus.emit('modal:open', null, 1);
    }
  }

  _onCardKey(e, el) {
    const card = this._board.getCard(el.dataset.id);
    if (!card) return;

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

    if (e.key === 'e' || e.key === 'Enter') {
      e.preventDefault();
      this._bus.emit('modal:open', card.i);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this._showDelPop(el);
    } else if (e.key === 'b' && card.s !== 0) {
      e.preventDefault();
      this._board.moveCard(card.i, 0);
      this._bus.emit('board:changed');
    } else if (e.key === 'd' && (card.s === 1 || card.s === 2)) {
      e.preventDefault();
      this._board.moveCard(card.i, 3);
      this._bus.emit('card:celebrate');
      this._bus.emit('board:changed');
    }
  }

  _showDelPop(cardEl) {
    document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
    cardEl.querySelector('.del-pop').classList.add('open');
  }
}
