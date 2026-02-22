import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  HealthComponent,
  InputComponent,
  MovementComponent,
  TransformComponent,
  StateMachineComponent,
  AnimationComponent,
} from '../components';
import { GAME_BALANCE } from '../config/balance';
import { clamp } from '../utils/math';
import type { SystemFn } from './types';

const movingQuery = defineQuery([
  ActiveEntityComponent,
  TransformComponent,
  MovementComponent,
  HealthComponent,
  StateMachineComponent,
  AnimationComponent,
]);
const controlledQuery = defineQuery([
  ActiveEntityComponent,
  TransformComponent,
  MovementComponent,
  HealthComponent,
  InputComponent,
]);

export const MovementSystem: SystemFn = (context) => {
  if (context.hitstopMs > 0) {
    return;
  }

  for (const entity of controlledQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      continue;
    }
    if (InputComponent.playerIndex[entity] === 2 && !context.coopEnabled) {
      continue;
    }
    const buffer = context.inputBuffers.get(entity);
    if (!buffer) {
      continue;
    }
    const locked = context.nowMs < AnimationComponent.lockedUntilMs[entity];
    if (!locked) {
      const moveX = buffer.last.moveX;
      const moveY = buffer.last.moveY;
      const isRun = Math.abs(moveX) > 0.65;
      const speed = isRun
        ? MovementComponent.runSpeed[entity]
        : MovementComponent.walkSpeed[entity];
      MovementComponent.vx[entity] = moveX * speed;
      MovementComponent.vy[entity] = moveY * speed * 0.58;
    } else {
      MovementComponent.vx[entity] *= 0.9;
      MovementComponent.vy[entity] *= 0.9;
    }

    const canJump = MovementComponent.onGround[entity] === 1 && !locked;
    if (buffer.last.jumpPressed && canJump) {
      MovementComponent.ay[entity] = -MovementComponent.jumpForce[entity];
      MovementComponent.onGround[entity] = 0;
    }
  }

  for (const entity of movingQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      continue;
    }
    MovementComponent.dashCooldownMs[entity] = Math.max(
      0,
      MovementComponent.dashCooldownMs[entity] - context.deltaMs,
    );

    if (MovementComponent.onGround[entity] === 0) {
      MovementComponent.ay[entity] += MovementComponent.gravity[entity] * (context.deltaMs / 1000);
    }

    TransformComponent.x[entity] += (MovementComponent.vx[entity] * context.deltaMs) / 1000;
    TransformComponent.y[entity] += (MovementComponent.vy[entity] * context.deltaMs) / 1000;
    TransformComponent.z[entity] += (MovementComponent.ay[entity] * context.deltaMs) / 1000;

    if (TransformComponent.z[entity] >= 0) {
      TransformComponent.z[entity] = 0;
      MovementComponent.ay[entity] = 0;
      MovementComponent.onGround[entity] = 1;
    } else {
      MovementComponent.onGround[entity] = 0;
    }

    TransformComponent.x[entity] = clamp(
      TransformComponent.x[entity],
      120,
      GAME_BALANCE.worldWidth - 120,
    );
    TransformComponent.y[entity] = clamp(
      TransformComponent.y[entity],
      GAME_BALANCE.laneMinY,
      GAME_BALANCE.laneMaxY,
    );

    MovementComponent.vx[entity] *= GAME_BALANCE.knockback.groundFriction;
    MovementComponent.vy[entity] *= GAME_BALANCE.knockback.groundFriction;
  }
};
