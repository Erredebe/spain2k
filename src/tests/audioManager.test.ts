import { describe, expect, it, vi } from 'vitest';

type MockHowlOptions = {
  src: string[];
  loop: boolean;
  preload: boolean;
  volume: number;
  html5: boolean;
};

const hoisted = vi.hoisted(() => {
  const state = {
    instances: [] as MockHowl[],
  };

  class MockHowl {
    private volumeValue: number;
    private playingValue = false;
    readonly options: MockHowlOptions;
    playCalls = 0;
    fadeCalls: Array<{ from: number; to: number; duration: number }> = [];
    unloadCalls = 0;

    constructor(options: MockHowlOptions) {
      this.options = options;
      this.volumeValue = options.volume;
      state.instances.push(this);
    }

    play(): number {
      this.playingValue = true;
      this.playCalls += 1;
      return this.playCalls;
    }

    stop(): void {
      this.playingValue = false;
    }

    unload(): void {
      this.unloadCalls += 1;
    }

    playing(): boolean {
      return this.playingValue;
    }

    fade(from: number, to: number, duration: number): void {
      this.fadeCalls.push({ from, to, duration });
      this.volumeValue = to;
    }

    volume(value?: number): number;
    volume(value: number, _id: number): number;
    volume(value?: number): number {
      if (typeof value === 'number') {
        this.volumeValue = value;
      }
      return this.volumeValue;
    }
  }

  return {
    state,
    MockHowl,
  };
});

vi.mock('howler', () => ({
  Howl: hoisted.MockHowl,
}));

import { AudioManager } from '../audio/audioManager';

describe('audio manager', () => {
  it('switches music tracks and ducks current music', () => {
    hoisted.state.instances.length = 0;
    const manager = new AudioManager();

    manager.playMusic('market-theme');
    manager.playMusic('metro-theme');
    manager.duckMusic(120);

    expect(hoisted.state.instances.length).toBeGreaterThanOrEqual(2);
    const first = hoisted.state.instances[0];
    const second = hoisted.state.instances[1];

    expect(first.options.loop).toBe(true);
    expect(first.playCalls).toBe(1);
    expect(second.playCalls).toBe(1);
    expect(second.fadeCalls.length).toBeGreaterThan(0);
  });

  it('reuses sfx howl instances by key', () => {
    hoisted.state.instances.length = 0;
    const manager = new AudioManager();

    manager.playSfx('hit-light');
    manager.playSfx('hit-light', 0.5);
    manager.playSfx('ui-click');

    const hitLightInstances = hoisted.state.instances.filter((instance) =>
      instance.options.src.some((src) => src.includes('hit-light')),
    );
    expect(hitLightInstances).toHaveLength(1);
    expect(hitLightInstances[0].playCalls).toBe(2);
  });
});
