import { DEFAULT_CONTROLS, validateControls } from '../config/input';
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
  input: {
    deadzone: 0.22,
    vibrationEnabled: true,
    lastDeviceByPlayer: {
      p1: 'keyboard',
      p2: 'keyboard',
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
    const parsedControls = parsed.controls as SaveDataV1['controls'] | undefined;
    const controlsValid = parsedControls ? validateControls(parsedControls) : false;
    const resolvedControls: SaveDataV1['controls'] =
      controlsValid && parsedControls
        ? {
            p1: {
              playerIndex: 1,
              bindings: parsedControls.p1.bindings.map((binding) => ({ ...binding })),
            },
            p2: {
              playerIndex: 2,
              bindings: parsedControls.p2.bindings.map((binding) => ({ ...binding })),
            },
          }
        : {
            p1: {
              playerIndex: 1,
              bindings: initial.controls.p1.bindings.map((binding) => ({ ...binding })),
            },
            p2: {
              playerIndex: 2,
              bindings: initial.controls.p2.bindings.map((binding) => ({ ...binding })),
            },
          };
    return {
      ...initial,
      ...parsed,
      accessibility: {
        ...initial.accessibility,
        ...parsed.accessibility,
      },
      controls: resolvedControls,
      input: {
        ...initial.input,
        ...parsed.input,
        lastDeviceByPlayer: {
          ...initial.input.lastDeviceByPlayer,
          ...parsed.input?.lastDeviceByPlayer,
        },
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

export const saveInputSettings = (input: SaveDataV1['input']): void => {
  const save = loadSave();
  save.input = input;
  persistSave(save);
};
