import { loadSave, persistSave } from '../../utils/storage';
import type { Locale } from '../../config/types';

export interface SessionState {
  levelIndex: number;
  coopEnabled: boolean;
  selectedCharacters: [string, string];
  locale: Locale;
}

const save = loadSave();

const sessionState: SessionState = {
  levelIndex:
    save.checkpointLevelId === 'level-2-metro'
      ? 1
      : save.checkpointLevelId === 'level-3-port'
        ? 2
        : 0,
  coopEnabled: false,
  selectedCharacters: [save.selectedCharacterP1, save.selectedCharacterP2],
  locale: save.language,
};

export const getSessionState = (): SessionState => sessionState;

export const updateSessionState = (patch: Partial<SessionState>): SessionState => {
  Object.assign(sessionState, patch);
  const latestSave = loadSave();
  latestSave.language = sessionState.locale;
  latestSave.selectedCharacterP1 = sessionState.selectedCharacters[0];
  latestSave.selectedCharacterP2 = sessionState.selectedCharacters[1];
  persistSave(latestSave);
  return sessionState;
};
