//  Board & card rendering 
function render() {
  document.getElementById('board-title').value = state.title;

  const board = document.getElementById('board');
  board.innerHTML = '';

  COLS.forEach(col => {
    const colCards = state.cards.filter(c => c.s === col.id);

    const colEl = document.createElement('div');
    colEl.className = 'column';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'col-header';
    hdr.dataset.col = col.id;
    hdr.innerHTML =
      `<div class="col-pip"></div>` +
      `<span class="col-name">${col.name}</span>` +
      `<span class="col-count">${colCards.length}</span>` +
      (col.id === 3 ? `<button class="clear-done-btn" title="Delete all done cards">Clear done</button>` : '');
    colEl.appendChild(hdr);

    if (col.id === 3) {
      hdr.querySelector('.clear-done-btn').addEventListener('click', () => {
        state.cards = state.cards.filter(c => c.s !== 3);
        saveToURL();
        render();
      });
    }

    // Cards
    const cardsEl = document.createElement('div');
    cardsEl.className = 'col-cards';
    cardsEl.dataset.col = col.id;
    colCards.forEach(card => cardsEl.appendChild(buildCard(card)));

    cardsEl.addEventListener('dragover', e => { e.preventDefault(); cardsEl.classList.add('drag-over'); });
    cardsEl.addEventListener('dragleave', () => cardsEl.classList.remove('drag-over'));
    cardsEl.addEventListener('drop', e => {
      e.preventDefault();
      cardsEl.classList.remove('drag-over');
      const id = e.dataTransfer.getData('cardId');
      const card = state.cards.find(c => c.i === id);
      if (card && card.s !== col.id) {
        const wasntDone = card.s !== 3;
        card.s = col.id;
        if (col.id === 3 && wasntDone) celebrate();
        saveToURL();
        render();
      }
    });

    colEl.appendChild(cardsEl);

    // Add card button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-card-btn';
    addBtn.innerHTML = '<span>+</span> Add card';
    addBtn.addEventListener('click', () => openModal(null, col.id));
    colEl.appendChild(addBtn);

    board.appendChild(colEl);
  });
}

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.i;

  // Name
  const nm = document.createElement('div');
  nm.className = 'card-name';
  nm.textContent = card.n;
  el.appendChild(nm);

  // Footer
  const foot = document.createElement('div');
  foot.className = 'card-footer';

  // Action buttons by column
  const acts = document.createElement('div');
  acts.className = 'card-actions';

  if (card.s === 0) {
    // Blocked: edit, delete
    acts.appendChild(mkBtn('✏️', 'btn-edit', 'Edit card',    ()  => openModal(card.i)));
    acts.appendChild(mkBtn('🗑',  'btn-del',  'Delete card', (e) => showDelPop(el)));
  } else if (card.s === 1 || card.s === 2) {
    // To Do / In Progress: block, edit, delete, done
    acts.appendChild(mkBtn('⬅️', 'btn-block', 'Block this task', () => moveCard(card.i, 0)));
    acts.appendChild(mkBtn('✏️', 'btn-edit',  'Edit card',       ()  => openModal(card.i)));
    acts.appendChild(mkBtn('🗑',  'btn-del',  'Delete card',     ()  => showDelPop(el)));
    acts.appendChild(mkBtn('✅', 'btn-done',  'Mark as done',    ()  => moveCard(card.i, 3, true)));
  }
  // Done column: no buttons

  foot.appendChild(acts);

  // Size dots
  const dotsEl = document.createElement('div');
  dotsEl.className = 'size-dots';
  const bright = card.z === 4;
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < (card.z || 0) ? (' on' + (bright ? ' bright' : '')) : '');
    dotsEl.appendChild(d);
  }
  foot.appendChild(dotsEl);
  el.appendChild(foot);

  // Delete popover
  const pop = document.createElement('div');
  pop.className = 'del-pop';
  pop.innerHTML =
    `<span>Delete?</span>` +
    `<button class="pop-yes">Yes</button>` +
    `<button class="pop-no">No</button>`;
  pop.querySelector('.pop-yes').addEventListener('click', e => {
    e.stopPropagation();
    state.cards = state.cards.filter(c => c.i !== card.i);
    saveToURL();
    render();
  });
  pop.querySelector('.pop-no').addEventListener('click', e => {
    e.stopPropagation();
    pop.classList.remove('open');
  });
  el.appendChild(pop);

  // Drag
  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('cardId', card.i);
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));

  return el;
}

function mkBtn(icon, cls, title, handler) {
  const b = document.createElement('button');
  b.className = 'card-btn ' + cls;
  b.title = title;
  b.textContent = icon;
  b.addEventListener('click', e => { e.stopPropagation(); handler(e); });
  return b;
}

function showDelPop(cardEl) {
  document.querySelectorAll('.del-pop.open').forEach(p => p.classList.remove('open'));
  cardEl.querySelector('.del-pop').classList.add('open');
}

function moveCard(id, toCol, doFete = false) {
  const card = state.cards.find(c => c.i === id);
  if (!card) return;
  card.s = toCol;
  if (doFete) celebrate();
  saveToURL();
  render();
}
