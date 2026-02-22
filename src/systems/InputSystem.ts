import Phaser from 'phaser';
import { defineQuery } from 'bitecs';
import { ActiveEntityComponent, InputComponent, MovementComponent } from '../components';
import type { InputSnapshot } from '../components/runtimeStores';
import type { PlayerAttackKind } from '../config/types';
import { saveInputSettings } from '../utils/storage';
import { applyAxisDeadzone, resolveActiveInputDevice, resolveMovementAxis } from './inputMapping';
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

const axisValue = (gamepad: Phaser.Input.Gamepad.Gamepad | undefined, axisIndex: number): number => {
  const axis = gamepad?.axes[axisIndex];
  if (!axis) {
    return 0;
  }
  if (typeof axis.getValue === 'function') {
    return axis.getValue();
  }
  return axis.value ?? 0;
};

const resolveSnapshot = (
  context: Parameters<SystemFn>[0],
  playerIndex: 1 | 2,
  gamepad: Phaser.Input.Gamepad.Gamepad | undefined,
): InputSnapshot => {
  const bindings = playerIndex === 1 ? context.controls.p1.bindings : context.controls.p2.bindings;
  const keyboardPressedForAction = (action: string): boolean => {
    const binding = bindings.find((candidate) => candidate.action === action);
    if (!binding) {
      return false;
    }
    return getKey(context.scene, binding.keyboard)?.isDown ?? false;
  };
  const gamepadPressedForAction = (action: string): boolean => {
    const binding = bindings.find((candidate) => candidate.action === action);
    if (!binding) {
      return false;
    }
    return gamepad?.buttons[binding.gamepadButton]?.pressed ?? false;
  };
  const pressed = (action: string): boolean =>
    keyboardPressedForAction(action) || gamepadPressedForAction(action);

  const deadzone = context.inputSettings.deadzone;
  const moveAxisX = applyAxisDeadzone(axisValue(gamepad, 0), deadzone);
  const moveAxisY = applyAxisDeadzone(axisValue(gamepad, 1), deadzone);

  const moveX = resolveMovementAxis(
    pressed('move-left'),
    pressed('move-right'),
    moveAxisX,
  );
  const moveY = resolveMovementAxis(pressed('move-up'), pressed('move-down'), moveAxisY);

  const keyboardActive = bindings.some(
    (binding) => getKey(context.scene, binding.keyboard)?.isDown ?? false,
  );
  const gamepadActive =
    bindings.some((binding) => gamepad?.buttons[binding.gamepadButton]?.pressed ?? false) ||
    Math.abs(moveAxisX) > 0.1 ||
    Math.abs(moveAxisY) > 0.1;
  const assignment = context.inputAssignments[playerIndex];
  const resolvedDevice = resolveActiveInputDevice(
    assignment.activeDevice,
    keyboardActive,
    gamepadActive,
  );
  assignment.activeDevice = resolvedDevice;
  assignment.lastInputAtMs = context.nowMs;

  return {
    moveX,
    moveY,
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

export const InputSystem: SystemFn = (context) => {
  if (!context.scene.input.keyboard) {
    return;
  }

  const gamepads = context.scene.input.gamepad?.gamepads ?? [];
  let inputSettingsChanged = false;
  for (const entity of inputQuery(context.world)) {
    const playerIndex = InputComponent.playerIndex[entity] as 1 | 2;
    if (playerIndex === 2 && !context.coopEnabled) {
      continue;
    }

    const assignment = context.inputAssignments[playerIndex];
    const gamepad = gamepads[assignment.preferredGamepadIndex];
    const snapshot = resolveSnapshot(context, playerIndex, gamepad);
    const inputBuffer = context.inputBuffers.get(entity);
    if (!inputBuffer) {
      continue;
    }
    const playerSettingsKey: 'p1' | 'p2' = playerIndex === 1 ? 'p1' : 'p2';
    if (context.inputSettings.lastDeviceByPlayer[playerSettingsKey] !== assignment.activeDevice) {
      context.inputSettings.lastDeviceByPlayer[playerSettingsKey] = assignment.activeDevice;
      inputSettingsChanged = true;
    }
    InputComponent.deviceType[entity] = assignment.activeDevice === 'gamepad' ? 1 : 0;
    const meta = context.entitiesMeta.get(entity);
    if (meta) {
      meta.currentInputDevice = assignment.activeDevice;
    }

    const previousPause = inputBuffer.last.pausePressed;
    inputBuffer.last = snapshot;
    const queuedAttack = attackFromSnapshot(snapshot);
    if (queuedAttack) {
      inputBuffer.queuedAttack = queuedAttack;
    }
    if (snapshot.pausePressed && !previousPause) {
      context.eventBus.emit('ui:pause-toggled', { paused: true });
    }
  }

  if (inputSettingsChanged) {
    saveInputSettings(context.inputSettings);
  }
};
