import { DEFAULT_CONTROLS } from '../config/input';
import type { AccessibilitySettings, Locale, SaveDataV1 } from '../config/types';

const SAVE_KEY = 'spain2k.save.v1';

const defaultAccessibility: AccessibilitySettings = {
  subtitles: true,
  reducedFlashes: false,
  reducedShake: false,
  highContrastHud: false,
  largeHud: false,
};

export const createDefaultSave = (): SaveDataV1 => ({
  version: 1,
  unlockedLevels: ['level-1-market'],
  selectedCharacterP1: 'heavy-brawler',
  selectedCharacterP2: 'technical',
  checkpointLevelId: null,
  language: 'es',
  accessibility: { ...defaultAccessibility },
  controls: {
    p1: {
      playerIndex: 1,
      bindings: DEFAULT_CONTROLS.p1.bindings.map((binding) => ({ ...binding })),
    },
    p2: {
      playerIndex: 2,
      bindings: DEFAULT_CONTROLS.p2.bindings.map((binding) => ({ ...binding })),
    },
  },
});

export const loadSave = (): SaveDataV1 => {
  const initial = createDefaultSave();
  if (typeof window === 'undefined') {
    return initial;
  }

  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as SaveDataV1;
    if (parsed.version !== 1) {
      return initial;
    }
    return {
      ...initial,
      ...parsed,
      accessibility: {
        ...initial.accessibility,
        ...parsed.accessibility,
      },
    };
  } catch {
    return initial;
  }
};

export const persistSave = (save: SaveDataV1): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
};

export const saveCheckpoint = (levelId: string): void => {
  const save = loadSave();
  save.checkpointLevelId = levelId;
  if (!save.unlockedLevels.includes(levelId)) {
    save.unlockedLevels.push(levelId);
  }
  persistSave(save);
};

export const saveLanguage = (language: Locale): void => {
  const save = loadSave();
  save.language = language;
  persistSave(save);
};

export const saveControls = (controls: SaveDataV1['controls']): void => {
  const save = loadSave();
  save.controls = controls;
  persistSave(save);
};
