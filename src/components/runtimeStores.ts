import type Phaser from 'phaser';
import type {
  AttackDefinition,
  CharacterDefinition,
  EnemyDefinition,
  PlayerAttackKind,
} from '../config/types';

export interface HitboxRuntime {
  owner: number;
  attack: AttackDefinition;
  startedAtMs: number;
  expiresAtMs: number;
  alreadyHit: Set<number>;
}

export interface HurtboxRuntime {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface InputSnapshot {
  moveX: number;
  moveY: number;
  jumpPressed: boolean;
  lightPressed: boolean;
  heavyPressed: boolean;
  grabPressed: boolean;
  specialPressed: boolean;
  pausePressed: boolean;
}

export interface InputBuffer {
  last: InputSnapshot;
  queuedAttack: PlayerAttackKind | null;
}

export interface AttackRuntime {
  attackKey: PlayerAttackKind;
  attack: AttackDefinition;
  startedAtMs: number;
  lockUntilMs: number;
  cancelOpenMs: number;
  cancelCloseMs: number;
}

export interface EntityMeta {
  renderKey: string;
  displayName: string;
  character?: CharacterDefinition;
  enemy?: EnemyDefinition;
  isPlayer: boolean;
  playerIndex?: 1 | 2;
  isBoss: boolean;
  weight: number;
}

export interface RenderObjectRef {
  id: number;
  sprite: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Ellipse;
}
