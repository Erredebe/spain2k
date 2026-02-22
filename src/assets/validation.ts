import type { AssetManifest } from '../config/types';

export interface ManifestValidationResult {
  missingImageDefinitions: string[];
  missingAudioDefinitions: string[];
}

export interface RuntimeValidationResult {
  missingImageLoads: string[];
  missingAudioLoads: string[];
}

export const validateManifestDefinitions = (
  manifest: AssetManifest,
): ManifestValidationResult => {
  const missingImageDefinitions = manifest.requiredImageKeys.filter((key) => !manifest.images[key]);
  const missingAudioDefinitions = manifest.requiredAudioKeys.filter((key) => !manifest.audio[key]);
  return {
    missingImageDefinitions,
    missingAudioDefinitions,
  };
};

export const validateRuntimeLoads = (
  manifest: AssetManifest,
  lookups: {
    hasImage: (key: string) => boolean;
    hasAudio: (key: string) => boolean;
  },
): RuntimeValidationResult => {
  const missingImageLoads = manifest.requiredImageKeys.filter((key) => !lookups.hasImage(key));
  const missingAudioLoads = manifest.requiredAudioKeys.filter((key) => !lookups.hasAudio(key));
  return {
    missingImageLoads,
    missingAudioLoads,
  };
};

export const assertManifestValid = (manifest: AssetManifest): void => {
  const result = validateManifestDefinitions(manifest);
  if (!result.missingImageDefinitions.length && !result.missingAudioDefinitions.length) {
    return;
  }
  const issues = [
    ...result.missingImageDefinitions.map((key) => `missing image definition: ${key}`),
    ...result.missingAudioDefinitions.map((key) => `missing audio definition: ${key}`),
  ];
  throw new Error(`Invalid asset manifest. ${issues.join(', ')}`);
};

export const assertRuntimeAssetsLoaded = (
  manifest: AssetManifest,
  lookups: {
    hasImage: (key: string) => boolean;
    hasAudio: (key: string) => boolean;
  },
): void => {
  const result = validateRuntimeLoads(manifest, lookups);
  if (!result.missingImageLoads.length && !result.missingAudioLoads.length) {
    return;
  }
  const issues = [
    ...result.missingImageLoads.map((key) => `missing loaded image: ${key}`),
    ...result.missingAudioLoads.map((key) => `missing loaded audio: ${key}`),
  ];
  throw new Error(`Asset preload failed. ${issues.join(', ')}`);
};
