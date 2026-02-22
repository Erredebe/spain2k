import type { ControlProfile, PlayerAction, SaveDataV1 } from './types';

const player1Bindings: ControlProfile = {
  playerIndex: 1,
  bindings: [
    {
      action: 'move-left',
      keyboard: 'ARROWLEFT',
      gamepadButton: 14,
      allowAxis: true,
      displayLabel: 'Left',
    },
    {
      action: 'move-right',
      keyboard: 'ARROWRIGHT',
      gamepadButton: 15,
      allowAxis: true,
      displayLabel: 'Right',
    },
    {
      action: 'move-up',
      keyboard: 'ARROWUP',
      gamepadButton: 12,
      allowAxis: true,
      displayLabel: 'Up',
    },
    {
      action: 'move-down',
      keyboard: 'ARROWDOWN',
      gamepadButton: 13,
      allowAxis: true,
      displayLabel: 'Down',
    },
    { action: 'jump', keyboard: 'SPACE', gamepadButton: 0, displayLabel: 'Jump' },
    { action: 'light', keyboard: 'J', gamepadButton: 2, displayLabel: 'Light' },
    { action: 'heavy', keyboard: 'K', gamepadButton: 3, displayLabel: 'Heavy' },
    { action: 'grab', keyboard: 'H', gamepadButton: 1, displayLabel: 'Grab' },
    { action: 'special', keyboard: 'L', gamepadButton: 5, displayLabel: 'Special' },
    { action: 'pause', keyboard: 'ESC', gamepadButton: 9, displayLabel: 'Pause' },
  ],
};

const player2Bindings: ControlProfile = {
  playerIndex: 2,
  bindings: [
    {
      action: 'move-left',
      keyboard: 'A',
      gamepadButton: 14,
      allowAxis: true,
      displayLabel: 'Left',
    },
    {
      action: 'move-right',
      keyboard: 'D',
      gamepadButton: 15,
      allowAxis: true,
      displayLabel: 'Right',
    },
    { action: 'move-up', keyboard: 'W', gamepadButton: 12, allowAxis: true, displayLabel: 'Up' },
    {
      action: 'move-down',
      keyboard: 'S',
      gamepadButton: 13,
      allowAxis: true,
      displayLabel: 'Down',
    },
    { action: 'jump', keyboard: 'R', gamepadButton: 0, displayLabel: 'Jump' },
    { action: 'light', keyboard: 'F', gamepadButton: 2, displayLabel: 'Light' },
    { action: 'heavy', keyboard: 'G', gamepadButton: 3, displayLabel: 'Heavy' },
    { action: 'grab', keyboard: 'T', gamepadButton: 1, displayLabel: 'Grab' },
    { action: 'special', keyboard: 'Y', gamepadButton: 5, displayLabel: 'Special' },
    { action: 'pause', keyboard: 'TAB', gamepadButton: 9, displayLabel: 'Pause' },
  ],
};

export const DEFAULT_CONTROLS = {
  p1: player1Bindings,
  p2: player2Bindings,
} as const;

const REQUIRED_ACTIONS: PlayerAction[] = [
  'move-left',
  'move-right',
  'move-up',
  'move-down',
  'pause',
];

export const validateControlProfile = (profile: ControlProfile): boolean => {
  if (!profile.bindings.length) {
    return false;
  }
  const actionSet = new Set(profile.bindings.map((binding) => binding.action));
  return REQUIRED_ACTIONS.every((action) => actionSet.has(action));
};

export const validateControls = (controls: SaveDataV1['controls']): boolean =>
  validateControlProfile(controls.p1) && validateControlProfile(controls.p2);
