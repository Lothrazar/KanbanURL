export class Storage {
  saveToURL(board) {
    const json = JSON.stringify(board.toJSON());
    const compressed = pako.deflate(json);
    let b64 = this._u8ToB64(compressed);
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    history.replaceState(null, '', '?d=' + b64);
    this.updateBudget(b64, board.cards.length);
  }

  loadFromURL() {
    const d = new URLSearchParams(location.search).get('d');
    if (!d) return null;
    try {
      let b64 = d.replace(/-/g, '+').replace(/_/g, '/');
      b64 += '='.repeat((4 - b64.length % 4) % 4);
      const raw = atob(b64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      return JSON.parse(pako.inflate(bytes, { to: 'string' }));
    } catch (e) {
      console.warn('Could not load state from URL', e);
      return null;
    }
  }

  updateBudget(b64, cardCount) {
    const len = (b64 || '').length;
    const pct = Math.min(100, (len / 8000) * 100);
    $('budget-label').textContent =
      `${len.toLocaleString()} / 8,000 chars`;
    $('card-count-label').textContent =
      `${cardCount} card${cardCount !== 1 ? 's' : ''}`;
    const fill = $('budget-fill');
    fill.style.width = pct + '%';
    fill.style.background = pct < 60 ? '#10b981' : pct < 85 ? '#f59e0b' : '#ef4444';
  }

  saveToLocalStorage(board) {
    try {
      localStorage.setItem('kanbanurl_board', JSON.stringify({
        board: board.toJSON(),
        savedAt: Date.now()
      }));
    } catch(e) {}
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('kanbanurl_board');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) {
      return null;
    }
  }

  clearLocalStorage() {
    try { localStorage.removeItem('kanbanurl_board'); } catch(e) {}
  }

  _u8ToB64(arr) {
    let s = '';
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s);
  }
}
