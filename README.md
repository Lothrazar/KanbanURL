# KanbanURL

A zero-backend Kanban board where the entire board state lives in the URL. No server, no database, no login — share the URL, share the board.

## How it works

Board state (title + cards) is serialised to JSON, compressed with [pako](https://github.com/nodeca/pako), and Base64URL-encoded into the `?d=` query parameter. Every change calls `history.replaceState()` so the URL stays in sync. Copy the URL to share or bookmark a board exactly as it is.

```
JSON → pako.deflate → Uint8Array → btoa → Base64URL → ?d=BLOB
```

The board title is part of the URL state and travels with the board when shared. Settings (theme, colors, card limit) are separate and stored in `localStorage` under `kanban_settings` — they are per-device and do not affect the shared URL.

## Features

- 4 columns: **Blocked · To Do · In Progress · Done**
- Add / edit / delete cards with inline confirmation
- Drag cards between columns
- Per-card actions appear on hover (block, edit, delete, mark done)
- Marking a card done triggers a random celebration animation (confetti, fireworks, bubbles, stars, hearts, rainbow)
- Card size indicator: None / Tiny / Small / Medium / Large (shown as filled dots)
- Editable board title (encoded in the URL)
- "Share Board" button copies the current URL to your clipboard
- URL budget meter in the footer (green → amber → red, target 8,000 chars)
- Hard cap of 70 cards per board
- **Settings panel** (gear icon, footer bottom-right):
  - Light / Dark / System theme
  - Custom color for each column
  - Card name character limit (5–100, default 20)
  - Settings are per-device (`localStorage`) and do not affect shared URLs

## Running locally

It's a static site with no build step. Either:

```bash
npx serve .
# or
python -m http.server
```

…or just open `index.html` in a browser.

## Project layout

```
index.html        markup + script tags
css/
  base.css        reset, variables, header, footer
  board.css       board, columns, cards
  modal.css       add/edit modal + settings modal
  effects.css     delete popover, canvas, toast
js/
  state.js        state object, constants, settings defaults
  storage.js      URL encoding, budget meter
  settings.js     settings load/persist/apply, settings modal UI
  render.js       board / card rendering
  modal.js        add/edit modal logic
  celebrate.js    canvas animations
  main.js         event wiring & init
PLAN.md           full spec, data model, roadmap
```

Plain `<script>` tags — no bundler, no modules. Load order matters and is set in `index.html`.

## Data model

State is a plain JS object. Keys are short to keep the URL compact.

```json
{
  "title": "My Project",
  "cards": [
    { "i": "a1b2c3", "n": "Task name", "z": 2, "s": 1 }
  ]
}
```

| Key | Field    | Values                                     |
|-----|----------|--------------------------------------------|
| `i` | id       | random base-36, 6 chars                    |
| `n` | name     | string, max N chars (configurable, default 20) |
| `z` | size     | 0=None, 1=Tiny, 2=Small, 3=Medium, 4=Large |
| `s` | status   | 0=Blocked, 1=To Do, 2=In Progress, 3=Done  |

## Decoding a board URL manually

In DevTools:

```js
const blob = new URLSearchParams(location.search).get('d');
const b64 = blob.replace(/-/g, '+').replace(/_/g, '/');
JSON.parse(pako.inflate(atob(b64), { to: 'string' }));
```

## Dependencies

- [pako](https://github.com/nodeca/pako) `2.1.0` (loaded from jsDelivr CDN) — zlib deflate/inflate
