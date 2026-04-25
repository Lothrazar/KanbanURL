//  Add / Edit card modal ─
function openModal(id, defaultCol = 1) {
  editingId = id || null;
  const card = id ? state.cards.find(c => c.i === id) : null;

  document.getElementById('m-title').textContent = id ? 'Edit Card' : 'Add Card';
  document.getElementById('m-save').textContent  = id ? 'Save Changes' : 'Save Card';

  const nameInput = document.getElementById('m-name');
  nameInput.value = card ? card.n : '';
  updateCharCount();

  // Column radios
  const colRadios = document.getElementById('col-radios');
  colRadios.innerHTML = '';
  colRadios.setAttribute('role', 'radiogroup');
  colRadios.setAttribute('aria-label', 'Column');
  const selCol = card !== null ? card.s : defaultCol;
  COLS.forEach(col => {
    const lbl = document.createElement('label');
    lbl.className = 'col-rl' + (selCol === col.id ? ' sel' : '');
    lbl.dataset.col = col.id;
    lbl.innerHTML =
      `<input type="radio" name="m-col" value="${col.id}" ${selCol === col.id ? 'checked' : ''}>` +
      `<div class="rl-dot"></div>${col.name}`;
    lbl.querySelector('input').addEventListener('change', () => {
      colRadios.querySelectorAll('.col-rl').forEach(l => l.classList.remove('sel'));
      lbl.classList.add('sel');
    });
    colRadios.appendChild(lbl);
  });

  // Size radios
  const sizeRadios = document.getElementById('size-radios');
  sizeRadios.innerHTML = '';
  sizeRadios.setAttribute('role', 'radiogroup');
  sizeRadios.setAttribute('aria-label', 'Size');
  const selSz = card ? card.z : 0;
  SIZES.forEach(sz => {
    const lbl = document.createElement('label');
    lbl.className = 'sz-rl' + (selSz === sz.v ? ' sel' : '');
    lbl.innerHTML =
      `<input type="radio" name="m-sz" value="${sz.v}" ${selSz === sz.v ? 'checked' : ''}>` +
      sz.label;
    lbl.querySelector('input').addEventListener('change', () => {
      sizeRadios.querySelectorAll('.sz-rl').forEach(l => l.classList.remove('sel'));
      lbl.classList.add('sel');
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
  const col = parseInt(document.querySelector('input[name="m-col"]:checked')?.value ?? 1);
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
  el.textContent = `${len} / 20`;
  el.className = 'char-count' + (len >= 18 ? ' warn' : '');
}
