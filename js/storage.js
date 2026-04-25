//  URL encoding & budget ─
function u8ToB64(arr) {
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function saveToURL() {
  const json = JSON.stringify(state);
  const compressed = pako.deflate(json);
  let b64 = u8ToB64(compressed);
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  history.replaceState(null, '', '?d=' + b64);
  updateBudget(b64);
}

function loadFromURL() {
  const d = new URLSearchParams(location.search).get('d');
  if (!d) return;
  try {
    let b64 = d.replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - b64.length % 4) % 4);
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    state = JSON.parse(pako.inflate(bytes, { to: 'string' }));
  } catch (e) {
    console.warn('Could not load state from URL', e);
  }
}

function updateBudget(b64) {
  const len = (b64 || '').length;
  const pct = Math.min(100, (len / 8000) * 100);
  document.getElementById('budget-label').textContent =
    `${len.toLocaleString()} / 8,000 chars`;
  document.getElementById('card-count-label').textContent =
    `${state.cards.length} card${state.cards.length !== 1 ? 's' : ''}`;
  const fill = document.getElementById('budget-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 60 ? '#10b981' : pct < 85 ? '#f59e0b' : '#ef4444';
}
