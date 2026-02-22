import type { Locale } from './types';

type DictKey =
  | 'title'
  | 'pressStart'
  | 'coopHint'
  | 'characterSelect'
  | 'player1'
  | 'player2'
  | 'continue'
  | 'combo'
  | 'victory'
  | 'gameOver'
  | 'levelCleared'
  | 'specialReady'
  | 'checkpointSaved';

const dictionary: Record<Locale, Record<DictKey, string>> = {
  es: {
    title: 'SPAIN 2K',
    pressStart: 'Pulsa ENTER para empezar',
    coopHint: 'Pulsa C para activar coop local',
    characterSelect: 'Selecciona personaje',
    player1: 'Jugador 1',
    player2: 'Jugador 2',
    continue: 'Pulsa ENTER para continuar',
    combo: 'Combo',
    victory: 'Victoria',
    gameOver: 'Derrota',
    levelCleared: 'Nivel superado',
    specialReady: 'Especial listo',
    checkpointSaved: 'Checkpoint guardado',
  },
  en: {
    title: 'SPAIN 2K',
    pressStart: 'Press ENTER to start',
    coopHint: 'Press C to enable local co-op',
    characterSelect: 'Select character',
    player1: 'Player 1',
    player2: 'Player 2',
    continue: 'Press ENTER to continue',
    combo: 'Combo',
    victory: 'Victory',
    gameOver: 'Defeat',
    levelCleared: 'Level cleared',
    specialReady: 'Special ready',
    checkpointSaved: 'Checkpoint saved',
  },
};

export const t = (locale: Locale, key: DictKey): string => dictionary[locale][key];
