import type { AssetManifest } from '../config/types';

export interface ManifestValidationResult {
  missingImageDefinitions: string[];
  missingAtlasDefinitions: string[];
  missingAudioDefinitions: string[];
  missingAnimationFrameDefinitions: string[];
  missingAnimationBindings: string[];
  missingAnimationSets: string[];
}

export interface RuntimeValidationResult {
  missingImageLoads: string[];
  missingAtlasLoads: string[];
  missingAnimationFrameLoads: string[];
  missingAudioLoads: string[];
}

export const validateManifestDefinitions = (
  manifest: AssetManifest,
): ManifestValidationResult => {
  const missingImageDefinitions = manifest.requiredImageKeys.filter((key) => !manifest.images[key]);
  const missingAtlasDefinitions =
    manifest.requiredAnimationFrames.length > 0 && Object.keys(manifest.atlases).length === 0
      ? ['entities-anim']
      : [];
  const missingAudioDefinitions = manifest.requiredAudioKeys.filter((key) => !manifest.audio[key]);
  const availableFrameNames = new Set(
    Object.values(manifest.atlases).flatMap((atlas) => atlas.requiredFrames),
  );
  const missingAnimationFrameDefinitions = manifest.requiredAnimationFrames.filter(
    (frame) => !availableFrameNames.has(frame),
  );
  const missingAnimationBindings = Object.values(manifest.entityAnimationBindings)
    .map((binding) => binding.animationSetId)
    .filter((setId) => !manifest.animationSets[setId]);
  const missingAnimationSets = Object.values(manifest.animationSets).flatMap((set) => {
    const hasFallback = Boolean(set.clips[set.fallbackState]);
    return hasFallback ? [] : [set.id];
  });
  return {
    missingImageDefinitions,
    missingAtlasDefinitions,
    missingAudioDefinitions,
    missingAnimationFrameDefinitions,
    missingAnimationBindings,
    missingAnimationSets,
  };
};

export const validateRuntimeLoads = (
  manifest: AssetManifest,
  lookups: {
    hasImage: (key: string) => boolean;
    hasAudio: (key: string) => boolean;
    hasAtlas: (key: string) => boolean;
    hasAtlasFrame: (atlasKey: string, frame: string) => boolean;
  },
): RuntimeValidationResult => {
  const missingImageLoads = manifest.requiredImageKeys.filter((key) => !lookups.hasImage(key));
  const missingAtlasLoads = Object.keys(manifest.atlases).filter((key) => !lookups.hasAtlas(key));
  const missingAnimationFrameLoads = Object.values(manifest.atlases).flatMap((atlas) =>
    atlas.requiredFrames
      .filter((frame) => !lookups.hasAtlasFrame(atlas.key, frame))
      .map((frame) => `${atlas.key}:${frame}`),
  );
  const missingAudioLoads = manifest.requiredAudioKeys.filter((key) => !lookups.hasAudio(key));
  return {
    missingImageLoads,
    missingAtlasLoads,
    missingAnimationFrameLoads,
    missingAudioLoads,
  };
};

export const assertManifestValid = (manifest: AssetManifest): void => {
  const result = validateManifestDefinitions(manifest);
  if (
    !result.missingImageDefinitions.length &&
    !result.missingAtlasDefinitions.length &&
    !result.missingAudioDefinitions.length &&
    !result.missingAnimationFrameDefinitions.length &&
    !result.missingAnimationBindings.length &&
    !result.missingAnimationSets.length
  ) {
    return;
  }
  const issues = [
    ...result.missingImageDefinitions.map((key) => `missing image definition: ${key}`),
    ...result.missingAtlasDefinitions.map((key) => `missing animation binding: ${key}`),
    ...result.missingAudioDefinitions.map((key) => `missing audio definition: ${key}`),
    ...result.missingAnimationFrameDefinitions.map(
      (frame) => `missing animation frame definition: ${frame}`,
    ),
    ...result.missingAnimationBindings.map((setId) => `missing animation set: ${setId}`),
    ...result.missingAnimationSets.map((setId) => `invalid animation set fallback: ${setId}`),
  ];
  throw new Error(`Invalid asset manifest. ${issues.join(', ')}`);
};

export const assertRuntimeAssetsLoaded = (
  manifest: AssetManifest,
  lookups: {
    hasImage: (key: string) => boolean;
    hasAudio: (key: string) => boolean;
    hasAtlas: (key: string) => boolean;
    hasAtlasFrame: (atlasKey: string, frame: string) => boolean;
  },
): void => {
  const result = validateRuntimeLoads(manifest, lookups);
  if (
    !result.missingImageLoads.length &&
    !result.missingAtlasLoads.length &&
    !result.missingAnimationFrameLoads.length &&
    !result.missingAudioLoads.length
  ) {
    return;
  }
  const issues = [
    ...result.missingImageLoads.map((key) => `missing loaded image: ${key}`),
    ...result.missingAtlasLoads.map((key) => `missing loaded atlas: ${key}`),
    ...result.missingAnimationFrameLoads.map((value) => `missing loaded animation frame: ${value}`),
    ...result.missingAudioLoads.map((key) => `missing loaded audio: ${key}`),
  ];
  throw new Error(`Asset preload failed. ${issues.join(', ')}`);
};
