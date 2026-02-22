# SPAIN 2K

Beat'em up 2D moderno en TypeScript + Phaser 3 con arquitectura ECS (`bitecs`), 3 niveles completos, 3 personajes jugables, coop local 2P, boss final multifase, HUD moderno y combate con hitboxes/hurtboxes desacoplados.

## Stack

- TypeScript
- Phaser 3
- Vite
- Vitest
- ESLint
- Prettier
- bitecs

## Requisitos

- Node.js 20+
- npm 10+

## Scripts

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

## Contenido jugable

- 3 niveles:
  - Mercado nocturno
  - Metro
  - Puerto industrial (boss final)
- 3 personajes:
  - Heavy Brawler (`Toro`)
  - Técnico (`Navaja`)
  - Ágil (`Chispa`)
- Enemigos:
  - Brawler
  - Rusher
  - Tank
  - Armed
  - Ranged
- Boss:
  - 3 fases con thresholds de vida al 60% y 30%
  - Dash agresivo, AoE y estado enrage

## Arquitectura ECS

- Componentes y sistemas en `src/components` y `src/systems`.
- Escenas (`src/scenes`) solo orquestan flujo y presentación.
- Lógica de gameplay vive en sistemas + event bus tipado.

Ver detalle en `docs/ARCHITECTURE.md`.

## Controles

### Player 1

- Mover: Flechas
- Jump: `Space`
- Light: `J`
- Heavy: `K`
- Grab: `H`
- Special: `L`
- Pause: `Esc`

### Player 2 (coop)

- Mover: `W A S D`
- Jump: `R`
- Light: `F`
- Heavy: `G`
- Grab: `T`
- Special: `Y`

### Remap rápido

- `F1` en combate intercambia `Light`/`Heavy` de P1 y guarda la configuración.

## Guardado

- Checkpoints por nivel en `localStorage`.
- Persisten idioma, personaje seleccionado, accesibilidad y controles.

## Accesibilidad

- Subtítulos
- Reducción de flashes/sacudidas
- HUD alto contraste
- HUD grande
- Remapeo de controles

## Assets y licencias

- Pipeline de assets procedural HD generado en runtime (sprites, fondos y audio).
- Registro de licencias:
  - `docs/ASSET_LICENSES.md`
  - `src/config/licenses/assets-licenses.json`

## Documentación adicional

- `docs/ARCHITECTURE.md`
- `docs/ADD_CHARACTER.md`
- `docs/ADD_LEVEL.md`
- `docs/ASSET_LICENSES.md`
- `docs/QA_CHECKLIST.md`
