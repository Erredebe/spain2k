import { clamp, signOrOne } from '../utils/math';

export interface DamageInput {
  baseDamage: number;
  attackStat: number;
  defenseStat: number;
  specialScaling?: number;
}

export interface KnockbackInput {
  baseX: number;
  baseY: number;
  weight: number;
  facing: number;
  knockbackLimitX: number;
  knockbackLimitY: number;
}

export interface ComboStateInput {
  currentCombo: number;
  comboTimerMs: number;
  deltaMs: number;
  timeoutMs: number;
  landedHit: boolean;
}

export const calculateDamage = ({
  baseDamage,
  attackStat,
  defenseStat,
  specialScaling = 1,
}: DamageInput): number => {
  const raw = baseDamage + attackStat * 0.65 - defenseStat * 0.42;
  return Math.max(1, Math.round(raw * specialScaling));
};

export const calculateKnockback = ({
  baseX,
  baseY,
  weight,
  facing,
  knockbackLimitX,
  knockbackLimitY,
}: KnockbackInput): { x: number; y: number } => {
  const appliedFacing = signOrOne(facing);
  const horizontal = clamp(
    (baseX / Math.max(weight, 0.2)) * appliedFacing,
    -knockbackLimitX,
    knockbackLimitX,
  );
  const vertical = clamp(-(baseY / Math.max(weight, 0.2)), -knockbackLimitY, knockbackLimitY);
  return { x: horizontal, y: vertical };
};

export const updateComboState = ({
  currentCombo,
  comboTimerMs,
  deltaMs,
  timeoutMs,
  landedHit,
}: ComboStateInput): { combo: number; timerMs: number } => {
  let combo = currentCombo;
  let timerMs = comboTimerMs + deltaMs;
  if (timerMs > timeoutMs) {
    combo = 0;
    timerMs = 0;
  }
  if (landedHit) {
    combo += 1;
    timerMs = 0;
  }
  return { combo, timerMs };
};
