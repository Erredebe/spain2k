import { defineQuery } from 'bitecs';
import {
  ActiveEntityComponent,
  CombatComponent,
  HealthComponent,
  InputComponent,
} from '../components';
import { GAME_BALANCE } from '../config/balance';
import type { SystemFn } from './types';

const playerQuery = defineQuery([
  ActiveEntityComponent,
  InputComponent,
  HealthComponent,
  CombatComponent,
]);

export const UISystem: SystemFn = (context) => {
  context.hud.setCoopVisible(context.coopEnabled);

  for (const player of playerQuery(context.world)) {
    const playerIndex = InputComponent.playerIndex[player] as 1 | 2;
    if (playerIndex === 2 && !context.coopEnabled) {
      continue;
    }

    const hpRatio = HealthComponent.hp[player] / Math.max(1, HealthComponent.maxHp[player]);
    const specialRatio = CombatComponent.specialMeter[player] / GAME_BALANCE.special.maxMeter;
    const combo = CombatComponent.comboCounter[player];
    context.hud.setPlayerVitals(playerIndex, hpRatio, specialRatio);
    context.hud.setCombo(playerIndex, combo);
  }

  context.hud.update(context.nowMs);
};
