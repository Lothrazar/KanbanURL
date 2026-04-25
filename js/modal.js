//  Add / Edit card modal ─
function openModal(id, defaultCol = 1) {
  editingId = id || null;
  const card = id ? state.cards.find(c => c.i === id) : null;

  document.getElementById('m-title').textContent = id ? 'Edit Card' : 'Add Card';
  document.getElementById('m-save').textContent  = id ? 'Save Changes' : 'Save Card';

  const nameInput = document.getElementById('m-name');
  nameInput.maxLength = settings.cardNameLimit;
  nameInput.value = card ? card.n : '';
  updateCharCount();

  // Column (read-only — derived from origin, shown as tag in header)
  editingCol = card !== null ? card.s : defaultCol;
  const colTag = document.getElementById('m-col-tag');
  colTag.textContent = '' + COLS.find(c => c.id === editingCol).name;
  colTag.dataset.col = editingCol;
  document.querySelector('.modal').dataset.col = editingCol;

  // Size radios
  const sizeRadios = document.getElementById('size-radios');
  sizeRadios.innerHTML = '';
  sizeRadios.setAttribute('role', 'radiogroup');
  sizeRadios.setAttribute('aria-label', 'Size');
  const selSz = card ? card.z : 1;
  SIZES.forEach(sz => {
    const lbl = document.createElement('label');
    lbl.className = 'sz-rl' + (selSz === sz.v ? ' sel' : '');
    lbl.tabIndex = 0;
    lbl.innerHTML =
      `<input type="radio" name="m-sz" value="${sz.v}" tabindex="-1" ${selSz === sz.v ? 'checked' : ''}>` +
      sz.label;

    const select = () => {
      sizeRadios.querySelectorAll('.sz-rl').forEach(l => l.classList.remove('sel'));
      lbl.classList.add('sel');
      lbl.querySelector('input').checked = true;
    };

    lbl.querySelector('input').addEventListener('change', select);
    lbl.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(); }
    });
    sizeRadios.appendChild(lbl);
  });

  document.getElementById('overlay').classList.add('open');
  nameInput.focus();
  nameInput.select();
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
}

function saveModal() {
  const name = document.getElementById('m-name').value.trim();
  if (!name) { document.getElementById('m-name').focus(); return; }
  if (!editingId && state.cards.length >= 70) {
    alert('Maximum 70 cards reached. Clear some cards to add more.');
    return;
  }
  const col = editingCol;
  const sz  = parseInt(document.querySelector('input[name="m-sz"]:checked')?.value  ?? 0);

  if (editingId) {
    const card = state.cards.find(c => c.i === editingId);
    if (card) { card.n = name; card.z = sz; card.s = col; }
  } else {
    state.cards.push({ i: uid(), n: name, z: sz, s: col });
  }

  saveToURL();
  render();
  closeModal();
}

function updateCharCount() {
  const len = document.getElementById('m-name').value.length;
  const el = document.getElementById('char-count');
  el.textContent = `${len} / ${settings.cardNameLimit}`;
  el.className = 'char-count' + (len >= settings.cardNameLimit - 2 ? ' warn' : '');
}
