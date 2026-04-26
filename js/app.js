import { Board } from './core/board.js';
import { EventBus } from './core/eventbus.js';
import { Settings } from './core/settings.js';
import { Storage } from './core/storage.js';
import { Celebrations } from './fx/celebrate.js';
import { Keyboard } from './interaction/keyboard.js';
import { BudgetMeter } from './ui/budget.js';
import { Modal } from './ui/modal.js';
import { Renderer } from './ui/render.js';
import { RestoreBanner } from './ui/restore.js';
import { SettingsPanel } from './ui/settings-panel.js';
import { Toast } from './ui/toast.js';
import { Toolbar } from './ui/toolbar.js';

class App {
  constructor() {
    this.bus           = new EventBus();
    this.board         = new Board();
    this.settings      = new Settings();
    this.settingsPanel = new SettingsPanel(this.settings);
    this.storage       = new Storage();
    this.celebrations  = new Celebrations(this.settings);
    this.renderer      = new Renderer(this.board, this.bus);
    this.modal         = new Modal(this.board, this.settings, this.bus);
    this.keyboard      = new Keyboard(this.board, this.bus, this.modal, this.settingsPanel);
    this.toast         = new Toast();
    this.budgetMeter   = new BudgetMeter(this.board);
    this.restoreBanner = new RestoreBanner(this.board, this.storage, this.renderer, this.budgetMeter);
    this.toolbar       = new Toolbar(this.board, this.storage, this.toast);

    this._init();
  }

  _wireEvents() {
    this._wireBusEvents();
    this.modal.wireEvents();
    this.settingsPanel.wireEvents();
    this.keyboard.wireEvents();
    this.restoreBanner.wireEvents();
    this.toolbar.wireEvents();
  }

  _wireBusEvents() {
    this.bus.on('board:changed', () => {
      const focusedId = document.activeElement?.dataset?.id;
      this.storage.saveToURL(this.board);
      this.storage.saveToLocalStorage(this.board);
      this.budgetMeter.update();
      this.restoreBanner.hide();
      this.renderer.render();
      if (focusedId) document.querySelector(`[data-id="${focusedId}"]`)?.focus();
    });
    this.bus.on('card:celebrate', () => this.celebrations.celebrate());
    this.bus.on('modal:open', (id, col) => this.modal.open(id, col));
  }

  _init() {
    this._wireEvents();
    this.settings.load();
    this.settings.apply();

    const urlData   = this.storage.loadFromURL();
    const localData = this.storage.loadFromLocalStorage();

    if (urlData) {
      this.board.loadFromData(urlData);
      if (localData && JSON.stringify(urlData) !== JSON.stringify(localData.board)) {
        this.restoreBanner.show(localData.savedAt, localData.board, false);
      }
    } else if (localData) {
      this.restoreBanner.show(localData.savedAt, localData.board, true);
    }

    this.renderer.render();
    this.budgetMeter.update();
  }
}

new App();
