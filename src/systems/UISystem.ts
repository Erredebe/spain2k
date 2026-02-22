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
  const getKeyboardHint = (playerIndex: 1 | 2): string => {
    const bindings = playerIndex === 1 ? context.controls.p1.bindings : context.controls.p2.bindings;
    const key = (action: string) =>
      bindings.find((binding) => binding.action === action)?.keyboard ?? '?';
    if (context.locale === 'es') {
      return `Teclado ${playerIndex}: ${key('move-left')}/${key('move-right')}/${key('move-up')}/${key('move-down')} Mover | ${key('jump')} Salto | ${key('light')} Ligero | ${key('heavy')} Fuerte | ${key('special')} Especial`;
    }
    return `Keyboard ${playerIndex}: ${key('move-left')}/${key('move-right')}/${key('move-up')}/${key('move-down')} Move | ${key('jump')} Jump | ${key('light')} Light | ${key('heavy')} Heavy | ${key('special')} Special`;
  };

  const getGamepadHint = (playerIndex: 1 | 2): string =>
    context.locale === 'es'
      ? `Mando ${playerIndex}: Stick/D-Pad mover | 0 salto | 2 ligero | 3 fuerte | 1 agarre | 5 especial | 9 pausa`
      : `Gamepad ${playerIndex}: Stick/D-Pad move | 0 jump | 2 light | 3 heavy | 1 grab | 5 special | 9 pause`;

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
    const inputDevice = context.inputAssignments[playerIndex].activeDevice;
    context.hud.setInputHint(
      playerIndex,
      inputDevice === 'gamepad' ? getGamepadHint(playerIndex) : getKeyboardHint(playerIndex),
    );
  }

  context.hud.update(context.nowMs);
};
