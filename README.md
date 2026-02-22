# SPAIN 2K

Modern 2D beat'em up built with TypeScript + Phaser 3 using ECS (`bitecs`), with 3 levels, 3 playable characters, local 2P co-op, and a 3-phase final boss.

## Stack

- TypeScript
- Phaser 3
- Vite
- Vitest
- ESLint
- Prettier
- bitecs
- howler

## Requirements

- Node.js 20+
- npm 10+

## Scripts

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
npm run assets:sync
npm run assets:atlas
npm run assets:verify
```

## Runtime Asset Policy

- No procedural textures/audio in production runtime.
- Runtime loads only versioned open assets from `public/assets/**`.
- Allowed licenses: `CC0` and `CC-BY`.
- Full legal traceability:
  - `src/config/licenses/assets-licenses.json`
  - `docs/ASSET_LICENSES.md`

## Playable Content

- Levels:
  - Night Market
  - Metro
  - Industrial Port (final boss)
- Characters:
  - Heavy Brawler (`Toro`)
  - Technical (`Navaja`)
  - Agile (`Chispa`)
- Enemy archetypes:
  - Brawler
  - Rusher
  - Tank
  - Armed
  - Ranged

## Architecture

- ECS gameplay in `src/components` + `src/systems`.
- Scenes in `src/scenes` orchestrate flow only.
- Typed domain event bus in `src/core/events`.

See `docs/ARCHITECTURE.md` for frame flow and system ordering.

## Controls

### Player 1

- Move: Arrow keys
- Jump: `Space`
- Light: `J`
- Heavy: `K`
- Grab: `H`
- Special: `L`
- Pause: `Esc`

### Player 2 (co-op)

- Move: `W A S D`
- Jump: `R`
- Light: `F`
- Heavy: `G`
- Grab: `T`
- Special: `Y`

### Quick remap

- In combat, `F1` swaps P1 `Light`/`Heavy` and persists to save data.

## Save Data

Progress and settings are stored in `localStorage`:
- level checkpoint
- locale (ES/EN)
- accessibility options
- control bindings

## Additional Docs

- `docs/ARCHITECTURE.md`
- `docs/ADD_CHARACTER.md`
- `docs/ADD_LEVEL.md`
- `docs/ASSET_LICENSES.md`
- `docs/QA_CHECKLIST.md`
