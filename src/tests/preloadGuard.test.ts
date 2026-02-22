import { describe, expect, it } from 'vitest';
import { assertManifestValid, assertRuntimeAssetsLoaded } from '../assets/validation';
import type { AssetManifest } from '../config/types';

const baseManifest: AssetManifest = {
  images: {
    hero: '/assets/hero.png',
  },
  atlases: {},
  audio: {
    theme: {
      key: 'theme',
      category: 'music',
      loop: true,
      volume: 0.5,
      oggPath: '/assets/theme.ogg',
    },
  },
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
      }),
    ).toThrow(/missing loaded audio/i);
  });
});
