export const SceneKeys = {
  Boot: 'boot-scene',
  Preload: 'preload-scene',
  Title: 'title-scene',
  CharacterSelect: 'character-select-scene',
  Level: 'level-scene',
  Result: 'result-scene',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
