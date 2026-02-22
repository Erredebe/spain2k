import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  AnimationComponent,
  CombatComponent,
  HealthComponent,
  InputComponent,
  MovementComponent,
  StateMachineComponent,
  TransformComponent,
} from '../components';
import { GAME_BALANCE } from '../config/balance';
import type { AttackDefinition, PlayerAttackKind } from '../config/types';
import { calculateDamage, calculateKnockback, updateComboState } from './combatMath';
import type { SystemFn } from './types';

const combatantsQuery = defineQuery([
  ActiveEntityComponent,
  HealthComponent,
  CombatComponent,
  MovementComponent,
  TransformComponent,
  StateMachineComponent,
]);
const playerCombatQuery = defineQuery([
  ActiveEntityComponent,
  HealthComponent,
  CombatComponent,
  InputComponent,
  MovementComponent,
  AnimationComponent,
]);

const resolvePlayerAttack = (
  context: Parameters<SystemFn>[0],
  entity: number,
  requested: PlayerAttackKind,
): AttackDefinition | null => {
  const character = context.entitiesMeta.get(entity)?.character;
  if (!character) {
    return null;
  }

  if (requested === 'light-1') {
    const active = context.activeAttacks.get(entity);
    if (active?.attack.kind === 'light-1') {
      return character.moveset['light-2'];
    }
    if (active?.attack.kind === 'light-2') {
      return character.moveset['light-3'];
    }
  }
  return character.moveset[requested];
};

const canCancelCurrentAttack = (context: Parameters<SystemFn>[0], entity: number): boolean => {
  const active = context.activeAttacks.get(entity);
  if (!active) {
    return true;
  }
  const elapsed = context.nowMs - active.startedAtMs;
  return elapsed >= active.cancelOpenMs && elapsed <= active.cancelCloseMs;
};

const startAttack = (
  context: Parameters<SystemFn>[0],
  entity: number,
  requested: PlayerAttackKind,
): void => {
  const attack = resolvePlayerAttack(context, entity, requested);
  if (!attack) {
    return;
  }
  if (!canCancelCurrentAttack(context, entity)) {
    return;
  }
  const attackDurationMs = attack.startupMs + attack.activeMs + attack.recoveryMs;
  context.activeAttacks.set(entity, {
    attackKey: requested,
    attack,
    startedAtMs: context.nowMs,
    lockUntilMs: context.nowMs + attackDurationMs,
    cancelOpenMs: attack.cancelOpenMs,
    cancelCloseMs: attack.cancelCloseMs,
  });
  AnimationComponent.lockedUntilMs[entity] = context.nowMs + attackDurationMs;
  AnimationComponent.cancelOpenMs[entity] = attack.cancelOpenMs;
  AnimationComponent.cancelCloseMs[entity] = attack.cancelCloseMs;
  StateMachineComponent.timerMs[entity] = 0;
  if (requested === 'special') {
    CombatComponent.specialMeter[entity] = 0;
    context.audio.playSfx('special', 0.85);
    context.audio.duckMusic(240);
  } else {
    context.audio.playSfx('hit-light', 0.22);
  }
};

const updateActiveAttacks = (context: Parameters<SystemFn>[0]): void => {
  for (const [entity, runtime] of context.activeAttacks.entries()) {
    const elapsed = context.nowMs - runtime.startedAtMs;
    const activeStart = runtime.attack.startupMs;
    const activeEnd = runtime.attack.startupMs + runtime.attack.activeMs;

    if (elapsed >= activeStart && elapsed <= activeEnd) {
      if (!context.hitboxes.has(entity)) {
        context.hitboxes.set(entity, {
          owner: entity,
          attack: runtime.attack,
          startedAtMs: context.nowMs,
          expiresAtMs: runtime.startedAtMs + activeEnd,
          alreadyHit: new Set<number>(),
        });
      }
    } else {
      context.hitboxes.delete(entity);
    }

    if (context.nowMs >= runtime.lockUntilMs) {
      context.activeAttacks.delete(entity);
      context.hitboxes.delete(entity);
    }
  }
};

const applyHit = (
  context: Parameters<SystemFn>[0],
  attacker: number,
  defender: number,
  attack: AttackDefinition,
): void => {
  const specialScaling = attack.kind === 'special' ? 1.2 : attack.kind === 'boss-aoe' ? 1.15 : 1;
  const damage = calculateDamage({
    baseDamage: attack.damage,
    attackStat: CombatComponent.attack[attacker],
    defenseStat: CombatComponent.defense[defender],
    specialScaling,
  });

  HealthComponent.hp[defender] = Math.max(0, HealthComponent.hp[defender] - damage);
  if (HealthComponent.hp[defender] <= 0) {
    HealthComponent.isAlive[defender] = 0;
  }

  const attackerMeta = context.entitiesMeta.get(attacker);
  const defenderMeta = context.entitiesMeta.get(defender);
  const knockback = calculateKnockback({
    baseX: attack.knockbackX,
    baseY: attack.knockbackY,
    weight: defenderMeta?.weight ?? 1,
    facing: TransformComponent.facing[attacker],
    knockbackLimitX: GAME_BALANCE.knockback.maxHorizontal,
    knockbackLimitY: GAME_BALANCE.knockback.maxVertical,
  });
  MovementComponent.vx[defender] = knockback.x;
  MovementComponent.ay[defender] = knockback.y;
  MovementComponent.onGround[defender] = knockback.y < -20 ? 0 : 1;

  if (attack.groundBounce && MovementComponent.onGround[defender] === 1) {
    MovementComponent.onGround[defender] = 0;
    MovementComponent.ay[defender] = -Math.abs(knockback.y) * 0.8;
  }
  CombatComponent.juggleCount[defender] += attack.juggleCost;
  const maxJuggle = attackerMeta?.character?.stats.maxJuggle ?? GAME_BALANCE.juggle.hardLimit;
  if (CombatComponent.juggleCount[defender] > maxJuggle) {
    HealthComponent.downUntilMs[defender] = context.nowMs + 900;
    CombatComponent.juggleCount[defender] = 0;
    context.eventBus.emit('combat:entity-knockdown', { entity: defender });
  }

  HealthComponent.invulnUntilMs[defender] = context.nowMs + 320;

  CombatComponent.specialMeter[attacker] = Math.min(
    GAME_BALANCE.special.maxMeter,
    CombatComponent.specialMeter[attacker] + attack.specialGain,
  );
  CombatComponent.specialMeter[defender] = Math.min(
    GAME_BALANCE.special.maxMeter,
    CombatComponent.specialMeter[defender] + GAME_BALANCE.special.gainOnReceive,
  );
  if (CombatComponent.specialMeter[attacker] >= GAME_BALANCE.special.specialCost) {
    context.eventBus.emit('combat:special-ready', { entity: attacker });
  }

  const comboState = updateComboState({
    currentCombo: CombatComponent.comboCounter[attacker],
    comboTimerMs: CombatComponent.comboTimerMs[attacker],
    deltaMs: context.deltaMs,
    timeoutMs: GAME_BALANCE.comboTimeoutMs,
    landedHit: true,
  });
  CombatComponent.comboCounter[attacker] = comboState.combo;
  CombatComponent.comboTimerMs[attacker] = comboState.timerMs;
  context.eventBus.emit('combat:combo-updated', {
    entity: attacker,
    comboCounter: comboState.combo,
  });

  context.hitstopMs = Math.max(context.hitstopMs, attack.hitstopMs);
  const shakeIntensity =
    attack.kind === 'special' || attack.kind === 'boss-aoe'
      ? GAME_BALANCE.camera.shake.special
      : attack.kind === 'heavy' || attack.kind === 'boss-dash'
        ? GAME_BALANCE.camera.shake.heavy
        : GAME_BALANCE.camera.shake.light;
  context.scene.cameras.main.shake(attack.hitstopMs, shakeIntensity);
  context.audio.playSfx(
    attack.kind === 'heavy' || attack.kind === 'boss-dash' ? 'hit-heavy' : 'hit-light',
    0.85,
  );

  context.eventBus.emit('combat:hit-registered', {
    attacker,
    defender,
    attackKind: attack.kind,
    damage,
  });
};

export const CombatSystem: SystemFn = (context) => {
  if (context.hitstopMs > 0) {
    context.hitstopMs -= context.deltaMs;
    return;
  }

  for (const entity of combatantsQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      continue;
    }
    const comboState = updateComboState({
      currentCombo: CombatComponent.comboCounter[entity],
      comboTimerMs: CombatComponent.comboTimerMs[entity],
      deltaMs: context.deltaMs,
      timeoutMs: GAME_BALANCE.comboTimeoutMs,
      landedHit: false,
    });
    CombatComponent.comboCounter[entity] = comboState.combo;
    CombatComponent.comboTimerMs[entity] = comboState.timerMs;
  }

  for (const entity of playerCombatQuery(context.world)) {
    if (HealthComponent.isAlive[entity] === 0) {
      continue;
    }
    if (InputComponent.playerIndex[entity] === 2 && !context.coopEnabled) {
      continue;
    }
    const input = context.inputBuffers.get(entity);
    if (!input || !input.queuedAttack) {
      continue;
    }
    const requested = input.queuedAttack;
    if (
      requested === 'special' &&
      CombatComponent.specialMeter[entity] < GAME_BALANCE.special.specialCost
    ) {
      input.queuedAttack = null;
      continue;
    }

    startAttack(context, entity, requested);
    input.queuedAttack = null;
  }

  updateActiveAttacks(context);

  for (const hit of context.pendingHits) {
    if (
      HealthComponent.isAlive[hit.attacker] === 0 ||
      HealthComponent.isAlive[hit.defender] === 0
    ) {
      continue;
    }
    applyHit(context, hit.attacker, hit.defender, hit.hitbox.attack);
  }
};
