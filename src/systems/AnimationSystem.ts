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
import { ASSET_MANIFEST } from '../assets/manifest';
import type { AnimationState } from '../config/types';
import { createAnimationRuntimeState, stepAnimationRuntime } from './animationRuntime';
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
  const stateByIndex: Record<number, AnimationState> = {
    [AnimationStateMap.idle]: 'idle',
    [AnimationStateMap.walk]: 'walk',
    [AnimationStateMap.run]: 'run',
    [AnimationStateMap.jump]: 'jump',
    [AnimationStateMap.fall]: 'fall',
    [AnimationStateMap['light-combo-1']]: 'light-combo-1',
    [AnimationStateMap['light-combo-2']]: 'light-combo-2',
    [AnimationStateMap['light-combo-3']]: 'light-combo-3',
    [AnimationStateMap.heavy]: 'heavy',
    [AnimationStateMap['air-attack']]: 'air-attack',
    [AnimationStateMap.grab]: 'grab',
    [AnimationStateMap.throw]: 'throw',
    [AnimationStateMap.special]: 'special',
    [AnimationStateMap.hurt]: 'hurt',
    [AnimationStateMap.knockdown]: 'knockdown',
    [AnimationStateMap.recovery]: 'recovery',
    [AnimationStateMap.victory]: 'victory',
  };

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

    const renderKey = context.entitiesMeta.get(entity)?.renderKey;
    if (!renderKey) {
      continue;
    }
    const binding = ASSET_MANIFEST.entityAnimationBindings[renderKey];
    if (!binding) {
      continue;
    }
    const animationSet = ASSET_MANIFEST.animationSets[binding.animationSetId];
    if (!animationSet) {
      continue;
    }

    const desiredState = stateByIndex[AnimationComponent.stateAnim[entity]] ?? 'idle';
    const runtime =
      context.animationRuntime.get(entity) ??
      createAnimationRuntimeState(animationSet, animationSet.fallbackState);
    stepAnimationRuntime(runtime, animationSet, desiredState, context.deltaMs);
    AnimationComponent.frameIndex[entity] = runtime.frameCursor;
    AnimationComponent.elapsed[entity] = runtime.frameElapsedMs;
    context.animationRuntime.set(entity, runtime);
  }
};
