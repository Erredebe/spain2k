import { describe, expect, it } from 'vitest';
import { ASSET_MANIFEST } from '../assets/manifest';
import {
  createAnimationRuntimeState,
  resolveClipForState,
  stepAnimationRuntime,
} from '../systems/animationRuntime';
import type { AnimationSetDefinition } from '../config/types';

describe('animation runtime', () => {
  it('loops through clip frames when clip.loop=true', () => {
    const set = ASSET_MANIFEST.animationSets.heavy;
    const runtime = createAnimationRuntimeState(set, 'idle');
    const originalFrame = runtime.frameName;

    for (let index = 0; index < 20; index += 1) {
      stepAnimationRuntime(runtime, set, 'idle', 120);
    }

    expect(runtime.frameName).not.toBe('');
    expect(runtime.frameName).not.toBeUndefined();
    expect(runtime.frameName).not.toBe(originalFrame);
  });

  it('holds last frame for non-looping clips and resets on state change', () => {
    const set = ASSET_MANIFEST.animationSets.technical;
    const runtime = createAnimationRuntimeState(set, 'heavy');
    const heavyFrames = set.clips.heavy?.frames ?? [];

    for (let index = 0; index < 120; index += 1) {
      stepAnimationRuntime(runtime, set, 'heavy', 42);
    }
    expect(runtime.frameName).toBe(heavyFrames[heavyFrames.length - 1].frame);

    stepAnimationRuntime(runtime, set, 'idle', 16);
    expect(runtime.frameCursor).toBeGreaterThanOrEqual(0);
    expect(runtime.frameName.startsWith('technical.idle')).toBe(true);
  });

  it('falls back to fallbackState when requested clip is missing', () => {
    const brokenSet: AnimationSetDefinition = {
      id: 'broken',
      fallbackState: 'idle',
      clips: {
        idle: {
          id: 'broken.idle',
          state: 'idle',
          fps: 8,
          loop: true,
          frames: [{ atlasKey: 'entities-anim', frame: 'broken.idle.00' }],
        },
      },
    };
    const clip = resolveClipForState(brokenSet, 'special');
    expect(clip.id).toBe('broken.idle');
  });
});

