import Phaser from 'phaser';
import { t } from '../config/i18n';
import { REQUIRED_ATTRIBUTIONS } from '../config/licenses';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState } from '../core/engine/sessionState';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Result);
  }

  create(data: { victory?: boolean }): void {
    const locale = getSessionState().locale;
    const victory = Boolean(data.victory);

    this.add.image(960, 540, victory ? 'bg-gradient-warm' : 'bg-gradient-cold').setAlpha(0.95);
    this.add.rectangle(960, 540, 1920, 1080, 0x020617, 0.35);
    this.add
      .text(960, 340, victory ? t(locale, 'victory') : t(locale, 'gameOver'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '98px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);
    this.add
      .text(960, 540, t(locale, 'continue'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '34px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    const creditsTitle = locale === 'es' ? 'Creditos (CC-BY)' : 'Credits (CC-BY)';
    this.add
      .text(960, 650, creditsTitle, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#67e8f9',
      })
      .setOrigin(0.5);

    const creditsText = REQUIRED_ATTRIBUTIONS.map((line) => `- ${line}`).join('\n');
    this.add
      .text(960, 700, creditsText, {
        fontFamily: 'Trebuchet MS',
        fontSize: '17px',
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: 1600, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start(SceneKeys.Title);
    });
  }
}
