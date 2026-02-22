import { createWorld } from 'bitecs';
import type Phaser from 'phaser';
import { EventBus } from '../events/eventBus';
import type { BossDefinition, LevelDefinition, Locale } from '../../config/types';
import type { GameEcsContext } from '../../systems/types';
import type { HudController } from '../../ui/HUD';
import type { AudioMixer } from '../../audio/audioMixer';

interface CreateContextOptions {
  level: LevelDefinition;
  levelIndex: number;
  selectedCharacters: [string, string];
  coopEnabled: boolean;
  locale: Locale;
  hud: HudController;
  audio: AudioMixer;
  bossDefinition: BossDefinition;
  controls: GameEcsContext['controls'];
}

export const createEcsContext = (
  scene: Phaser.Scene,
  options: CreateContextOptions,
): GameEcsContext => ({
  scene,
  world: createWorld(),
  eventBus: new EventBus(),
  nowMs: 0,
  deltaMs: 0,
  hitstopMs: 0,
  entitiesMeta: new Map(),
  renderObjects: new Map(),
  hitboxes: new Map(),
  hurtboxes: new Map(),
  inputBuffers: new Map(),
  activeAttacks: new Map(),
  pendingDestroy: new Set<number>(),
  spawnRuntime: {
    currentWaveIndex: 0,
    pending: [],
    timeUntilNextSpawnMs: 0,
    levelComplete: false,
    bossSpawned: false,
    midEventTriggered: false,
  },
  levelRuntime: {
    levelIndex: options.levelIndex,
    level: options.level,
  },
  selectedCharacters: options.selectedCharacters,
  coopEnabled: options.coopEnabled,
  locale: options.locale,
  hud: options.hud,
  audio: options.audio,
  activeBossEntity: null,
  bossDefinition: options.bossDefinition,
  remapArmed: false,
  controls: options.controls,
  pendingHits: [],
});
