# KanbanURL

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Live page:** [lothrazar.github.io/GithubTools](https://lothrazar.github.io/KanbanURL)

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
- URL budget meter in the footer (green → amber → red) — see [URL length budget](#url-length-budget)
- Hard cap of 70 cards per board
- **Settings panel** (gear icon, footer bottom-right):
  - Light / Dark / System theme
  - Custom color for each column
  - Card name character limit (5–100, default 20)
  - Settings are per-device (`localStorage`) and do not affect shared URLs

## Running locally

It's a static site with no build step, but ES modules require a local server (browsers block `file://` imports). Either:

```bash
npx serve .
# or
python -m http.server
```

## Project layout

```
index.html        markup, loads js/app.js as an ES module
css/
  base.css        reset, variables, header, footer
  board.css       board, columns, cards
  modal.css       add/edit modal + settings modal
  effects.css     delete popover, canvas, toast
js/
  board.js          Card + Board classes, COLS/SIZES constants
  eventbus.js       lightweight EventBus (on/emit/off)
  settings.js       Settings class — load/persist/apply data
  settings-panel.js SettingsPanel class — settings overlay UI
  storage.js        Storage class — URL + localStorage persistence
  budget.js         BudgetMeter class — URL-size meter UI
  render.js         Renderer class — board/card DOM building
  dragdrop.js       DragDrop class — drag-and-drop wiring
  keyboard.js       Keyboard class — keyboard shortcuts
  modal.js          Modal class — add/edit card logic
  restore.js        RestoreBanner class — unsaved-changes banner
  toolbar.js        Toolbar class — header buttons + url-info
  toast.js          Toast class — transient toast notifications
  celebrate.js      Celebrations class — canvas animations
  app.js            App class — wires all classes together, entry point
  polyfill.js       deepClone shim + $ helper
PLAN.md           full spec, data model, roadmap
```

ES modules with a single `<script type="module" src="js/app.js">` entry point. No bundler required.

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
| `z` | size     | 0=Tiny, 1=Small, 2=Medium, 3=Large         |
| `s` | status   | 0=Blocked, 1=To Do, 2=In Progress, 3=Done  |

## URL length budget

The footer shows a live meter for the length of the `?d=` value (the Base64URL-encoded data blob), capped at 8,000 characters. This is a round estimate — the real limits depend on context:

| Constraint | Limit |
|---|---|
| nginx default (`large_client_header_buffers`) | 8,192 bytes — **full URL** |
| Apache default (`LimitRequestLine`) | 8,190 bytes — **full URL** |
| Modern browsers (Chrome, Firefox, Safari) | ~100 KB+ — not a practical concern |
| IE 11 | 2,083 bytes — full URL |

Because the full URL includes the protocol, host, path, and `?d=`, the data portion alone should stay under roughly **7,500–7,800 characters** to leave headroom against common server defaults. In practice the 70-card hard cap is hit long before the budget — a fully loaded board compresses to well under 2,000 characters.

8,000 chars of Base64 ≈ 6,000 bytes of compressed JSON. Base64 expands the compressed payload by ~33%.

## Decoding a board URL manually

In DevTools:

```js
const blob = new URLSearchParams(location.search).get('d');
const b64 = blob.replace(/-/g, '+').replace(/_/g, '/');
JSON.parse(pako.inflate(atob(b64), { to: 'string' }));
```

## Dependencies

- [pako](https://github.com/nodeca/pako) `2.1.0` (loaded from jsDelivr CDN) — zlib deflate/inflate
