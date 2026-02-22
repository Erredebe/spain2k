import { describe, expect, it } from 'vitest';
import { calculateDamage } from '../systems/combatMath';

describe('combat damage calculation', () => {
  it('applies attack, defense and special scaling', () => {
    const normal = calculateDamage({
      baseDamage: 40,
      attackStat: 30,
      defenseStat: 10,
    });
    const special = calculateDamage({
      baseDamage: 40,
      attackStat: 30,
      defenseStat: 10,
      specialScaling: 1.2,
    });

    expect(normal).toBeGreaterThan(0);
    expect(special).toBeGreaterThan(normal);
  });

  it('never returns below 1', () => {
    const damage = calculateDamage({
      baseDamage: 1,
      attackStat: 1,
      defenseStat: 99,
    });
    expect(damage).toBe(1);
  });
});
