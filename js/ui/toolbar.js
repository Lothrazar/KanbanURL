export class Toolbar {
  constructor(board, storage, toast) {
    this._board = board;
    this._storage = storage;
    this._toast = toast;
  }

  wireEvents() {
    document.addEventListener('click', e => {
      if (!e.target.closest('#url-info-btn') && !e.target.closest('#url-info-tooltip')) {
        $('url-info-tooltip').setAttribute('hidden', '');
        $('url-info-btn').classList.remove('open');
      }
    });

    $('url-info-btn').addEventListener('click', e => {
      e.stopPropagation();
      const tooltip = $('url-info-tooltip');
      const open = tooltip.hasAttribute('hidden');
      tooltip.toggleAttribute('hidden', !open);
      $('url-info-btn').classList.toggle('open', open);
    });

    $('board-title').addEventListener('input', e => {
      this._board.title = e.target.value;
      this._storage.saveToURL(this._board);
    });

    $('new-board-btn').addEventListener('click', () => {
      window.open(location.origin + location.pathname, '_blank');
    });

    $('share-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(location.href)
        .then(() => this._toast.show('URL copied to clipboard!'))
        .catch(() => this._toast.show('Copy this URL: ' + location.href));
    });
  }
}
