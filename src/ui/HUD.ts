import type Phaser from 'phaser';
import { clamp } from '../utils/math';
import type { AccessibilitySettings } from '../config/types';

interface PlayerHudWidgets {
  label: Phaser.GameObjects.Text;
  hpBg: Phaser.GameObjects.Image;
  hpFill: Phaser.GameObjects.Image;
  specialBg: Phaser.GameObjects.Image;
  specialFill: Phaser.GameObjects.Image;
  comboLabel: Phaser.GameObjects.Text;
}

export class HudController {
  private readonly players: Record<1 | 2, PlayerHudWidgets>;
  private readonly subtitle: Phaser.GameObjects.Text;
  private readonly toast: Phaser.GameObjects.Text;
  private subtitleHideAt = 0;
  private toastHideAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    accessibility: AccessibilitySettings,
  ) {
    const scale = accessibility.largeHud ? 1.2 : 1;
    const tint = accessibility.highContrastHud ? 0xffffff : 0xf0f4f8;

    const createPlayerWidgets = (playerIndex: 1 | 2, y: number): PlayerHudWidgets => {
      const xOffset = playerIndex === 1 ? 36 : 1080;
      const label = scene.add
        .text(xOffset, y - 30, playerIndex === 1 ? 'P1' : 'P2', {
          color: '#f8fafc',
          fontFamily: 'Trebuchet MS',
          fontSize: `${Math.floor(24 * scale)}px`,
          fontStyle: 'bold',
        })
        .setScrollFactor(0)
        .setDepth(1000);
      const hpBg = scene.add
        .image(xOffset, y, 'ui-bar-bg')
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setScale(scale)
        .setTint(0x111827)
        .setDepth(1000);
      const hpFill = scene.add
        .image(xOffset, y, 'ui-bar-fill')
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setScale(scale)
        .setTint(tint)
        .setDepth(1001);
      const specialBg = scene.add
        .image(xOffset, y + 30, 'ui-bar-bg')
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setScale(scale)
        .setTint(0x0f172a)
        .setDepth(1000);
      const specialFill = scene.add
        .image(xOffset, y + 30, 'ui-bar-fill')
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setScale(scale)
        .setTint(0x22d3ee)
        .setDepth(1001);
      const comboLabel = scene.add
        .text(xOffset + 310, y - 4, 'Combo 0', {
          color: '#f8fafc',
          fontFamily: 'Trebuchet MS',
          fontSize: `${Math.floor(20 * scale)}px`,
        })
        .setScrollFactor(0)
        .setDepth(1002);
      return { label, hpBg, hpFill, specialBg, specialFill, comboLabel };
    };

    this.players = {
      1: createPlayerWidgets(1, 52),
      2: createPlayerWidgets(2, 52),
    };

    this.subtitle = scene.add
      .text(960, 930, '', {
        color: '#f8fafc',
        fontFamily: 'Trebuchet MS',
        fontSize: `${Math.floor(30 * scale)}px`,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(false);

    this.toast = scene.add
      .text(960, 120, '', {
        color: '#67e8f9',
        fontFamily: 'Trebuchet MS',
        fontSize: `${Math.floor(26 * scale)}px`,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(false);
  }

  setPlayerLabel(playerIndex: 1 | 2, name: string): void {
    this.players[playerIndex].label.setText(`P${playerIndex} ${name}`);
  }

  setPlayerVitals(playerIndex: 1 | 2, hpRatio: number, specialRatio: number): void {
    const widgets = this.players[playerIndex];
    const hp = clamp(hpRatio, 0, 1);
    const special = clamp(specialRatio, 0, 1);
    widgets.hpFill.setDisplaySize(300 * hp, 24);
    widgets.specialFill.setDisplaySize(300 * special, 24);
  }

  setCombo(playerIndex: 1 | 2, combo: number): void {
    this.players[playerIndex].comboLabel.setText(`Combo ${combo}`);
  }

  setSubtitle(text: string, durationMs: number): void {
    this.subtitle.setText(text).setVisible(true);
    this.subtitleHideAt = this.scene.time.now + durationMs;
  }

  showToast(text: string, durationMs = 1_000): void {
    this.toast.setText(text).setVisible(true);
    this.toastHideAt = this.scene.time.now + durationMs;
  }

  update(nowMs: number): void {
    if (this.subtitle.visible && nowMs > this.subtitleHideAt) {
      this.subtitle.setVisible(false);
    }
    if (this.toast.visible && nowMs > this.toastHideAt) {
      this.toast.setVisible(false);
    }
  }

  setCoopVisible(enabled: boolean): void {
    this.players[2].label.setVisible(enabled);
    this.players[2].hpBg.setVisible(enabled);
    this.players[2].hpFill.setVisible(enabled);
    this.players[2].specialBg.setVisible(enabled);
    this.players[2].specialFill.setVisible(enabled);
    this.players[2].comboLabel.setVisible(enabled);
  }

  destroy(): void {
    (Object.values(this.players) as PlayerHudWidgets[]).forEach((widgets) => {
      widgets.label.destroy();
      widgets.hpBg.destroy();
      widgets.hpFill.destroy();
      widgets.specialBg.destroy();
      widgets.specialFill.destroy();
      widgets.comboLabel.destroy();
    });
    this.subtitle.destroy();
    this.toast.destroy();
  }
}
