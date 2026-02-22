import { addComponent, addEntity, createWorld, defineQuery } from 'bitecs';
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../core/events/eventBus';
import {
  ActiveEntityComponent,
  HealthComponent,
  InteractableTag,
} from '../components';
import type { GameEcsContext } from '../systems/types';
import { LifecycleSystem } from '../systems/LifecycleSystem';

const activeQuery = defineQuery([ActiveEntityComponent]);

const createContext = (world: ReturnType<typeof createWorld>, entity: number): GameEcsContext => {
  const spriteDestroy = vi.fn();
  const shadowDestroy = vi.fn();

  addComponent(world, ActiveEntityComponent, entity);
  addComponent(world, InteractableTag, entity);
  addComponent(world, HealthComponent, entity);
  HealthComponent.isAlive[entity] = 0;
  HealthComponent.downUntilMs[entity] = 0;

  return {
    scene: {} as never,
    world,
    eventBus: new EventBus(),
    nowMs: 3000,
    deltaMs: 16,
    hitstopMs: 0,
    entitiesMeta: new Map([
      [
        entity,
        {
          renderKey: 'prop-crate',
          displayName: 'crate',
          isPlayer: false,
          isBoss: false,
          weight: 1,
        },
      ],
    ]),
    renderObjects: new Map([
      [
        entity,
        {
          id: 1,
          sprite: { destroy: spriteDestroy } as never,
          shadow: { destroy: shadowDestroy } as never,
          shadowBaseWidth: 10,
          shadowBaseHeight: 10,
          shadowOffsetY: 0,
        },
      ],
    ]),
    hitboxes: new Map([[entity, {} as never]]),
    hurtboxes: new Map([[entity, { offsetX: 0, offsetY: 0, width: 10, height: 10 }]]),
    inputBuffers: new Map([
      [
        entity,
        {
          last: {
            moveX: 0,
            moveY: 0,
            jumpPressed: false,
            lightPressed: false,
            heavyPressed: false,
            grabPressed: false,
            specialPressed: false,
            pausePressed: false,
          },
          queuedAttack: null,
        },
      ],
    ]),
    animationRuntime: new Map([
      [
        entity,
        {
          currentState: 'idle',
          clipId: 'test',
          frameCursor: 0,
          frameElapsedMs: 0,
          frameName: 'frame',
        },
      ],
    ]),
    activeAttacks: new Map([[entity, {} as never]]),
    pendingDestroy: new Map(),
    spawnRuntime: {
      currentWaveIndex: 0,
      pending: [],
      timeUntilNextSpawnMs: 0,
      levelComplete: false,
      bossSpawned: false,
      midEventTriggered: false,
    },
    levelRuntime: {
      levelIndex: 0,
      level: {} as never,
    },
    selectedCharacters: ['heavy-brawler', 'technical'],
    coopEnabled: false,
    locale: 'es',
    hud: {} as never,
    audio: {} as never,
    activeBossEntity: null,
    bossDefinition: {} as never,
    remapArmed: false,
    controls: {
      p1: { playerIndex: 1, bindings: [] },
      p2: { playerIndex: 2, bindings: [] },
    },
    inputSettings: {
      deadzone: 0.22,
      vibrationEnabled: false,
      lastDeviceByPlayer: {
        p1: 'keyboard',
        p2: 'keyboard',
      },
    },
    inputRuntime: {
      hasFocus: true,
      isVisible: true,
      awaitingFocusClick: false,
    },
    debug: {
      inputTrace: false,
    },
    inputAssignments: {
      1: {
        playerIndex: 1,
        preferredGamepadIndex: 0,
        activeDevice: 'keyboard',
        lastInputAtMs: 0,
      },
      2: {
        playerIndex: 2,
        preferredGamepadIndex: 1,
        activeDevice: 'keyboard',
        lastInputAtMs: 0,
      },
    },
    pendingHits: [],
  };
};

describe('lifecycle system', () => {
  it('destroys pending entities and clears runtime stores', () => {
    const world = createWorld();
    const entity = addEntity(world);
    const context = createContext(world, entity);

    LifecycleSystem(context);

    expect(context.pendingDestroy.size).toBe(0);
    expect(context.renderObjects.has(entity)).toBe(false);
    expect(context.entitiesMeta.has(entity)).toBe(false);
    expect(context.hitboxes.has(entity)).toBe(false);
    expect(context.hurtboxes.has(entity)).toBe(false);
    expect(context.inputBuffers.has(entity)).toBe(false);
    expect(context.animationRuntime.has(entity)).toBe(false);
    expect(context.activeAttacks.has(entity)).toBe(false);
    expect(activeQuery(context.world)).toHaveLength(0);
  });
});
