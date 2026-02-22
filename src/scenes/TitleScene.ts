import Phaser from 'phaser';
import { AudioManager } from '../audio/audioManager';
import { t } from '../config/i18n';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';
import { saveLanguage } from '../utils/storage';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    const state = getSessionState();
    const background = this.add.image(960, 540, 'bg-market').setAlpha(0.95);
    const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x0f172a, 0.22);
    const title = this.add
      .text(960, 240, t(state.locale, 'title'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '112px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(960, 520, t(state.locale, 'pressStart'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '38px',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const coopText = this.add
      .text(960, 580, `${t(state.locale, 'coopHint')} [${state.coopEnabled ? 'ON' : 'OFF'}]`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);

    const localeText = this.add
      .text(960, 630, state.locale === 'es' ? 'L: Idioma English' : 'L: Language Espanol', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#67e8f9',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startText],
      alpha: { from: 1, to: 0.4 },
      yoyo: true,
      repeat: -1,
      duration: 880,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: background,
      scaleX: { from: 1, to: 1.04 },
      scaleY: { from: 1, to: 1.04 },
      yoyo: true,
      repeat: -1,
      duration: 4_800,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: overlay,
      alpha: { from: 0.12, to: 0.28 },
      yoyo: true,
      repeat: -1,
      duration: 3_400,
      ease: 'Quad.easeInOut',
    });

    let audio = this.registry.get('audioManager') as AudioManager | undefined;
    if (!audio) {
      audio = new AudioManager();
      this.registry.set('audioManager', audio);
    }
    audio.playMusic('market-theme');

    const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const coop = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    const locale = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    this.input.keyboard?.on('keydown', () => {
      audio?.unlock();
    });

    this.events.on('update', () => {
      if (coop && Phaser.Input.Keyboard.JustDown(coop)) {
        const next = !getSessionState().coopEnabled;
        updateSessionState({ coopEnabled: next });
        coopText.setText(`${t(getSessionState().locale, 'coopHint')} [${next ? 'ON' : 'OFF'}]`);
        audio?.playSfx('ui-click');
      }
      if (locale && Phaser.Input.Keyboard.JustDown(locale)) {
        const nextLocale = getSessionState().locale === 'es' ? 'en' : 'es';
        updateSessionState({ locale: nextLocale });
        saveLanguage(nextLocale);
        title.setText(t(nextLocale, 'title'));
        startText.setText(t(nextLocale, 'pressStart'));
        coopText.setText(
          `${t(nextLocale, 'coopHint')} [${getSessionState().coopEnabled ? 'ON' : 'OFF'}]`,
        );
        localeText.setText(nextLocale === 'es' ? 'L: Idioma English' : 'L: Language Espanol');
        audio?.playSfx('ui-click', 0.8);
      }
      if (enter && Phaser.Input.Keyboard.JustDown(enter)) {
        audio?.playSfx('ui-click');
        this.scene.start(SceneKeys.CharacterSelect);
      }
    });
  }
}
