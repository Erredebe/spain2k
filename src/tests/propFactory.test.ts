import { describe, expect, it } from 'vitest';
import type { InteractableDefinition } from '../config/types';
import { resolvePropTextureKey } from '../entities/propFactory';

describe('prop factory mapping', () => {
  it('maps each prop type to dedicated environment texture key', () => {
    const crate: InteractableDefinition = {
      id: 'crate-01',
      type: 'crate',
      x: 0,
      y: 0,
      hp: 20,
    };
    const train: InteractableDefinition = {
      id: 'train-01',
      type: 'train',
      x: 0,
      y: 0,
      hp: 99,
    };
    const container: InteractableDefinition = {
      id: 'container-01',
      type: 'container-light',
      x: 0,
      y: 0,
      hp: 45,
    };

    expect(resolvePropTextureKey(crate)).toBe('prop-crate');
    expect(resolvePropTextureKey(train)).toBe('prop-train');
    expect(resolvePropTextureKey(container)).toBe('prop-container-light');
  });

  it('rejects non-prop visual keys and falls back to safe mapping', () => {
    const forgedDefinition = {
      id: 'crate-02',
      type: 'crate',
      visualKey: 'enemy-brawler',
      x: 0,
      y: 0,
      hp: 20,
    } as unknown as InteractableDefinition;

    expect(resolvePropTextureKey(forgedDefinition)).toBe('prop-crate');
  });
});
