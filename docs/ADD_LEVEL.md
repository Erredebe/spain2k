# Add A Level

## 1. Create level JSON

Create a file in `src/config/levels/` using the same shape as:
- `level-1.json`
- `level-2.json`
- `level-3.json`

Required fields:
- `id`
- `displayNameEs`, `displayNameEn`
- `introEs`, `introEn`
- `musicKey`
- `backgroundStyle`
- `waves`
- `midEvent`
- `interactables`
- `hasBoss`

## 2. Register it

Edit `src/config/levels/index.ts` and append it to `LEVELS`.

## 3. Add visual and audio assets

Update `src/assets/manifest.ts`:
- background image key/path
- music key/path (`ogg` + `mp3` where possible)

All files must exist under `public/assets/**`.

## 4. Register licenses

Add legal records in:
- `src/config/licenses/assets-licenses.json`

Then validate:

```bash
npm run assets:verify
```

## 5. Run gameplay checks

```bash
npm run dev
npm test
npm run build
```

Verify:
- wave progression
- mid-event trigger
- level clear transition
