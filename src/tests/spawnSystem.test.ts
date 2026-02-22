import { describe, expect, it } from 'vitest';
import type { WaveDefinition } from '../config/types';
import { planWaveSpawn } from '../systems/spawnPlanner';

describe('spawn planner', () => {
  it('creates one spawn plan entry per enemy instance', () => {
    const wave: WaveDefinition = {
      id: 'wave-test',
      trigger: 'auto',
      maxConcurrent: 3,
      spawns: [
        {
          enemyId: 'enemy-brawler',
          count: 2,
          spawnDelayMs: 500,
          spawnPoints: [{ x: 100, y: 200 }],
        },
        {
          enemyId: 'enemy-rusher',
          count: 1,
          spawnDelayMs: 300,
          spawnPoints: [
            { x: 300, y: 400 },
            { x: 320, y: 420 },
          ],
        },
      ],
    };

    const result = planWaveSpawn(wave);
    expect(result).toHaveLength(3);
    expect(result[0].enemyId).toBe('enemy-brawler');
    expect(result[2].enemyId).toBe('enemy-rusher');
  });
});
