export const GAME_BALANCE = {
  worldWidth: 1920,
  laneMinY: 250,
  laneMaxY: 680,
  gravity: 1_900,
  hitstop: {
    lightMs: 55,
    heavyMs: 80,
    specialMs: 100,
  },
  comboTimeoutMs: 2_000,
  special: {
    maxMeter: 100,
    specialCost: 100,
    gainOnHit: 14,
    gainOnReceive: 8,
  },
  knockback: {
    maxHorizontal: 750,
    maxVertical: 500,
    groundFriction: 0.85,
  },
  juggle: {
    hardLimit: 3,
  },
  camera: {
    followLerp: 0.12,
    shake: {
      light: 0.002,
      heavy: 0.004,
      special: 0.006,
    },
  },
  performance: {
    maxEntities: 512,
    maxParticles: 256,
    cullingPadding: 180,
  },
  ai: {
    engagementCap: 2,
    telegraphMs: 300,
  },
} as const;

export const TICK_RATE = 1 / 60;
