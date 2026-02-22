import { addComponent } from 'bitecs';
import { InteractableTag, MovementComponent, TeamComponent } from '../components';
import type { InteractableDefinition } from '../config/types';
import type { GameEcsContext } from '../systems/types';
import { createBaseEntity } from './common';

const propTextureByType: Record<InteractableDefinition['type'], string> = {
  crate: 'enemy-armed',
  train: 'enemy-tank',
  'container-light': 'enemy-ranged',
};

const propTextureIndexByType: Record<InteractableDefinition['type'], number> = {
  crate: 104,
  train: 103,
  'container-light': 105,
};

export const createInteractableProp = (
  context: GameEcsContext,
  definition: InteractableDefinition,
): number => {
  const entity = createBaseEntity({
    context,
    x: definition.x,
    y: definition.y,
    textureIndex: propTextureIndexByType[definition.type],
    textureKey: propTextureByType[definition.type],
    hp: definition.hp,
    attack: 0,
    defense: 0,
    walkSpeed: 0,
    runSpeed: 0,
    jumpForce: 0,
    gravity: 0,
    team: 3,
    hurtbox: {
      offsetX: 0,
      offsetY: -20,
      width: definition.type === 'train' ? 280 : 88,
      height: definition.type === 'train' ? 118 : 88,
    },
  });
  addComponent(context.world, InteractableTag, entity);
  MovementComponent.vx[entity] = 0;
  MovementComponent.vy[entity] = 0;
  TeamComponent.value[entity] = 3;

  context.entitiesMeta.set(entity, {
    renderKey: propTextureByType[definition.type],
    displayName: definition.id,
    isPlayer: false,
    isBoss: false,
    weight: definition.type === 'train' ? 99 : 2,
  });

  return entity;
};
