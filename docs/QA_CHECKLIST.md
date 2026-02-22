# QA Checklist

## Build And Tests

- [ ] `npm install` completes.
- [ ] `npm run dev` boots game correctly.
- [ ] `npm run build` passes.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run assets:verify` passes.

## Gameplay

- [ ] Full campaign can be completed (3 levels).
- [ ] 3 playable characters are selectable and playable.
- [ ] Local 2P co-op works.
- [ ] Final boss phase changes happen at 60% and 30% HP.

## Combat

- [ ] Hitboxes independent from sprite art.
- [ ] Hurtboxes update by state.
- [ ] I-frames prevent unfair overlap multi-hit.
- [ ] Hitstop is visible (50-100ms).
- [ ] Screen shake and particles trigger on impact.
- [ ] Combo counter updates and resets correctly.
- [ ] Special meter fills and spends correctly.

## Asset Integrity

- [ ] No runtime call to procedural texture/audio generators.
- [ ] `PreloadScene` loads from manifest only.
- [ ] All required manifest keys are present.
- [ ] All versioned files in `public/assets/**` are listed in license inventory.
- [ ] Every license record includes `localPath`, `sha256`, and attribution metadata.

## Audio

- [ ] Music changes per level.
- [ ] SFX for step, hit, special, UI click play correctly.
- [ ] Ducking occurs during special usage.

## UI/UX

- [ ] Animated title screen.
- [ ] Character select works for 1P/2P.
- [ ] HUD bars animate and reflect state.
- [ ] Credits include CC-BY attributions.
