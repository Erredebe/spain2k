import Phaser from 'phaser';
import { defineQuery } from 'bitecs';
import { AudioManager } from '../audio/audioManager';
import { HealthComponent, InputComponent, PlayerTag } from '../components';
import { FINAL_BOSS } from '../config/boss';
import { LEVELS } from '../config/levels';
import { t } from '../config/i18n';
import { SceneKeys } from '../core/engine/sceneKeys';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';
import { createEcsContext } from '../core/ecs/world';
import { SystemScheduler } from '../core/ecs/scheduler';
import { createInteractableProp } from '../entities/propFactory';
import { createPlayer } from '../entities/playerFactory';
import { OrderedSystems } from '../systems';
import type { GameEcsContext } from '../systems/types';
import { HudController } from '../ui/HUD';
import { loadSave } from '../utils/storage';

const playerAliveQuery = defineQuery([PlayerTag, InputComponent, HealthComponent]);

export class LevelScene extends Phaser.Scene {
  private context: GameEcsContext | null = null;
  private scheduler: SystemScheduler | null = null;
  private levelIndex = 0;
  private resultAtMs = -1;
  private resultType: 'victory' | 'defeat' | null = null;
  private paused = false;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;
  private pausePadPressedP1 = false;
  private pausePadPressedP2 = false;
  private pauseEscKey: Phaser.Input.Keyboard.Key | null = null;
  private pauseTabKey: Phaser.Input.Keyboard.Key | null = null;
  private needsManualResume = false;
  private onWindowBlur: (() => void) | null = null;
  private onWindowFocus: (() => void) | null = null;
  private onVisibilityChange: (() => void) | null = null;

  constructor() {
    super(SceneKeys.Level);
  }

  init(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? getSessionState().levelIndex;
  }

  create(): void {
    const level = LEVELS[this.levelIndex] ?? LEVELS[0];
    const session = getSessionState();
    const save = loadSave();

    this.buildBackground(level.backgroundStyle);
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.cameras.main.setZoom(1);
    this.pauseEscKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) ?? null;
    this.pauseTabKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TAB) ?? null;

    let audio = this.registry.get('audioManager') as AudioManager | undefined;
    if (!audio) {
      audio = new AudioManager();
      this.registry.set('audioManager', audio);
    }
    audio.unlock();

    const hud = new HudController(this, save.accessibility);
    this.context = createEcsContext(this, {
      level,
      levelIndex: this.levelIndex,
      selectedCharacters: session.selectedCharacters,
      coopEnabled: session.coopEnabled,
      locale: session.locale,
      hud,
      audio,
      bossDefinition: FINAL_BOSS,
      controls: save.controls,
      input: save.input,
    });
    this.context.inputRuntime.awaitingFocusClick = !(
      typeof window !== 'undefined' && window.__SPAIN2K_RUNTIME__?.focusActivated
    );
    this.scheduler = new SystemScheduler(OrderedSystems);
    this.bindWindowFocusHandlers();

    const player1 = createPlayer(this.context, 1, session.selectedCharacters[0], 360, 470);
    const player1Name = this.context.entitiesMeta.get(player1)?.displayName ?? 'P1';
    hud.setPlayerLabel(1, player1Name);

    if (session.coopEnabled) {
      const player2 = createPlayer(this.context, 2, session.selectedCharacters[1], 280, 560);
      const player2Name = this.context.entitiesMeta.get(player2)?.displayName ?? 'P2';
      hud.setPlayerLabel(2, player2Name);
    }

    for (const interactable of level.interactables) {
      createInteractableProp(this.context, interactable);
    }

    this.context.eventBus.on('game:level-cleared', () => {
      this.resultType = 'victory';
      this.resultAtMs = this.time.now + 2_100;
      hud.showToast(t(this.context?.locale ?? 'es', 'levelCleared'), 1_600);
    });
    this.context.eventBus.on('boss:phase-changed', ({ phase }) => {
      hud.setSubtitle(
        this.context?.locale === 'es' ? `Boss fase ${phase}` : `Boss phase ${phase}`,
        1_200,
      );
    });
    this.context.eventBus.on('combat:special-ready', ({ entity }) => {
      const playerIndex = InputComponent.playerIndex[entity] as 1 | 2;
      if (playerIndex >= 1 && playerIndex <= 2) {
        hud.showToast(`P${playerIndex}: ${t(this.context?.locale ?? 'es', 'specialReady')}`, 900);
      }
    });
    this.context.eventBus.emit('audio:music-switch', { musicKey: level.musicKey });
    this.context.hud.setSubtitle(
      this.context.locale === 'es' ? level.introEs : level.introEn,
      2_600,
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });
  }

  update(time: number, delta: number): void {
    if (!this.context || !this.scheduler) {
      return;
    }
    this.context.nowMs = time;
    this.context.deltaMs = Math.min(delta, 33);

    if (this.consumePauseShortcut()) {
      this.togglePause(false);
    }
    if (this.paused) {
      this.context.hud.update(this.context.nowMs);
      return;
    }

    this.scheduler.update(this.context);
    this.updateCamera();
    this.checkDefeat();
    this.resolveResultTransition();
  }

  private checkDefeat(): void {
    if (!this.context || this.resultType) {
      return;
    }
    const players = (playerAliveQuery(this.context.world) as number[]).filter((entity: number) => {
      if (InputComponent.playerIndex[entity] === 2 && !this.context?.coopEnabled) {
        return false;
      }
      return true;
    });
    const allDead = players.every((player: number) => HealthComponent.isAlive[player] === 0);
    if (allDead) {
      this.resultType = 'defeat';
      this.resultAtMs = this.time.now + 1_700;
      this.context.hud.showToast(t(this.context.locale, 'gameOver'), 1_200);
    }
  }

  private resolveResultTransition(): void {
    if (!this.context || !this.resultType || this.time.now < this.resultAtMs) {
      return;
    }
    if (this.resultType === 'defeat') {
      updateSessionState({ levelIndex: 0 });
      this.scene.start(SceneKeys.Result, { victory: false });
      return;
    }

    const nextLevel = this.levelIndex + 1;
    if (nextLevel < LEVELS.length) {
      updateSessionState({ levelIndex: nextLevel });
      this.scene.start(SceneKeys.Level, { levelIndex: nextLevel });
      return;
    }
    updateSessionState({ levelIndex: 0 });
    this.scene.start(SceneKeys.Result, { victory: true });
  }

  private updateCamera(): void {
    if (!this.context) {
      return;
    }
    const players = (playerAliveQuery(this.context.world) as number[]).filter((entity: number) => {
      if (InputComponent.playerIndex[entity] === 2 && !this.context?.coopEnabled) {
        return false;
      }
      return true;
    });
    if (!players.length) {
      return;
    }
    const centerX =
      players.reduce(
        (accumulator: number, entity: number) =>
          accumulator + (this.context?.renderObjects.get(entity)?.sprite.x ?? 0),
        0,
      ) / players.length;
    const centerY =
      players.reduce(
        (accumulator: number, entity: number) =>
          accumulator + (this.context?.renderObjects.get(entity)?.sprite.y ?? 0),
        0,
      ) / players.length;
    this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, centerX - 960, 0.06);
    this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, centerY - 540, 0.05);
  }

  private buildBackground(style: 'market' | 'metro' | 'port'): void {
    const key = style === 'market' ? 'bg-market' : style === 'metro' ? 'bg-metro' : 'bg-port';
    const tintOverlay = style === 'market' ? 0x5f2b17 : style === 'metro' ? 0x0d2f45 : 0x0f172a;

    const sky = this.add.image(960, 540, key).setScrollFactor(0.15).setDepth(-130).setAlpha(0.96);
    const mountain = this.add
      .image(960, 600, 'parallax-mountain')
      .setScrollFactor(0.22)
      .setDepth(-120)
      .setAlpha(style === 'market' ? 0.28 : 0.4)
      .setScale(2.3);
    const hills = this.add
      .image(960, 650, 'parallax-hills')
      .setScrollFactor(0.36)
      .setDepth(-110)
      .setAlpha(style === 'metro' ? 0.32 : 0.44)
      .setScale(2.4);
    const cloudA = this.add
      .image(760, 280, 'parallax-cloud-1')
      .setScrollFactor(0.2)
      .setDepth(-108)
      .setAlpha(0.28)
      .setScale(1.8);
    const cloudB = this.add
      .image(1280, 340, 'parallax-cloud-2')
      .setScrollFactor(0.24)
      .setDepth(-107)
      .setAlpha(0.22)
      .setScale(1.7);

    const mid = this.add.image(960, 580, key).setScrollFactor(0.5).setDepth(-90).setAlpha(0.72);
    const near = this.add.image(960, 610, key).setScrollFactor(0.72).setDepth(-70).setAlpha(0.46);
    [sky, mid, near].forEach((image) => image.setDisplaySize(2200, 1300));
    const colorGrade = this.add
      .rectangle(960, 540, 1920, 1080, tintOverlay, style === 'metro' ? 0.18 : 0.14)
      .setScrollFactor(0)
      .setDepth(-60);

    this.tweens.add({
      targets: [sky, mid, near],
      x: '+=12',
      yoyo: true,
      repeat: -1,
      duration: 3200,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: [cloudA, cloudB, mountain, hills],
      x: '+=26',
      yoyo: true,
      repeat: -1,
      duration: 5200,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: colorGrade,
      alpha: { from: colorGrade.alpha, to: colorGrade.alpha + 0.05 },
      yoyo: true,
      repeat: -1,
      duration: 3500,
      ease: 'Quad.easeInOut',
    });
  }

  private consumePauseShortcut(): boolean {
    const keyboardPressed =
      (this.pauseEscKey ? Phaser.Input.Keyboard.JustDown(this.pauseEscKey) : false) ||
      (this.pauseTabKey ? Phaser.Input.Keyboard.JustDown(this.pauseTabKey) : false);
    const pads = this.input.gamepad?.gamepads ?? [];
    const p1PadPressed = pads[0]?.buttons[9]?.pressed ?? false;
    const p2PadPressed = pads[1]?.buttons[9]?.pressed ?? false;
    const gamepadToggle =
      (p1PadPressed && !this.pausePadPressedP1) || (p2PadPressed && !this.pausePadPressedP2);
    this.pausePadPressedP1 = p1PadPressed;
    this.pausePadPressedP2 = p2PadPressed;
    return keyboardPressed || gamepadToggle;
  }

  private togglePause(fromBlur: boolean): void {
    this.paused = !this.paused;
    if (fromBlur && this.paused) {
      this.needsManualResume = true;
    }
    if (!this.paused) {
      this.needsManualResume = false;
    }
    if (!this.pauseOverlay) {
      const panel = this.add.rectangle(960, 540, 980, 420, 0x020617, 0.82).setDepth(1400);
      panel.setStrokeStyle(2, 0x67e8f9, 0.6);
      const title = this.add
        .text(960, 410, this.context?.locale === 'es' ? 'PAUSA' : 'PAUSED', {
          fontFamily: 'Trebuchet MS',
          fontSize: '56px',
          color: '#f8fafc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(1401);
      const body = this.add
        .text(
          960,
          500,
          this.context?.locale === 'es'
            ? 'ESC/TAB o boton 9 para continuar\nRemapeo y deadzone: menu principal (tecla O)'
            : 'ESC/TAB or button 9 to continue\nRemap and deadzone: title menu (key O)',
          {
            fontFamily: 'Trebuchet MS',
            fontSize: '24px',
            color: '#cbd5e1',
            align: 'center',
          },
        )
        .setOrigin(0.5)
        .setDepth(1401);
      this.pauseOverlay = this.add.container(0, 0, [panel, title, body]).setVisible(false);
    }
    this.pauseOverlay.setVisible(this.paused);
    const overlayBody = this.pauseOverlay.list[2] as Phaser.GameObjects.Text;
    if (this.needsManualResume) {
      overlayBody.setText(
        this.context?.locale === 'es'
          ? 'Juego pausado por perdida de foco.\nPulsa ESC/TAB o boton 9 para reanudar.'
          : 'Game paused after focus loss.\nPress ESC/TAB or button 9 to resume.',
      );
    } else {
      overlayBody.setText(
        this.context?.locale === 'es'
          ? 'ESC/TAB o boton 9 para continuar\nRemapeo y deadzone: menu principal (tecla O)'
          : 'ESC/TAB or button 9 to continue\nRemap and deadzone: title menu (key O)',
      );
    }
    this.context?.hud.showToast(this.paused ? 'PAUSE' : 'RESUME', 600);
  }

  private bindWindowFocusHandlers(): void {
    if (!this.context) {
      return;
    }
    this.onWindowBlur = () => {
      if (!this.context) {
        return;
      }
      this.context.inputRuntime.hasFocus = false;
      if (!this.paused) {
        this.togglePause(true);
      } else {
        this.needsManualResume = true;
      }
    };
    this.onWindowFocus = () => {
      if (!this.context) {
        return;
      }
      this.context.inputRuntime.hasFocus = true;
      this.context.hud.showToast(
        this.context.locale === 'es'
          ? 'Foco recuperado. Reanuda manualmente.'
          : 'Focus restored. Resume manually.',
        950,
      );
    };
    this.onVisibilityChange = () => {
      if (!this.context) {
        return;
      }
      const isVisible = document.visibilityState === 'visible';
      this.context.inputRuntime.isVisible = isVisible;
      if (!isVisible && !this.paused) {
        this.togglePause(true);
      }
    };
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('focus', this.onWindowFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  shutdown(): void {
    if (this.onWindowBlur) {
      window.removeEventListener('blur', this.onWindowBlur);
    }
    if (this.onWindowFocus) {
      window.removeEventListener('focus', this.onWindowFocus);
    }
    if (this.onVisibilityChange) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    this.onWindowBlur = null;
    this.onWindowFocus = null;
    this.onVisibilityChange = null;
    this.pauseOverlay?.destroy(true);
    this.pauseOverlay = null;
    this.context?.eventBus.clear();
    this.context?.hud.destroy();
    this.context = null;
    this.scheduler = null;
    this.paused = false;
    this.needsManualResume = false;
    this.pausePadPressedP1 = false;
    this.pausePadPressedP2 = false;
  }
}
