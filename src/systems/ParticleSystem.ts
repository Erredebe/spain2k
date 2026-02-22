import type Phaser from 'phaser';
import { ObjectPool } from '../utils/objectPool';
import { TransformComponent } from '../components';
import type { SystemFn } from './types';

interface ParticleInstance {
  sprite: Phaser.GameObjects.Image;
  ttlMs: number;
  vx: number;
  vy: number;
}

interface ParticleRuntime {
  pool: ObjectPool<ParticleInstance>;
  active: Set<ParticleInstance>;
  initialized: boolean;
}

const runtimeByScene = new WeakMap<Phaser.Scene, ParticleRuntime>();

const ensureRuntime = (context: Parameters<SystemFn>[0]): ParticleRuntime => {
  const existing = runtimeByScene.get(context.scene);
  if (existing) {
    return existing;
  }
  const runtime: ParticleRuntime = {
    pool: new ObjectPool<ParticleInstance>(() => {
      const sprite = context.scene.add.image(0, 0, 'fx-impact').setVisible(false).setDepth(999);
      return { sprite, ttlMs: 0, vx: 0, vy: 0 };
    }, 28),
    active: new Set<ParticleInstance>(),
    initialized: false,
  };
  runtimeByScene.set(context.scene, runtime);
  return runtime;
};

const spawnImpact = (runtime: ParticleRuntime, target: number): void => {
  const particle = runtime.pool.acquire();
  const x = TransformComponent.x[target];
  const y = TransformComponent.y[target] - 60;
  particle.sprite
    .setPosition(x, y)
    .setVisible(true)
    .setScale(0.9 + Math.random() * 0.7)
    .setAlpha(1);
  particle.ttlMs = 240 + Math.random() * 140;
  particle.vx = (Math.random() - 0.5) * 50;
  particle.vy = -100 - Math.random() * 80;
  runtime.active.add(particle);
};

export const ParticleSystem: SystemFn = (context) => {
  const runtime = ensureRuntime(context);

  if (!runtime.initialized) {
    context.eventBus.on('combat:hit-registered', ({ defender, attackKind }) => {
      spawnImpact(runtime, defender);
      if (attackKind === 'special' || attackKind === 'boss-aoe') {
        for (let index = 0; index < 4; index += 1) {
          spawnImpact(runtime, defender);
        }
      }
    });
    context.eventBus.on('combat:entity-knockdown', ({ entity }) => {
      for (let index = 0; index < 3; index += 1) {
        spawnImpact(runtime, entity);
      }
    });
    runtime.initialized = true;
  }

  runtime.active.forEach((particle) => {
    particle.ttlMs -= context.deltaMs;
    particle.sprite.x += (particle.vx * context.deltaMs) / 1000;
    particle.sprite.y += (particle.vy * context.deltaMs) / 1000;
    particle.vy += 300 * (context.deltaMs / 1000);
    particle.sprite.setAlpha(Math.max(0, particle.ttlMs / 240));
    if (particle.ttlMs <= 0) {
      particle.sprite.setVisible(false);
      runtime.active.delete(particle);
      runtime.pool.release(particle);
    }
  });
};
