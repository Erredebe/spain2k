import type { AnimationRuntimeState } from '../components/runtimeStores';
import type { AnimationClipDefinition, AnimationSetDefinition, AnimationState } from '../config/types';

export const resolveClipForState = (
  animationSet: AnimationSetDefinition,
  state: AnimationState,
): AnimationClipDefinition => {
  const direct = animationSet.clips[state];
  if (direct && direct.frames.length > 0) {
    return direct;
  }
  const fallback = animationSet.clips[animationSet.fallbackState];
  if (fallback && fallback.frames.length > 0) {
    return fallback;
  }
  throw new Error(`Animation set "${animationSet.id}" does not provide a valid fallback clip`);
};

export const createAnimationRuntimeState = (
  animationSet: AnimationSetDefinition,
  state: AnimationState,
): AnimationRuntimeState => {
  const clip = resolveClipForState(animationSet, state);
  return {
    currentState: state,
    clipId: clip.id,
    frameCursor: 0,
    frameElapsedMs: 0,
    frameName: clip.frames[0].frame,
  };
};

export const stepAnimationRuntime = (
  runtime: AnimationRuntimeState,
  animationSet: AnimationSetDefinition,
  desiredState: AnimationState,
  deltaMs: number,
): AnimationRuntimeState => {
  const clip = resolveClipForState(animationSet, desiredState);
  const stateChanged = runtime.currentState !== desiredState || runtime.clipId !== clip.id;
  if (stateChanged) {
    runtime.currentState = desiredState;
    runtime.clipId = clip.id;
    runtime.frameCursor = 0;
    runtime.frameElapsedMs = 0;
  }

  const frameDurationMs = 1000 / Math.max(1, clip.fps);
  runtime.frameElapsedMs += Math.max(0, deltaMs);

  while (runtime.frameElapsedMs >= frameDurationMs) {
    runtime.frameElapsedMs -= frameDurationMs;
    runtime.frameCursor += 1;
    if (runtime.frameCursor < clip.frames.length) {
      continue;
    }
    if (clip.loop) {
      runtime.frameCursor = 0;
      continue;
    }
    runtime.frameCursor = Math.max(0, clip.frames.length - 1);
    if (clip.holdLastFrame) {
      runtime.frameElapsedMs = 0;
    }
    break;
  }

  const frame = clip.frames[Math.min(runtime.frameCursor, clip.frames.length - 1)];
  runtime.frameName = frame.frame;
  return runtime;
};

