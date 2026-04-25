//  Settings persistence & UI ─

const SETTINGS_LS_KEY = 'kanban_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved.cardNameLimit === 'number') settings.cardNameLimit = saved.cardNameLimit;
    if (saved.theme) settings.theme = saved.theme;
    if (saved.colColors) Object.assign(settings.colColors, saved.colColors);
  } catch (e) {}
}

function persistSettings() {
  try { localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings)); } catch (e) {}
}

function applySettings() {
  const root = document.documentElement;
  root.style.setProperty('--col-blocked',    settings.colColors.blocked);
  root.style.setProperty('--col-todo',       settings.colColors.todo);
  root.style.setProperty('--col-inprogress', settings.colColors.inprogress);
  root.style.setProperty('--col-done',       settings.colColors.done);
  applyTheme();
}

function applyTheme() {
  let t = settings.theme;
  if (t === 'system') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (settings.theme === 'system') applyTheme();
});

let _settingsSnap = null;

function openSettings() {
  _settingsSnap = JSON.parse(JSON.stringify(settings));
  _populateSettingsForm();
  document.getElementById('settings-overlay').classList.add('open');
}

function closeSettings(revert) {
  if (revert && _settingsSnap) {
    settings = _settingsSnap;
    applySettings();
  }
  _settingsSnap = null;
  document.getElementById('settings-overlay').classList.remove('open');
}

function saveSettings() {
  const limit = parseInt(document.getElementById('st-limit').value, 10);
  if (!isNaN(limit) && limit >= 5 && limit <= 100) settings.cardNameLimit = limit;

  const checked = document.querySelector('input[name="st-theme"]:checked');
  if (checked) settings.theme = checked.value;

  settings.colColors.blocked    = document.getElementById('st-col-0').value;
  settings.colColors.todo       = document.getElementById('st-col-1').value;
  settings.colColors.inprogress = document.getElementById('st-col-2').value;
  settings.colColors.done       = document.getElementById('st-col-3').value;

  applySettings();
  persistSettings();
  _settingsSnap = null;
  document.getElementById('settings-overlay').classList.remove('open');
}

function resetSettingsDefaults() {
  settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  applySettings();
  _populateSettingsForm();
}

function _populateSettingsForm() {
  document.getElementById('st-limit').value = settings.cardNameLimit;

  document.querySelectorAll('input[name="st-theme"]').forEach(r => {
    const active = r.value === settings.theme;
    r.checked = active;
    r.closest('.theme-opt').classList.toggle('sel', active);
  });

  document.getElementById('st-col-0').value = settings.colColors.blocked;
  document.getElementById('st-col-1').value = settings.colColors.todo;
  document.getElementById('st-col-2').value = settings.colColors.inprogress;
  document.getElementById('st-col-3').value = settings.colColors.done;
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('settings-overlay').classList.contains('open')) return;
  if (e.key === 'Escape') { e.stopPropagation(); closeSettings(true); }
});
