import { describe, expect, it } from 'vitest';
import { ASSET_MANIFEST, REQUIRED_ANIMATION_STATES } from '../assets/manifest';
import { PLAYABLE_CHARACTERS } from '../config/characters';

describe('animation mapping', () => {
  it('ensures every playable character includes all required animation states', () => {
    for (const character of PLAYABLE_CHARACTERS) {
      for (const requiredState of REQUIRED_ANIMATION_STATES) {
        expect(
          character.animationStates.includes(requiredState),
          `${character.id} is missing animation state ${requiredState}`,
        ).toBe(true);
      }
    }
  });

  it('ensures each playable character has a bound animation clip with frames', () => {
    for (const character of PLAYABLE_CHARACTERS) {
      const textureKey = `player-${character.id === 'heavy-brawler' ? 'heavy' : character.id}`;
      const binding = ASSET_MANIFEST.entityAnimationBindings[textureKey];
      expect(binding, `${textureKey} missing animation binding`).toBeDefined();
      if (!binding) {
        continue;
      }
      const set = ASSET_MANIFEST.animationSets[binding.animationSetId];
      expect(set, `${textureKey} missing animation set`).toBeDefined();
      if (!set) {
        continue;
      }
      for (const requiredState of REQUIRED_ANIMATION_STATES) {
        const clip = set.clips[requiredState];
        expect(clip, `${textureKey} missing clip ${requiredState}`).toBeDefined();
        expect((clip?.frames.length ?? 0) > 0).toBe(true);
      }
    }
  });
});
