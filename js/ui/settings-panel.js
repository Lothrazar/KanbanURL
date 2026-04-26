export class SettingsPanel {
  constructor(settings) {
    this._settings = settings;
    this._snap = null;
  }

  open() {
    this._snap = this._settings.snapshot();
    this._populateForm();
    $('settings-overlay').classList.add('open');
  }

  close(revert = false) {
    if (revert && this._snap) {
      this._settings.restoreSnapshot(this._snap);
      this._settings.apply();
    }
    this._snap = null;
    $('settings-overlay').classList.remove('open');
  }

  save() {
    const limit = parseInt($('st-limit').value, 10);
    if (!isNaN(limit) && limit >= 5 && limit <= 100) this._settings.cardNameLimit = limit;

    const checked = document.querySelector('input[name="st-theme"]:checked');
    if (checked) this._settings.theme = checked.value;

    this._settings.setColColor('blocked',    $('st-col-0').value);
    this._settings.setColColor('todo',       $('st-col-1').value);
    this._settings.setColColor('inprogress', $('st-col-2').value);
    this._settings.setColColor('done',       $('st-col-3').value);

    const celebKeys = Object.keys(this._settings.celebrations);
    const enabled = celebKeys.filter(k => $('st-celeb-' + k).checked);
    if (enabled.length > 0) {
      celebKeys.forEach(k => this._settings.setCelebration(k, enabled.includes(k)));
    }

    this._settings.apply();
    this._settings.persist();
    this._snap = null;
    $('settings-overlay').classList.remove('open');
  }

  isOpen() {
    return $('settings-overlay').classList.contains('open');
  }

  wireEvents() {
    document.querySelectorAll('.celeb-opt input').forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = [...document.querySelectorAll('.celeb-opt input')].filter(i => i.checked);
        if (allChecked.length === 0) cb.checked = true;
        cb.closest('.celeb-opt').classList.toggle('sel', cb.checked);
      });
    });

    document.addEventListener('keydown', e => {
      if (!this.isOpen()) return;
      if (e.key === 'Escape') { e.stopPropagation(); this.close(true); }
    });

    $('settings-btn').addEventListener('click', () => this.open());
    $('st-cancel').addEventListener('click', () => this.close(true));
    $('st-save').addEventListener('click', () => this.save());
    $('st-reset').addEventListener('click', () => {
      this._settings.reset();
      this._populateForm();
    });
    $('settings-overlay').addEventListener('click', e => {
      if (e.target === $('settings-overlay')) this.close(true);
    });

    const colKeys = ['blocked', 'todo', 'inprogress', 'done'];
    ['st-col-0', 'st-col-1', 'st-col-2', 'st-col-3'].forEach((id, i) => {
      $(id).addEventListener('input', e => {
        this._settings.setColColor(colKeys[i], e.target.value);
        this._settings.apply();
      });
    });

    document.querySelectorAll('input[name="st-theme"]').forEach(r => {
      r.addEventListener('change', () => {
        this._settings.theme = r.value;
        this._settings.applyTheme();
        document.querySelectorAll('.theme-opt').forEach(o => {
          o.classList.toggle('sel', o.querySelector('input').checked);
        });
      });
    });
  }

  _populateForm() {
    $('st-limit').value = this._settings.cardNameLimit;

    document.querySelectorAll('input[name="st-theme"]').forEach(r => {
      const active = r.value === this._settings.theme;
      r.checked = active;
      r.closest('.theme-opt').classList.toggle('sel', active);
    });

    $('st-col-0').value = this._settings.colColors.blocked;
    $('st-col-1').value = this._settings.colColors.todo;
    $('st-col-2').value = this._settings.colColors.inprogress;
    $('st-col-3').value = this._settings.colColors.done;

    Object.keys(this._settings.celebrations).forEach(k => {
      const cb  = $('st-celeb-' + k);
      const lbl = cb.closest('.celeb-opt');
      cb.checked = this._settings.celebrations[k];
      lbl.classList.toggle('sel', cb.checked);
    });
  }
}
