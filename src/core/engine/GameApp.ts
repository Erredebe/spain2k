import Phaser from 'phaser';
import { GAME_CONFIG } from './gameConfig';

export class GameApp {
  private game: Phaser.Game | null = null;

  mount(): Phaser.Game {
    if (this.game) {
      return this.game;
    }
    this.game = new Phaser.Game(GAME_CONFIG);
    return this.game;
  }

  destroy(): void {
    this.game?.destroy(true);
    this.game = null;
  }
}
