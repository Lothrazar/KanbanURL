export class BudgetMeter {
  constructor(board) {
    this._board = board;
  }

  update() {
    const b64 = new URLSearchParams(location.search).get('d') || '';
    const len = b64.length;
    const pct = Math.min(100, (len / 8000) * 100);
    const cardCount = this._board.cards.length;

    $('budget-label').textContent = `${len.toLocaleString()} / 8,000 chars`;
    $('card-count-label').textContent = `${cardCount} card${cardCount !== 1 ? 's' : ''}`;
    const fill = $('budget-fill');
    fill.style.width = pct + '%';
    const cls = pct < 60 ? 'budget-ok' : pct < 85 ? 'budget-warn' : 'budget-danger';
    fill.classList.remove('budget-ok', 'budget-warn', 'budget-danger');
    fill.classList.add(cls);
  }
}
