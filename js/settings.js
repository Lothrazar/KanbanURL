// import { deepClone } from './polyfill.js';

const LS_KEY = 'kanban_settings';

const DEFAULT_SETTINGS = {
  cardNameLimit: 40,
  theme: 'dark',
  colColors: {
    blocked:    '#ef4444',
    todo:       '#6366f1',
    inprogress: '#f59e0b',
    done:       '#10b981',
  },
  celebrations: {
    confetti:      true,
    fireworks:     true,
    bubbles:       true,
    stars:         true,
    hearts:        true,
    rainbow:       true,
    shootingStars: true,
    balloons:      true,
  },
};

export class Settings {
  constructor() {
    this._data = deepClone(DEFAULT_SETTINGS);
    this._snap = null;
  }

  get cardNameLimit() { return this._data.cardNameLimit; }
  get theme()         { return this._data.theme; }
  get colColors()     { return this._data.colColors; }
  get celebrations()  { return this._data.celebrations; }

  load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.cardNameLimit === 'number') this._data.cardNameLimit = saved.cardNameLimit;
      if (saved.theme) this._data.theme = saved.theme;
      if (saved.colColors) Object.assign(this._data.colColors, saved.colColors);
      if (saved.celebrations) Object.assign(this._data.celebrations, saved.celebrations);
    } catch (e) {}
  }

  persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this._data)); } catch (e) {}
  }

  apply() {
    const root = document.documentElement;
    root.style.setProperty('--col-blocked',    this._data.colColors.blocked);
    root.style.setProperty('--col-todo',       this._data.colColors.todo);
    root.style.setProperty('--col-inprogress', this._data.colColors.inprogress);
    root.style.setProperty('--col-done',       this._data.colColors.done);
    this.applyTheme();
  }

  applyTheme() {
    let t = this._data.theme;
    if (t === 'system') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
  }

  reset() {
    this._data = deepClone(DEFAULT_SETTINGS);
    this.apply();
  }

  openPanel() {
    this._snap = JSON.stringify(this._data);
    this._populateForm();
    $('settings-overlay').classList.add('open');
  }

  closePanel(revert = false) {
    if (revert && this._snap) {
      this._data = JSON.parse(this._snap);
      this.apply();
    }
    this._snap = null;
    $('settings-overlay').classList.remove('open');
  }

  savePanel() {
    const limit = parseInt($('st-limit').value, 10);
    if (!isNaN(limit) && limit >= 5 && limit <= 100) this._data.cardNameLimit = limit;

    const checked = document.querySelector('input[name="st-theme"]:checked');
    if (checked) this._data.theme = checked.value;

    this._data.colColors.blocked    = $('st-col-0').value;
    this._data.colColors.todo       = $('st-col-1').value;
    this._data.colColors.inprogress = $('st-col-2').value;
    this._data.colColors.done       = $('st-col-3').value;

    const celebKeys = Object.keys(this._data.celebrations);
    const enabled = celebKeys.filter(k => $('st-celeb-' + k).checked);
    if (enabled.length > 0) {
      celebKeys.forEach(k => { this._data.celebrations[k] = enabled.includes(k); });
    }

    this.apply();
    this.persist();
    this._snap = null;
    $('settings-overlay').classList.remove('open');
  }

  isPanelOpen() {
    return $('settings-overlay').classList.contains('open');
  }

  wireEvents() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._data.theme === 'system') this.applyTheme();
    });

    document.querySelectorAll('.celeb-opt input').forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = [...document.querySelectorAll('.celeb-opt input')].filter(i => i.checked);
        if (allChecked.length === 0) cb.checked = true;
        cb.closest('.celeb-opt').classList.toggle('sel', cb.checked);
      });
    });

    document.addEventListener('keydown', e => {
      if (!this.isPanelOpen()) return;
      if (e.key === 'Escape') { e.stopPropagation(); this.closePanel(true); }
    });

    $('settings-btn').addEventListener('click', () => this.openPanel());
    $('st-cancel').addEventListener('click', () => this.closePanel(true));
    $('st-save').addEventListener('click', () => this.savePanel());
    $('st-reset').addEventListener('click', () => {
      this.reset();
      this._populateForm();
    });
    $('settings-overlay').addEventListener('click', e => {
      if (e.target === $('settings-overlay')) this.closePanel(true);
    });

    const colKeys = ['blocked', 'todo', 'inprogress', 'done'];
    ['st-col-0', 'st-col-1', 'st-col-2', 'st-col-3'].forEach((id, i) => {
      $(id).addEventListener('input', e => {
        this._data.colColors[colKeys[i]] = e.target.value;
        this.apply();
      });
    });

    document.querySelectorAll('input[name="st-theme"]').forEach(r => {
      r.addEventListener('change', () => {
        this._data.theme = r.value;
        this.applyTheme();
        document.querySelectorAll('.theme-opt').forEach(o => {
          o.classList.toggle('sel', o.querySelector('input').checked);
        });
      });
    });
  }

  _populateForm() {
    $('st-limit').value = this._data.cardNameLimit;

    document.querySelectorAll('input[name="st-theme"]').forEach(r => {
      const active = r.value === this._data.theme;
      r.checked = active;
      r.closest('.theme-opt').classList.toggle('sel', active);
    });

    $('st-col-0').value = this._data.colColors.blocked;
    $('st-col-1').value = this._data.colColors.todo;
    $('st-col-2').value = this._data.colColors.inprogress;
    $('st-col-3').value = this._data.colColors.done;

    Object.keys(this._data.celebrations).forEach(k => {
      const cb  = $('st-celeb-' + k);
      const lbl = cb.closest('.celeb-opt');
      cb.checked = this._data.celebrations[k];
      lbl.classList.toggle('sel', cb.checked);
    });
  }
}
