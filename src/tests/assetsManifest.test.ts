import { describe, expect, it } from 'vitest';
import { ASSET_MANIFEST } from '../assets/manifest';
import { validateManifestDefinitions } from '../assets/validation';

describe('asset manifest', () => {
  it('defines all required image/audio keys', () => {
    const result = validateManifestDefinitions(ASSET_MANIFEST);
    expect(result.missingImageDefinitions).toHaveLength(0);
    expect(result.missingAudioDefinitions).toHaveLength(0);
  });

  it('uses valid audio definitions with at least one source format', () => {
    for (const definition of Object.values(ASSET_MANIFEST.audio)) {
      const hasSource = Boolean(definition.oggPath || definition.mp3Path);
      expect(hasSource).toBe(true);
      expect(definition.volume).toBeGreaterThan(0);
      expect(definition.volume).toBeLessThanOrEqual(1);
    }
  });
});
