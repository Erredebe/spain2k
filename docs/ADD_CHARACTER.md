# Add A Character

## 1. Define gameplay data

Edit `src/config/characters.ts` and add a new `CharacterDefinition`:
- `id`
- `displayName`
- `archetype`
- `stats`
- full `moveset`
- required animation states

## 2. Bind animation set + texture key mapping

Update `src/assets/manifest.ts`:
- `TEXTURE_KEYS.players`
- `TEXTURE_INDEX`
- `ENTITY_TEXTURE_REFS`

Update `src/config/animations/index.ts`:
- `ENTITY_ANIMATION_SETS` (or reuse an existing set)
- `ENTITY_ANIMATION_BINDINGS` for the new entity key
- `VISUAL_SCALE_PROFILES` if a custom scale is needed

The runtime entity texture should point to atlas `entities-anim`.

## 3. Register legal metadata

Add the new file entries in:
- `src/config/licenses/assets-licenses.json`

Required fields:
- source URL
- author
- license (`CC0` or `CC-BY`)
- local path
- SHA-256
- attribution flags/text

## 4. Enable selection

`src/scenes/CharacterSelectScene.ts` reads from `PLAYABLE_CHARACTERS`.
After adding config data and animation binding, animated preview appears automatically.

## 5. Validate

Run:

```bash
npm run assets:verify
npm test
npm run build
```
