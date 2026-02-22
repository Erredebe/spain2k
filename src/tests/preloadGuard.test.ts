import { describe, expect, it } from 'vitest';
import { assertManifestValid, assertRuntimeAssetsLoaded } from '../assets/validation';
import type { AssetManifest } from '../config/types';

const baseManifest: AssetManifest = {
  images: {
    hero: '/assets/hero.png',
  },
  atlases: {
    'entities-anim': {
      key: 'entities-anim',
      texturePath: '/assets/entities-anim.png',
      atlasPath: '/assets/entities-anim.json',
      requiredFrames: ['hero.idle.00'],
    },
  },
  audio: {
    theme: {
      key: 'theme',
      category: 'music',
      loop: true,
      volume: 0.5,
      oggPath: '/assets/theme.ogg',
    },
  },
  animationSets: {
    hero: {
      id: 'hero',
      fallbackState: 'idle',
      clips: {
        idle: {
          id: 'hero.idle',
          state: 'idle',
          fps: 8,
          loop: true,
          frames: [{ atlasKey: 'entities-anim', frame: 'hero.idle.00' }],
        },
      },
    },
  },
  entityAnimationBindings: {
    hero: {
      entityKey: 'hero',
      animationSetId: 'hero',
      visualScaleProfileId: 'hero',
    },
  },
  requiredAnimationFrames: ['hero.idle.00'],
  requiredImageKeys: ['hero'],
  requiredAudioKeys: ['theme'],
};

describe('preload guards', () => {
  it('fails when required audio definition is missing', () => {
    const invalid: AssetManifest = {
      ...baseManifest,
      audio: {},
    };
    expect(() => assertManifestValid(invalid)).toThrow(/missing audio definition/i);
  });

  it('fails when required runtime audio key was not loaded', () => {
    expect(() =>
      assertRuntimeAssetsLoaded(baseManifest, {
        hasImage: () => true,
        hasAudio: () => false,
        hasAtlas: () => true,
        hasAtlasFrame: () => true,
      }),
    ).toThrow(/missing loaded audio/i);
  });

  it('fails when required animation frame was not loaded from atlas', () => {
    expect(() =>
      assertRuntimeAssetsLoaded(baseManifest, {
        hasImage: () => true,
        hasAudio: () => true,
        hasAtlas: () => true,
        hasAtlasFrame: () => false,
      }),
    ).toThrow(/missing loaded animation frame/i);
  });
});
