import { Types, defineComponent } from 'bitecs';

export const TransformComponent = defineComponent({
  x: Types.f32,
  y: Types.f32,
  z: Types.f32,
  scaleX: Types.f32,
  scaleY: Types.f32,
  rotation: Types.f32,
  facing: Types.i8,
});

export const SpriteComponent = defineComponent({
  textureIndex: Types.ui16,
  frame: Types.ui16,
  depth: Types.f32,
  visible: Types.ui8,
  flipX: Types.ui8,
  tint: Types.ui32,
  alpha: Types.f32,
});

export const AnimationComponent = defineComponent({
  stateAnim: Types.ui8,
  frameIndex: Types.ui16,
  elapsed: Types.f32,
  lockedUntilMs: Types.f32,
  cancelOpenMs: Types.f32,
  cancelCloseMs: Types.f32,
});

export const HealthComponent = defineComponent({
  hp: Types.f32,
  maxHp: Types.f32,
  isAlive: Types.ui8,
  invulnUntilMs: Types.f32,
  downUntilMs: Types.f32,
});

export const CombatComponent = defineComponent({
  attack: Types.f32,
  defense: Types.f32,
  comboCounter: Types.ui8,
  comboTimerMs: Types.f32,
  specialMeter: Types.f32,
  juggleCount: Types.ui8,
  lastHitBy: Types.i16,
});

export const HitboxComponent = defineComponent({
  attackId: Types.ui16,
  active: Types.ui8,
});

export const HurtboxComponent = defineComponent({
  active: Types.ui8,
});

export const MovementComponent = defineComponent({
  vx: Types.f32,
  vy: Types.f32,
  ax: Types.f32,
  ay: Types.f32,
  walkSpeed: Types.f32,
  runSpeed: Types.f32,
  jumpForce: Types.f32,
  gravity: Types.f32,
  onGround: Types.ui8,
  dashCooldownMs: Types.f32,
});

export const InputComponent = defineComponent({
  enabled: Types.ui8,
  playerIndex: Types.ui8,
  deviceType: Types.ui8,
  bufferSize: Types.ui8,
});

export const AIComponent = defineComponent({
  state: Types.ui8,
  targetEntity: Types.i16,
  decisionTimerMs: Types.f32,
  aggression: Types.f32,
  range: Types.f32,
});

export const StateMachineComponent = defineComponent({
  current: Types.ui8,
  previous: Types.ui8,
  timerMs: Types.f32,
  transitionFlags: Types.ui16,
});

export const TeamComponent = defineComponent({
  value: Types.ui8,
});

export const BossComponent = defineComponent({
  phase: Types.ui8,
  aoeCooldownMs: Types.f32,
  dashCooldownMs: Types.f32,
  enraged: Types.ui8,
});

export const CameraTargetComponent = defineComponent();

export const ActiveEntityComponent = defineComponent({
  value: Types.ui8,
});

export const RenderObjectComponent = defineComponent({
  objectId: Types.ui16,
});

export const PlayerTag = defineComponent();
export const EnemyTag = defineComponent();
export const BossTag = defineComponent();
export const ProjectileTag = defineComponent();
export const InteractableTag = defineComponent();

export const AnimationStateMap = {
  idle: 0,
  walk: 1,
  run: 2,
  jump: 3,
  fall: 4,
  'light-combo-1': 5,
  'light-combo-2': 6,
  'light-combo-3': 7,
  heavy: 8,
  'air-attack': 9,
  grab: 10,
  throw: 11,
  special: 12,
  hurt: 13,
  knockdown: 14,
  recovery: 15,
  victory: 16,
} as const;

export const AIStateMap = {
  Idle: 0,
  Approach: 1,
  Attack: 2,
  Retreat: 3,
  Stunned: 4,
  Knockdown: 5,
  Enraged: 6,
} as const;

export const InverseAIStateMap = {
  0: 'Idle',
  1: 'Approach',
  2: 'Attack',
  3: 'Retreat',
  4: 'Stunned',
  5: 'Knockdown',
  6: 'Enraged',
} as const;
