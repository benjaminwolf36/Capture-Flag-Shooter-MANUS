# PARALLAX: FLAGFALL — Build Plan

## Concept
PARALLAX: FLAGFALL is a hero-based, team-oriented capture-the-flag shooter set in the mid-22nd century. Players control Sync-Runners—rare individuals who can neural-link to the Parallax Sync technology, allowing them to perceive both an immersive ground-level perspective and a strategic overhead tactical view simultaneously. Teams of three compete to capture Data Flags across reclaimed arenas that double as historical sites.

This prototype adapts the full 3D hero-shooter vision into a playable 2D top-down canvas proof-of-concept, preserving the core fantasy: hero selection, class-based abilities, flag capture, team combat, and the signature Parallax tactical view.

**Tone:** Futuristic, competitive, lore-rich. Cool palette (blues, cyans, greens) with warm orange/crimson accents for objectives and enemy markers.

---

## Core Loop
1. **Title & Lore** → Brief animated title with Parallax lore text.
2. **Hero Select** → Choose from 4 Sync-Runners (Vanguard, Specter, Aegis, Volt). Each has a weapon + tactical ability + ultimate.
3. **Deployment** → Spawn into a 3v3 match on the Sky-City Citadel arena.
4. **Combat & Capture** → WASD move, mouse aim, click to shoot. Use Q (tactical), F (ultimate). Press T to enter Parallax overhead view.
5. **Victory/Defeat** → First team to 3 captures wins, or most captures after 5 minutes.
6. **Result Screen** → Stats, then return to hero select or title.

---

## Player Input
- **WASD** — movement (8-directional, continuous).
- **Mouse** — aim (character rotates toward cursor).
- **Left Click** — primary weapon fire.
- **Q** — Tactical ability (cooldown ~6–10 s).
- **F** — Ultimate ability (long cooldown ~30 s).
- **T** — Toggle Parallax overhead tactical view (hold/release or toggle).
- **Esc** — Pause menu overlay.

Default to **tap-to-toggle** for T, **cooldown-based** for Q/F. All cooldowns displayed on HUD.

---

## Game Systems

### Heroes (4 playable, 1 player + 2 AI per team)
Each hero has:
- HP (150–300), speed (200–350 px/s), weapon range, fire rate.
- **Passive** — constant effect.
- **Tactical (Q)** — utility / damage / heal.
- **Ultimate (F)** — game-changing burst.
- *( Mobility/E ability cut for prototype scope. )*

| Hero | Role | HP | Speed | Weapon | Notes |
|------|------|----|-------|--------|-------|
| **Vanguard** | Tank | 300 | 220 | Heavy pulse rifle (slow, high dmg) | Q: deploy shield; F: overcharge |
| **Specter** | Scout | 150 | 320 | Silenced SMG (fast, low dmg) | Q: phase shift; F: void veil |
| **Aegis** | Support | 200 | 250 | Healing beam / light carbine | Q: heal drone; F: resurrection |
| **Volt** | Damage | 175 | 290 | Twin energy pistols (medium) | Q: arc bolt; F: thunderstruck dash |

**Enemy AI** — simple state-machine behavior: seek flag → attack if seen → retreat if low HP → capture if carrying flag. AI teammates mirror this.

### Capture the Flag
- 1 neutral flag spawns at central map objective.
- Picking up flag reduces movement speed by 20%.
- Return to your team's capture zone (blue or orange) to score.
- On score: flag resets to center after 3 s delay.
- **Win:** first to 3 captures or most captures after 300 s (5 min).

### Projectiles & Combat
- All weapons fire projectile bullets from `projectile-system` template.
- Damage per bullet: 8–25 depending on hero.
- Headshot bonus not tracked (2D top-down); consistent damage.
- Ricochet off map walls; projectiles expire after lifetime.
- Particle sparks on hit, bloodless neon burst for kills (Synth-blue for Syndicate, amber for Resistance).

### Parallax Tactical View (Overhead)
- Renders same scene zoomed out to show entire arena (display scale ~0.4×).
- Player hero shown in bright highlight.
- Teammates: bright team color dots. Enemies: faint red if recently spotted (within LOS in last 3 s).
- Flag and capture zones always visible.
- Camera smoothly interpolates between ground view and overhead.
- Player can still issue movement clicks but cannot shoot.

### Map — Sky-City Citadel (Prototype)
- Arena size: 2400×1600 logical pixels.
- Three vertical tiers connected by jump pads / ramps.
- Central plaza (flag spawn).
- Two team bases left/right with capture zones.
- Destructible-looking glass barriers (cosmetic) and permanent cover walls.
- Visual theme: dark blue/cyan metallic surface, glowing circuit lines, neon edge lighting.

### Scoring & Match Manager
- Per-match score (no persistence in prototype).
- Announcements: "Flag Taken!", "Flag Captured!", "Kill!", "Parallax Sync Active."
- Kill feed top-right, team scores top-center.

---

## Progression
This is a **per-match** prototype. No meta progression.
- Replayability comes from hero choice (4 classes) and AI variance.
- Future scope (out of plan): unlockable skins, battle-pass, ranked.

---

## State & Flow
```
Title/Lore → HeroSelect → MatchIntro → Playing → TacticalOverlay(Pause) → (Victory | Defeat) → Result → HeroSelect
```
- **Title:** Animated logo + "Press Enter/Click to Continue" after lore scroll.
- **HeroSelect:** 4 hero cards with stats, click to pick, then Deploy.
- **MatchIntro:** 3-second "SYNC ESTABLISHED…" overlay.
- **Playing:** Main combat loop, pause overlay via Esc.
- **TacticalOverlay:** Holding T overlays the overhead view (parallax sync) without pausing time.
- **Victory/Defeat:** Full-screen result with stats (kills, captures, time).

---

## Presentation
- **Visual Style:** 2D top-down stylized futuristic. No pixel art—clean vector shapes with glow.
- **Camera:** Smooth follow on player with deadzone (120 px). Tactical view zooms out to arena bounds.
- **HUD:**
  - Bottom center: Hero portrait + circular health bar + 2 ability icons (Q and F) with radial cooldown sweeps.
  - Top center: Team scores (blue vs orange) + match timer.
  - Top right: Kill feed (last 5 events).
  - Bottom right: Minimap (240×160) showing full arena.
- **Juice:** Screen shake (3 px, 100 ms) on hit / kill. Flash vignette on low HP. Capture triggers 500 ms slow-mo + particle explosion + "VICTORY" text.
- **No audio in prototype** (placeholder comments for AudioManager integration).

---

## Narrative
- Setting: Great Discontinuity, 22nd century. Flagfall Tournaments settle territorial disputes.
- Three factions: Core Syndicate (blue/silver), Apex Resistance (green/purple), Void Nomads (charcoal/cyan).
- Title screen displays short scrolling lore paragraph establishing the Parallax Link.
- Hero select shows hero name, faction badge, and a 2-line lore quote.

---

## Build Needs
- **Canvas:** 1920×1080, scaled to fit window.
- **Sprites:** Minimal—characters rendered as colored circles/shapes with glow. Flags as glowing diamonds. Map drawn procedurally with rectangles.
- **Particles:** For hits, kills, ability activations, captures (re-use `object-pool` ParticleSystem).
- **No external assets needed for MVP**—everything draw-call based. If user adds sprites later, manifest already wired.
- **Performance cap:** 30 active projectiles, 60 particles, 6 AI agents.

---

## Scope
**In this plan:**
- 4 heroes with complete stat kits and 1 passive + 2 active abilities each (Tactical + Ultimate; E mobility merged into kit where appropriate).
- 3v3 AI match (1 player + 2 allies vs 3 enemies).
- 1 arena: Sky-City Citadel (3-tier, central flag).
- Full CTF loop with score, timer, win/loss.
- Parallax overhead tactical view.
- Hero selection UI with lore.
- HUD, kill feed, minimap, ability cooldown display.

**Explicitly out:**
- Multiplayer networking (AI only).
- 3D / isometric perspective (2D top-down).
- Procedural map generation or multiple maps.
- Persistent progression / cosmetics / battle pass.
- Full 4 abilities per hero (only 2 actives + passive to keep scope manageable).
- Prop Hunt party mode (future scope).
- Audio/SFX (skeleton AudioManager calls only).
- Physics-based platforming / gravity (flat 2D + speed pads).

---

## Architecture Sketch

```
main.ts                              # Boot MakkoEngine, manifests, start Game

game/game.ts                         # Game class with SceneManager
scenes/
  title-scene.ts                     # Lore + animated title
  hero-select-scene.ts               # Hero cards using ui-layer (Button, Card, VStack)
  match-scene.ts                     # Main CTF gameplay; owns MatchManager + Camera + InputHandler
  tactical-overlay.ts                # Overlay scene pushed while T held (renders minimap-style world)
  pause-scene.ts                     # Esc overlay (resume / quit to title)
  result-scene.ts                    # Victory/defeat stats

entities/
  hero.ts                            # Base hero: move, aim, health, shoot, cooldowns, death/respawn
  heroes/
    vanguard.ts                      # Tank overrides (shield deploy, overcharge)
    specter.ts                       # Scout overrides (phase shift, void veil)
    aegis.ts                         # Support overrides (heal drone, resurrection)
    volt.ts                          # DPS overrides (arc bolt, thunderstruck dash)
  ai-controller.ts                   # StateMachine for AI: idle→seekFlag→fight→retreat→cap
  flag.ts                            # Flag entity (neutral / carried / dropped)
  map-arena.ts                       # Rectangle wall data, spawn zones, jump pad positions

combat/
  projectile-pool.ts                 # From template: bullet spawning, update, hit tests
  weapon.ts                          # Fire rate, bullet config per hero
  ability.ts                         # Cooldown logic, trigger, duration
  particle-fx.ts                     # Thin wrapper over ParticleSystem for hit/kill/ability bursts

systems/
  match-manager.ts                   # Score, timer, announcements, game-over trigger
  camera.ts                          # Deadzone follow + Parallax zoom lerp
  input-handler.ts                   # Consolidated mouse aim, key bindings, UI pass-through

ui/
  hud.ts                             # Assembles: health bar, ability icons, minimap, scores, kill feed
  ability-icon.ts                    # Radial cooldown swipe + key hint
  minimap.ts                         # Draws scaled-down arena + dots
  kill-feed.ts                       # Fading text stack
  capture-banner.ts                  # Big centered text with timer
```

**Scenes connect via Game.switchScene() / pushScene() / popScene().**
- MatchScene owns the world update loop (heroes, projectiles, flags, manager).
- TacticalOverlay is pushed when T is held; MatchScene continues updating underneath (time does not pause), but TacticalOverlay renders full-screen scaled world instead.
- PauseScene is pushed on Esc; pauses MatchScene update via a `timeScale` guard in MatchScene.

---

## Template Plan
| Template | Provides | Customization |
|----------|----------|---------------|
| `new-project` | GameLoop, SceneManager, StartScene, Menu | Replace StartScene with custom TitleScene; extend GameScene into MatchScene |
| `projectile-system` | Projectile, ProjectilePool, configs | Add HeroBullet configs per class; integrate into Hero.shoot() |
| `object-pool` | Pool, ParticleSystem | Use for sparks/death particles; hook into hit/kill events |
| `state-machine` | StateMachine, State | AI behavior states (AiController); game flow states inside MatchScene |
| `ui-layer` | UILayer, Button, Card, StatusBar, HStack/VStack | Hero cards, HUD widgets, ability icons, kill feed |

---

## Task List

### Task 1 — Bootstrap project & wire scenes
- **What:** Inject `new-project` scaffold and register all 7 scenes in `Game.init()`.
- **Files:** `src/main.ts`, `src/game/game.ts`, `src/scenes/title-scene.ts`, `src/scenes/hero-select-scene.ts`, `src/scenes/match-scene.ts`, `src/scenes/tactical-overlay.ts`, `src/scenes/pause-scene.ts`, `src/scenes/result-scene.ts`
- **Verify:** All scenes compile; `Game.switchScene('title')` starts title scene; pressing Enter goes to hero select.

### Task 2 — Inject template stack
- **What:** Inject `projectile-system`, `object-pool`, `state-machine`, `ui-layer`.
- **Files:** Templates auto-create under `src/projectile/*`, `src/pool/*`, `src/state/*`, `src/ui/*`
- **Verify:** Build passes; can instantiate ProjectilePool and UILayer in a test scene. (addresses risk: template desync)

### Task 3 — Arena map & camera
- **What:** Implement `MapArena` with hardcoded 2400×1600 walls, 3-tier layout, team bases, central flag zone, 6 hero spawn points. Implement `Camera` with deadzone follow and Parallax zoom lerp (0.4× scale, 500 ms transition).
- **Files:** `src/entities/map-arena.ts`, `src/systems/camera.ts`
- **Verify:** Render map walls in MatchScene; camera follows mock center point; T key zooms out to full arena. (addresses risk: world-space vs screen-space confusion)

### Task 4 — Base Hero class + InputHandler
- **What:** `Hero` base class: position, velocity, hp, maxHp, speed, angle (aim), weapon cooldowns, respawn timer. Movement resolves against `MapArena.walls` (AABB push-out). `InputHandler` reads WASD (movement vector), mouse position (angle via `atan2`), left click (fire), Q/F key states. Mouse position must be converted from screen to world using camera offset.
- **Files:** `src/entities/hero.ts`, `src/systems/input-handler.ts`
- **Verify:** Hero moves with WASD, rotates toward cursor, shoots bullets on click. Bullets render. Camera follows hero. (addresses risk: screen-to-world coordinate mismatch)

### Task 5 — 4 Hero subclasses + weapon configs
- **What:** `Vanguard`, `Specter`, `Aegis`, `Volt` extending Hero. Each overrides `updateAbility()` and sets bullet config (speed, damage, color, fire rate). Implement passive constants (e.g., Vanguard: -10% damage taken, +20 hp).
- **Files:** `src/entities/heroes/vanguard.ts`, `src/entities/heroes/specter.ts`, `src/entities/heroes/aegis.ts`, `src/entities/heroes/volt.ts`, `src/combat/weapon.ts`
- **Verify:** Spawn each hero; shoot bullets; bullets have correct colors and speeds; damage values match table.

### Task 6 — Ability system (Q Tactical + F Ultimate)
- **What:** `Ability` class with `cooldown`, `duration`, `isReady()`, `use()`, `update(dt)`. Hook into each hero:
  - Vanguard Q = deploy shield (stationary barrier rectangle, 5 s); F = Overcharge (2× fire rate, 6 s).
  - Specter Q = phase shift (2.5 s invis, no shoot); F = Void Veil (slows enemies in radius 300, 4 s).
  - Aegis Q = heal beam drone (auto-target nearest damaged ally in 300 px, burst heal 50 HP); F = Resurrection (revives all dead allies within radius 400 with 50% HP, skipping respawn timer).
  - Volt Q = arc bolt (chain to 2 nearest enemies in 200 px, 20 dmg each); F = thunderstruck dash (500 px burst, 40 dmg to touched enemies).
- **Files:** `src/combat/ability.ts`, updates to hero subclasses
- **Verify:** Press Q/F triggers effects; cooldown timers prevent immediate re-use; UI icons show disabled state.

### Task 7 — Flag entity + CTF scoring loop
- **What:** `Flag` entity with states: `neutral` at center, `carried` (follows carrier, speed penalty), `dropped` (dropped on death, 10 s return timer). Heroes have death state: on 0 HP, drop flag, set `dead=true`, start 5 s respawn timer, respawn at team base. `MatchManager` tracks scores, 300 s timer, announces captures. Bases are static capture zones.
- **Files:** `src/entities/flag.ts`, `src/systems/match-manager.ts`
- **Verify:** Walk over flag to pick up; walk into base to score; score increments; flag resets center; win at 3.

### Task 8 — AI Controller with StateMachine
- **What:** `AiController` wraps a hero and drives it via `StateMachine<AiController>`. Implement LOS helper `lineOfSight(from, to, wallRects)` using AABB segment intersection. States:
  - `seekFlag` → move to flag position / dropped flag.
  - `fight` → if enemy visible in LOS (ray vs walls) and in range, shoot; else move toward.
  - `retreat` → if HP < 30%, move toward nearest ally / base.
  - `capture` → if carrying flag, move to enemy base (avoid enemies if possible).
- 2 AI teammates + 3 AI enemies spawn at match start (random hero from 4 classes).
- **Files:** `src/entities/ai-controller.ts`
- **Verify:** AI heroes move, pick up flags, shoot each other, score captures. No AI gets stuck on walls (AABB slide). (addresses risk: AI wall-stuck)

### Task 9 — Particle FX integration
- **What:** Use `ParticleSystem` from `object-pool` for: bullet hit sparks, death burst, ability activation glow, flag capture fireworks. Create thin `CombatFX` manager that triggers bursts at x,y with color presets.
- **Files:** `src/combat/particle-fx.ts`
- **Verify:** Particles spawn on hit and kill, fade and recycle. Active particle count stays under limit.

### Task 10 — Hero Selection Scene UI
- **What:** HeroSelectScene using ui-layer (`Card`, `Button`, `VStack`, `HStack`). Display 4 hero cards with:
  - Name + faction badge
  - 2-line lore quote
  - HP / Speed bars
  - Click to select (highlight border); Deploy button starts match.
- Pass selected hero ID to MatchScene via Game state or scene init param.
- **Files:** `src/scenes/hero-select-scene.ts`
- **Verify:** Build passes; cards render; click selects hero; Deploy switches to MatchScene with correct hero.

### Task 11 — HUD, Kill Feed, Minimap
- **What:** In-match HUD assembled from ui-layer widgets:
  - Bottom center: `StatusBar` (health circle) + `AbilityIcon` × 2 (radial cooldown sweep using arc draw) + hero name.
  - Top center: Team score badges + match timer `Text`.
  - Top right: KillFeed (stack of 5 fading `Text` lines: "[Specter] eliminated [Volt]").
  - Bottom right: Minimap (240×160 Panel) drawing scaled arena walls + 6 hero dots (blue/orange/green for player).
- **Files:** `src/ui/hud.ts`, `src/ui/kill-feed.ts`, `src/ui/minimap.ts`, `src/ui/ability-icon.ts`, updates to `match-scene.ts`
- **Verify:** HUD renders without camera offset; health updates on damage; cooldowns sweep; kill feed pushes events; minimap shows all entities.

### Task 12 — Tactical Overlay (Parallax View)
- **What:** `TacticalOverlay` scene pushed by T key. Renders `match-scene`'s world at 0.4× scale centered on arena. Draws hero dots, flag diamond, base zones. Grayed out if enemy not recently spotted. Does NOT pause match update beneath. Pop overlay on T release.
- **Files:** `src/scenes/tactical-overlay.ts`
- **Verify:** Overlay shows full arena; dots move in real time; releasing T returns to normal camera smoothly.

### Task 13 — Pause menu & Game Over flow
- **What:** `PauseScene` pushed by Esc: Resume / Quit to Title. `ResultScene` on match end shows winner + stats (kills, captures, time). Switch back to HeroSelect or Title.
- **Files:** `src/scenes/pause-scene.ts`, `src/scenes/result-scene.ts`
- **Verify:** Esc pauses match time; Resume returns; Quit goes to Title. Result scene shows after 3 captures.

### Task 14 — Juice & polish pass
- **What:** Screen shake on hit (3 px, 100 ms) triggered in MatchScene. Red vignette overlay when HP < 30%. Capture triggers 500 ms slow-mo (`timeScale = 0.2`) + particle burst + "VICTORY NEXUS" banner. Fix any coordinate / clipping bugs.
- **Files:** `src/systems/match-manager.ts`, `src/scenes/match-scene.ts`
- **Verify:** Visual feedback feels satisfying; no persistent camera offset bugs. (addresses risk: camera state leak)

---

## Verification Milestones
1. **After Task 3** — Scaffold compiles; map renders; camera + zoom work.
2. **After Task 6** — Single hero playable; shoots, abilities work; projectiles collide with walls.
3. **After Task 8** — Full 3v3 match runs autonomously; AI scores captures; no crashes.
4. **After Task 12** — HUD complete; tactical overlay functional; core loop is playable.
5. **After Task 14** — Menu flow title → hero select → match → result → title works end-to-end.

---

## Engine Primitives Used
- `MakkoEngine.display.drawRect` / `drawCircle` / `drawText` / `drawArc` — arena, heroes, UI.
- `MakkoEngine.display.setGlobalOffset` + `pushClipRect` — UI rendering after world.
- `MakkoEngine.input.isKeyDown` / `isKeyPressed` / `mouseX` / `mouseY` — WASD, abilities, mouse aim.
- `MakkoEngine.staticAsset(...).image` — only if user later adds sprites; currently unused.
- `Pool<T>` / `ParticleSystem` — bullets and FX.
- `StateMachine<T>` — AI and game-state logic.
- **No `character.draw()` or sprite animations in MVP** — heroes drawn as geometric shapes with glow.

---

## Known Risks & Gotchas
1. **Screen-to-world coordinate mismatch** — Mouse aiming in a world-space game requires subtracting camera offset and scaling. Fix: `worldX = (screenX - displayOffsetX) / zoom + camera.x`. Always re-verify after camera zoom changes. *(addressed in Task 4 verify)*
2. **Tactical overlay/scene camera state leak** — Popping an overlay that changed camera offset must fully reset camera before next render. Fix: `Camera.reset()` must zero out offset and zoom before UILayer renders. *(addressed in Task 14 verify)*
3. **Projectile ownerFilter bug** — `ProjectilePool.checkHits` only checks one owner direction per call. Call twice (once for player bullets vs enemies, once for enemy bullets vs players). *(addressed in Task 4)*
4. **AI wall-stuck** — AI uses simple AABB wall slide. If velocity is low, small step may not clear wall. Fix: minimum separation impulse (push out by overlap + 1 px). *(addressed in Task 8 verify)*
5. **Ability cooldown desync** — Cooldowns must be updated in `update(dt)` even when holding T (time does not pause). Do not gate hero update behind pause state. *(addressed in Task 6)*
6. **UI coordinate drift** — UILayer renders with `setGlobalOffset(0,0)`. Scene render must happen before UI render, and no scene should leave the camera offset dirty. *(addressed in Task 11)*
