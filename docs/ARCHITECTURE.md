# SPAIN 2K Architecture

## Core Rules

- ECS with `bitecs`.
- Scenes do not contain gameplay rules.
- Gameplay runs through systems + typed event bus.
- Asset loading is manifest-driven and fail-fast.

## Folder Structure

```text
src/
  core/
    engine/
    ecs/
    events/
  scenes/
  entities/
  components/
  systems/
  config/
  ui/
  audio/
  assets/
  utils/
```

## Frame Order

1. `SpawnSystem`
2. `InputSystem`
3. `AISystem`
4. `MovementSystem`
5. `CollisionSystem`
6. `CombatSystem`
7. `AnimationSystem`
8. `ParticleSystem`
9. `AudioSystem`
10. `UISystem`
11. `RenderSystem`

## ECS Runtime

- Context builder: `src/core/ecs/world.ts`
- Scheduler: `src/core/ecs/scheduler.ts`
- Event bus: `src/core/events/eventBus.ts`
- Runtime stores:
  - `animationRuntime` (state/clip/frame cursor by entity)
  - `inputAssignments` (active device by player, gamepad preference, last input timestamp)

## Scene Responsibilities

- `BootScene`: boot handoff.
- `PreloadScene`: loads manifest assets and fails if any required key is missing.
- `TitleScene`: title UX and session toggles.
- `CharacterSelectScene`: 1P/2P character selection.
- `LevelScene`: level orchestration, camera, ECS scheduler.
- `ResultScene`: result + credits.

## Asset Runtime

- Manifest: `src/assets/manifest.ts`
- Validation helpers: `src/assets/validation.ts`
- Audio runtime: `src/audio/audioManager.ts` (`howler`)
- Versioned files served from `public/assets/**`.
- Entity animation source of truth:
  - `src/config/animations/index.ts`
  - atlas: `public/assets/atlases/entities-anim/entities-anim.(png|json)`

## Persistence

- `localStorage`:
  - checkpoint by level
  - locale
  - accessibility settings
  - control mapping
  - input settings (`deadzone`, vibration, last active device per player)

## Performance Practices

- View culling in `RenderSystem`
- Particle object pooling
- Spawn concurrency limits
- Centralized hitstop handling
