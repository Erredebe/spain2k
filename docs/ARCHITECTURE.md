# Arquitectura SPAIN 2K

## Principios

- ECS con `bitecs`.
- Escenas sin lógica de combate.
- Event bus tipado para desacoplar UI/audio/gameplay.
- Sistema data-driven para niveles y oleadas.

## Estructura

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

## Flujo por frame

Orden fijo de sistemas:

1. SpawnSystem
2. InputSystem
3. AISystem
4. MovementSystem
5. CollisionSystem
6. CombatSystem
7. AnimationSystem
8. ParticleSystem
9. AudioSystem
10. UISystem
11. RenderSystem

## ECS Core

- Contexto ECS: `src/core/ecs/world.ts`
- Scheduler: `src/core/ecs/scheduler.ts`
- Event bus: `src/core/events/eventBus.ts`
- Eventos de dominio: `src/core/events/events.ts`

## Escenas

- `BootScene`: arranque.
- `PreloadScene`: generación de texturas HD procedurales.
- `TitleScene`: título animado y opciones base.
- `CharacterSelectScene`: selección de personaje 1P/2P.
- `LevelScene`: orquestación de nivel + ejecución ECS.
- `ResultScene`: victoria/derrota.

## Persistencia

- `localStorage`:
  - checkpoint por nivel
  - idioma
  - accesibilidad
  - remapeo de controles

## Optimización aplicada

- Culling en `RenderSystem`.
- Object pooling para partículas.
- Límite de spawn por oleada.
- Hitstop centralizado.
- Reutilización de render objects por entidad.
