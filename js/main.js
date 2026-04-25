//  Top-level event wiring & init ─

// Modal listeners
document.getElementById('m-name').addEventListener('input', updateCharCount);
document.getElementById('m-cancel').addEventListener('click', closeModal);
document.getElementById('m-save').addEventListener('click', saveModal);
document.getElementById('overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('overlay')) closeModal();
});
document.getElementById('m-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveModal();
});
document.addEventListener('keydown', e => {
  if (!document.getElementById('overlay').classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const first = document.getElementById('m-name');
    const last  = document.getElementById('m-save');
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Dismiss delete popovers when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.del-pop') && !e.target.closest('.btn-del')) {
    document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
  }
});

// Delete popover keyboard: Enter = Yes, Escape = No
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

// Board title
document.getElementById('board-title').addEventListener('input', e => {
  state.title = e.target.value;
  saveToURL();
});

// New board button
document.getElementById('new-board-btn').addEventListener('click', () => {
  window.open(location.origin + location.pathname, '_blank');
});

// Share button
document.getElementById('share-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(location.href)
    .then(() => showToast('URL copied to clipboard!'))
    .catch(() => showToast('Copy this URL: ' + location.href));
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// Settings wiring
document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('st-cancel').addEventListener('click', () => closeSettings(true));
document.getElementById('st-save').addEventListener('click', saveSettings);
document.getElementById('st-reset').addEventListener('click', resetSettingsDefaults);
document.getElementById('settings-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('settings-overlay')) closeSettings(true);
});

// Live color preview while picker is open
const _colKeys = ['blocked', 'todo', 'inprogress', 'done'];
['st-col-0', 'st-col-1', 'st-col-2', 'st-col-3'].forEach((id, i) => {
  document.getElementById(id).addEventListener('input', e => {
    settings.colColors[_colKeys[i]] = e.target.value;
    applySettings();
  });
});

// Live theme preview
document.querySelectorAll('input[name="st-theme"]').forEach(r => {
  r.addEventListener('change', () => {
    settings.theme = r.value;
    applyTheme();
    document.querySelectorAll('.theme-opt').forEach(o => {
      o.classList.toggle('sel', o.querySelector('input').checked);
    });
  });
});

// Init
loadSettings();
applySettings();
loadFromURL();
render();
updateBudget(new URLSearchParams(location.search).get('d') || '');
