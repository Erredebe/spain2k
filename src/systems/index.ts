import { SpawnSystem } from './SpawnSystem';
import { InputSystem } from './InputSystem';
import { AISystem } from './AISystem';
import { MovementSystem } from './MovementSystem';
import { CollisionSystem } from './CollisionSystem';
import { CombatSystem } from './CombatSystem';
import { AnimationSystem } from './AnimationSystem';
import { ParticleSystem } from './ParticleSystem';
import { AudioSystem } from './AudioSystem';
import { UISystem } from './UISystem';
import { RenderSystem } from './RenderSystem';
import type { SystemFn } from './types';

export const OrderedSystems: SystemFn[] = [
  SpawnSystem,
  InputSystem,
  AISystem,
  MovementSystem,
  CollisionSystem,
  CombatSystem,
  AnimationSystem,
  ParticleSystem,
  AudioSystem,
  UISystem,
  RenderSystem,
];
