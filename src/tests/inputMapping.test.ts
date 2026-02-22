import { describe, expect, it } from 'vitest';
import {
  applyAxisDeadzone,
  resolveActiveInputDevice,
  resolveMovementAxis,
} from '../systems/inputMapping';

describe('input mapping helpers', () => {
  it('applies deadzone and normalizes axis output', () => {
    expect(applyAxisDeadzone(0.1, 0.22)).toBe(0);
    expect(applyAxisDeadzone(-0.15, 0.22)).toBe(0);
    const moved = applyAxisDeadzone(0.7, 0.22);
    expect(moved).toBeGreaterThan(0);
    expect(moved).toBeLessThanOrEqual(1);
  });

  it('prioritizes digital movement over analog when key is pressed', () => {
    expect(resolveMovementAxis(true, false, 0.9)).toBe(-1);
    expect(resolveMovementAxis(false, true, -0.8)).toBe(1);
    expect(resolveMovementAxis(false, false, 0.5)).toBe(0.5);
  });

  it('resolves active input device following activity', () => {
    expect(resolveActiveInputDevice('keyboard', true, false)).toBe('keyboard');
    expect(resolveActiveInputDevice('keyboard', false, true)).toBe('gamepad');
    expect(resolveActiveInputDevice('gamepad', true, true)).toBe('gamepad');
  });
});

