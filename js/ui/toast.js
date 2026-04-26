export class Toast {
  show(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }
}
