import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  HealthComponent,
  SpriteComponent,
  TransformComponent,
  RenderObjectComponent,
} from '../components';
import { GAME_BALANCE } from '../config/balance';
import { isInsideCameraBounds } from '../utils/culling';
import { ENTITY_TEXTURE_REFS, TEXTURE_KEY_BY_INDEX } from '../assets/manifest';
import type { SystemFn } from './types';

const renderQuery = defineQuery([
  ActiveEntityComponent,
  TransformComponent,
  SpriteComponent,
  RenderObjectComponent,
  HealthComponent,
]);

export const RenderSystem: SystemFn = (context) => {
  const camera = context.scene.cameras.main;

  for (const entity of renderQuery(context.world)) {
    const render = context.renderObjects.get(entity);
    if (!render) {
      continue;
    }

    const x = TransformComponent.x[entity];
    const y = TransformComponent.y[entity] + TransformComponent.z[entity];
    const textureId = TEXTURE_KEY_BY_INDEX[SpriteComponent.textureIndex[entity]];
    const runtimeTexture = textureId ? ENTITY_TEXTURE_REFS[textureId] : undefined;
    if (
      runtimeTexture &&
      (render.sprite.texture.key !== runtimeTexture.textureKey ||
        (runtimeTexture.frame !== undefined && render.sprite.frame.name !== runtimeTexture.frame))
    ) {
      render.sprite.setTexture(runtimeTexture.textureKey, runtimeTexture.frame);
    }

    const visible = isInsideCameraBounds(
      x,
      y,
      {
        scrollX: camera.scrollX,
        scrollY: camera.scrollY,
        width: camera.width,
        height: camera.height,
      },
      GAME_BALANCE.performance.cullingPadding,
    );
    render.sprite.setVisible(visible && SpriteComponent.visible[entity] === 1);
    render.shadow.setVisible(visible && HealthComponent.isAlive[entity] === 1);

    render.sprite.setPosition(x, y);
    render.sprite.setDepth(
      TransformComponent.y[entity] + 150 + (HealthComponent.isAlive[entity] === 1 ? 0 : -1),
    );
    render.shadow.setPosition(x, TransformComponent.y[entity] + 80);
    render.shadow.setDepth(TransformComponent.y[entity] - 5);
    render.shadow.setScale(1 - Math.abs(TransformComponent.z[entity]) / 420);

    render.sprite.setScale(TransformComponent.scaleX[entity], TransformComponent.scaleY[entity]);
    render.sprite.setRotation(TransformComponent.rotation[entity]);
    render.sprite.setFlipX(TransformComponent.facing[entity] < 0);
    render.sprite.setAlpha(SpriteComponent.alpha[entity]);
    render.sprite.setTint(SpriteComponent.tint[entity]);
  }
};
