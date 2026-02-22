import { describe, expect, it } from 'vitest';
import { updateComboState } from '../systems/combatMath';

describe('combo activation', () => {
  it('increments combo when hit lands and resets timer', () => {
    const state = updateComboState({
      currentCombo: 2,
      comboTimerMs: 300,
      deltaMs: 16,
      timeoutMs: 2000,
      landedHit: true,
    });
    expect(state.combo).toBe(3);
    expect(state.timerMs).toBe(0);
  });

  it('resets combo after timeout', () => {
    const state = updateComboState({
      currentCombo: 4,
      comboTimerMs: 1995,
      deltaMs: 16,
      timeoutMs: 2000,
      landedHit: false,
    });
    expect(state.combo).toBe(0);
    expect(state.timerMs).toBe(0);
  });
});
