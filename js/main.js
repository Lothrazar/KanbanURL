import { Board } from './board.js';
import { Settings } from './settings.js';
import { Storage } from './storage.js';
import { CelebrationManager } from './celebrate.js';
import { Renderer } from './render.js';
import { Modal } from './modal.js';
import { EventBus } from './eventbus.js';

class App {
  constructor() {
    this._restoreData = null;
    this._restoreBannerIsBlankSlate = false;
    this.bus          = new EventBus();
    this.board        = new Board();
    this.settings     = new Settings();
    this.storage      = new Storage();
    this.celebrations = new CelebrationManager(this.settings);
    this.renderer     = new Renderer(this.board, this.settings, this.bus);
    this.modal        = new Modal(this.board, this.settings, this.bus);

    this._wireEvents();
    this._init();
  }

  _wireEvents() {
    this.bus.on('board:changed', () => {
      this.storage.saveToURL(this.board);
      this.storage.saveToLocalStorage(this.board);
      if (this._restoreData) this._hideRestoreBanner();
      this.renderer.render();
    });
    this.bus.on('card:celebrate', () => this.celebrations.celebrate());
    this.bus.on('modal:open', (id, col) => this.modal.open(id, col));

    this.modal.wireEvents();
    this.settings.wireEvents();

    document.addEventListener('click', e => {
      if (!e.target.closest('.del-pop') && !e.target.closest('.btn-del')) {
        document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
      }
      if (!e.target.closest('#url-info-btn') && !e.target.closest('#url-info-tooltip')) {
        $('url-info-tooltip').setAttribute('hidden', '');
        $('url-info-btn').classList.remove('open');
      }
    });

    document.addEventListener('keydown', e => {
      const openPop = document.querySelector('.del-pop.open');
      if (!openPop) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        openPop.querySelector('.pop-yes').click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        openPop.classList.remove('open');
      }
    });

    $('url-info-btn').addEventListener('click', e => {
      e.stopPropagation();
      const tooltip = $('url-info-tooltip');
      const open = tooltip.hasAttribute('hidden');
      tooltip.toggleAttribute('hidden', !open);
      $('url-info-btn').classList.toggle('open', open);
    });

    $('restore-btn').addEventListener('click', () => {
      if (!this._restoreData) return;
      this.board.loadFromData(this._restoreData);
      this.storage.saveToURL(this.board);
      this.storage.clearLocalStorage();
      this._hideRestoreBanner();
      this.renderer.render();
      this.storage.updateBudget(
        new URLSearchParams(location.search).get('d') || '',
        this.board.cards.length
      );
    });

    $('restore-dismiss').addEventListener('click', () => {
      this.storage.clearLocalStorage();
      this._hideRestoreBanner();
    });

    $('board-title').addEventListener('input', e => {
      this.board.title = e.target.value;
      this.storage.saveToURL(this.board);
    });

    $('new-board-btn').addEventListener('click', () => {
      window.open(location.origin + location.pathname, '_blank');
    });

    $('share-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(location.href)
        .then(() => this._showToast('URL copied to clipboard!'))
        .catch(() => this._showToast('Copy this URL: ' + location.href));
    });
  }

  _init() {
    this.settings.load();
    this.settings.apply();

    const urlData   = this.storage.loadFromURL();
    const localData = this.storage.loadFromLocalStorage();

    if (urlData) {
      this.board.loadFromData(urlData);
      if (localData && JSON.stringify(urlData) !== JSON.stringify(localData.board)) {
        this._showRestoreBanner(localData.savedAt, localData.board, false);
      }
    } else if (localData) {
      this._showRestoreBanner(localData.savedAt, localData.board, true);
    }

    this.renderer.render();
    this.storage.updateBudget(
      new URLSearchParams(location.search).get('d') || '',
      this.board.cards.length
    );
  }

  _showRestoreBanner(savedAt, boardData, blankSlate) {
    this._restoreData = boardData;
    this._restoreBannerIsBlankSlate = blankSlate;
    $('restore-banner-msg').textContent = blankSlate
      ? `You have a previously saved board from ${this._formatTimeAgo(savedAt)}.`
      : `You have unsaved changes from ${this._formatTimeAgo(savedAt)} — restore to continue where you left off.`;
    $('restore-btn').textContent     = blankSlate ? 'Open it'     : 'Restore changes';
    $('restore-dismiss').textContent = blankSlate ? 'Start fresh' : 'Dismiss';
    $('restore-banner').removeAttribute('hidden');
  }

  _hideRestoreBanner() {
    $('restore-banner').setAttribute('hidden', '');
    $('restore-btn').textContent     = 'Restore changes';
    $('restore-dismiss').textContent = 'Dismiss';
    this._restoreData = null;
    this._restoreBannerIsBlankSlate = false;
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

  _showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }
}

new App();
