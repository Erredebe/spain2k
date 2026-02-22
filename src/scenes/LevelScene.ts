import Phaser from 'phaser';
import { defineQuery } from 'bitecs';
import { HealthComponent, InputComponent, PlayerTag } from '../components';
import { LEVELS } from '../config/levels';
import { FINAL_BOSS } from '../config/boss';
import { SceneKeys } from '../core/engine/sceneKeys';
import { createEcsContext } from '../core/ecs/world';
import { SystemScheduler } from '../core/ecs/scheduler';
import { OrderedSystems } from '../systems';
import { createPlayer } from '../entities/playerFactory';
import { createInteractableProp } from '../entities/propFactory';
import { HudController } from '../ui/HUD';
import { AudioMixer } from '../audio/audioMixer';
import { getSessionState, updateSessionState } from '../core/engine/sessionState';
import { loadSave } from '../utils/storage';
import type { GameEcsContext } from '../systems/types';
import { t } from '../config/i18n';

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

    let audioMixer = this.registry.get('audioMixer') as AudioMixer | undefined;
    if (!audioMixer) {
      audioMixer = new AudioMixer();
      this.registry.set('audioMixer', audioMixer);
    }
    audioMixer.unlock();

    const hud = new HudController(this, save.accessibility);
    this.context = createEcsContext(this, {
      level,
      levelIndex: this.levelIndex,
      selectedCharacters: session.selectedCharacters,
      coopEnabled: session.coopEnabled,
      locale: session.locale,
      hud,
      audio: audioMixer,
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
    const far = this.add.image(960, 540, key).setScrollFactor(0.2).setDepth(-100);
    const mid = this.add.image(960, 560, key).setScrollFactor(0.45).setDepth(-80).setAlpha(0.75);
    const near = this.add.image(960, 590, key).setScrollFactor(0.7).setDepth(-60).setAlpha(0.45);
    this.tweens.add({
      targets: [far, mid, near],
      x: '+=12',
      yoyo: true,
      repeat: -1,
      duration: 3200,
      ease: 'Sine.easeInOut',
    });
  }

  shutdown(): void {
    this.context?.hud.destroy();
    this.context = null;
    this.scheduler = null;
  }
}
