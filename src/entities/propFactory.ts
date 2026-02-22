import { addComponent } from 'bitecs';
import { InteractableTag, MovementComponent, SpriteComponent, TeamComponent, TransformComponent } from '../components';
import { TEXTURE_INDEX } from '../assets/manifest';
import type { InteractableDefinition } from '../config/types';
import type { GameEcsContext } from '../systems/types';
import { createBaseEntity } from './common';

const allowedPropTextures = ['prop-crate', 'prop-train', 'prop-container-light'] as const;

const defaultPropTextureByType: Record<InteractableDefinition['type'], InteractableDefinition['visualKey']> = {
  crate: 'prop-crate',
  train: 'prop-train',
  'container-light': 'prop-container-light',
};

const propScaleByType: Record<InteractableDefinition['type'], number> = {
  crate: 0.12,
  train: 0.3,
  'container-light': 0.22,
};

export const resolvePropTextureKey = (
  definition: InteractableDefinition,
): (typeof allowedPropTextures)[number] => {
  if (
    definition.visualKey &&
    (allowedPropTextures as readonly string[]).includes(definition.visualKey)
  ) {
    return definition.visualKey;
  }
  return defaultPropTextureByType[definition.type] ?? 'prop-crate';
};

export const createInteractableProp = (
  context: GameEcsContext,
  definition: InteractableDefinition,
): number => {
  const propTexture = resolvePropTextureKey(definition);
  const textureIndex = TEXTURE_INDEX[propTexture];
  const entity = createBaseEntity({
    context,
    x: definition.x,
    y: definition.y,
    textureIndex,
    textureKey: propTexture,
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
  const scale = propScaleByType[definition.type];
  TransformComponent.scaleX[entity] = scale;
  TransformComponent.scaleY[entity] = scale;
  if (definition.type === 'train') {
    SpriteComponent.tint[entity] = 0x9ca3af;
  } else if (definition.type === 'container-light') {
    SpriteComponent.tint[entity] = 0xd1d5db;
  }
  MovementComponent.vx[entity] = 0;
  MovementComponent.vy[entity] = 0;
  TeamComponent.value[entity] = 3;

  context.entitiesMeta.set(entity, {
    renderKey: propTexture,
    displayName: definition.id,
    isPlayer: false,
    isBoss: false,
    weight: definition.type === 'train' ? 99 : 2,
  });

  return entity;
};
