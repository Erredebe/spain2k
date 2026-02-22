import type Phaser from 'phaser';
import { defineQuery } from 'bitecs';
import { ActiveEntityComponent, InputComponent, MovementComponent } from '../components';
import type { SystemFn } from './types';

interface AudioRuntime {
  initialized: boolean;
  currentMusicKey: string | null;
  stepCooldownByEntity: Map<number, number>;
}

const runtimeByScene = new WeakMap<Phaser.Scene, AudioRuntime>();
const footstepQuery = defineQuery([ActiveEntityComponent, InputComponent, MovementComponent]);

const ensureRuntime = (context: Parameters<SystemFn>[0]): AudioRuntime => {
  const existing = runtimeByScene.get(context.scene);
  if (existing) {
    return existing;
  }
  const runtime: AudioRuntime = {
    initialized: false,
    currentMusicKey: null,
    stepCooldownByEntity: new Map(),
  };
  runtimeByScene.set(context.scene, runtime);
  return runtime;
};

export const AudioSystem: SystemFn = (context) => {
  const runtime = ensureRuntime(context);

  if (!runtime.initialized) {
    context.eventBus.on('audio:music-switch', ({ musicKey }) => {
      context.audio.playMusic(musicKey);
      runtime.currentMusicKey = musicKey;
    });
    context.eventBus.on('audio:sfx-play', ({ sfxKey, volume }) => {
      context.audio.playSfx(sfxKey, volume);
    });
    context.eventBus.on('combat:special-ready', () => {
      context.audio.playSfx('ui-click', 0.2);
    });
    runtime.initialized = true;
  }

  const desiredMusic = context.levelRuntime.level.musicKey;
  if (runtime.currentMusicKey !== desiredMusic) {
    context.audio.playMusic(desiredMusic);
    runtime.currentMusicKey = desiredMusic;
  }

  for (const entity of footstepQuery(context.world)) {
    if (InputComponent.playerIndex[entity] === 2 && !context.coopEnabled) {
      continue;
    }
    const speed = Math.abs(MovementComponent.vx[entity]) + Math.abs(MovementComponent.vy[entity]);
    const nextAllowed = runtime.stepCooldownByEntity.get(entity) ?? 0;
    if (speed > 140 && context.nowMs >= nextAllowed) {
      context.audio.playSfx('step', 0.34);
      runtime.stepCooldownByEntity.set(entity, context.nowMs + (speed > 260 ? 150 : 220));
    }
  }
};
