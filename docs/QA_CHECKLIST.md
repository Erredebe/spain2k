# QA Checklist

## Build & Test

- [ ] `npm install` sin errores.
- [ ] `npm run dev` levanta correctamente.
- [ ] `npm run build` completa.
- [ ] `npm test` pasa.

## Gameplay

- [ ] Se puede completar campaña de 3 niveles.
- [ ] Los 3 personajes son seleccionables y jugables.
- [ ] Coop local 2P funciona.
- [ ] Boss final cambia de fase al 60% y 30% HP.

## Combate

- [ ] Hitboxes independientes del sprite.
- [ ] Hurtboxes dinámicas por estado.
- [ ] I-frames tras impacto.
- [ ] Hitstop perceptible (50-100ms).
- [ ] Screen shake en impactos.
- [ ] Combo counter por jugador.
- [ ] Special meter carga y consume al usar especial.
- [ ] Knockback / juggle / ground bounce operativos.

## UI/UX

- [ ] Pantalla título animada.
- [ ] Selector de personajes operativo.
- [ ] HUD moderno con barras animadas.
- [ ] Subtítulos y opciones accesibilidad activas.

## Audio

- [ ] Música única por nivel.
- [ ] SFX de pasos, impacto, UI.
- [ ] Ducking durante especial/hitstop.

## Datos y persistencia

- [ ] Checkpoint por nivel se guarda en localStorage.
- [ ] Remapeo rápido de controles se persiste.
- [ ] Idioma ES/EN se persiste.

## Legal

- [ ] `docs/ASSET_LICENSES.md` actualizado.
- [ ] `src/config/licenses/assets-licenses.json` actualizado.
