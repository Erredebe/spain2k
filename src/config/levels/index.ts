import level1 from './level-1.json';
import level2 from './level-2.json';
import level3 from './level-3.json';
import type { LevelDefinition } from '../types';

export const LEVELS = [level1, level2, level3] as LevelDefinition[];

export const findLevelById = (id: string): LevelDefinition =>
  LEVELS.find((level) => level.id === id) ?? LEVELS[0];
