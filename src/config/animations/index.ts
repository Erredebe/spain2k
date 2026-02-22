import type {
  AnimationClipDefinition,
  AnimationSetDefinition,
  AnimationState,
  EntityAnimationBinding,
  VisualScaleProfile,
} from '../types';

interface ClipPreset {
  count: number;
  fps: number;
  loop: boolean;
  holdLastFrame?: boolean;
}

const CLIP_PRESETS: Record<AnimationState, ClipPreset> = {
  idle: { count: 5, fps: 8, loop: true },
  walk: { count: 6, fps: 11, loop: true },
  run: { count: 6, fps: 13, loop: true },
  jump: { count: 4, fps: 12, loop: false, holdLastFrame: true },
  fall: { count: 4, fps: 11, loop: true },
  'light-combo-1': { count: 5, fps: 16, loop: false, holdLastFrame: true },
  'light-combo-2': { count: 5, fps: 16, loop: false, holdLastFrame: true },
  'light-combo-3': { count: 5, fps: 15, loop: false, holdLastFrame: true },
  heavy: { count: 6, fps: 13, loop: false, holdLastFrame: true },
  'air-attack': { count: 5, fps: 14, loop: false, holdLastFrame: true },
  grab: { count: 4, fps: 12, loop: false, holdLastFrame: true },
  throw: { count: 5, fps: 12, loop: false, holdLastFrame: true },
  special: { count: 7, fps: 14, loop: false, holdLastFrame: true },
  hurt: { count: 4, fps: 12, loop: false, holdLastFrame: true },
  knockdown: { count: 5, fps: 11, loop: false, holdLastFrame: true },
  recovery: { count: 4, fps: 10, loop: false, holdLastFrame: true },
  victory: { count: 6, fps: 9, loop: true },
};

const ANIMATION_STATES: AnimationState[] = [
  'idle',
  'walk',
  'run',
  'jump',
  'fall',
  'light-combo-1',
  'light-combo-2',
  'light-combo-3',
  'heavy',
  'air-attack',
  'grab',
  'throw',
  'special',
  'hurt',
  'knockdown',
  'recovery',
  'victory',
];

const frameRef = (
  setId: string,
  state: AnimationState,
  index: number,
): AnimationClipDefinition['frames'][number] => ({
  atlasKey: 'entities-anim',
  frame: `${setId}.${state}.${String(index).padStart(2, '0')}`,
});

const buildSet = (setId: string): AnimationSetDefinition => {
  const clips: Partial<Record<AnimationState, AnimationClipDefinition>> = {};
  for (const state of ANIMATION_STATES) {
    const preset = CLIP_PRESETS[state];
    clips[state] = {
      id: `${setId}.${state}`,
      state,
      fps: preset.fps,
      loop: preset.loop,
      holdLastFrame: preset.holdLastFrame,
      frames: Array.from({ length: preset.count }, (_, index) => frameRef(setId, state, index)),
    };
  }
  return {
    id: setId,
    fallbackState: 'idle',
    clips,
  };
};

export const ENTITY_ANIMATION_SETS: Record<string, AnimationSetDefinition> = {
  heavy: buildSet('heavy'),
  technical: buildSet('technical'),
  agile: buildSet('agile'),
};

export const ENTITY_ANIMATION_BINDINGS: Record<string, EntityAnimationBinding> = {
  'player-heavy': {
    entityKey: 'player-heavy',
    animationSetId: 'heavy',
    visualScaleProfileId: 'heavy',
  },
  'player-technical': {
    entityKey: 'player-technical',
    animationSetId: 'technical',
    visualScaleProfileId: 'technical',
  },
  'player-agile': {
    entityKey: 'player-agile',
    animationSetId: 'agile',
    visualScaleProfileId: 'agile',
  },
  'enemy-brawler': {
    entityKey: 'enemy-brawler',
    animationSetId: 'heavy',
    visualScaleProfileId: 'enemyStandard',
  },
  'enemy-rusher': {
    entityKey: 'enemy-rusher',
    animationSetId: 'agile',
    visualScaleProfileId: 'enemyLight',
  },
  'enemy-tank': {
    entityKey: 'enemy-tank',
    animationSetId: 'technical',
    visualScaleProfileId: 'enemyTank',
  },
  'enemy-armed': {
    entityKey: 'enemy-armed',
    animationSetId: 'heavy',
    visualScaleProfileId: 'enemyStandard',
  },
  'enemy-ranged': {
    entityKey: 'enemy-ranged',
    animationSetId: 'agile',
    visualScaleProfileId: 'enemyLight',
  },
  'boss-cabecilla': {
    entityKey: 'boss-cabecilla',
    animationSetId: 'heavy',
    visualScaleProfileId: 'boss',
  },
};

export const VISUAL_SCALE_PROFILES: Record<string, VisualScaleProfile> = {
  heavy: { id: 'heavy', scale: 1.05, shadowScale: 1.2, shadowYOffset: 86 },
  technical: { id: 'technical', scale: 1.0, shadowScale: 1.12, shadowYOffset: 84 },
  agile: { id: 'agile', scale: 0.98, shadowScale: 1.05, shadowYOffset: 82 },
  enemyStandard: { id: 'enemyStandard', scale: 0.98, shadowScale: 1.08, shadowYOffset: 84 },
  enemyLight: { id: 'enemyLight', scale: 0.95, shadowScale: 1, shadowYOffset: 82 },
  enemyTank: { id: 'enemyTank', scale: 1.08, shadowScale: 1.24, shadowYOffset: 92 },
  boss: { id: 'boss', scale: 1.18, shadowScale: 1.32, shadowYOffset: 100 },
};

export const REQUIRED_ANIMATION_FRAMES = Object.values(ENTITY_ANIMATION_SETS).flatMap((set) =>
  Object.values(set.clips).flatMap((clip) => clip?.frames.map((frame) => frame.frame) ?? []),
);
