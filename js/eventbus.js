export class EventBus {
  constructor() {
    this._map = {};
  }

  on(event, fn) {
    if (!this._map[event]) this._map[event] = [];
    this._map[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this._map[event] = (this._map[event] || []).filter(f => f !== fn);
  }

  emit(event, ...args) {
    (this._map[event] || []).slice().forEach(fn => fn(...args));
  }
}
