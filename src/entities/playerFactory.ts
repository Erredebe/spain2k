import { addComponent } from 'bitecs';
import {
  CameraTargetComponent,
  InputComponent,
  PlayerTag,
  SpriteComponent,
  TeamComponent,
} from '../components';
import type { GameEcsContext } from '../systems/types';
import { TEXTURE_INDEX } from '../assets/manifest';
import { ENTITY_ANIMATION_BINDINGS } from '../config/animations';
import { findCharacterById } from '../config/characters';
import { createBaseEntity } from './common';

export const createPlayer = (
  context: GameEcsContext,
  playerIndex: 1 | 2,
  characterId: string,
  x: number,
  y: number,
): number => {
  const character = findCharacterById(characterId);
  const textureKey = `player-${character.id === 'heavy-brawler' ? 'heavy' : character.id}`;
  const textureIndex = TEXTURE_INDEX[textureKey];

  const entity = createBaseEntity({
    context,
    x,
    y,
    textureIndex,
    textureKey,
    hp: character.stats.maxHp,
    attack: character.stats.attack,
    defense: character.stats.defense,
    walkSpeed: character.stats.walkSpeed,
    runSpeed: character.stats.runSpeed,
    jumpForce: character.stats.jumpForce,
    gravity: character.stats.gravity,
    team: 1,
  });

  addComponent(context.world, InputComponent, entity);
  addComponent(context.world, PlayerTag, entity);
  if (playerIndex === 1) {
    addComponent(context.world, CameraTargetComponent, entity);
  }

  InputComponent.enabled[entity] = 1;
  InputComponent.playerIndex[entity] = playerIndex;
  InputComponent.deviceType[entity] = 0;
  InputComponent.bufferSize[entity] = 8;

  SpriteComponent.tint[entity] = character.palette[0];
  TeamComponent.value[entity] = 1;

  context.entitiesMeta.set(entity, {
    renderKey: textureKey,
    displayName: character.displayName,
    character,
    isPlayer: true,
    playerIndex,
    isBoss: false,
    weight: 1,
    visualScaleProfileId: ENTITY_ANIMATION_BINDINGS[textureKey]?.visualScaleProfileId,
  });
  context.inputBuffers.set(entity, {
    last: {
      moveX: 0,
      moveY: 0,
      jumpPressed: false,
      lightPressed: false,
      heavyPressed: false,
      grabPressed: false,
      specialPressed: false,
      pausePressed: false,
    },
    queuedAttack: null,
  });

  return entity;
};
