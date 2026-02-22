import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  EnemyTag,
  HealthComponent,
  InteractableTag,
  PlayerTag,
} from '../components';
import { destroyEntity } from '../entities/destroyEntity';
import type { PendingDestroyReason } from '../config/types';
import type { SystemFn } from './types';

const enemyQuery = defineQuery([ActiveEntityComponent, EnemyTag, HealthComponent]);
const interactableQuery = defineQuery([ActiveEntityComponent, InteractableTag, HealthComponent]);
const playerQuery = defineQuery([ActiveEntityComponent, PlayerTag, HealthComponent]);

const enqueueDestroy = (
  context: Parameters<SystemFn>[0],
  entity: number,
  reason: PendingDestroyReason,
): void => {
  if (!context.pendingDestroy.has(entity)) {
    context.pendingDestroy.set(entity, reason);
  }
};

export const LifecycleSystem: SystemFn = (context) => {
  for (const entity of interactableQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      enqueueDestroy(context, entity, 'prop-broken');
    }
  }

  for (const entity of enemyQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 1) {
      continue;
    }
    const downUntil = HealthComponent.downUntilMs[entity];
    if (context.nowMs >= downUntil) {
      enqueueDestroy(context, entity, 'enemy-defeated');
    }
  }

  // Players remain in-world when KO so defeat flow and camera logic still work.
  for (const entity of playerQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      HealthComponent.downUntilMs[entity] = Math.max(
        HealthComponent.downUntilMs[entity],
        context.nowMs + 16,
      );
    }
  }

  if (context.pendingDestroy.size === 0) {
    return;
  }
  for (const entity of Array.from(context.pendingDestroy.keys())) {
    destroyEntity(context, entity);
  }
};

