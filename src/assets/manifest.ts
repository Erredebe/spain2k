import {
  ENTITY_ANIMATION_BINDINGS,
  ENTITY_ANIMATION_SETS,
  REQUIRED_ANIMATION_FRAMES,
} from '../config/animations';
import type { AssetManifest, AudioDefinition } from '../config/types';

export const TEXTURE_KEYS = {
  players: ['player-heavy', 'player-technical', 'player-agile'],
  enemies: ['enemy-brawler', 'enemy-rusher', 'enemy-tank', 'enemy-armed', 'enemy-ranged'],
  boss: 'boss-cabecilla',
  props: ['prop-crate', 'prop-train', 'prop-container-light'],
  effects: ['fx-impact', 'fx-spark', 'fx-special'],
  ui: ['ui-bar-bg', 'ui-bar-fill', 'ui-panel'],
  backgrounds: ['bg-market', 'bg-metro', 'bg-port', 'bg-gradient-warm', 'bg-gradient-cold'],
  parallax: ['parallax-cloud-1', 'parallax-cloud-2', 'parallax-hills', 'parallax-mountain'],
} as const;

export const TEXTURE_INDEX: Record<string, number> = {
  'player-heavy': 1,
  'player-technical': 2,
  'player-agile': 3,
  'enemy-brawler': 101,
  'enemy-rusher': 102,
  'enemy-tank': 103,
  'enemy-armed': 104,
  'enemy-ranged': 105,
  'boss-cabecilla': 201,
  'prop-crate': 301,
  'prop-train': 302,
  'prop-container-light': 303,
};

export const TEXTURE_KEY_BY_INDEX: Record<number, string> = Object.entries(TEXTURE_INDEX).reduce(
  (accumulator, [key, value]) => {
    accumulator[value] = key;
    return accumulator;
  },
  {} as Record<number, string>,
);

export interface TextureRuntimeRef {
  textureKey: string;
  frame?: string;
}

const resolveDefaultFrame = (entityKey: string): string => {
  const binding = ENTITY_ANIMATION_BINDINGS[entityKey];
  const set = binding ? ENTITY_ANIMATION_SETS[binding.animationSetId] : undefined;
  const fallbackState = set?.fallbackState ?? 'idle';
  const firstFrame = set?.clips[fallbackState]?.frames[0];
  return firstFrame ? firstFrame.frame : 'heavy.idle.00';
};

export const ENTITY_TEXTURE_REFS: Record<string, TextureRuntimeRef> = {
  'player-heavy': { textureKey: 'entities-anim', frame: resolveDefaultFrame('player-heavy') },
  'player-technical': {
    textureKey: 'entities-anim',
    frame: resolveDefaultFrame('player-technical'),
  },
  'player-agile': { textureKey: 'entities-anim', frame: resolveDefaultFrame('player-agile') },
  'enemy-brawler': { textureKey: 'entities-anim', frame: resolveDefaultFrame('enemy-brawler') },
  'enemy-rusher': { textureKey: 'entities-anim', frame: resolveDefaultFrame('enemy-rusher') },
  'enemy-tank': { textureKey: 'entities-anim', frame: resolveDefaultFrame('enemy-tank') },
  'enemy-armed': { textureKey: 'entities-anim', frame: resolveDefaultFrame('enemy-armed') },
  'enemy-ranged': { textureKey: 'entities-anim', frame: resolveDefaultFrame('enemy-ranged') },
  'boss-cabecilla': { textureKey: 'entities-anim', frame: resolveDefaultFrame('boss-cabecilla') },
  'prop-crate': { textureKey: 'prop-crate' },
  'prop-train': { textureKey: 'prop-train' },
  'prop-container-light': { textureKey: 'prop-container-light' },
};

const IMAGE_ASSETS: Record<string, string> = {
  'bg-market': '/assets/images/backgrounds/bg-market.png',
  'bg-metro': '/assets/images/backgrounds/bg-metro.png',
  'bg-port': '/assets/images/backgrounds/bg-port.png',
  'bg-gradient-warm': '/assets/images/backgrounds/bg-gradient-warm.png',
  'bg-gradient-cold': '/assets/images/backgrounds/bg-gradient-cold.png',
  'parallax-cloud-1': '/assets/parallax/cloudLayer1.png',
  'parallax-cloud-2': '/assets/parallax/cloudLayer2.png',
  'parallax-hills': '/assets/parallax/hillsLarge.png',
  'parallax-mountain': '/assets/parallax/mountainA.png',
  'prop-crate': '/assets/images/props/prop-crate.png',
  'prop-train': '/assets/images/props/prop-train.png',
  'prop-container-light': '/assets/images/props/prop-container-light.png',
  'fx-impact': '/assets/images/effects/fx-impact.png',
  'fx-spark': '/assets/images/effects/fx-spark.png',
  'fx-special': '/assets/images/effects/fx-special.png',
  'ui-bar-bg': '/assets/images/ui/ui-bar-bg.png',
  'ui-bar-fill': '/assets/images/ui/ui-bar-fill.png',
  'ui-panel': '/assets/images/ui/ui-panel.png',
};

const ATLAS_ASSETS = {
  'entities-anim': {
    key: 'entities-anim',
    texturePath: '/assets/atlases/entities-anim/entities-anim.png',
    atlasPath: '/assets/atlases/entities-anim/entities-anim.json',
    requiredFrames: REQUIRED_ANIMATION_FRAMES,
  },
} as const;

const AUDIO_ASSETS: Record<string, AudioDefinition> = {
  'market-theme': {
    key: 'market-theme',
    category: 'music',
    loop: true,
    volume: 0.36,
    oggPath: '/assets/audio/music/market-theme.ogg',
    mp3Path: '/assets/audio/music/market-theme.mp3',
  },
  'metro-theme': {
    key: 'metro-theme',
    category: 'music',
    loop: true,
    volume: 0.34,
    oggPath: '/assets/audio/music/metro-theme.ogg',
    mp3Path: '/assets/audio/music/metro-theme.mp3',
  },
  'port-theme': {
    key: 'port-theme',
    category: 'music',
    loop: true,
    volume: 0.34,
    oggPath: '/assets/audio/music/port-theme.ogg',
    mp3Path: '/assets/audio/music/port-theme.mp3',
  },
  'hit-light': {
    key: 'hit-light',
    category: 'sfx',
    loop: false,
    volume: 0.34,
    oggPath: '/assets/audio/sfx/hit-light.ogg',
  },
  'hit-heavy': {
    key: 'hit-heavy',
    category: 'sfx',
    loop: false,
    volume: 0.38,
    oggPath: '/assets/audio/sfx/hit-heavy.ogg',
  },
  special: {
    key: 'special',
    category: 'sfx',
    loop: false,
    volume: 0.4,
    oggPath: '/assets/audio/sfx/special.ogg',
  },
  step: {
    key: 'step',
    category: 'sfx',
    loop: false,
    volume: 0.26,
    oggPath: '/assets/audio/sfx/step.ogg',
  },
  'ui-click': {
    key: 'ui-click',
    category: 'sfx',
    loop: false,
    volume: 0.28,
    oggPath: '/assets/audio/sfx/ui-click.ogg',
  },
};

export const ASSET_MANIFEST: AssetManifest = {
  images: IMAGE_ASSETS,
  atlases: ATLAS_ASSETS,
  audio: AUDIO_ASSETS,
  animationSets: ENTITY_ANIMATION_SETS,
  entityAnimationBindings: ENTITY_ANIMATION_BINDINGS,
  requiredAnimationFrames: REQUIRED_ANIMATION_FRAMES,
  requiredImageKeys: Object.keys(IMAGE_ASSETS),
  requiredAudioKeys: Object.keys(AUDIO_ASSETS),
};

export const REQUIRED_ANIMATION_STATES = [
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
] as const;
