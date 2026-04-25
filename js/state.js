//  App state and constants ─
let state = { title: 'My Project', cards: [] };
let editingId = null;
let editingCol = 1;

const COLS = [
  { id: 0, name: 'Blocked',     color: '#ef4444' },
  { id: 1, name: 'To Do',       color: '#6366f1' },
  { id: 2, name: 'In Progress', color: '#f59e0b' },
  { id: 3, name: 'Done',        color: '#10b981' },
];

const SIZES = [
  { v: 0, label: 'Tiny' },
  { v: 1, label: 'Small' },
  { v: 2, label: 'Medium' },
  { v: 3, label: 'Large' },
];

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

let settings = {
  cardNameLimit: 20,
  theme: 'dark',
  colColors: {
    blocked:    '#ef4444',
    todo:       '#6366f1',
    inprogress: '#f59e0b',
    done:       '#10b981'
  },
  celebrations: {
    confetti:      true,
    fireworks:     true,
    bubbles:       true,
    stars:         true,
    hearts:        true,
    rainbow:       true,
    shootingStars: true,
  },
};

const DEFAULT_SETTINGS = {
  cardNameLimit: 20,
  theme: 'dark',
  colColors: {
    blocked:    '#ef4444',
    todo:       '#6366f1',
    inprogress: '#f59e0b',
    done:       '#10b981'
  },
  celebrations: {
    confetti:      true,
    fireworks:     true,
    bubbles:       true,
    stars:         true,
    hearts:        true,
    rainbow:       true,
    shootingStars: true,
  },
};
