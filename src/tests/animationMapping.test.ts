import { describe, expect, it } from 'vitest';
import { REQUIRED_ANIMATION_STATES } from '../assets/manifest';
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
});
