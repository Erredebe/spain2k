# Asset Licenses

## Policy

- Production runtime uses only external open assets.
- Allowed licenses in this build: `CC0` and `CC-BY`.
- No procedural art/audio is used at runtime.
- Every versioned file in `public/assets/**` has:
  - source URL
  - author
  - license
  - local path
  - SHA-256 checksum
  - attribution requirement flag/text

Canonical inventory:
- `src/config/licenses/assets-licenses.json`
- Packed runtime atlases:
  - `public/assets/atlases/entities-anim/entities-anim.(png|json)`
  - `public/assets/atlases/effects/effects.(png|json)`
  - `public/assets/atlases/ui/ui.(png|json)`

## Source Sets

### Characters (CC0)

- Mustermann 2 (Puffolotti):
  - https://opengameart.org/content/fighting-character-template-mustermann-2-a001aaaa001-karate
- Komato Devastator 2 (Puffolotti):
  - https://opengameart.org/content/complete-komato-devastator-2-for-platformers-or-fighting-games-alt
- Human woman with komato armor (Puffolotti):
  - https://opengameart.org/content/human-woman-wearing-new-komato-armor-shoto-cretin-fighting-style

Runtime extraction sources manifest:
- `src/assets/manifests/entity-animation-sources.json`

### Backgrounds (CC-BY / CC0)

- Glowing City Background (Fiulo, CC-BY):
  - https://opengameart.org/content/glowing-city-background
- Background Dark City (gfx0, CC-BY):
  - https://opengameart.org/content/background-dark-city
- Ruined City Background (TokyoGeisha, CC0):
  - https://opengameart.org/content/ruined-city-background
- Kenney Background Elements Redux (CC0):
  - https://kenney.nl/assets/background-elements-redux

### Environment Props (CC0)

- Kenney Background Elements Redux (CC0):
  - https://kenney.nl/assets/background-elements-redux
  - Runtime props used:
    - `public/assets/images/props/prop-crate.png`
    - `public/assets/images/props/prop-train.png`
    - `public/assets/images/props/prop-container-light.png`

### Music (CC-BY / CC0)

- Game Music Loop - Rising (HorrorPen, CC-BY):
  - https://opengameart.org/content/game-music-loop-rising
- Game Music Loop - Intense (HorrorPen, CC-BY):
  - https://opengameart.org/content/game-music-loop-intense
- Dark Shrine Loop (qubodup, CC0):
  - https://opengameart.org/content/dark-shrine-loop

### UI + SFX (CC0)

- Kenney UI Pack:
  - https://kenney.nl/assets/ui-pack
- Kenney Impact Sounds:
  - https://kenney.nl/assets/impact-sounds
- Kenney Interface Sounds:
  - https://kenney.nl/assets/interface-sounds

## In-game Attribution

Credits shown in-game include all `CC-BY` attributions:
- Glowing City Background by Fiulo (CC-BY 4.0)
- Background Dark City by gfx0 (CC-BY 3.0)
- Game Music Loop - Rising by HorrorPen (CC-BY 3.0)
- Game Music Loop - Intense by HorrorPen (CC-BY 3.0)
