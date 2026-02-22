import type { ControlProfile } from './types';

const player1Bindings: ControlProfile = {
  playerIndex: 1,
  bindings: [
    { action: 'move-left', keyboard: 'ARROWLEFT', gamepadButton: 14 },
    { action: 'move-right', keyboard: 'ARROWRIGHT', gamepadButton: 15 },
    { action: 'move-up', keyboard: 'ARROWUP', gamepadButton: 12 },
    { action: 'move-down', keyboard: 'ARROWDOWN', gamepadButton: 13 },
    { action: 'jump', keyboard: 'SPACE', gamepadButton: 0 },
    { action: 'light', keyboard: 'J', gamepadButton: 2 },
    { action: 'heavy', keyboard: 'K', gamepadButton: 3 },
    { action: 'grab', keyboard: 'H', gamepadButton: 1 },
    { action: 'special', keyboard: 'L', gamepadButton: 5 },
    { action: 'pause', keyboard: 'ESC', gamepadButton: 9 },
  ],
};

const player2Bindings: ControlProfile = {
  playerIndex: 2,
  bindings: [
    { action: 'move-left', keyboard: 'A', gamepadButton: 14 },
    { action: 'move-right', keyboard: 'D', gamepadButton: 15 },
    { action: 'move-up', keyboard: 'W', gamepadButton: 12 },
    { action: 'move-down', keyboard: 'S', gamepadButton: 13 },
    { action: 'jump', keyboard: 'R', gamepadButton: 0 },
    { action: 'light', keyboard: 'F', gamepadButton: 2 },
    { action: 'heavy', keyboard: 'G', gamepadButton: 3 },
    { action: 'grab', keyboard: 'T', gamepadButton: 1 },
    { action: 'special', keyboard: 'Y', gamepadButton: 5 },
    { action: 'pause', keyboard: 'TAB', gamepadButton: 9 },
  ],
};

export const DEFAULT_CONTROLS = {
  p1: player1Bindings,
  p2: player2Bindings,
} as const;
