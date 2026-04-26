export class DragDrop {
  constructor(board, bus) {
    this._board = board;
    this._bus = bus;
  }

  wireColumn(cardsEl, colId) {
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
      this._board.insertCard(id, colId, dropBeforeId);
      if (colId === 3 && wasntDone) this._bus.emit('card:celebrate');
      this._bus.emit('board:changed');
      dropBeforeId = null;
    });
  }

  wireCard(el, cardId) {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('cardId', cardId);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  }
}
