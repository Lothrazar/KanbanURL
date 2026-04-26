import { Board } from './board.js';
import { Settings } from './settings.js';
import { Storage } from './storage.js';
import { CelebrationManager } from './celebrate.js';
import { Renderer } from './render.js';
import { Modal } from './modal.js';
import { EventBus } from './eventbus.js';

class App {
  constructor() {
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

    const saved = this.storage.loadFromURL();
    if (saved) this.board.loadFromData(saved);

    this.renderer.render();
    this.storage.updateBudget(
      new URLSearchParams(location.search).get('d') || '',
      this.board.cards.length
    );
  }

  _showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }
}

new App();
