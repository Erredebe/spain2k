# Cómo Agregar un Nivel

## 1. Crear JSON de nivel

Crear archivo en `src/config/levels/` siguiendo la forma de:

- `level-1.json`
- `level-2.json`
- `level-3.json`

Campos mínimos:

- `id`
- `displayNameEs`, `displayNameEn`
- `introEs`, `introEn`
- `musicKey`
- `backgroundStyle`
- `waves` (4-6 recomendado)
- `midEvent`
- `interactables`
- `hasBoss`

## 2. Registrar nivel

Editar `src/config/levels/index.ts` y añadir import + entrada en `LEVELS`.

## 3. Fondo y música

- Fondo: debe existir estilo en `LevelScene.buildBackground`.
- Música: `musicKey` válido para `AudioMixer` en `src/audio/audioMixer.ts`.

## 4. Oleadas

Cada `WaveDefinition` soporta:

- `maxConcurrent`
- múltiples grupos `spawns` con:
  - `enemyId`
  - `count`
  - `spawnDelayMs`
  - `spawnPoints`

`SpawnSystem` consume estos datos sin lógica hardcodeada de escena.

## 5. QA recomendado

- Validar flujo completo con `npm run dev`.
- Ejecutar `npm test` y `npm run build`.
- Revisar que el evento intermedio se dispara en la wave esperada.
