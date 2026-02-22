import type Phaser from 'phaser';
import type { IWorld } from 'bitecs';
import type { EventBus } from '../core/events/eventBus';
import type {
  BossDefinition,
  InputDeviceAssignment,
  LevelDefinition,
  Locale,
  SaveDataV1,
} from '../config/types';
import type {
  AnimationRuntimeState,
  AttackRuntime,
  EntityMeta,
  HitboxRuntime,
  HurtboxRuntime,
  InputBuffer,
  RenderObjectRef,
} from '../components/runtimeStores';
import type { HudController } from '../ui/HUD';
import type { AudioManager } from '../audio/audioManager';

export interface SpawnPlanItem {
  enemyId: string;
  x: number;
  y: number;
}

export interface SpawnRuntime {
  currentWaveIndex: number;
  pending: SpawnPlanItem[];
  timeUntilNextSpawnMs: number;
  levelComplete: boolean;
  bossSpawned: boolean;
  midEventTriggered: boolean;
}

export interface LevelRuntime {
  levelIndex: number;
  level: LevelDefinition;
}

export interface GameEcsContext {
  scene: Phaser.Scene;
  world: IWorld;
  eventBus: EventBus;
  nowMs: number;
  deltaMs: number;
  hitstopMs: number;
  entitiesMeta: Map<number, EntityMeta>;
  renderObjects: Map<number, RenderObjectRef>;
  hitboxes: Map<number, HitboxRuntime>;
  hurtboxes: Map<number, HurtboxRuntime>;
  inputBuffers: Map<number, InputBuffer>;
  animationRuntime: Map<number, AnimationRuntimeState>;
  activeAttacks: Map<number, AttackRuntime>;
  pendingDestroy: Set<number>;
  spawnRuntime: SpawnRuntime;
  levelRuntime: LevelRuntime;
  selectedCharacters: [string, string];
  coopEnabled: boolean;
  locale: Locale;
  hud: HudController;
  audio: AudioManager;
  activeBossEntity: number | null;
  bossDefinition: BossDefinition;
  remapArmed: boolean;
  controls: SaveDataV1['controls'];
  inputSettings: SaveDataV1['input'];
  inputAssignments: Record<1 | 2, InputDeviceAssignment>;
  pendingHits: Array<{ attacker: number; defender: number; hitbox: HitboxRuntime }>;
}

export type SystemFn = (context: GameEcsContext) => void;
