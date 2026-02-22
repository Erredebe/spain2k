import { describe, expect, it } from 'vitest';
import { ASSET_MANIFEST } from '../assets/manifest';
import { validateManifestDefinitions } from '../assets/validation';

describe('asset manifest', () => {
  it('defines all required image/audio keys', () => {
    const result = validateManifestDefinitions(ASSET_MANIFEST);
    expect(result.missingImageDefinitions).toHaveLength(0);
    expect(result.missingAtlasDefinitions).toHaveLength(0);
    expect(result.missingAudioDefinitions).toHaveLength(0);
    expect(result.missingAnimationFrameDefinitions).toHaveLength(0);
    expect(result.missingAnimationBindings).toHaveLength(0);
    expect(result.missingAnimationSets).toHaveLength(0);
  });

  it('uses valid audio definitions with at least one source format', () => {
    for (const definition of Object.values(ASSET_MANIFEST.audio)) {
      const hasSource = Boolean(definition.oggPath || definition.mp3Path);
      expect(hasSource).toBe(true);
      expect(definition.volume).toBeGreaterThan(0);
      expect(definition.volume).toBeLessThanOrEqual(1);
    }
  });

  it('declares animation set binding for all gameplay entities', () => {
    const requiredEntities = [
      'player-heavy',
      'player-technical',
      'player-agile',
      'enemy-brawler',
      'enemy-rusher',
      'enemy-tank',
      'enemy-armed',
      'enemy-ranged',
      'boss-cabecilla',
    ];
    for (const entityKey of requiredEntities) {
      const binding = ASSET_MANIFEST.entityAnimationBindings[entityKey];
      expect(binding, `${entityKey} missing animation binding`).toBeDefined();
      if (!binding) {
        continue;
      }
      expect(ASSET_MANIFEST.animationSets[binding.animationSetId]).toBeDefined();
    }
  });
});
