import type { BossDefinition } from './types';

export const FINAL_BOSS: BossDefinition = {
  id: 'boss-cabecilla',
  displayName: 'El Cabecilla del Puerto',
  maxHp: 3_800,
  phaseThresholds: [0.6, 0.3],
  phases: [
    {
      id: 'phase-1',
      dashCooldownMs: 2_200,
      aoeCooldownMs: 4_600,
      aggressionMultiplier: 1,
    },
    {
      id: 'phase-2',
      dashCooldownMs: 1_850,
      aoeCooldownMs: 3_300,
      aggressionMultiplier: 1.2,
    },
    {
      id: 'phase-3',
      dashCooldownMs: 1_300,
      aoeCooldownMs: 2_500,
      aggressionMultiplier: 1.45,
    },
  ],
};
