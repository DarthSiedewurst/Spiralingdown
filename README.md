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
| UI-Shell  | Bootstrap 5 + Bootstrap-Icons      | Modal, Offcanvas, Dropdown; kein eigener CSS-Frame                     |
| Musik     | `<audio>` + Gonzales-MP3s          | `BarbaraAnn.mp3`, `iwantgonzales.mp3`, `gonzalesbrueder.mp3` (Shuffle) |
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

Die App-Shell `src/App.vue` hält die ständigen Teile: `#dice-box` (Canvas),
⚙️-Offcanvas (`Sidebar.vue`), `<router-view>`. **Nicht umbauen**, sonst brechen
Modal + Offcanvas + Dice-Overlay gleichzeitig.

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
- `availableRulesets: string[]` — **wird nur einmal beim Store-Init** aus
  `i18n.global.messages[locale].rulesets` gelesen → siehe Gotcha §"Regelset-Registry"
- `activeRuleset: string` (default = `availableRulesets[0]` = `"spiralingDown"`)
- `currentRuleset: { name, fieldId0..fieldId71 }` — reaktiv auf `activeRuleset`
- `settings: { music, sound, vibration }` + `setSettings(partial)`

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

**Feld-ID ≠ Zug-Reihenfolge.** Die Brett-Geometrie ist hartkodiert in
`src/views/Game.vue → matrix` (8×9, IDs 0–71 in Spiral-Reihenfolge). `fieldId`-Keys
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
   - `|move|  > 6` → **direkter Sprung** (`player.position = end`).
     Der Code-Kommentar dazu steht _verkehrt herum_ („große Distanzen schrittweise")
     — nicht „fixen", das ist das gewollte Verhalten (Kettenbewegungen fliegen).
4. **Kein End-Spiel.** Wenn jemand Feld 71 („SIEG") erreicht passiert nichts sonderbares —
   das Feld zeigt nur ein Modal. Kein Reset-Button, kein Winner-State. Wer neu
   startet, geht manuell zurück auf `/` (Router).

**Spielerwechsel ist strikt rotierend.** Kein Aussetzen, kein Zweitsprung.

## UI/Overlay — nix umschichten

- **`Player.vue`** rendert den Spieler-Titel als absolut positioniertes `img`
  (player.png) mit `filter` aus `store.colors` und `top/left` in % aus der
  Brett-Matrix. **Die Matrix ist hier hartkodiert** (doppelt mit `Game.vue`).
  Wenn eine der beiden geändert wird, **muss** die andere synchron folgen.
- **`Overlay.vue`** ist das feste 30 vw breites Seitengerüst (links/rechts, je
  nach Spalte), das den aktuellen Spieler + aktiv laufende Regel zeigt, `pointer-events: none`.
- **`Sidebar.vue`** = ⚙️-Offcanvas (Bootstrap): Sprache (de/en), Musik/Sound/Vibration.
  **Beachte:** `settings.sound` und `settings.vibration` sind **deklariert, aber
  nirgends umgesetzt** (nur `music` greift über `musicService`). Nicht als
  fertige Features verlinken.
- **`App.vue`** positioniert `#dice-box` + `:deep(.dice-box-canvas)` absolut
  über allem (`z-index: 2`, `pointer-events: none`). Canvas-Größe = 100 vw/vh.
  Brechen `z-index`/`pointer-events` weg = Modal/Clicks tot.

## i18n / Regelset-Registry

`src/i18n/i18n.ts` merge-t 8 JSONs:

- `de.json` / `en.json` — UI-Strings + `colors`
- `rules/rules.{de,en}.json` — Random-Regel-Pool
- `rulesets/<id>/<id>.{de,en}.json` — je ein Regelset pro Id

**Regelset-Registry (Pinned, Gotcha):** Der Store berechnet
`availableRulesets` **einmal beim Init** aus
`i18n.global.messages[de].rulesets` (Standard-locale). Das heißt:

1. **Neues Regelset hinzufügen = 4 Dateien + 2 Registry-Edits**:
   - `src/rulesets/<id>/<id>.de.json` und `.en.json` (Inhalt, `fieldId*`-IDs)
   - `src/i18n/i18n.ts`: Importe ergänzen + in `de.rulesets` und `en.rulesets` registrieren
   - `src/store/store.ts`: Falls das neue Regelset `availableRulesets[0]` werden
     soll, **`activeRuleset`-Default** anpassen. Sonst bleibt es `spiralingDown`.
2. **`availableRulesets` ist nicht reaktiv** — nach Sprachwechsel wird die
   Liste nicht neu berechnet. Ist das Regeln-Set in einer Sprache leer, fehlt
   es im Dropdown, obwohl die andere Sprache es hat. **Regelsets immer 1:1
   in beiden Locales** registrieren.
3. **Kein JSON-Schema-Validator** im Build — Tippfehler in `fieldIdN`-IDs
   oder fehlende Felder fallen erst zur Laufzeit auf (leeres Modal, kein Fehler-Log).

## Local Dev

```bash
npm ci
npm run dev        # Vite, Port 5173 (Standard)
npm run build      # vue-tsc -b && vite build  → dist/
npm run preview    # lokale Build-Vorschau (port 4173)
```

**Es gibt keine Tests und keinen Linter im Repo.** `vue-tsc` im Build
ist der einzige Guard. Bei Änderung an `Game.vue`/`Overlay.vue`/`Player.vue`
immer `npm run build` lokal fahren, bevor push/deploy.

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
  App.vue                     # Shell: #dice-box + ⚙️ + Sidebar + <router-view>
  main.ts                     # createApp + pinia + i18n + router
  router/router.ts            # 2 Routen, createWebHistory (SPA-Fallback)
  store/store.ts              # Pinia-store: players/colors/rulesets/settings
  store/interfaces.ts         # PlayerModel
  views/Home.vue              # Spieler-Setup + Regelset-Picker + Start
  views/Game.vue              # Brett, Würfel, Modal, Spielerwechsel, Random-Regel
  components/Player.vue       # Spieler-Token auf dem Brett (matrix DUPLIKAT!)
  components/Overlay.vue      # Festes Seitenpanel: aktueller Spieler + Regel
  components/Sidebar.vue      # Offcanvas: Sprache + settings (nur music aktiv)
  i18n/{de,en}.json           # UI-Strings + colors
  i18n/i18n.ts                # createI18n + rulesets-Registry (Gotcha!)
  rules/rules.{de,en}.json    # Random-Regel-Pool (pro Sprache, nicht sync)
  rulesets/spiralingdown/spiralingdown.{de,en}.json
  rulesets/spongebob/spongebob.{de,en}.json
  services/musicService.ts    # Gonzales-Shuffle, kein Audio-API-Fallback
  services/getDescription.ts  # {PlayerName} + {switch}-Template-Engine
  styles/style.scss           # Global Styles (vor allem .background)
  assets/                     # Logo, flags, player.png, musics
public/
  dice-box/                   # @3d-dice/dice-box runtime assets (ammo.wasm, themes)
  assets/                     # (Duplikat der Dice-Box-Assets — Vite public/)
Dockerfile  docker-compose.yml  nginx.conf  .dockerignore
```

## Do / Don't (Kern-Regeln)

- **Do:** Regelinhalte immer in `rulesets/<id>/<id>.<locale>.json` pflegen,
  nie in Vue/TS hardcoden.
- **Do:** Neue Regelsets in **beide** Locales + `i18n.ts`-Registry (siehe Gotcha).
- **Do:** `npm run build` vor jedem Deploy (Type-Check ist der einzige Guard).
- **Don't:** `Player.vue`-Matrix oder `Game.vue`-Matrix ändern ohne die
  andere zu synchronisieren.
- **Don't:** `movePlayerSpiral`'s `<=6`-Schwellwert „logisch" umkehren —
  das ist gewolltes Verhalten (Kettenbewegungen fliegen, kleine Schritte
  animieren).
- **Don't:** `network_mode: bridge`-Port 8084:80 einführen — Pi-hole/HUB/Küche
  nutzen host-networking, das bleibt konsistent.
- **Don't:** `public/dice-box/` aus `nginx.conf` immutable-Cache rausnehmen
  (jede Reload neu 1.3 MB).
- **Don't:** `settings.sound`/`settings.vibration` als fertige Features
  dokumentieren/verkaufen — nur `music` ist aktiv.
- **Don't:** Neue Regelset mit `activeRuleset`-Default machen, wenn das
  vorherige `spiralingDown` noch in der UI steht (Store-Init-Default bleibt
  `spiralingDown`, bis Store neu init'd wird).
