import { defineQuery } from 'bitecs';
import { ActiveEntityComponent, EnemyTag, HealthComponent } from '../components';
import { createEnemy } from '../entities/enemyFactory';
import { createFinalBoss } from '../entities/bossFactory';
import { saveCheckpoint } from '../utils/storage';
import { t } from '../config/i18n';
import { planWaveSpawn } from './spawnPlanner';
import type { SystemFn } from './types';

const enemyAliveQuery = defineQuery([ActiveEntityComponent, EnemyTag, HealthComponent]);

const isWaveCleared = (context: Parameters<SystemFn>[0]): boolean =>
  (enemyAliveQuery(context.world) as number[]).every(
    (entity: number) => HealthComponent.isAlive[entity] === 0,
  );

const startWave = (context: Parameters<SystemFn>[0]): void => {
  const { waves } = context.levelRuntime.level;
  if (context.spawnRuntime.currentWaveIndex >= waves.length) {
    return;
  }
  const wave = waves[context.spawnRuntime.currentWaveIndex];
  context.spawnRuntime.pending = planWaveSpawn(wave);
  context.spawnRuntime.timeUntilNextSpawnMs = 0;
  context.eventBus.emit('game:level-started', { levelId: context.levelRuntime.level.id });
};

export const SpawnSystem: SystemFn = (context) => {
  const { level } = context.levelRuntime;
  const waves = level.waves;
  if (!waves.length || context.spawnRuntime.levelComplete) {
    return;
  }

  if (context.spawnRuntime.currentWaveIndex >= waves.length) {
    if (level.hasBoss && !context.spawnRuntime.bossSpawned) {
      context.spawnRuntime.bossSpawned = true;
      createFinalBoss(context, 1_560, 500);
      context.hud.setSubtitle(
        context.locale === 'es' ? 'El Cabecilla entra al muelle.' : 'The kingpin steps into the dock.',
        2_800,
      );
      return;
    }
    if (isWaveCleared(context)) {
      context.spawnRuntime.levelComplete = true;
      context.eventBus.emit('game:level-cleared', { levelId: level.id });
      saveCheckpoint(level.id);
      context.hud.showToast(t(context.locale, 'checkpointSaved'));
    }
    return;
  }

  if (
    !context.spawnRuntime.midEventTriggered &&
    context.spawnRuntime.currentWaveIndex > 0 &&
    waves[context.spawnRuntime.currentWaveIndex - 1]?.id === level.midEvent.triggerAfterWaveId
  ) {
    context.spawnRuntime.midEventTriggered = true;
    context.hud.setSubtitle(
      context.locale === 'es' ? level.midEvent.subtitleEs : level.midEvent.subtitleEn,
      level.midEvent.durationMs,
    );
  }

  if (context.spawnRuntime.pending.length === 0 && context.spawnRuntime.currentWaveIndex === 0) {
    startWave(context);
  }

  if (context.spawnRuntime.pending.length > 0) {
    const wave = waves[context.spawnRuntime.currentWaveIndex];
    const alive = (enemyAliveQuery(context.world) as number[]).filter(
      (entity: number) => HealthComponent.isAlive[entity] === 1,
    ).length;

    context.spawnRuntime.timeUntilNextSpawnMs -= context.deltaMs;
    if (context.spawnRuntime.timeUntilNextSpawnMs <= 0 && alive < wave.maxConcurrent) {
      const next = context.spawnRuntime.pending.shift();
      if (next) {
        createEnemy(context, next.enemyId, next.x, next.y);
        context.spawnRuntime.timeUntilNextSpawnMs = 380;
      }
    }
  }

  if (context.spawnRuntime.pending.length === 0 && isWaveCleared(context)) {
    const clearedWave = waves[context.spawnRuntime.currentWaveIndex];
    context.eventBus.emit('game:wave-cleared', {
      levelId: level.id,
      waveId: clearedWave.id,
    });

    context.spawnRuntime.currentWaveIndex += 1;
    const hasNext = context.spawnRuntime.currentWaveIndex < waves.length;
    if (hasNext) {
      startWave(context);
      return;
    }
  }
};
