import Phaser from 'phaser';
import { createProceduralTextures } from '../assets/textureFactory';
import { SceneKeys } from '../core/engine/sceneKeys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  create(): void {
    createProceduralTextures(this);
    this.scene.start(SceneKeys.Title);
  }
}
