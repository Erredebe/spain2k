import { defineQuery, hasComponent } from 'bitecs';
import {
  ActiveEntityComponent,
  HealthComponent,
  PlayerTag,
  SpriteComponent,
  TransformComponent,
  RenderObjectComponent,
} from '../components';
import { GAME_BALANCE } from '../config/balance';
import { VISUAL_SCALE_PROFILES } from '../config/animations';
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
    const runtimeAnimationFrame = context.animationRuntime.get(entity)?.frameName;
    const targetTextureKey = runtimeTexture?.textureKey;
    const targetFrameName = runtimeAnimationFrame ?? runtimeTexture?.frame;
    if (
      targetTextureKey &&
      (render.sprite.texture.key !== targetTextureKey ||
        (targetFrameName !== undefined && render.sprite.frame.name !== targetFrameName))
    ) {
      render.sprite.setTexture(targetTextureKey, targetFrameName);
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
    const isAlive = HealthComponent.isAlive[entity] === 1;
    const isPlayer = hasComponent(context.world, PlayerTag, entity);
    const allowDeadRender = isPlayer;
    render.sprite.setVisible(visible && SpriteComponent.visible[entity] === 1 && (isAlive || allowDeadRender));
    render.shadow.setVisible(visible && isAlive);

    render.sprite.setPosition(x, y);
    render.sprite.setDepth(
      TransformComponent.y[entity] + 150 + (HealthComponent.isAlive[entity] === 1 ? 0 : -1),
    );
    const profileId = context.entitiesMeta.get(entity)?.visualScaleProfileId ?? 'technical';
    const profile = VISUAL_SCALE_PROFILES[profileId] ?? VISUAL_SCALE_PROFILES.technical;
    render.shadow.setPosition(x, TransformComponent.y[entity] + profile.shadowYOffset);
    render.shadow.setDepth(TransformComponent.y[entity] - 5);
    const zScale = Math.max(0.25, 1 - Math.abs(TransformComponent.z[entity]) / 420);
    render.shadow.setScale(profile.shadowScale * zScale);

    render.sprite.setScale(TransformComponent.scaleX[entity], TransformComponent.scaleY[entity]);
    render.sprite.setRotation(TransformComponent.rotation[entity]);
    render.sprite.setFlipX(TransformComponent.facing[entity] < 0);
    render.sprite.setAlpha(SpriteComponent.alpha[entity]);
    render.sprite.setTint(SpriteComponent.tint[entity]);
  }
};
