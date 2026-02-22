# Add A Character

## 1. Define gameplay data

Edit `src/config/characters.ts` and add a new `CharacterDefinition`:
- `id`
- `displayName`
- `archetype`
- `stats`
- full `moveset`
- required animation states

## 2. Add texture key + file mapping

Update `src/assets/manifest.ts`:
- `TEXTURE_KEYS.players`
- `TEXTURE_INDEX`
- `ENTITY_TEXTURE_REFS`
- `ASSET_MANIFEST.images` with the new file in `public/assets/images/entities`

## 3. Register legal metadata

Add the new file entry in:
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
After adding config data, the card appears automatically.

## 5. Validate

Run:

```bash
npm run assets:verify
npm test
npm run build
```
