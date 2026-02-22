import { Howl } from 'howler';
import { ASSET_MANIFEST } from '../assets/manifest';
import type { AudioDefinition } from '../config/types';

export class AudioManager {
  private readonly definitions = ASSET_MANIFEST.audio;
  private readonly sfxInstances = new Map<string, Howl>();
  private currentMusicKey: string | null = null;
  private currentMusic: Howl | null = null;
  private restoreMusicTimer: ReturnType<typeof setTimeout> | null = null;

  unlock(): void {
    // Howler handles unlock after first user interaction in modern browsers.
  }

  playMusic(key: string): void {
    const definition = this.definitions[key];
    if (!definition || definition.category !== 'music') {
      return;
    }
    if (this.currentMusicKey === key && this.currentMusic?.playing()) {
      return;
    }

    const previous = this.currentMusic;
    const next = this.createHowl(definition);
    next.volume(definition.volume);
    next.play();

    this.currentMusic = next;
    this.currentMusicKey = key;

    if (previous) {
      const from = previous.volume();
      previous.fade(from, 0, 180);
      setTimeout(() => {
        previous.stop();
        previous.unload();
      }, 220);
    }
  }

  playSfx(key: string, volume = 1): void {
    const definition = this.definitions[key];
    if (!definition || definition.category !== 'sfx') {
      return;
    }

    let howl = this.sfxInstances.get(key);
    if (!howl) {
      howl = this.createHowl(definition);
      this.sfxInstances.set(key, howl);
    }

    const instanceId = howl.play();
    howl.volume(Math.max(0, Math.min(1, definition.volume * volume)), instanceId);
  }

  duckMusic(durationMs = 120): void {
    if (!this.currentMusic || !this.currentMusic.playing()) {
      return;
    }
    const normalVolume = this.getDefinitionVolume(this.currentMusicKey, 0.34);
    this.currentMusic.fade(this.currentMusic.volume(), Math.max(0.06, normalVolume * 0.28), 40);

    if (this.restoreMusicTimer) {
      clearTimeout(this.restoreMusicTimer);
    }
    this.restoreMusicTimer = setTimeout(() => {
      if (!this.currentMusic) {
        return;
      }
      this.currentMusic.fade(this.currentMusic.volume(), normalVolume, Math.max(80, durationMs));
      this.restoreMusicTimer = null;
    }, 45);
  }

  stopMusic(): void {
    if (!this.currentMusic) {
      this.currentMusicKey = null;
      return;
    }
    this.currentMusic.stop();
    this.currentMusic.unload();
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  destroy(): void {
    this.stopMusic();
    if (this.restoreMusicTimer) {
      clearTimeout(this.restoreMusicTimer);
      this.restoreMusicTimer = null;
    }
    for (const instance of this.sfxInstances.values()) {
      instance.stop();
      instance.unload();
    }
    this.sfxInstances.clear();
  }

  private createHowl(definition: AudioDefinition): Howl {
    const src = [definition.oggPath, definition.mp3Path].filter(Boolean) as string[];
    return new Howl({
      src,
      loop: definition.loop,
      preload: true,
      volume: definition.volume,
      html5: false,
    });
  }

  private getDefinitionVolume(key: string | null, fallback: number): number {
    if (!key) {
      return fallback;
    }
    const definition = this.definitions[key];
    return definition ? definition.volume : fallback;
  }
}
