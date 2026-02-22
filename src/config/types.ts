export type Locale = 'es' | 'en';

export type GameplayDifficulty = 'adaptive-normal';

export type InputDeviceType = 'keyboard' | 'gamepad';

export type AttackKind =
  | 'light-1'
  | 'light-2'
  | 'light-3'
  | 'heavy'
  | 'air'
  | 'grab'
  | 'throw'
  | 'special'
  | 'enemy-melee'
  | 'enemy-ranged'
  | 'boss-aoe'
  | 'boss-dash';

export type PlayerAttackKind =
  | 'light-1'
  | 'light-2'
  | 'light-3'
  | 'heavy'
  | 'air'
  | 'grab'
  | 'throw'
  | 'special';

export type CharacterArchetype = 'heavy-brawler' | 'technical' | 'agile';

export type EnemyType = 'brawler' | 'rusher' | 'tank' | 'armed' | 'ranged';

export type AIState =
  | 'Idle'
  | 'Approach'
  | 'Attack'
  | 'Retreat'
  | 'Stunned'
  | 'Knockdown'
  | 'Enraged';

export type AnimationState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'light-combo-1'
  | 'light-combo-2'
  | 'light-combo-3'
  | 'heavy'
  | 'air-attack'
  | 'grab'
  | 'throw'
  | 'special'
  | 'hurt'
  | 'knockdown'
  | 'recovery'
  | 'victory';

export interface HitboxShape {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface HurtboxShape {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface AttackDefinition {
  id: string;
  kind: AttackKind;
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
  cancelOpenMs: number;
  cancelCloseMs: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstopMs: number;
  juggleCost: number;
  groundBounce: boolean;
  hitbox: HitboxShape;
  specialGain: number;
}

export interface CharacterStats {
  maxHp: number;
  attack: number;
  defense: number;
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  gravity: number;
  maxJuggle: number;
}

export interface CharacterDefinition {
  id: string;
  displayName: string;
  archetype: CharacterArchetype;
  stats: CharacterStats;
  moveset: Record<PlayerAttackKind, AttackDefinition>;
  animationStates: AnimationState[];
  palette: [number, number, number];
}

export interface EnemyDefinition {
  id: string;
  enemyType: EnemyType;
  maxHp: number;
  attack: number;
  defense: number;
  moveSpeed: number;
  decisionMs: number;
  approachRange: number;
  retreatRange: number;
  attackRange: number;
  weight: number;
  weapon: 'none' | 'bat' | 'chain' | 'gun';
}

export interface BossPhasePattern {
  id: string;
  dashCooldownMs: number;
  aoeCooldownMs: number;
  aggressionMultiplier: number;
}

export interface BossDefinition {
  id: string;
  displayName: string;
  maxHp: number;
  phaseThresholds: [number, number];
  phases: [BossPhasePattern, BossPhasePattern, BossPhasePattern];
}

export interface WaveSpawn {
  enemyId: string;
  count: number;
  spawnDelayMs: number;
  spawnPoints: Array<{ x: number; y: number }>;
}

export interface WaveDefinition {
  id: string;
  trigger: 'auto' | 'on-clear';
  maxConcurrent: number;
  spawns: WaveSpawn[];
}

export interface MidLevelEvent {
  id: string;
  triggerAfterWaveId: string;
  subtitleEs: string;
  subtitleEn: string;
  durationMs: number;
}

export interface InteractableDefinition {
  id: string;
  type: 'crate' | 'train' | 'container-light';
  x: number;
  y: number;
  hp: number;
}

export interface LevelDefinition {
  id: string;
  displayNameEs: string;
  displayNameEn: string;
  introEs: string;
  introEn: string;
  musicKey: string;
  backgroundStyle: 'market' | 'metro' | 'port';
  warmLighting: boolean;
  waves: WaveDefinition[];
  midEvent: MidLevelEvent;
  interactables: InteractableDefinition[];
  hasBoss: boolean;
}

export type PlayerAction =
  | 'move-left'
  | 'move-right'
  | 'move-up'
  | 'move-down'
  | 'jump'
  | 'light'
  | 'heavy'
  | 'grab'
  | 'special'
  | 'pause';

export interface InputBinding {
  action: PlayerAction;
  keyboard: string;
  gamepadButton: number;
  allowAxis?: boolean;
  displayLabel?: string;
}

export interface ControlProfile {
  playerIndex: 1 | 2;
  bindings: InputBinding[];
}

export interface AccessibilitySettings {
  subtitles: boolean;
  reducedFlashes: boolean;
  reducedShake: boolean;
  highContrastHud: boolean;
  largeHud: boolean;
}

export interface SaveDataV1 {
  version: 1;
  unlockedLevels: string[];
  selectedCharacterP1: string;
  selectedCharacterP2: string;
  checkpointLevelId: string | null;
  language: Locale;
  accessibility: AccessibilitySettings;
  controls: {
    p1: ControlProfile;
    p2: ControlProfile;
  };
  input: {
    deadzone: number;
    vibrationEnabled: boolean;
    lastDeviceByPlayer: {
      p1: InputDeviceType;
      p2: InputDeviceType;
    };
  };
}

export interface AtlasDefinition {
  key: string;
  texturePath: string;
  atlasPath: string;
  requiredFrames: string[];
}

export interface AudioDefinition {
  key: string;
  oggPath?: string;
  mp3Path?: string;
  loop: boolean;
  volume: number;
  category: 'music' | 'sfx';
}

export interface AnimationFrameRef {
  atlasKey: string;
  frame: string;
}

export interface AnimationClipDefinition {
  id: string;
  state: AnimationState;
  fps: number;
  loop: boolean;
  holdLastFrame?: boolean;
  frames: AnimationFrameRef[];
}

export interface AnimationSetDefinition {
  id: string;
  fallbackState: AnimationState;
  clips: Partial<Record<AnimationState, AnimationClipDefinition>>;
}

export interface VisualScaleProfile {
  id: string;
  scale: number;
  shadowScale: number;
  shadowYOffset: number;
}

export interface EntityAnimationBinding {
  entityKey: string;
  animationSetId: string;
  visualScaleProfileId: string;
}

export type GamepadLayoutLabel = 'web-standard';

export interface ControlGlyphSet {
  keyboard: Partial<Record<PlayerAction, string>>;
  gamepad: Partial<Record<PlayerAction, string>>;
}

export interface InputDeviceAssignment {
  playerIndex: 1 | 2;
  preferredGamepadIndex: number;
  activeDevice: InputDeviceType;
  lastInputAtMs: number;
}

export interface AssetManifest {
  images: Record<string, string>;
  atlases: Record<string, AtlasDefinition>;
  audio: Record<string, AudioDefinition>;
  animationSets: Record<string, AnimationSetDefinition>;
  entityAnimationBindings: Record<string, EntityAnimationBinding>;
  requiredAnimationFrames: string[];
  requiredImageKeys: string[];
  requiredAudioKeys: string[];
}

export interface AssetLicenseRecord {
  assetId: string;
  name: string;
  source: string;
  author: string;
  license: 'CC0' | 'CC-BY';
  usage: string;
  url: string;
  localPath: string;
  sha256: string;
  attributionRequired: boolean;
  attributionText: string;
}
