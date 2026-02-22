import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  AnimationComponent,
  AnimationStateMap,
  HealthComponent,
  MovementComponent,
  SpriteComponent,
  TransformComponent,
} from '../components';
import type { SystemFn } from './types';

const animationQuery = defineQuery([
  ActiveEntityComponent,
  AnimationComponent,
  MovementComponent,
  TransformComponent,
  HealthComponent,
  SpriteComponent,
]);

export const AnimationSystem: SystemFn = (context) => {
  for (const entity of animationQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      AnimationComponent.stateAnim[entity] = AnimationStateMap.knockdown;
      continue;
    }

    const attackRuntime = context.activeAttacks.get(entity);
    if (attackRuntime) {
      if (attackRuntime.attack.kind === 'special') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap.special;
      } else if (attackRuntime.attack.kind === 'heavy') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap.heavy;
      } else if (attackRuntime.attack.kind === 'light-1') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap['light-combo-1'];
      } else if (attackRuntime.attack.kind === 'light-2') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap['light-combo-2'];
      } else if (attackRuntime.attack.kind === 'light-3') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap['light-combo-3'];
      } else if (attackRuntime.attack.kind === 'air') {
        AnimationComponent.stateAnim[entity] = AnimationStateMap['air-attack'];
      }
    } else if (MovementComponent.onGround[entity] === 0) {
      AnimationComponent.stateAnim[entity] =
        MovementComponent.ay[entity] < 0 ? AnimationStateMap.jump : AnimationStateMap.fall;
    } else {
      const speed = Math.abs(MovementComponent.vx[entity]) + Math.abs(MovementComponent.vy[entity]);
      if (speed > 310) {
        AnimationComponent.stateAnim[entity] = AnimationStateMap.run;
      } else if (speed > 80) {
        AnimationComponent.stateAnim[entity] = AnimationStateMap.walk;
      } else {
        AnimationComponent.stateAnim[entity] = AnimationStateMap.idle;
      }
    }

    if (context.nowMs < HealthComponent.invulnUntilMs[entity]) {
      const blink = Math.floor(context.nowMs / 60) % 2 === 0;
      SpriteComponent.alpha[entity] = blink ? 0.45 : 1;
    } else {
      SpriteComponent.alpha[entity] = 1;
    }

    const hurtbox = context.hurtboxes.get(entity);
    if (hurtbox) {
      const state = AnimationComponent.stateAnim[entity];
      if (state === AnimationStateMap.run) {
        hurtbox.width = 82;
        hurtbox.height = 116;
      } else if (state === AnimationStateMap.jump || state === AnimationStateMap.fall) {
        hurtbox.width = 68;
        hurtbox.height = 98;
      } else if (state === AnimationStateMap.knockdown) {
        hurtbox.width = 108;
        hurtbox.height = 62;
      } else {
        hurtbox.width = 74;
        hurtbox.height = 124;
      }
    }
  }
};
