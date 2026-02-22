import { describe, expect, it } from 'vitest';
import { getNextAIState } from '../systems/aiTransitions';

describe('ai state transitions', () => {
  it('chooses approach when target is far', () => {
    const state = getNextAIState({
      current: 'Idle',
      distanceToTarget: 420,
      canAttack: true,
      isStunned: false,
      isKnockedDown: false,
      enraged: false,
      approachRange: 300,
      attackRange: 90,
      retreatRange: 50,
    });
    expect(state).toBe('Approach');
  });

  it('chooses attack when in range and ready', () => {
    const state = getNextAIState({
      current: 'Approach',
      distanceToTarget: 70,
      canAttack: true,
      isStunned: false,
      isKnockedDown: false,
      enraged: false,
      approachRange: 300,
      attackRange: 90,
      retreatRange: 45,
    });
    expect(state).toBe('Attack');
  });

  it('prioritizes knockdown over any state', () => {
    const state = getNextAIState({
      current: 'Attack',
      distanceToTarget: 20,
      canAttack: true,
      isStunned: false,
      isKnockedDown: true,
      enraged: true,
      approachRange: 300,
      attackRange: 90,
      retreatRange: 45,
    });
    expect(state).toBe('Knockdown');
  });
});
