import type { AIState } from '../config/types';

export interface AITransitionInput {
  current: AIState;
  distanceToTarget: number;
  canAttack: boolean;
  isStunned: boolean;
  isKnockedDown: boolean;
  enraged: boolean;
  approachRange: number;
  attackRange: number;
  retreatRange: number;
}

export const getNextAIState = (input: AITransitionInput): AIState => {
  if (input.isKnockedDown) {
    return 'Knockdown';
  }
  if (input.isStunned) {
    return 'Stunned';
  }
  if (input.enraged) {
    if (input.distanceToTarget > input.attackRange) {
      return 'Approach';
    }
    return input.canAttack ? 'Attack' : 'Enraged';
  }

  if (input.distanceToTarget > input.approachRange) {
    return 'Approach';
  }
  if (input.distanceToTarget <= input.attackRange && input.canAttack) {
    return 'Attack';
  }
  if (input.distanceToTarget < input.retreatRange) {
    return 'Retreat';
  }

  if (input.current === 'Retreat' && input.distanceToTarget > input.attackRange) {
    return 'Approach';
  }
  return 'Idle';
};
