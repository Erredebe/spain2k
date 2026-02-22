export const TEXTURE_KEYS = {
  players: ['player-heavy', 'player-technical', 'player-agile'],
  enemies: ['enemy-brawler', 'enemy-rusher', 'enemy-tank', 'enemy-armed', 'enemy-ranged'],
  boss: 'boss-cabecilla',
  effects: ['fx-impact', 'fx-spark', 'fx-special', 'fx-shadow'],
  ui: ['ui-bar-bg', 'ui-bar-fill', 'ui-panel'],
  backgrounds: ['bg-market', 'bg-metro', 'bg-port', 'bg-gradient-warm', 'bg-gradient-cold'],
} as const;

export const TEXTURE_INDEX: Record<string, number> = {
  'player-heavy': 1,
  'player-technical': 2,
  'player-agile': 3,
  'enemy-brawler': 101,
  'enemy-rusher': 102,
  'enemy-tank': 103,
  'enemy-armed': 104,
  'enemy-ranged': 105,
  'boss-cabecilla': 201,
};

export const TEXTURE_KEY_BY_INDEX: Record<number, string> = Object.entries(TEXTURE_INDEX).reduce(
  (accumulator, [key, value]) => {
    accumulator[value] = key;
    return accumulator;
  },
  {} as Record<number, string>,
);
