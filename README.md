# Spiraling Down — Trinkspiel-App

Lokale LAN-App für den 8×9-Spieltisch „Spiraling Down": Spieler auf dem Brett
positionieren, 1d6 würfeln, Regeln/Trink-Schlüsse über ein Bootstrap-Modal ziehen.
Läuft auf dem Raspberry Pi (192.168.178.69:8084) neben HUB (8080/8081) und
Küche (8082/8083) und ist von allen Geräten im LAN erreichbar.

> **Statische App:** Kein Backend, keine DB, keine Auth. `core/` existiert hier
> **nicht** — im Gegensatz zur Küche. Regelsätze und Regeln sind JSON im
> Repo (`src/rulesets/`, `src/rules/`) und landen baked in den Vite-Build.

## Stack

| Teil      | Technologie                        | Anmerkung                                                              |
| --------- | ---------------------------------- | ---------------------------------------------------------------------- |
| UI        | Vue 3 `<script setup>`, TypeScript | Router (2 Routen), Pinia (1 Store), vue-i18n (de/en)                   |
| 3D-Würfel | `@3d-dice/dice-box` (ammo-wasm)    | `1d6`, Assets unter `/dice-box/` (public/)                             |
| UI-Shell  | Bootstrap 5 + Bootstrap-Icons      | Modal, Offcanvas, Dropdown; Design-Tokens in `src/styles/tokens.scss`  |
| Musik     | `<audio>` + Gonzales-MP3s          | `BarbaraAnn.mp3`, `iwantgonzales.mp3`, `gonzalesbrueder.mp3` (Shuffle) |
| Sound     | Web Audio API (`soundService.ts`)  | Würfel-Klack, Lande-Pfiff, Victory; `navigator.vibrate`-Vibration      |
| Build     | Vite 5 + `vue-tsc` Type-Check      | `npm run build` = `vue-tsc -b && vite build`                           |
| Serve     | nginx:alpine (host-network)        | `docker compose`-Container `spiralingdown-web`                         |

## Ports

| Service     | Host-Port | Hostname-Bezug                |
| ----------- | --------- | ----------------------------- |
| web (nginx) | **8084**  | `http://192.168.178.69:8084/` |

→ **Nur 1 Port** (reine statische SPA). Port 80 bleibt Pi-hole (AGENTS §14/§16),
HUB 8080/8081, Küche 8082/8083 — Spiraling Down bekommt **8084**, frei im LAN.

## Router / Views

`src/router/router.ts` — 2 Routen:

- `/` → `src/views/Home.vue` — Spieler hinzufügen/entfernen, Regelset wählen, Start
- `/game` → `src/views/Game.vue` — Spielfeld 8×9, Würfeln, Modal, Player-Animation

**Start-Voraussetzung:** ≥ 2 Spieler (`canStartGame`).

Die App-Shell `src/layouts/AppShell.vue` hält die ständigen Teile: `#dice-box`
(Canvas), ⚙️-Offcanvas (`Sidebar.vue`), `<router-view>`. **Nicht umbauen**,
sonst brechen Modal + Offcanvas + Dice-Overlay gleichzeitig.
`App.vue` selbst ist nur Mount + F5→`Home`-Redirect (Router-Guard).

## Data Model (Pinned)

`src/store/store.ts` + `interfaces.ts`:

```ts
interface PlayerModel {
  name: string;
  color: string;
  position: number;
}
```

Store-Ref-Exposition (Pinia setup-store):

- `players: PlayerModel[]`
- `colors: { i18nKey, value, filter }[]` — 12 Farben (gelb/orange/grün/lila/schwarz/
  **dafuq**/blau/aqua/rosa/braun/rot/weiß); `filter` ist ein CSS-`filter`-Wert für
  das farbig eingefärbte `player.png`
- `availableRulesets: RulesetName[]` — **stabile Liste** aus `listRulesets()`
  (Registry `src/rulesets/index.ts`). Default-Order von der Fallback-Locale `de`.
- `activeRuleset: RulesetName` (default = `availableRulesets[0]` = `"spiralingDown"`)
- `currentRuleset: Ruleset` — reaktiver `computed` auf `[locale, activeRuleset]`;
  Form: `{ name: string; fields: FieldModel[] }` (Index = Feld-ID)
- `settings: { music, sound, vibration }` + `setSettings(partial)` — **alle drei aktiv**

## Regelset-Dateien (Source of truth)

**Kein Code, nur JSON** — alle Inhalte liegen in `src/rulesets/<id>/<id>.<locale>.json`:

```jsonc
{
  "name": "Spiraling Down", // Display-Name in UI/Home
  "fieldId0": {
    // ← Key MÜSSTE `fieldId<N>` sein (N = Brett-ID)
    "name": "Start",
    "description": "…{PlayerName}…", // optional {PlayerName}, {switch}
    "move": 0, // ±n = vorwärts/rückwärts, 0 = keine Bewegung
    "rule": "-", // ""=keine, "-"=aufgehoben, "Random"=aus rules.*,
    // sonst Literal-Text (wird als Regel angezeigt)
  },
  "fieldId6": { "name": "Lucky Shot", "move": 24, "rule": "" }, // Sprung
  "fieldId9": { "name": "Regel", "move": 0, "rule": "Random" },
}
```

**Feld-ID ≠ Zug-Reihenfolge.** Die Brett-Geometrie ist zentral in
`src/board/boardGeometry.ts` (`BOARD_MATRIX`, 8×9, IDs 0–71 in Spiral-Reihenfolge,

- `BOARD_BORDER_*` Sets und `coordinatesOf(fieldId)`). `fieldId`-Keys
  müssen **exakt** die Brett-ID treffen, sonst greift `getFieldData(id)` auf
  `{name:"",description:""}` zurück und das Feld ist tot.

### Template-Platzhalter (in `description` / `rule`)

- **`{PlayerName}`** → wird durch den Namen des **aktuellen** Spielers ersetzt
  (`replacePlayerName`, `services/getDescription.ts`). Auch bei `rule: "…"` erlaubt.
- **`{switch}`** → teilt die `description` in Segmente; das gewürfelte `steps`
  (1–6) wählt ein Segment: `index = min(floor((steps-1)/(6/len)), len-1)`.
  Für 2 Segmente: 1–3 → A, 4–6 → B. Für 3 Segmente: 1–2, 3–4, 5–6.

### Random-Regeln

`rule: "Random"` → zieht **eine** aus der globalen Rule-List der aktiven Sprache
in `src/rules/rules.<locale>.json` (`rules: string[]`). Die Ziehung hält
`currentRuleIndex` und wird bei Sprachwechsel erneut aufgelöst
(`Game.vue → watch(locale)`), damit Random-Regel in beiden Sprachen existieren.

**Zustand der Regeln:** `rules/rules.de.json` + `rules.en.json` — die beiden sind
getrennt gepflegt und **nicht** automatisch synchron. Neue Regeln = in **beide**
Locales ergänzen, sonst fehlen sie in einer Sprache.

## Spiel-Loop (Game.vue, Kurzform)

1. `rollDice()` → `diceBox.roll("1d6")` → await `movePlayerSpiral(steps)` →
   await `handleFieldInteraction` → Spielerwechsel (`(idx+1) % players.length`).
2. `handleFieldInteraction`:
   - **Während `fieldData.move != 0`:** Modal (mit Titel/Beschreibung/Regel) →
     warten bis `hide.bs.modal` → `movePlayerSpiral(move)` → neues Feld einlesen.
     Das ist eine `while`-Kette für Kettenbewegungen (z. B. „Gehe auf Feld 30").
   - **Am Endfeld:** `description` und `rule` durch `processDescription` +
     `replacePlayerName` template-aufgelöst, dann ein finales Modal.
3. `movePlayerSpiral(player, move)` ist **bewusst asymmetrisch**:
   - `|move| <= 6` → **schrittweise** (500 ms pro Feld), animiert.
   - `|move| > 6` → **direkter Sprung** (`player.position = end`).
     Der Code-Kommentar dazu steht _verkehrt herum_ („große Distanzen schrittweise")
     — nicht „fixen", das ist das gewollte Verhalten (Kettenbewegungen fliegen).
4. **Kein End-Spiel.** Wenn jemand Feld 71 („SIEG") erreicht passiert nichts sonderbares —
   das Feld zeigt nur ein Modal. Kein Reset-Button, kein Winner-State. Wer neu
   startet, geht manuell zurück auf `/` (Router).

**Spielerwechsel ist strikt rotierend.** Kein Aussetzen, kein Zweitsprung.

## UI/Overlay — nix umschichten

- **`BoardGrid.vue`** rendert das 8×9-Spielfeld als `<table>` aus
  `boardGeometry.BOARD_MATRIX`. Alle Board-Styles (`.game-board`, `.field`,
  `.field-number`, `.border-left|right|bottom`, `.field.active`) sind **hier** —
  `Game.vue` rendert `<BoardGrid>` und hält **keine** Board-CSS mehr.
- **`Player.vue`** rendert den Spieler-Token als absolut positioniertes `img`
  (player.png) mit `filter` aus `store.colors` und `top/left` in % via
  `coordinatesOf()` aus `boardGeometry.ts`.
- **`Overlay.vue`** ist das feste 30 vw breite Seitengerüst (links/rechts, je
  nach Spalte), das den aktuellen Spieler + aktiv laufende Regel zeigt,
  `pointer-events: none` (Seite via `overlaySide(fieldId)` aus `boardGeometry`).
- **`Sidebar.vue`** = ⚙️-Offcanvas (Bootstrap): Sprache (de/en), Musik/Sound/Vibration.
  Alle drei `settings.*` sind **aktiv umgesetzt**:
  - `music` → `musicService.ts` (Gonzales-Shuffle)
  - `sound` → `soundService.ts` (Web-Audio: Klack, Pfiff, Victory)
  - `vibration` → `navigator.vibrate(...)` (Game.vue + rollEvent + victory)
- **`AppShell.vue`** positioniert `#dice-box` + `:deep(.dice-box-canvas)` absolut
  über allem (`z-index: 2`, `pointer-events: none`). Canvas-Größe = 100 vw/vh.
  Brechen `z-index`/`pointer-events` weg = Modal/Clicks tot.
- **`App.vue`** ist nur Mount (`<AppShell/>`) + F5→`Home`-Redirect-Guard
  (`onMounted` + `router.replace`). Shell-Styles nicht hier anfassen.

## i18n / Regelset-Registry

**Trennung** (wichtig):

- `src/i18n/i18n.ts` hält **NUR UI-Strings** (`de.json`, `en.json`) plus
  $t-Keys für Titel/Buttons/Farben. createI18n ist rein.
- `src/rulesets/index.ts` ist die **typisierte Registry** für Regelsätze +
  Random-Regeln. Sie importiert die 6 JSONs (2 Regelsets × 2 Locales + 2 Rule-Pools)
  und stellt `listRulesets()`, `getRuleset(locale, name)`, `getRules(locale)`,
  `isRulesetName(name)` bereit. Fallback-Locale = `de`.
- `src/store/store.ts` verdrahtet die Registry: `availableRulesets` (aus
  `listRulesets()`), `currentRuleset` (computed auf [locale, activeRuleset]),
  `setRuleset(name)` (verwirft nicht-matching).

**Neues Regelset hinzufügen** (3 Schritte):

1. `src/rulesets/<id>/<id>.de.json` **und** `<id>.en.json` anlegen
   (gleiche `fieldId*N`-IDs, gleiche Struktur — der Registry-Normalizer
   liest **beide** Locales über die `fieldId`-Keys, nicht pro-Sprache).
2. `src/rulesets/index.ts` editieren:
   - die 2 JSONs importieren,
   - in `RulesetName`-Typ ergänzen,
   - in `RULESETS.de` und `RULESETS.en` registrieren.
3. Optional: `activeRuleset`-Default in `src/store/store.ts` anpassen, falls
   das neue Set `listRulesets()[0]` werden soll (sonst bleibt `spiralingDown`).

**Kein i18n.ts-Edit** mehr — die registry-Getrennung ist fix.
**Kein JSON-Schema-Validator** im Build — Tippfehler in `fieldIdN`-IDs
oder fehlende Felder fallen erst zur Laufzeit auf (leeres Modal, kein Fehler-Log).

## Local Dev

```bash
npm ci
npm run dev        # Vite, Port 5173 (Standard)
npm run build      # vue-tsc -b && vite build  → dist/
npm run preview    # lokale Build-Vorschau (port 4173)
npm run lint       # prettier --check .   (Guard 2)
npm run format     # prettier --write .   (Guard 3)
```

**Keine Unit-/Integration-Tests** im Repo. Guards sind:

1. `vue-tsc` im Build (Typfehler blockieren `npm run build`),
2. `prettier --check` (`npm run lint`),
3. `npm run format` bei Formatierungs-Drift.

Bei Änderung an `Game.vue`/`BoardGrid.vue`/`Overlay.vue`/`Player.vue` immer
`npm run build` lokal fahren, bevor push/deploy.

## Docker / Deploy (Raspi)

**Einziger Container: `spiralingdown-web`** (kein `core`, keine Volumes).

```yaml
# docker-compose.yml (Repo-Root)
services:
  web:
    build: .
    image: spiralingdown-web:0.1.0
    container_name: spiralingdown-web
    network_mode: host # Port 8084 direkt am Host, wie kueche-web :8082
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:8084/"]
```

`Dockerfile` (Multi-Stage):

1. **build** — `node:24-alpine`, `npm ci` + `npm run build`.
2. **runtime** — `nginx:alpine`, `COPY --from=build /app/dist → /usr/share/nginx/html`,
   `nginx.conf` listen **8084**.

### Update/Deploy (Raspi)

```bash
cd ~/Projekte/spiralingdown
git pull --ff-only
docker compose build        # node-Stage cached, nginx-Stage neu
docker compose up -d
# Verif:
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.178.69:8084/
docker compose ps           # healthcheck sollte "healthy" zeigen
```

**Niemals:** `network_mode: host` entfernen (bricht die Port-1:1-Kopplung
mit Pi-hole/HUB/Küche), Port 8084 auf 80 verschieben (Pi-hole!), `nginx.conf`
`/dice-box/` immutable-cache entfernen (würde jede Reload die ammo.wasm neu laden,
1.3 MB).

## File-Map (kurz)

```
src/
  App.vue                     # Mount + F5→Home-Redirect (keine Shell-Logik)
  main.ts                     # createApp + pinia + i18n + router
  router/router.ts            # 2 Routen, createWebHistory (SPA-Fallback)
  layouts/AppShell.vue        # Shell: .background, #dice-box, ⚙️, Sidebar, <router-view>
  board/boardGeometry.ts      # BOARD_MATRIX, BORDER_*, coordinatesOf, overlaySide
  store/store.ts              # Pinia-store: players/colors/rulesets/settings
  store/interfaces.ts         # PlayerModel, FieldModel
  views/Home.vue              # Spieler-Setup + Regelset-Picker + Start
  views/Game.vue              # Spiel-Loop, Würfeln, Modal, Sound/Vibration, Spielerwechsel
  components/BoardGrid.vue    # 8×9-Table + alle Board-Styles (zentral)
  components/Player.vue       # Spieler-Token (Top/Left via boardGeometry)
  components/Overlay.vue      # Festes Seitenpanel: aktueller Spieler + Regel
  components/Sidebar.vue      # Offcanvas: Sprache + settings (music/sound/vibration)
  i18n/{de,en}.json           # UI-Strings + colors (KEINE Regelsätze!)
  i18n/i18n.ts                # createI18n (rein, nur UI-Strings)
  rules/rules.{de,en}.json    # Random-Regel-Pool (pro Sprache, nicht sync)
  rulesets/spiralingdown/spiralingdown.{de,en}.json
  rulesets/spongebob/spongebob.{de,en}.json
  rulesets/index.ts           # Registry: listRulesets/getRuleset/getRules/isRulesetName
  services/musicService.ts    # Gonzales-Shuffle
  services/soundService.ts    # Web-Audio: soundRoll/soundLanding/soundVictory
  services/getDescription.ts  # {PlayerName} + {switch}-Template-Engine
  styles/style.scss           # Global-Styles (App-Wrapper, Card, Utilities)
  styles/tokens.scss          # Design-Tokens (Farben, Radien, Gaps, Fonts, Schatten, Z, BP)
  assets/                     # Logo, flags, player.png, musics
public/
  dice-box/                   # @3d-dice/dice-box runtime assets (ammo.wasm, themes)
Dockerfile  docker-compose.yml  nginx.conf  .dockerignore
```

## Do / Don't (Kern-Regeln)

- **Do:** Regelinhalte immer in `rulesets/<id>/<id>.<locale>.json` pflegen,
  nie in Vue/TS hardcoden.
- **Do:** neue Regelsets in **beide** Locales **und** in `rulesets/index.ts`
  registrieren (Typ + RULESETS.de + RULESETS.en).
- **Do:** `npm run build` + `npm run lint` vor jedem Deploy — beide Guards.
- **Do:** Board-Geometrie nur in `board/boardGeometry.ts` ändern; alle
  Konsumenten (BoardGrid, Player, Overlay) ziehen von dort.
- **Don't:** `movePlayerSpiral`'s `<=6`-Schwellwert „logisch" umkehren —
  das ist gewolltes Verhalten (Kettenbewegungen fliegen, kleine Schritte
  animieren).
- **Don't:** `network_mode: bridge`-Port 8084:80 einführen — Pi-hole/HUB/Küche
  nutzen host-networking, das bleibt konsistent.
- **Don't:** `public/dice-box/` aus `nginx.conf` immutable-Cache rausnehmen
  (jede Reload neu 1.3 MB).
- **Don't:** i18n.ts-Datei mit Regel-Daten befüllen — die Registry
  (`rulesets/index.ts`) ist die einzige Quelle für Regelsätze/Random-Regeln.
- **Don't:** `App.vue`-Template umbauen — die Shell lebt in
  `layouts/AppShell.vue`; `App.vue` hält nur Mount + F5-Guard.
