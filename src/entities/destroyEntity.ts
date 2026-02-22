import { removeEntity } from 'bitecs';
import type { GameEcsContext } from '../systems/types';

export const destroyEntity = (context: GameEcsContext, entity: number): void => {
  const renderObject = context.renderObjects.get(entity);
  if (renderObject) {
    renderObject.sprite.destroy();
    renderObject.shadow.destroy();
    context.renderObjects.delete(entity);
  }
  context.entitiesMeta.delete(entity);
  context.hitboxes.delete(entity);
  context.hurtboxes.delete(entity);
  context.inputBuffers.delete(entity);
  context.animationRuntime.delete(entity);
  context.activeAttacks.delete(entity);
  context.pendingDestroy.delete(entity);
  removeEntity(context.world, entity);
};
