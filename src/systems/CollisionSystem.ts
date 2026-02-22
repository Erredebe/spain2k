import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  HealthComponent,
  HurtboxComponent,
  TeamComponent,
  TransformComponent,
} from '../components';
import { rectOverlaps } from '../utils/math';
import type { SystemFn } from './types';

const defendersQuery = defineQuery([
  ActiveEntityComponent,
  TransformComponent,
  HurtboxComponent,
  HealthComponent,
  TeamComponent,
]);

const getEntityRect = (
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): { x: number; y: number; width: number; height: number } => ({
  x: x + offsetX - width / 2,
  y: y + offsetY - height / 2,
  width,
  height,
});

export const CollisionSystem: SystemFn = (context) => {
  context.pendingHits.length = 0;

  for (const [attacker, hitbox] of context.hitboxes) {
    if (context.nowMs >= hitbox.expiresAtMs) {
      context.hitboxes.delete(attacker);
      continue;
    }

    const team = TeamComponent.value[attacker];
    const attackerX = TransformComponent.x[attacker];
    const attackerY = TransformComponent.y[attacker];
    const facing =
      TransformComponent.facing[attacker] === 0 ? 1 : TransformComponent.facing[attacker];
    const hitRect = getEntityRect(
      attackerX,
      attackerY,
      hitbox.attack.hitbox.offsetX * facing,
      hitbox.attack.hitbox.offsetY,
      hitbox.attack.hitbox.width,
      hitbox.attack.hitbox.height,
    );

    for (const defender of defendersQuery(context.world)) {
      if (defender === attacker) {
        continue;
      }
      if (HealthComponent.isAlive[defender] === 0) {
        continue;
      }
      if (context.nowMs < HealthComponent.invulnUntilMs[defender]) {
        continue;
      }
      const defenderTeam = TeamComponent.value[defender];
      if (defenderTeam === team) {
        continue;
      }
      if (hitbox.alreadyHit.has(defender)) {
        continue;
      }

      const hurt = context.hurtboxes.get(defender);
      if (!hurt) {
        continue;
      }
      const hurtRect = getEntityRect(
        TransformComponent.x[defender],
        TransformComponent.y[defender],
        hurt.offsetX,
        hurt.offsetY,
        hurt.width,
        hurt.height,
      );
      if (rectOverlaps(hitRect, hurtRect)) {
        context.pendingHits.push({ attacker, defender, hitbox });
        hitbox.alreadyHit.add(defender);
      }
    }
  }
};
