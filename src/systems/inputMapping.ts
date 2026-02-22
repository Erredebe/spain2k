import type { InputDeviceType } from '../config/types';

export const applyAxisDeadzone = (value: number, deadzone: number): number => {
  const safeDeadzone = Math.max(0, Math.min(0.95, deadzone));
  const magnitude = Math.abs(value);
  if (magnitude <= safeDeadzone) {
    return 0;
  }
  const normalized = (magnitude - safeDeadzone) / (1 - safeDeadzone);
  return Math.sign(value) * Math.min(1, normalized);
};

export const resolveMovementAxis = (
  negativePressed: boolean,
  positivePressed: boolean,
  analogAxis: number,
): number => {
  const digital = (positivePressed ? 1 : 0) - (negativePressed ? 1 : 0);
  if (digital !== 0) {
    return digital;
  }
  if (Math.abs(analogAxis) < 0.08) {
    return 0;
  }
  return analogAxis;
};

export const resolveActiveInputDevice = (
  previous: InputDeviceType,
  keyboardActive: boolean,
  gamepadActive: boolean,
): InputDeviceType => {
  if (keyboardActive && !gamepadActive) {
    return 'keyboard';
  }
  if (gamepadActive && !keyboardActive) {
    return 'gamepad';
  }
  if (keyboardActive && gamepadActive) {
    return previous;
  }
  return previous;
};
