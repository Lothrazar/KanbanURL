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

// Board title
document.getElementById('board-title').addEventListener('input', e => {
  state.title = e.target.value;
  saveToURL();
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

// Init
loadFromURL();
render();
updateBudget(new URLSearchParams(location.search).get('d') || '');
