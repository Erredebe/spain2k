import Phaser from 'phaser';
import { defineQuery } from 'bitecs';
import { ActiveEntityComponent, InputComponent, MovementComponent } from '../components';
import type { InputSnapshot } from '../components/runtimeStores';
import { saveControls } from '../utils/storage';
import type { PlayerAttackKind } from '../config/types';
import type { SystemFn } from './types';

const inputQuery = defineQuery([ActiveEntityComponent, InputComponent, MovementComponent]);
const keyCache = new Map<string, Phaser.Input.Keyboard.Key>();

const getKey = (scene: Phaser.Scene, keyName: string): Phaser.Input.Keyboard.Key | null => {
  if (!scene.input.keyboard) {
    return null;
  }
  const code =
    Phaser.Input.Keyboard.KeyCodes[keyName as keyof typeof Phaser.Input.Keyboard.KeyCodes];
  if (code === undefined) {
    return null;
  }
  const cacheKey = `${scene.sys.settings.key}:${keyName}`;
  const cached = keyCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const key = scene.input.keyboard.addKey(code, false);
  keyCache.set(cacheKey, key);
  return key;
};

const resolveSnapshot = (
  context: Parameters<SystemFn>[0],
  playerIndex: 1 | 2,
  gamepad: Phaser.Input.Gamepad.Gamepad | undefined,
): InputSnapshot => {
  const bindings = playerIndex === 1 ? context.controls.p1.bindings : context.controls.p2.bindings;
  const pressed = (action: string): boolean => {
    const binding = bindings.find((candidate) => candidate.action === action);
    if (!binding) {
      return false;
    }
    const keyboardPressed = getKey(context.scene, binding.keyboard)?.isDown ?? false;
    const padPressed = gamepad?.buttons[binding.gamepadButton]?.pressed ?? false;
    return keyboardPressed || padPressed;
  };

  return {
    moveX: (pressed('move-right') ? 1 : 0) - (pressed('move-left') ? 1 : 0),
    moveY: (pressed('move-down') ? 1 : 0) - (pressed('move-up') ? 1 : 0),
    jumpPressed: pressed('jump'),
    lightPressed: pressed('light'),
    heavyPressed: pressed('heavy'),
    grabPressed: pressed('grab'),
    specialPressed: pressed('special'),
    pausePressed: pressed('pause'),
  };
};

const attackFromSnapshot = (snapshot: InputSnapshot): PlayerAttackKind | null => {
  if (snapshot.specialPressed) {
    return 'special';
  }
  if (snapshot.heavyPressed) {
    return 'heavy';
  }
  if (snapshot.grabPressed) {
    return 'grab';
  }
  if (snapshot.lightPressed) {
    return 'light-1';
  }
  return null;
};

const handleRemapShortcut = (context: Parameters<SystemFn>[0]): void => {
  const remapKey = getKey(context.scene, 'F1');
  if (!remapKey) {
    return;
  }
  if (Phaser.Input.Keyboard.JustDown(remapKey)) {
    const p1 = context.controls.p1.bindings;
    const light = p1.find((binding) => binding.action === 'light');
    const heavy = p1.find((binding) => binding.action === 'heavy');
    if (light && heavy) {
      [light.keyboard, heavy.keyboard] = [heavy.keyboard, light.keyboard];
      saveControls(context.controls);
      context.hud.showToast('Remap P1: light/heavy');
      context.audio.playSfx('ui-click');
    }
  }
};

export const InputSystem: SystemFn = (context) => {
  if (!context.scene.input.keyboard) {
    return;
  }

  handleRemapShortcut(context);

  const gamepads = context.scene.input.gamepad?.gamepads ?? [];
  for (const entity of inputQuery(context.world)) {
    const playerIndex = InputComponent.playerIndex[entity] as 1 | 2;
    if (playerIndex === 2 && !context.coopEnabled) {
      continue;
    }
    const gamepad = gamepads[playerIndex - 1];
    const snapshot = resolveSnapshot(context, playerIndex, gamepad);
    const inputBuffer = context.inputBuffers.get(entity);
    if (!inputBuffer) {
      continue;
    }
    inputBuffer.last = snapshot;
    const queuedAttack = attackFromSnapshot(snapshot);
    if (queuedAttack) {
      inputBuffer.queuedAttack = queuedAttack;
    }
    if (snapshot.pausePressed) {
      context.eventBus.emit('ui:pause-toggled', { paused: true });
    }
  }
};
