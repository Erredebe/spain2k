import Phaser from 'phaser';
import { ASSET_MANIFEST } from '../assets/manifest';
import { PLAYABLE_CHARACTERS } from '../config/characters';
import { t } from '../config/i18n';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';

interface PreviewSprite {
  sprite: Phaser.GameObjects.Image;
  frames: string[];
  frameCursor: number;
}

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

    const cardX = [460, 960, 1460];
    const previews: PreviewSprite[] = [];
    PLAYABLE_CHARACTERS.forEach((character, index) => {
      const textureKey = `player-${character.id === 'heavy-brawler' ? 'heavy' : character.id}`;
      const binding = ASSET_MANIFEST.entityAnimationBindings[textureKey];
      const animationSet = binding ? ASSET_MANIFEST.animationSets[binding.animationSetId] : undefined;
      const previewFrames =
        animationSet?.clips.walk?.frames.map((frame) => frame.frame) ??
        animationSet?.clips.idle?.frames.map((frame) => frame.frame) ??
        ['heavy.idle.00'];

      const panel = this.add
        .rectangle(cardX[index], 520, 460, 610, 0x0f172a, 0.42)
        .setStrokeStyle(2, 0x67e8f9, 0.35);
      panel.setDepth(2);

      const sprite = this.add
        .image(cardX[index], 510, 'entities-anim', previewFrames[0])
        .setOrigin(0.5, 0.9)
        .setScale(1.15)
        .setDepth(4);
      this.add
        .text(cardX[index], 790, character.displayName, {
          fontFamily: 'Trebuchet MS',
          fontSize: '34px',
          color: '#e2e8f0',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(5);
      previews.push({ sprite, frames: previewFrames, frameCursor: 0 });
    });

    this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => {
        for (const preview of previews) {
          preview.frameCursor = (preview.frameCursor + 1) % preview.frames.length;
          preview.sprite.setFrame(preview.frames[preview.frameCursor]);
        }
      },
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
    const edgeState = new Map<number, { left: boolean; right: boolean; confirm: boolean }>();

    const p1Marker = this.add.rectangle(cardX[p1Index], 860, 290, 10, 0x22d3ee).setOrigin(0.5);
    const p2Marker = this.add
      .rectangle(cardX[p2Index], 890, 290, 10, 0xf97316)
      .setOrigin(0.5)
      .setVisible(state.coopEnabled);
    const info = this.add
      .text(
        960,
        940,
        state.locale === 'es'
          ? 'P1: Flechas+ENTER | P2: A/D+R | Mando: D-Pad / Boton 0'
          : 'P1: Arrows+ENTER | P2: A/D+R | Gamepad: D-Pad / Button 0',
        {
          fontFamily: 'Trebuchet MS',
          fontSize: '24px',
          color: '#cbd5e1',
        },
      )
      .setOrigin(0.5);
    const gamepadLegend = this.add
      .text(
        960,
        980,
        state.locale === 'es'
          ? 'Mando Web: 0 salto/confirmar, 2 ligero, 3 fuerte, 1 agarre, 5 especial, 9 pausa'
          : 'Web gamepad: 0 jump/confirm, 2 light, 3 heavy, 1 grab, 5 special, 9 pause',
        {
          fontFamily: 'Trebuchet MS',
          fontSize: '18px',
          color: '#67e8f9',
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

    const lockSelection = (player: 1 | 2): void => {
      if (player === 1 && !p1Locked) {
        p1Locked = true;
        p1Marker.fillColor = 0x34d399;
      }
      if (player === 2 && !p2Locked && state.coopEnabled) {
        p2Locked = true;
        p2Marker.fillColor = 0x34d399;
      }

      if (p1Locked && p2Locked) {
        updateSessionState({
          selectedCharacters: [PLAYABLE_CHARACTERS[p1Index].id, PLAYABLE_CHARACTERS[p2Index].id],
        });
        this.scene.start(SceneKeys.Level, { levelIndex: getSessionState().levelIndex });
      }
    };

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        moveSelection(1, -1);
      } else if (event.code === 'ArrowRight') {
        moveSelection(1, 1);
      } else if (event.code === 'Enter') {
        lockSelection(1);
      } else if (event.code === 'KeyA') {
        moveSelection(2, -1);
      } else if (event.code === 'KeyD') {
        moveSelection(2, 1);
      } else if (event.code === 'KeyR' && state.coopEnabled) {
        lockSelection(2);
      }
    });

    this.events.on('update', () => {
      const pads = this.input.gamepad?.gamepads ?? [];
      const p1Pad = pads[0];
      const p2Pad = pads[1];

      const processPad = (
        player: 1 | 2,
        pad: Phaser.Input.Gamepad.Gamepad | undefined,
      ): void => {
        if (!pad) {
          return;
        }
        const previous = edgeState.get(player) ?? { left: false, right: false, confirm: false };
        const left = pad.buttons[14]?.pressed ?? false;
        const right = pad.buttons[15]?.pressed ?? false;
        const confirm = pad.buttons[0]?.pressed ?? false;
        if (left && !previous.left) {
          moveSelection(player, -1);
        }
        if (right && !previous.right) {
          moveSelection(player, 1);
        }
        if (confirm && !previous.confirm) {
          lockSelection(player);
        }
        edgeState.set(player, { left, right, confirm });
      };

      processPad(1, p1Pad);
      if (state.coopEnabled) {
        processPad(2, p2Pad);
      }
    });

    this.tweens.add({
      targets: [p1Marker, p2Marker, info, gamepadLegend],
      alpha: { from: 1, to: 0.58 },
      yoyo: true,
      repeat: -1,
      duration: 720,
    });
  }
}

