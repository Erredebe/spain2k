import type { AIState, AttackKind } from '../../config/types';

export interface DomainEventMap {
  'game:level-started': { levelId: string };
  'game:wave-cleared': { levelId: string; waveId: string };
  'game:level-cleared': { levelId: string };
  'combat:hit-registered': {
    attacker: number;
    defender: number;
    attackKind: AttackKind;
    damage: number;
  };
  'combat:combo-updated': { entity: number; comboCounter: number };
  'combat:special-ready': { entity: number };
  'combat:entity-knockdown': { entity: number };
  'ai:state-changed': { entity: number; from: AIState; to: AIState };
  'boss:phase-changed': { entity: number; phase: 1 | 2 | 3 };
  'boss:enraged': { entity: number };
  'ui:menu-opened': { menuId: string };
  'ui:character-selected': { player: 1 | 2; characterId: string };
  'ui:pause-toggled': { paused: boolean };
  'audio:music-switch': { musicKey: string };
  'audio:sfx-play': { sfxKey: string; volume: number };
  'save:checkpoint-written': { levelId: string };
  'save:data-loaded': { checkpointLevelId: string | null };
}

export type DomainEventName = keyof DomainEventMap;
export type DomainEventHandler<K extends DomainEventName> = (payload: DomainEventMap[K]) => void;
