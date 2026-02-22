import Phaser from 'phaser';
import { SceneKeys } from './sceneKeys';
import { BootScene } from '../../scenes/BootScene';
import { PreloadScene } from '../../scenes/PreloadScene';
import { TitleScene } from '../../scenes/TitleScene';
import { CharacterSelectScene } from '../../scenes/CharacterSelectScene';
import { LevelScene } from '../../scenes/LevelScene';
import { ResultScene } from '../../scenes/ResultScene';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1920,
  height: 1080,
  backgroundColor: '#020617',
  pixelArt: false,
  scene: [BootScene, PreloadScene, TitleScene, CharacterSelectScene, LevelScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  callbacks: {
    postBoot: (game) => {
      game.scene.start(SceneKeys.Boot);
    },
  },
};
