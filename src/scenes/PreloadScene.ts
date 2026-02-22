import Phaser from 'phaser';
import { ASSET_MANIFEST } from '../assets/manifest';
import { assertManifestValid, assertRuntimeAssetsLoaded } from '../assets/validation';
import { SceneKeys } from '../core/engine/sceneKeys';

export class PreloadScene extends Phaser.Scene {
  private readonly failedKeys = new Set<string>();

  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    assertManifestValid(ASSET_MANIFEST);

    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failedKeys.add(file.key);
    });

    for (const [key, path] of Object.entries(ASSET_MANIFEST.images)) {
      this.load.image(key, path);
    }

    for (const definition of Object.values(ASSET_MANIFEST.atlases)) {
      this.load.atlas(definition.key, definition.texturePath, definition.atlasPath);
    }

    for (const [key, definition] of Object.entries(ASSET_MANIFEST.audio)) {
      const src = [definition.oggPath, definition.mp3Path].filter(Boolean) as string[];
      if (!src.length) {
        throw new Error(`Audio definition "${key}" has no source files`);
      }
      this.load.audio(key, src);
    }
  }

  create(): void {
    if (this.failedKeys.size) {
      throw new Error(`Asset load errors: ${Array.from(this.failedKeys).join(', ')}`);
    }

    assertRuntimeAssetsLoaded(ASSET_MANIFEST, {
      hasImage: (key) => this.textures.exists(key),
      hasAudio: (key) => this.cache.audio.exists(key),
      hasAtlas: (key) => this.textures.exists(key),
      hasAtlasFrame: (atlasKey, frame) => this.textures.get(atlasKey).has(frame),
    });

    this.scene.start(SceneKeys.Title);
  }
}
