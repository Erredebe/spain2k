# Cómo Agregar un Personaje

## 1. Definir datos base

Editar `src/config/characters.ts`:

- Nuevo `CharacterDefinition` con:
  - `id`
  - `displayName`
  - `archetype`
  - `stats`
  - `moveset` completo (`light-1`, `light-2`, `light-3`, `heavy`, `air`, `grab`, `throw`, `special`)
  - `animationStates` requeridos
  - `palette`

## 2. Registrar textura

Actualizar:

- `src/assets/manifest.ts` (`TEXTURE_KEYS.players` y `TEXTURE_INDEX`)
- `src/assets/textureFactory.ts` para generar la textura procedural nueva.

## 3. Habilitar selección

`src/scenes/CharacterSelectScene.ts` usa `PLAYABLE_CHARACTERS`.
Al añadirlo en config, aparece automáticamente en la selección.

## 4. Ajustar HUD y balance

- Revisar vida/daño en `stats`.
- Revisar ventanas de cancel/hitstop/juggle en `moveset`.

## 5. Testing recomendado

- Añadir o ajustar tests en:
  - `src/tests/combatMath.test.ts`
  - `src/tests/comboActivation.test.ts`
  - `src/tests/knockbackSystem.test.ts`
