import { addComponent } from 'bitecs';
import {
  AIComponent,
  AIStateMap,
  BossComponent,
  BossTag,
  EnemyTag,
  SpriteComponent,
  TeamComponent,
  TransformComponent,
} from '../components';
import type { GameEcsContext } from '../systems/types';
import { TEXTURE_INDEX } from '../assets/manifest';
import { createBaseEntity } from './common';

export const createFinalBoss = (context: GameEcsContext, x: number, y: number): number => {
  const boss = context.bossDefinition;
  const entity = createBaseEntity({
    context,
    x,
    y,
    textureIndex: TEXTURE_INDEX['boss-cabecilla'],
    textureKey: 'boss-cabecilla',
    hp: boss.maxHp,
    attack: 42,
    defense: 18,
    walkSpeed: 165,
    runSpeed: 260,
    jumpForce: 0,
    gravity: 1_850,
    team: 2,
    hurtbox: {
      offsetX: 0,
      offsetY: -40,
      width: 132,
      height: 198,
    },
  });

  addComponent(context.world, AIComponent, entity);
  addComponent(context.world, EnemyTag, entity);
  addComponent(context.world, BossTag, entity);
  addComponent(context.world, BossComponent, entity);

  AIComponent.state[entity] = AIStateMap.Idle;
  AIComponent.targetEntity[entity] = -1;
  AIComponent.decisionTimerMs[entity] = 600;
  AIComponent.aggression[entity] = boss.phases[0].aggressionMultiplier;
  AIComponent.range[entity] = 130;

  BossComponent.phase[entity] = 1;
  BossComponent.aoeCooldownMs[entity] = boss.phases[0].aoeCooldownMs;
  BossComponent.dashCooldownMs[entity] = boss.phases[0].dashCooldownMs;
  BossComponent.enraged[entity] = 0;
  TransformComponent.scaleX[entity] = 0.29;
  TransformComponent.scaleY[entity] = 0.29;
  SpriteComponent.tint[entity] = 0xb91c1c;
  TeamComponent.value[entity] = 2;

  context.entitiesMeta.set(entity, {
    renderKey: 'boss-cabecilla',
    displayName: boss.displayName,
    isPlayer: false,
    isBoss: true,
    weight: 2.4,
  });
  context.activeBossEntity = entity;

  return entity;
};
