import type Phaser from 'phaser';
import { addComponent, addEntity } from 'bitecs';
import {
  ActiveEntityComponent,
  AnimationComponent,
  CombatComponent,
  HealthComponent,
  HitboxComponent,
  HurtboxComponent,
  MovementComponent,
  RenderObjectComponent,
  SpriteComponent,
  StateMachineComponent,
  TeamComponent,
  TransformComponent,
} from '../components';
import type { GameEcsContext } from '../systems/types';
import type { HurtboxRuntime, RenderObjectRef } from '../components/runtimeStores';

let renderObjectCounter = 1;

export const createRenderObject = (
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
): RenderObjectRef => {
  const shadow = scene.add.ellipse(x, y + 78, 125, 36, 0x000000, 0.25).setDepth(y - 0.01);
  const sprite = scene.add.image(x, y, textureKey).setOrigin(0.5, 0.87).setDepth(y);
  return {
    id: renderObjectCounter++,
    sprite,
    shadow,
  };
};

interface CreateBaseEntityInput {
  context: GameEcsContext;
  x: number;
  y: number;
  textureIndex: number;
  textureKey: string;
  hp: number;
  attack: number;
  defense: number;
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  gravity: number;
  team: number;
  hurtbox?: HurtboxRuntime;
}

export const createBaseEntity = (input: CreateBaseEntityInput): number => {
  const { context } = input;
  const entity = addEntity(context.world);
  addComponent(context.world, ActiveEntityComponent, entity);
  addComponent(context.world, TransformComponent, entity);
  addComponent(context.world, SpriteComponent, entity);
  addComponent(context.world, AnimationComponent, entity);
  addComponent(context.world, HealthComponent, entity);
  addComponent(context.world, CombatComponent, entity);
  addComponent(context.world, HitboxComponent, entity);
  addComponent(context.world, HurtboxComponent, entity);
  addComponent(context.world, MovementComponent, entity);
  addComponent(context.world, StateMachineComponent, entity);
  addComponent(context.world, TeamComponent, entity);
  addComponent(context.world, RenderObjectComponent, entity);

  TransformComponent.x[entity] = input.x;
  TransformComponent.y[entity] = input.y;
  TransformComponent.z[entity] = 0;
  TransformComponent.scaleX[entity] = 1;
  TransformComponent.scaleY[entity] = 1;
  TransformComponent.rotation[entity] = 0;
  TransformComponent.facing[entity] = 1;

  SpriteComponent.textureIndex[entity] = input.textureIndex;
  SpriteComponent.frame[entity] = 0;
  SpriteComponent.depth[entity] = input.y;
  SpriteComponent.visible[entity] = 1;
  SpriteComponent.flipX[entity] = 0;
  SpriteComponent.tint[entity] = 0xffffff;
  SpriteComponent.alpha[entity] = 1;

  AnimationComponent.stateAnim[entity] = 0;
  AnimationComponent.frameIndex[entity] = 0;
  AnimationComponent.elapsed[entity] = 0;
  AnimationComponent.lockedUntilMs[entity] = 0;
  AnimationComponent.cancelOpenMs[entity] = 0;
  AnimationComponent.cancelCloseMs[entity] = 0;

  HealthComponent.hp[entity] = input.hp;
  HealthComponent.maxHp[entity] = input.hp;
  HealthComponent.isAlive[entity] = 1;
  HealthComponent.invulnUntilMs[entity] = 0;
  HealthComponent.downUntilMs[entity] = 0;

  CombatComponent.attack[entity] = input.attack;
  CombatComponent.defense[entity] = input.defense;
  CombatComponent.comboCounter[entity] = 0;
  CombatComponent.comboTimerMs[entity] = 0;
  CombatComponent.specialMeter[entity] = 0;
  CombatComponent.juggleCount[entity] = 0;
  CombatComponent.lastHitBy[entity] = -1;

  HitboxComponent.attackId[entity] = 0;
  HitboxComponent.active[entity] = 0;
  HurtboxComponent.active[entity] = 1;

  MovementComponent.vx[entity] = 0;
  MovementComponent.vy[entity] = 0;
  MovementComponent.ax[entity] = 0;
  MovementComponent.ay[entity] = 0;
  MovementComponent.walkSpeed[entity] = input.walkSpeed;
  MovementComponent.runSpeed[entity] = input.runSpeed;
  MovementComponent.jumpForce[entity] = input.jumpForce;
  MovementComponent.gravity[entity] = input.gravity;
  MovementComponent.onGround[entity] = 1;
  MovementComponent.dashCooldownMs[entity] = 0;

  StateMachineComponent.current[entity] = 0;
  StateMachineComponent.previous[entity] = 0;
  StateMachineComponent.timerMs[entity] = 0;
  StateMachineComponent.transitionFlags[entity] = 0;

  TeamComponent.value[entity] = input.team;

  const renderObject = createRenderObject(context.scene, input.textureKey, input.x, input.y);
  RenderObjectComponent.objectId[entity] = renderObject.id;
  context.renderObjects.set(entity, renderObject);
  context.hurtboxes.set(
    entity,
    input.hurtbox ?? { offsetX: 0, offsetY: -26, width: 72, height: 124 },
  );

  return entity;
};
