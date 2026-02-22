import { addComponent } from 'bitecs';
import { AIComponent, AIStateMap, EnemyTag, TeamComponent } from '../components';
import { findEnemyById } from '../config/enemies';
import type { GameEcsContext } from '../systems/types';
import { TEXTURE_INDEX } from '../assets/manifest';
import { ENTITY_ANIMATION_BINDINGS } from '../config/animations';
import { createBaseEntity } from './common';

export const createEnemy = (
  context: GameEcsContext,
  enemyId: string,
  x: number,
  y: number,
): number => {
  const enemy = findEnemyById(enemyId);
  const textureKey = enemy.id;

  const entity = createBaseEntity({
    context,
    x,
    y,
    textureIndex: TEXTURE_INDEX[textureKey],
    textureKey,
    hp: enemy.maxHp,
    attack: enemy.attack,
    defense: enemy.defense,
    walkSpeed: enemy.moveSpeed,
    runSpeed: enemy.moveSpeed * 1.15,
    jumpForce: 0,
    gravity: 1_850,
    team: 2,
    hurtbox: {
      offsetX: 0,
      offsetY: -28,
      width: enemy.enemyType === 'tank' ? 92 : 74,
      height: enemy.enemyType === 'tank' ? 150 : 130,
    },
  });

  addComponent(context.world, AIComponent, entity);
  addComponent(context.world, EnemyTag, entity);

  AIComponent.state[entity] = AIStateMap.Idle;
  AIComponent.targetEntity[entity] = -1;
  AIComponent.decisionTimerMs[entity] = enemy.decisionMs;
  AIComponent.aggression[entity] =
    enemy.enemyType === 'rusher' ? 1.2 : enemy.enemyType === 'tank' ? 0.8 : 1;
  AIComponent.range[entity] = enemy.attackRange;
  TeamComponent.value[entity] = 2;

  context.entitiesMeta.set(entity, {
    renderKey: textureKey,
    displayName: enemy.enemyType,
    enemy,
    isPlayer: false,
    isBoss: false,
    weight: enemy.weight,
    visualScaleProfileId: ENTITY_ANIMATION_BINDINGS[textureKey]?.visualScaleProfileId,
  });

  return entity;
};
