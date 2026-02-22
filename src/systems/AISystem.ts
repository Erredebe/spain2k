import { defineQuery } from 'bitecs';
import {
  AIComponent,
  ActiveEntityComponent,
  BossComponent,
  BossTag,
  EnemyTag,
  HealthComponent,
  MovementComponent,
  TransformComponent,
  InverseAIStateMap,
  AIStateMap,
  CombatComponent,
  StateMachineComponent,
  PlayerTag,
} from '../components';
import type { AIState, AttackDefinition } from '../config/types';
import { getNextAIState } from './aiTransitions';
import type { SystemFn } from './types';

const enemyQuery = defineQuery([
  ActiveEntityComponent,
  EnemyTag,
  AIComponent,
  TransformComponent,
  MovementComponent,
  HealthComponent,
  CombatComponent,
  StateMachineComponent,
]);
const playerQuery = defineQuery([
  ActiveEntityComponent,
  PlayerTag,
  TransformComponent,
  HealthComponent,
  MovementComponent,
]);
const bossQuery = defineQuery([ActiveEntityComponent, BossTag, BossComponent, HealthComponent]);

const enemyMeleeAttack: AttackDefinition = {
  id: 'enemy-melee',
  kind: 'enemy-melee',
  startupMs: 180,
  activeMs: 120,
  recoveryMs: 240,
  cancelOpenMs: 0,
  cancelCloseMs: 0,
  damage: 24,
  knockbackX: 280,
  knockbackY: 60,
  hitstopMs: 55,
  juggleCost: 1,
  groundBounce: false,
  hitbox: { offsetX: 52, offsetY: -22, width: 74, height: 84 },
  specialGain: 0,
};

const enemyRangedAttack: AttackDefinition = {
  ...enemyMeleeAttack,
  id: 'enemy-ranged',
  kind: 'enemy-ranged',
  startupMs: 240,
  activeMs: 100,
  recoveryMs: 310,
  damage: 20,
  hitbox: { offsetX: 110, offsetY: -26, width: 92, height: 70 },
};

const bossDashAttack: AttackDefinition = {
  ...enemyMeleeAttack,
  id: 'boss-dash',
  kind: 'boss-dash',
  startupMs: 150,
  activeMs: 180,
  recoveryMs: 280,
  damage: 36,
  knockbackX: 440,
  knockbackY: 140,
  hitstopMs: 90,
  hitbox: { offsetX: 76, offsetY: -36, width: 126, height: 120 },
};

const bossAoeAttack: AttackDefinition = {
  ...enemyMeleeAttack,
  id: 'boss-aoe',
  kind: 'boss-aoe',
  startupMs: 280,
  activeMs: 220,
  recoveryMs: 350,
  damage: 28,
  knockbackX: 300,
  knockbackY: 210,
  hitstopMs: 80,
  hitbox: { offsetX: 0, offsetY: -20, width: 240, height: 180 },
};

const getNearestPlayer = (context: Parameters<SystemFn>[0], x: number, y: number): number => {
  let nearest = -1;
  let nearestSq = Number.MAX_SAFE_INTEGER;
  for (const player of playerQuery(context.world)) {
    if (HealthComponent.isAlive[player] === 0) {
      continue;
    }
    const dx = TransformComponent.x[player] - x;
    const dy = TransformComponent.y[player] - y;
    const sq = dx * dx + dy * dy;
    if (sq < nearestSq) {
      nearestSq = sq;
      nearest = player;
    }
  }
  return nearest;
};

const setAIState = (context: Parameters<SystemFn>[0], entity: number, next: AIState): void => {
  const previous = InverseAIStateMap[AIComponent.state[entity] as keyof typeof InverseAIStateMap];
  if (previous !== next) {
    context.eventBus.emit('ai:state-changed', {
      entity,
      from: previous,
      to: next,
    });
  }
  AIComponent.state[entity] = AIStateMap[next];
  StateMachineComponent.previous[entity] = AIComponent.state[entity];
  StateMachineComponent.current[entity] = AIStateMap[next];
  StateMachineComponent.timerMs[entity] = 0;
};

const startEnemyAttack = (
  context: Parameters<SystemFn>[0],
  entity: number,
  attack: AttackDefinition,
): void => {
  context.activeAttacks.set(entity, {
    attackKey: 'heavy',
    attack,
    startedAtMs: context.nowMs,
    lockUntilMs: context.nowMs + attack.startupMs + attack.activeMs + attack.recoveryMs,
    cancelOpenMs: 0,
    cancelCloseMs: 0,
  });
};

export const AISystem: SystemFn = (context) => {
  if (context.hitstopMs > 0) {
    return;
  }

  for (const enemy of enemyQuery(context.world)) {
    if (HealthComponent.isAlive[enemy] === 0) {
      continue;
    }

    const target = getNearestPlayer(
      context,
      TransformComponent.x[enemy],
      TransformComponent.y[enemy],
    );
    if (target === -1) {
      MovementComponent.vx[enemy] = 0;
      MovementComponent.vy[enemy] = 0;
      continue;
    }
    AIComponent.targetEntity[enemy] = target;

    AIComponent.decisionTimerMs[enemy] -= context.deltaMs;
    const dx = TransformComponent.x[target] - TransformComponent.x[enemy];
    const dy = TransformComponent.y[target] - TransformComponent.y[enemy];
    const distance = Math.hypot(dx, dy);
    const enemyMeta = context.entitiesMeta.get(enemy);
    const canAttack = !context.activeAttacks.has(enemy);

    if (AIComponent.decisionTimerMs[enemy] <= 0) {
      AIComponent.decisionTimerMs[enemy] = enemyMeta?.enemy?.decisionMs ?? 900;
      const nextState = getNextAIState({
        current: InverseAIStateMap[AIComponent.state[enemy] as keyof typeof InverseAIStateMap],
        distanceToTarget: distance,
        canAttack,
        isStunned: context.nowMs < HealthComponent.invulnUntilMs[enemy],
        isKnockedDown: context.nowMs < HealthComponent.downUntilMs[enemy],
        enraged: false,
        approachRange: enemyMeta?.enemy?.approachRange ?? 360,
        attackRange: enemyMeta?.enemy?.attackRange ?? 84,
        retreatRange: enemyMeta?.enemy?.retreatRange ?? 95,
      });
      setAIState(context, enemy, nextState);
    }

    const state = InverseAIStateMap[AIComponent.state[enemy] as keyof typeof InverseAIStateMap];
    const moveSpeed = MovementComponent.walkSpeed[enemy] * AIComponent.aggression[enemy];
    if (state === 'Approach') {
      MovementComponent.vx[enemy] = Math.sign(dx) * moveSpeed;
      MovementComponent.vy[enemy] = Math.sign(dy) * moveSpeed * 0.46;
    } else if (state === 'Retreat') {
      MovementComponent.vx[enemy] = -Math.sign(dx) * moveSpeed * 0.7;
      MovementComponent.vy[enemy] = -Math.sign(dy) * moveSpeed * 0.42;
    } else {
      MovementComponent.vx[enemy] = 0;
      MovementComponent.vy[enemy] = 0;
    }

    if (dx !== 0) {
      TransformComponent.facing[enemy] = dx >= 0 ? 1 : -1;
    }

    if (state === 'Attack' && canAttack) {
      const useRanged = enemyMeta?.enemy?.enemyType === 'ranged';
      startEnemyAttack(context, enemy, useRanged ? enemyRangedAttack : enemyMeleeAttack);
    }
  }

  for (const boss of bossQuery(context.world)) {
    if (HealthComponent.isAlive[boss] === 0) {
      continue;
    }
    const hpRatio = HealthComponent.hp[boss] / Math.max(1, HealthComponent.maxHp[boss]);
    let phase: 1 | 2 | 3 = 1;
    if (hpRatio <= context.bossDefinition.phaseThresholds[1]) {
      phase = 3;
    } else if (hpRatio <= context.bossDefinition.phaseThresholds[0]) {
      phase = 2;
    }
    if (BossComponent.phase[boss] !== phase) {
      BossComponent.phase[boss] = phase;
      context.eventBus.emit('boss:phase-changed', { entity: boss, phase });
      if (phase === 3) {
        BossComponent.enraged[boss] = 1;
        context.eventBus.emit('boss:enraged', { entity: boss });
      }
    }

    BossComponent.dashCooldownMs[boss] -= context.deltaMs;
    BossComponent.aoeCooldownMs[boss] -= context.deltaMs;
    const target = getNearestPlayer(
      context,
      TransformComponent.x[boss],
      TransformComponent.y[boss],
    );
    if (target === -1) {
      continue;
    }
    const dx = TransformComponent.x[target] - TransformComponent.x[boss];
    const dy = TransformComponent.y[target] - TransformComponent.y[boss];
    const moveSpeed = MovementComponent.walkSpeed[boss] + phase * 45;

    if (!context.activeAttacks.has(boss)) {
      if (BossComponent.dashCooldownMs[boss] <= 0) {
        MovementComponent.vx[boss] = Math.sign(dx) * moveSpeed * 2.1;
        MovementComponent.vy[boss] = Math.sign(dy) * moveSpeed * 0.8;
        startEnemyAttack(context, boss, bossDashAttack);
        BossComponent.dashCooldownMs[boss] =
          context.bossDefinition.phases[phase - 1].dashCooldownMs *
          (BossComponent.enraged[boss] ? 0.85 : 1);
      } else if (BossComponent.aoeCooldownMs[boss] <= 0) {
        startEnemyAttack(context, boss, bossAoeAttack);
        BossComponent.aoeCooldownMs[boss] = context.bossDefinition.phases[phase - 1].aoeCooldownMs;
      } else {
        MovementComponent.vx[boss] = Math.sign(dx) * moveSpeed;
        MovementComponent.vy[boss] = Math.sign(dy) * moveSpeed * 0.5;
      }
    }
  }
};
