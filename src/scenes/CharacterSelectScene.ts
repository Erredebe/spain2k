import Phaser from 'phaser';
import { PLAYABLE_CHARACTERS } from '../config/characters';
import { t } from '../config/i18n';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.CharacterSelect);
  }

  create(): void {
    const state = getSessionState();
    this.add.image(960, 540, 'bg-gradient-cold').setAlpha(0.95);
    this.add.rectangle(960, 540, 1920, 1080, 0x020617, 0.35);
    this.add
      .text(960, 120, t(state.locale, 'characterSelect'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '64px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const cardX = [480, 960, 1440];
    PLAYABLE_CHARACTERS.forEach((character, index) => {
      this.add
        .image(
          cardX[index],
          470,
          `player-${character.id === 'heavy-brawler' ? 'heavy' : character.id}`,
        )
        .setScale(0.5);
      this.add
        .text(cardX[index], 760, character.displayName, {
          fontFamily: 'Trebuchet MS',
          fontSize: '30px',
          color: '#e2e8f0',
        })
        .setOrigin(0.5);
    });

    let p1Index = Math.max(
      0,
      PLAYABLE_CHARACTERS.findIndex((character) => character.id === state.selectedCharacters[0]),
    );
    let p2Index = Math.max(
      0,
      PLAYABLE_CHARACTERS.findIndex((character) => character.id === state.selectedCharacters[1]),
    );
    let p1Locked = false;
    let p2Locked = !state.coopEnabled;

    const p1Marker = this.add.rectangle(cardX[p1Index], 860, 220, 10, 0x22d3ee).setOrigin(0.5);
    const p2Marker = this.add
      .rectangle(cardX[p2Index], 890, 220, 10, 0xf97316)
      .setOrigin(0.5)
      .setVisible(state.coopEnabled);
    const info = this.add
      .text(
        960,
        940,
        state.locale === 'es'
          ? 'P1: Flechas + Enter | P2: A/D + R'
          : 'P1: Arrows + Enter | P2: A/D + R',
        {
          fontFamily: 'Trebuchet MS',
          fontSize: '24px',
          color: '#cbd5e1',
        },
      )
      .setOrigin(0.5);

    const moveSelection = (player: 1 | 2, direction: -1 | 1): void => {
      if (player === 1 && !p1Locked) {
        p1Index = Phaser.Math.Wrap(p1Index + direction, 0, PLAYABLE_CHARACTERS.length);
        p1Marker.x = cardX[p1Index];
      }
      if (player === 2 && !p2Locked && state.coopEnabled) {
        p2Index = Phaser.Math.Wrap(p2Index + direction, 0, PLAYABLE_CHARACTERS.length);
        p2Marker.x = cardX[p2Index];
      }
    };

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        moveSelection(1, -1);
      } else if (event.code === 'ArrowRight') {
        moveSelection(1, 1);
      } else if (event.code === 'Enter') {
        p1Locked = true;
        p1Marker.fillColor = 0x34d399;
      } else if (event.code === 'KeyA') {
        moveSelection(2, -1);
      } else if (event.code === 'KeyD') {
        moveSelection(2, 1);
      } else if (event.code === 'KeyR' && state.coopEnabled) {
        p2Locked = true;
        p2Marker.fillColor = 0x34d399;
      }

      if (p1Locked && p2Locked) {
        updateSessionState({
          selectedCharacters: [PLAYABLE_CHARACTERS[p1Index].id, PLAYABLE_CHARACTERS[p2Index].id],
        });
        this.scene.start(SceneKeys.Level, { levelIndex: getSessionState().levelIndex });
      }
    });

    this.tweens.add({
      targets: [p1Marker, p2Marker, info],
      alpha: { from: 1, to: 0.55 },
      yoyo: true,
      repeat: -1,
      duration: 700,
    });
  }
}
