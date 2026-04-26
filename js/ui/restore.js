export class RestoreBanner {
  constructor(board, storage, renderer, budgetMeter) {
    this._board = board;
    this._storage = storage;
    this._renderer = renderer;
    this._budgetMeter = budgetMeter;
    this._data = null;
  }

  wireEvents() {
    $('restore-btn').addEventListener('click', () => {
      if (!this._data) return;
      this._board.loadFromData(this._data);
      this._storage.saveToURL(this._board);
      this._storage.clearLocalStorage();
      this.hide();
      this._renderer.render();
      this._budgetMeter.update();
    });

    $('restore-dismiss').addEventListener('click', () => {
      this._storage.clearLocalStorage();
      this.hide();
    });
  }

  show(savedAt, boardData, blankSlate) {
    this._data = boardData;
    $('restore-banner-msg').textContent = blankSlate
      ? `You have a previously saved board from ${this._formatTimeAgo(savedAt)}.`
      : `You have unsaved changes from ${this._formatTimeAgo(savedAt)} — restore to continue where you left off.`;
    $('restore-btn').textContent     = blankSlate ? 'Open it'     : 'Restore changes';
    $('restore-dismiss').textContent = blankSlate ? 'Start fresh' : 'Dismiss';
    $('restore-banner').removeAttribute('hidden');
  }

  hide() {
    if (!this._data) return;
    this._data = null;
    $('restore-banner').setAttribute('hidden', '');
    $('restore-btn').textContent     = 'Restore changes';
    $('restore-dismiss').textContent = 'Dismiss';
  }

  _formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}
