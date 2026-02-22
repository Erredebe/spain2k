import type { WaveDefinition } from '../config/types';
import type { SpawnPlanItem } from './types';

export const planWaveSpawn = (wave: WaveDefinition): SpawnPlanItem[] => {
  const plans: SpawnPlanItem[] = [];
  wave.spawns.forEach((group) => {
    for (let index = 0; index < group.count; index += 1) {
      const point = group.spawnPoints[index % group.spawnPoints.length];
      plans.push({
        enemyId: group.enemyId,
        x: point.x,
        y: point.y,
      });
    }
  });
  return plans;
};
