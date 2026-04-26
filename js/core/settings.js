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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._data.theme === 'system') this.applyTheme();
    });
  }

  get cardNameLimit()  { return this._data.cardNameLimit; }
  set cardNameLimit(v) { this._data.cardNameLimit = v; }

  get theme()  { return this._data.theme; }
  set theme(v) { this._data.theme = v; }

  get colColors()    { return this._data.colColors; }
  get celebrations() { return this._data.celebrations; }

  setColColor(key, value)     { this._data.colColors[key] = value; }
  setCelebration(key, enabled) { this._data.celebrations[key] = enabled; }

  snapshot()             { return JSON.stringify(this._data); }
  restoreSnapshot(snap)  { this._data = JSON.parse(snap); }

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
}
