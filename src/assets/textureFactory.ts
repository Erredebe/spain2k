import type Phaser from 'phaser';

const createCharacterTexture = (
  scene: Phaser.Scene,
  key: string,
  primary: number,
  secondary: number,
  accent: number,
): void => {
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(primary, 1);
  graphics.fillRoundedRect(120, 80, 220, 420, 45);
  graphics.fillStyle(secondary, 1);
  graphics.fillRoundedRect(145, 180, 170, 220, 35);
  graphics.fillStyle(accent, 1);
  graphics.fillCircle(228, 130, 46);
  graphics.fillRoundedRect(165, 420, 130, 50, 20);
  graphics.lineStyle(8, 0xffffff, 0.22);
  graphics.strokeRoundedRect(120, 80, 220, 420, 45);
  graphics.generateTexture(key, 512, 512);
  graphics.destroy();
};

const createEnemyTexture = (scene: Phaser.Scene, key: string, tone: number): void => {
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(tone, 1);
  graphics.fillRoundedRect(140, 86, 200, 400, 36);
  graphics.fillStyle(0x111827, 0.75);
  graphics.fillRoundedRect(170, 196, 140, 180, 25);
  graphics.fillStyle(0xfff1c1, 1);
  graphics.fillCircle(240, 140, 40);
  graphics.lineStyle(8, 0xffffff, 0.15);
  graphics.strokeRoundedRect(140, 86, 200, 400, 36);
  graphics.generateTexture(key, 512, 512);
  graphics.destroy();
};

const createBackgroundTexture = (
  scene: Phaser.Scene,
  key: string,
  topColor: number,
  bottomColor: number,
  neonColor: number,
): void => {
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
  graphics.fillRect(0, 0, 1920, 1080);
  for (let index = 0; index < 26; index += 1) {
    const x = 80 + index * 70;
    const y = 240 + ((index * 31) % 440);
    const width = 30 + (index % 4) * 15;
    const height = 90 + (index % 5) * 20;
    graphics.fillStyle(0x111827, 0.45);
    graphics.fillRect(x, y, width, height);
    graphics.lineStyle(2, neonColor, 0.45);
    graphics.strokeRect(x + 4, y + 6, width - 8, height - 12);
  }
  graphics.generateTexture(key, 1920, 1080);
  graphics.destroy();
};

const createEffectTextures = (scene: Phaser.Scene): void => {
  const impact = scene.add.graphics({ x: 0, y: 0 });
  impact.fillStyle(0xffcf66, 1);
  impact.fillCircle(32, 32, 22);
  impact.fillStyle(0xffffff, 1);
  impact.fillCircle(32, 32, 10);
  impact.generateTexture('fx-impact', 64, 64);
  impact.destroy();

  const spark = scene.add.graphics({ x: 0, y: 0 });
  spark.fillStyle(0x88f7ff, 1);
  spark.fillTriangle(32, 2, 52, 62, 12, 62);
  spark.generateTexture('fx-spark', 64, 64);
  spark.destroy();

  const special = scene.add.graphics({ x: 0, y: 0 });
  special.fillStyle(0x6cf0ff, 0.85);
  special.fillCircle(96, 96, 84);
  special.lineStyle(8, 0xffffff, 0.65);
  special.strokeCircle(96, 96, 76);
  special.generateTexture('fx-special', 192, 192);
  special.destroy();

  const uiBarBg = scene.add.graphics({ x: 0, y: 0 });
  uiBarBg.fillStyle(0x1f2937, 1);
  uiBarBg.fillRoundedRect(0, 0, 300, 24, 12);
  uiBarBg.generateTexture('ui-bar-bg', 300, 24);
  uiBarBg.destroy();

  const uiBarFill = scene.add.graphics({ x: 0, y: 0 });
  uiBarFill.fillGradientStyle(0x22d3ee, 0x3b82f6, 0x14b8a6, 0x06b6d4, 1);
  uiBarFill.fillRoundedRect(0, 0, 300, 24, 12);
  uiBarFill.generateTexture('ui-bar-fill', 300, 24);
  uiBarFill.destroy();

  const panel = scene.add.graphics({ x: 0, y: 0 });
  panel.fillStyle(0x111827, 0.75);
  panel.fillRoundedRect(0, 0, 640, 360, 20);
  panel.lineStyle(3, 0x22d3ee, 0.35);
  panel.strokeRoundedRect(0, 0, 640, 360, 20);
  panel.generateTexture('ui-panel', 640, 360);
  panel.destroy();
};

export const createProceduralTextures = (scene: Phaser.Scene): void => {
  if (!scene.textures.exists('player-heavy')) {
    createCharacterTexture(scene, 'player-heavy', 0xf56f5c, 0x2d2f44, 0xffc857);
    createCharacterTexture(scene, 'player-technical', 0x3fd5c6, 0x1f2d3d, 0xf0f4f8);
    createCharacterTexture(scene, 'player-agile', 0x73f26f, 0x13293d, 0xf4d35e);

    createEnemyTexture(scene, 'enemy-brawler', 0xef4444);
    createEnemyTexture(scene, 'enemy-rusher', 0xf97316);
    createEnemyTexture(scene, 'enemy-tank', 0x64748b);
    createEnemyTexture(scene, 'enemy-armed', 0x7c3aed);
    createEnemyTexture(scene, 'enemy-ranged', 0x0ea5e9);
    createEnemyTexture(scene, 'boss-cabecilla', 0xdc2626);

    createBackgroundTexture(scene, 'bg-market', 0x2f174f, 0x7d3259, 0xff5da2);
    createBackgroundTexture(scene, 'bg-metro', 0x0f172a, 0x1e3a8a, 0x93c5fd);
    createBackgroundTexture(scene, 'bg-port', 0x111827, 0x1f2937, 0x60a5fa);
    createBackgroundTexture(scene, 'bg-gradient-warm', 0xff8b42, 0x2f174f, 0xffe28a);
    createBackgroundTexture(scene, 'bg-gradient-cold', 0x0f172a, 0x164e63, 0x67e8f9);

    createEffectTextures(scene);
  }
};
