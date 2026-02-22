import Phaser from 'phaser';
import { AudioManager } from '../audio/audioManager';
import { t } from '../config/i18n';
import type { PlayerAction, SaveDataV1 } from '../config/types';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';
import { loadSave, saveControls, saveInputSettings, saveLanguage } from '../utils/storage';

const ACTION_ORDER: PlayerAction[] = [
  'move-left',
  'move-right',
  'move-up',
  'move-down',
  'jump',
  'light',
  'heavy',
  'grab',
  'special',
  'pause',
];

const ACTION_LABEL: Record<PlayerAction, { es: string; en: string }> = {
  'move-left': { es: 'Mover izquierda', en: 'Move left' },
  'move-right': { es: 'Mover derecha', en: 'Move right' },
  'move-up': { es: 'Mover arriba', en: 'Move up' },
  'move-down': { es: 'Mover abajo', en: 'Move down' },
  jump: { es: 'Saltar', en: 'Jump' },
  light: { es: 'Golpe ligero', en: 'Light attack' },
  heavy: { es: 'Golpe fuerte', en: 'Heavy attack' },
  grab: { es: 'Agarre', en: 'Grab' },
  special: { es: 'Especial', en: 'Special' },
  pause: { es: 'Pausa', en: 'Pause' },
};

const normalizeKeyboardCode = (code: string): string | null => {
  if (code.startsWith('Arrow')) {
    return code.replace('Arrow', 'ARROW').toUpperCase();
  }
  if (code.startsWith('Key') && code.length === 4) {
    return code.slice(3).toUpperCase();
  }
  if (code === 'Space') {
    return 'SPACE';
  }
  if (code === 'Escape') {
    return 'ESC';
  }
  if (code === 'Tab') {
    return 'TAB';
  }
  return null;
};

const prettyKeyboardCode = (code: string): string => {
  const map: Record<string, string> = {
    ARROWLEFT: '<-',
    ARROWRIGHT: '->',
    ARROWUP: 'UP',
    ARROWDOWN: 'DOWN',
    SPACE: 'SPACE',
    ESC: 'ESC',
    TAB: 'TAB',
  };
  return map[code] ?? code;
};

const cloneControls = (controls: SaveDataV1['controls']): SaveDataV1['controls'] => ({
  p1: {
    playerIndex: 1,
    bindings: controls.p1.bindings.map((binding) => ({ ...binding })),
  },
  p2: {
    playerIndex: 2,
    bindings: controls.p2.bindings.map((binding) => ({ ...binding })),
  },
});

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    const session = getSessionState();
    const save = loadSave();
    const controls = cloneControls(save.controls);
    const inputSettings: SaveDataV1['input'] = {
      ...save.input,
      lastDeviceByPlayer: { ...save.input.lastDeviceByPlayer },
    };

    const background = this.add.image(960, 540, 'bg-market').setAlpha(0.95);
    const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x0f172a, 0.22);
    const title = this.add
      .text(960, 185, t(session.locale, 'title'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '112px',
        fontStyle: 'bold',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(960, 360, t(session.locale, 'pressStart'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '38px',
        color: '#f8fafc',
      })
      .setOrigin(0.5);

    const coopText = this.add
      .text(960, 415, `${t(session.locale, 'coopHint')} [${session.coopEnabled ? 'ON' : 'OFF'}]`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);

    const localeText = this.add
      .text(960, 455, session.locale === 'es' ? 'L: Idioma English' : 'L: Language Espanol', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#67e8f9',
      })
      .setOrigin(0.5);

    const controlsSummary = this.add
      .text(960, 580, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#cbd5e1',
        align: 'center',
      })
      .setOrigin(0.5);

    const optionsHint = this.add
      .text(
        960,
        760,
        session.locale === 'es'
          ? 'Pulsa O para remapeo, deadzone y vibracion'
          : 'Press O for remap, deadzone and vibration',
        {
          fontFamily: 'Trebuchet MS',
          fontSize: '21px',
          color: '#67e8f9',
        },
      )
      .setOrigin(0.5);

    const statusText = this.add
      .text(960, 810, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setVisible(false);

    const optionsPanel = this.add
      .rectangle(960, 610, 1120, 620, 0x020617, 0.88)
      .setStrokeStyle(2, 0x67e8f9, 0.6)
      .setVisible(false);
    const optionsTitle = this.add
      .text(960, 330, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '34px',
        color: '#f8fafc',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setVisible(false);
    const optionsBody = this.add
      .text(960, 390, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#e2e8f0',
        align: 'left',
      })
      .setOrigin(0.5, 0)
      .setVisible(false);
    const optionsFooter = this.add
      .text(960, 865, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#67e8f9',
        align: 'center',
      })
      .setOrigin(0.5)
      .setVisible(false);

    let optionsOpen = false;
    let waitingForKey = false;
    let selectedPlayer: 1 | 2 = 1;
    let selectedActionIndex = 0;
    const padEdge = { confirm: false, coop: false, options: false };

    const actionBinding = (player: 1 | 2, action: PlayerAction) => {
      const bindings = player === 1 ? controls.p1.bindings : controls.p2.bindings;
      return bindings.find((binding) => binding.action === action);
    };

    const setStatus = (message: string): void => {
      statusText.setText(message).setVisible(true);
      this.time.delayedCall(1_350, () => {
        statusText.setVisible(false);
      });
    };

    const controlsSummaryText = (): string => {
      const p1 = controls.p1.bindings;
      const p2 = controls.p2.bindings;
      const key = (bindings: SaveDataV1['controls']['p1']['bindings'], action: PlayerAction) =>
        prettyKeyboardCode(bindings.find((binding) => binding.action === action)?.keyboard ?? '?');
      if (session.locale === 'es') {
        return [
          `P1 Teclado: ${key(p1, 'move-left')}/${key(p1, 'move-right')}/${key(p1, 'move-up')}/${key(p1, 'move-down')} mover | ${key(p1, 'jump')} salto | ${key(p1, 'light')} ligero | ${key(p1, 'heavy')} fuerte | ${key(p1, 'grab')} agarre | ${key(p1, 'special')} especial | ${key(p1, 'pause')} pausa`,
          `P2 Teclado: ${key(p2, 'move-left')}/${key(p2, 'move-right')}/${key(p2, 'move-up')}/${key(p2, 'move-down')} mover | ${key(p2, 'jump')} salto | ${key(p2, 'light')} ligero | ${key(p2, 'heavy')} fuerte | ${key(p2, 'grab')} agarre | ${key(p2, 'special')} especial | ${key(p2, 'pause')} pausa`,
          'Mando Web Standard: D-Pad 12/13/14/15 o stick izq | 0 salto | 2 ligero | 3 fuerte | 1 agarre | 5 especial | 9 pausa',
        ].join('\n');
      }
      return [
        `P1 Keyboard: ${key(p1, 'move-left')}/${key(p1, 'move-right')}/${key(p1, 'move-up')}/${key(p1, 'move-down')} move | ${key(p1, 'jump')} jump | ${key(p1, 'light')} light | ${key(p1, 'heavy')} heavy | ${key(p1, 'grab')} grab | ${key(p1, 'special')} special | ${key(p1, 'pause')} pause`,
        `P2 Keyboard: ${key(p2, 'move-left')}/${key(p2, 'move-right')}/${key(p2, 'move-up')}/${key(p2, 'move-down')} move | ${key(p2, 'jump')} jump | ${key(p2, 'light')} light | ${key(p2, 'heavy')} heavy | ${key(p2, 'grab')} grab | ${key(p2, 'special')} special | ${key(p2, 'pause')} pause`,
        'Web Standard gamepad: D-Pad 12/13/14/15 or left stick | 0 jump | 2 light | 3 heavy | 1 grab | 5 special | 9 pause',
      ].join('\n');
    };

    const refreshSummary = (): void => {
      controlsSummary.setText(controlsSummaryText());
      coopText.setText(`${t(session.locale, 'coopHint')} [${session.coopEnabled ? 'ON' : 'OFF'}]`);
      localeText.setText(session.locale === 'es' ? 'L: Idioma English' : 'L: Language Espanol');
      title.setText(t(session.locale, 'title'));
      startText.setText(t(session.locale, 'pressStart'));
      optionsHint.setText(
        session.locale === 'es'
          ? 'Pulsa O para remapeo, deadzone y vibracion'
          : 'Press O for remap, deadzone and vibration',
      );
    };

    const refreshOptionsPanel = (): void => {
      optionsPanel.setVisible(optionsOpen);
      optionsTitle.setVisible(optionsOpen);
      optionsBody.setVisible(optionsOpen);
      optionsFooter.setVisible(optionsOpen);
      if (!optionsOpen) {
        return;
      }
      optionsTitle.setText(
        session.locale === 'es' ? 'Opciones de control' : 'Control options',
      );
      const lines = ACTION_ORDER.map((action, index) => {
        const binding = actionBinding(selectedPlayer, action);
        const marker = selectedActionIndex === index ? '>' : ' ';
        const label = ACTION_LABEL[action][session.locale];
        return `${marker} ${label}: ${prettyKeyboardCode(binding?.keyboard ?? '?')}`;
      });
      lines.push('');
      lines.push(
        session.locale === 'es'
          ? `Deadzone stick: ${inputSettings.deadzone.toFixed(2)}  ([ / ])`
          : `Stick deadzone: ${inputSettings.deadzone.toFixed(2)}  ([ / ])`,
      );
      lines.push(
        session.locale === 'es'
          ? `Vibracion: ${inputSettings.vibrationEnabled ? 'ON' : 'OFF'}  (V)`
          : `Vibration: ${inputSettings.vibrationEnabled ? 'ON' : 'OFF'}  (V)`,
      );
      lines.push(
        session.locale === 'es'
          ? `Jugador seleccionado: P${selectedPlayer}  (Flecha izq/der)`
          : `Selected player: P${selectedPlayer}  (Left/right arrow)`,
      );
      optionsBody.setText(lines.join('\n'));
      optionsFooter.setText(
        waitingForKey
          ? session.locale === 'es'
            ? 'Pulsa una tecla para asignar (ESC cancela)'
            : 'Press a key to bind (ESC cancels)'
          : session.locale === 'es'
            ? 'ENTER reasigna | ESC cierra y guarda'
            : 'ENTER rebind | ESC close and save',
      );
    };

    refreshSummary();

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

    const startGame = (): void => {
      audio?.playSfx('ui-click');
      this.scene.start(SceneKeys.CharacterSelect);
    };

    const toggleCoop = (): void => {
      updateSessionState({ coopEnabled: !session.coopEnabled });
      audio?.playSfx('ui-click');
      refreshSummary();
    };

    const toggleLocale = (): void => {
      const nextLocale = session.locale === 'es' ? 'en' : 'es';
      updateSessionState({ locale: nextLocale });
      saveLanguage(nextLocale);
      audio?.playSfx('ui-click', 0.8);
      refreshSummary();
      refreshOptionsPanel();
    };

    const toggleOptions = (): void => {
      optionsOpen = !optionsOpen;
      waitingForKey = false;
      refreshOptionsPanel();
      audio?.playSfx('ui-click');
    };

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      audio?.unlock();
      if (waitingForKey) {
        if (event.code === 'Escape') {
          waitingForKey = false;
          refreshOptionsPanel();
          return;
        }
        const normalized = normalizeKeyboardCode(event.code);
        if (!normalized) {
          setStatus(session.locale === 'es' ? 'Tecla no permitida' : 'Unsupported key');
          return;
        }
        const action = ACTION_ORDER[selectedActionIndex];
        const target = actionBinding(selectedPlayer, action);
        if (!target) {
          return;
        }
        const bindings = selectedPlayer === 1 ? controls.p1.bindings : controls.p2.bindings;
        const conflict = bindings.find(
          (binding) => binding.action !== action && binding.keyboard === normalized,
        );
        if (conflict) {
          setStatus(
            session.locale === 'es'
              ? 'Conflicto: tecla ya asignada en este jugador'
              : 'Conflict: key already used by this player',
          );
          return;
        }
        target.keyboard = normalized;
        saveControls(controls);
        waitingForKey = false;
        setStatus(session.locale === 'es' ? 'Control actualizado' : 'Control updated');
        refreshSummary();
        refreshOptionsPanel();
        return;
      }

      if (optionsOpen) {
        if (event.code === 'ArrowUp') {
          selectedActionIndex = Phaser.Math.Wrap(selectedActionIndex - 1, 0, ACTION_ORDER.length);
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'ArrowDown') {
          selectedActionIndex = Phaser.Math.Wrap(selectedActionIndex + 1, 0, ACTION_ORDER.length);
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
          selectedPlayer = selectedPlayer === 1 ? 2 : 1;
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'Enter') {
          waitingForKey = true;
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'BracketLeft') {
          inputSettings.deadzone = Math.max(0.05, inputSettings.deadzone - 0.02);
          saveInputSettings(inputSettings);
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'BracketRight') {
          inputSettings.deadzone = Math.min(0.5, inputSettings.deadzone + 0.02);
          saveInputSettings(inputSettings);
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'KeyV') {
          inputSettings.vibrationEnabled = !inputSettings.vibrationEnabled;
          saveInputSettings(inputSettings);
          refreshOptionsPanel();
          return;
        }
        if (event.code === 'Escape') {
          optionsOpen = false;
          waitingForKey = false;
          refreshOptionsPanel();
          return;
        }
      }

      if (event.code === 'KeyO') {
        toggleOptions();
      } else if (event.code === 'KeyC') {
        toggleCoop();
      } else if (event.code === 'KeyL') {
        toggleLocale();
      } else if (event.code === 'Enter') {
        startGame();
      }
    });

    this.events.on('update', () => {
      const pad = this.input.gamepad?.gamepads?.[0];
      if (!pad || optionsOpen || waitingForKey) {
        return;
      }
      const confirm = (pad.buttons[0]?.pressed ?? false) || (pad.buttons[9]?.pressed ?? false);
      const coopToggle = pad.buttons[2]?.pressed ?? false;
      const optionsToggle = pad.buttons[3]?.pressed ?? false;

      if (confirm && !padEdge.confirm) {
        startGame();
      }
      if (coopToggle && !padEdge.coop) {
        toggleCoop();
      }
      if (optionsToggle && !padEdge.options) {
        toggleOptions();
      }
      padEdge.confirm = confirm;
      padEdge.coop = coopToggle;
      padEdge.options = optionsToggle;
    });
  }
}

