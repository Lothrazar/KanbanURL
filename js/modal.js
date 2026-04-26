import { COLS, SIZES } from './board.js';

export class Modal {
  constructor(board, settings, bus) {
    this._board = board;
    this._settings = settings;
    this._bus = bus;
    this._editingId = null;
    this._editingCol = 1;
  }

  open(id, defaultCol = 1) {
    this._opener = document.activeElement;
    this._editingId = id || null;
    const card = id ? this._board.getCard(id) : null;

    $('m-title').textContent = id ? 'Edit Card' : 'Add Card';
    $('m-save').textContent  = id ? 'Save Changes' : 'Save Card';

    const nameInput = $('m-name');
    nameInput.maxLength = this._settings.cardNameLimit;
    nameInput.value = card ? card.n : '';
    this._updateCharCount();

    this._editingCol = card !== null ? card.s : defaultCol;
    const colTag = $('m-col-tag');
    colTag.textContent = '' + COLS.find(c => c.id === this._editingCol).name;
    colTag.dataset.col = this._editingCol;
    document.querySelector('.modal').dataset.col = this._editingCol;

    const sizeRadios = $('size-radios');
    sizeRadios.innerHTML = '';
    sizeRadios.setAttribute('role', 'radiogroup');
    sizeRadios.setAttribute('aria-label', 'Size');
    const selSz = card ? card.z : 1;
    SIZES.forEach(sz => {
      const lbl = document.createElement('label');
      lbl.className = 'sz-rl' + (selSz === sz.v ? ' sel' : '');
      lbl.tabIndex = 0;
      lbl.innerHTML =
        `<input type="radio" name="m-sz" value="${sz.v}" tabindex="-1" ${selSz === sz.v ? 'checked' : ''}>` +
        sz.label;

      const select = () => {
        sizeRadios.querySelectorAll('.sz-rl').forEach(l => l.classList.remove('sel'));
        lbl.classList.add('sel');
        lbl.querySelector('input').checked = true;
      };

      lbl.querySelector('input').addEventListener('change', select);
      lbl.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(); }
      });
      sizeRadios.appendChild(lbl);
    });

    $('overlay').classList.add('open');
    nameInput.focus();
    nameInput.select();
  }

  close() {
    $('overlay').classList.remove('open');
    this._editingId = null;
    this._opener?.focus();
    this._opener = null;
  }

  save() {
    const name = $('m-name').value.trim();
    if (!name) { $('m-name').focus(); return; }
    if (!this._editingId && this._board.cards.length >= 70) {
      alert('Maximum 70 cards reached. Clear some cards to add more.');
      return;
    }
    const col = this._editingCol;
    const sz  = parseInt(document.querySelector('input[name="m-sz"]:checked')?.value ?? 0);

    if (this._editingId) {
      this._board.updateCard(this._editingId, name, sz, col);
    } else {
      this._board.addCard(name, col, sz);
    }

    this._bus.emit('board:changed');
    this.close();
  }

  isOpen() {
    return $('overlay').classList.contains('open');
  }

  wireEvents() {
    $('m-name').addEventListener('input', () => this._updateCharCount());
    $('m-cancel').addEventListener('click', () => this.close());
    $('m-save').addEventListener('click', () => this.save());
    $('overlay').addEventListener('click', e => {
      if (e.target === $('overlay')) this.close();
    });
    $('m-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.save();
    });
    document.addEventListener('keydown', e => {
      if (!this.isOpen()) return;
      if (e.key === 'Escape') { this.close(); return; }
      if (e.key === 'Tab') {
        const first = $('m-name');
        const last  = $('m-save');
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  _updateCharCount() {
    const len = $('m-name').value.length;
    const el = $('char-count');
    el.textContent = `${len} / ${this._settings.cardNameLimit}`;
    el.className = 'char-count' + (len >= this._settings.cardNameLimit - 2 ? ' warn' : '');
  }
}
