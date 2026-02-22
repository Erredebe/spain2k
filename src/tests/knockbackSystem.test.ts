import { describe, expect, it } from 'vitest';
import { calculateKnockback } from '../systems/combatMath';

describe('knockback system', () => {
  it('applies facing and weight scaling', () => {
    const lightTarget = calculateKnockback({
      baseX: 320,
      baseY: 120,
      weight: 0.8,
      facing: 1,
      knockbackLimitX: 700,
      knockbackLimitY: 500,
    });
    const heavyTarget = calculateKnockback({
      baseX: 320,
      baseY: 120,
      weight: 2,
      facing: 1,
      knockbackLimitX: 700,
      knockbackLimitY: 500,
    });

    expect(Math.abs(lightTarget.x)).toBeGreaterThan(Math.abs(heavyTarget.x));
    expect(lightTarget.y).toBeLessThan(0);
  });

  it('clamps values to configured caps', () => {
    const result = calculateKnockback({
      baseX: 9_000,
      baseY: 9_000,
      weight: 0.1,
      facing: -1,
      knockbackLimitX: 600,
      knockbackLimitY: 450,
    });
    expect(result.x).toBeGreaterThanOrEqual(-600);
    expect(result.x).toBeLessThanOrEqual(600);
    expect(result.y).toBeGreaterThanOrEqual(-450);
    expect(result.y).toBeLessThanOrEqual(450);
  });
});
