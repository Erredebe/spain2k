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
    });
    this.scheduler = new SystemScheduler(OrderedSystems);

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

  shutdown(): void {
    this.context?.hud.destroy();
    this.context = null;
    this.scheduler = null;
  }
}
