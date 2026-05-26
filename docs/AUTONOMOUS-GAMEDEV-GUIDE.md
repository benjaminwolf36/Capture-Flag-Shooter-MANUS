# The Autonomous Game Dev Playbook

How to have Claude design, build, iterate, and ship a real game on your behalf, hands-off, for free (or as close to free as the universe permits).

This is the full playbook. The TL;DR is at the bottom if you want to skip ahead.

---

## The Pillars

Five things make autonomous game dev work:

1. **Bypass-mode local Claude Code** — Claude can do anything in your project folder without asking. Required for hands-off iteration.
2. **A clear north-star design doc** — Claude needs a vision to design toward. You write this once, in plain English. Claude makes all sub-decisions from it.
3. **The `/loop` slash command** — runs Claude on a recurring interval. Claude self-paces between iterations.
4. **Free AAA tooling** — Unreal Engine 5, Lyra Starter, Quixel Megascans, MetaHumans, Epic Online Services. All free, all production-quality.
5. **AI asset generators for the gaps** — Meshy (3D models), Suno (music), ElevenLabs (voice), Stable Diffusion (textures). Claude calls these and integrates results.

Get all five running and Claude is your full-time game studio.

---

## Part 1 — The Tools (all free)

### Engine + Multiplayer Backend
| Tool | What it does | Cost |
|---|---|---|
| **Unreal Engine 5** | The engine | Free until $1M revenue, then 5% |
| **Lyra Starter Game** | AAA multiplayer hero-shooter template | Free |
| **Epic Online Services** | Multiplayer matchmaking, lobbies, voice, friends | Free up to massive scale |
| **GitHub** | Source control + remote storage | Free |
| **GitHub Actions** | Automated builds | Free for public repos, 2000 min/month private |

### Visual Assets
| Tool | What it does | Cost |
|---|---|---|
| **Quixel Megascans** | Photorealistic textures, plants, props, terrain | Free with Epic account |
| **MetaHuman Creator** | Photorealistic human characters | Free |
| **UE Marketplace freebies** | Each month Epic gives away ~5 paid asset packs | Free if you "claim" them in time |
| **Meshy.ai** | Text-to-3D model generation | Free tier ~200 generations/month |
| **Tripo3D** | Text-to-3D, often better quality than Meshy | Free tier |
| **Stable Diffusion / SDXL** | Custom 2D textures, concept art, UI | Free (run locally or use free tiers) |

### Audio
| Tool | What it does | Cost |
|---|---|---|
| **Suno AI** | Generate music tracks from a text prompt | Free tier ~10 songs/day |
| **ElevenLabs** | AI voice acting for hero quips | Free tier (limited chars/month) |
| **freesound.org** | CC0 sound effects | Free |
| **Epic Sound Library** | Built into UE5, royalty-free | Free |

### Hosting (for non-Epic backends)
| Tool | What it does | Cost |
|---|---|---|
| **Render.com / Fly.io / Railway** | Host any backend service | Free tiers exist |
| **Vercel** | Static sites, web pages | Free |
| **Cloudflare Pages + R2** | Game asset CDN, web frontend | Free up to generous limits |

---

## Part 2 — Bypass Mode (the unlock)

Normal Claude Code asks permission every time it runs a command. That kills hands-off iteration. Bypass mode skips all permission prompts.

### How
```
claude --dangerously-skip-permissions
```

### Safety
- Only run in a project folder you're OK with being modified
- Use a dedicated user account / VM if paranoid
- Your project is committed to git — even if Claude does something dumb, `git reset` undoes it
- Claude won't touch files outside its working directory without being told to

### Make it the default for this project
Create `.claude/settings.json` in your project root:
```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```
Then just running `claude` in that folder uses bypass mode automatically.

---

## Part 3 — The North-Star Doc (your one job)

This is the **only** thing Claude needs from you to design the game. Write it once. Update when your taste changes. Save as `docs/PARALLAX-DESIGN.md` in your project.

Template:
```
# Game Vision

## One-sentence pitch
[e.g., "Cyberpunk 3v3 hero capture-the-flag with vertical maps and AAA visuals"]

## Inspirations
- [Movie / game / aesthetic 1]
- [Inspiration 2]
- [Inspiration 3]

## Feel
[3-5 adjectives — "fast, neon, fluid, weighty, satisfying"]

## Core loop (what the player does)
[1-2 paragraphs of the moment-to-moment gameplay]

## Heroes
- HERO NAME — role — abilities — personality — visual style
- (repeat for each hero)

## Maps
- MAP NAME — theme — gameplay focus
- (repeat)

## What I LOVE
[Things you definitely want]

## What I HATE
[Things you definitely don't want]

## Decisions I want to make personally
[e.g., "art direction final call", "hero names"]

## Decisions Claude can make freely
[e.g., "balance numbers", "code architecture", "menu layouts", "particle FX color"]

## Concept art
[Drop screenshots into docs/concept-art/, Claude reads them as references]
```

When Claude has this, it makes all small calls itself. Stronger pitch = less you need to weigh in.

---

## Part 4 — The Loop

`/loop` is a Claude Code slash command that runs Claude on a recurring schedule. Available as part of Claude Code.

### Usage
```
/loop 15m "Check todo.md, pick the next task, do it, commit, push, mark it done"
```
That tells Claude to re-fire every 15 minutes with that prompt.

### Better usage
Make a `loop-prompt.md` in your project with detailed instructions, then:
```
/loop 30m
```
Claude self-paces and picks tasks autonomously.

### What Claude does in each iteration
1. Pulls latest from GitHub
2. Reads `todo.md` (or design doc)
3. Picks the next thing to work on
4. Implements it (writes C++, edits Blueprints via Python, generates assets, etc.)
5. Tests it locally (compiles UE5 project, runs PIE)
6. Commits with a clear message
7. Pushes to GitHub
8. Updates `todo.md`
9. Waits for next loop tick

### What Claude can decide alone (with your blessing in the design doc)
- Code structure, architecture
- Balance numbers (hero damage, cooldowns)
- Menu and HUD layouts
- Effect colors, particle counts
- Lore details, hero quips, hero names
- Music style, SFX picks
- Bug fixes
- Optimization

### What Claude should ask before doing
- Changing the core game loop
- Cutting or adding a hero
- Changing art direction
- Anything costing money

In your design doc, list these explicitly. Claude respects the list.

---

## Part 5 — MCP Servers (giving Claude more powers)

MCP (Model Context Protocol) servers expose external tools to Claude. Useful for game dev:

### Unreal MCP Server
- Exposes UE5 editor control: spawn actors, edit Blueprints, import assets, take screenshots, run PIE
- Search GitHub for "unreal-mcp" — community projects exist; Epic may release official one
- Install in `.claude/settings.json`:
```json
{
  "mcpServers": {
    "unreal": { "command": "node", "args": ["path/to/unreal-mcp-server.js"] }
  }
}
```

### Meshy / Tripo / Suno MCP servers
- Some have HTTP APIs; Claude can call them via `Bash(curl ...)` even without dedicated MCP
- Or wrap them in a tiny script you put in `scripts/generate-3d.js` etc.

### GitHub MCP
- Already built into Claude Code's web version, comes via the `gh` CLI locally
- Lets Claude open PRs, respond to issues, manage releases

### Filesystem MCP, Browser MCP
- For Claude to take screenshots of the running game and self-critique visuals
- Browser MCP lets Claude open the UE5 marketplace, find free assets, download them

---

## Part 6 — The Iteration Cycle

Here's what a 24-hour autonomous cycle looks like:

```
Hour 0  — You drop in: "Build CTF gamemode on top of Lyra's Control"
Hour 1  — Claude implements GameMode + GameState, commits
Hour 2  — Claude wires up flag pickup + drop, commits
Hour 3  — Claude tests in PIE, finds a bug where flag spawns inside geometry,
          fixes, commits
Hour 4  — /loop pauses 30 min; Claude resumes, starts on win/lose UI
Hour 5  — Claude generates a 30-second victory fanfare via Suno, integrates it
...
Hour 12 — Claude has full CTF loop working
Hour 13 — Claude starts polish: particle FX for capture, screen shake, score popups
Hour 20 — Claude reads docs/PARALLAX-DESIGN.md, sees hero abilities are next
Hour 24 — You wake up; pull from GitHub; press Play; CTF works end-to-end
```

You give feedback like: "Volt's dash feels weak — make the FOV pulse and add a screen-tear effect." Claude does it during the next loop iteration. Back to sleep.

---

## Part 7 — Cost (real talk)

- **Claude Code itself** — your Claude Pro/Max plan. Heavy loop usage will hit the limit eventually. Max plan ($200/mo) gets the most. If you stay below the limit and run nightly, this can fit comfortably.
- **Everything else** — $0 if you stick to free tiers

When it might cost money:
- Meshy/Tripo paid tier if you want unlimited 3D generations ($10–30/mo)
- Paid voice synth if ElevenLabs free tier isn't enough
- Cloud hosting if your multiplayer game scales past EOS free limits (very generous, unlikely to hit)
- Steam publishing fee ($100, one-time, only if you want to release)

Realistically, you can build and ship a polished game for **<$200 total** outside your Claude subscription.

---

## Part 8 — Limits (what Claude genuinely cannot do)

- **Original concept art at the level of your TACTIC / AEGIS / SPECTER posters** — I can describe them perfectly to a 2D AI image gen tool, but I cannot generate them myself. You drop those PNGs in the repo; I use them.
- **Custom AAA hero animations** — MetaHuman + free anim packs get you 80%. Bespoke mocap-quality animation needs Mixamo (free) or a paid asset, neither of which I can produce from scratch.
- **Playtest feel** — I can't feel if Volt's dash is fun. You play it; I iterate.
- **Marketing, social media, community management** — that's a human role.
- **Sign legal agreements** (Steam, Epic Game Store, console publishing) — also you.

Everything else is in scope.

---

## TL;DR — Minimum Viable Autonomy

1. Install Claude Code locally
2. Set `.claude/settings.json` to `defaultMode: bypassPermissions`
3. Write `docs/PARALLAX-DESIGN.md` (your vision)
4. Write `todo.md` (initial task list — Claude will maintain it from here)
5. Run `claude` in your UE5 project folder
6. Tell Claude: "You're the lead. Loop on 30 min intervals. Pick from todo, build, commit, push, repeat. Match docs/PARALLAX-DESIGN.md. Ping me only for the decisions I marked as mine."
7. Sleep. Wake. Pull. Play. Give feedback. Repeat.

That's it. That's the whole pattern.

---

## Recommended Starting Tasks (paste into your initial todo.md)

```
- [ ] Clone Lyra Starter Game into the project folder
- [ ] Rebrand the project name to PARALLAX_FLAGFALL
- [ ] Set up Epic Online Services credentials in DefaultEngine.ini
- [ ] Create a new GameMode subclass: PFGameMode_CTF
- [ ] Create a new GameState subclass: PFGameState_CTF (blue score, orange score, match timer)
- [ ] Create Flag actor: pickup on overlap, drop on carrier death, 10s auto-return
- [ ] Create capture zones: blue base + orange base, trigger score when flag carrier enters opposing base
- [ ] Hook win condition: first to 3 captures
- [ ] Copy one of Lyra's existing maps and rename to L_SkyCityCitadel
- [ ] Add 2 capture zone actors at opposite ends of the map
- [ ] Add Flag actor at the map center
- [ ] Test in PIE — solo, then with a friend via EOS invite
- [ ] Customize HUD: top-center score+timer, bottom-center health+abilities,
      bottom-right minimap, top-right kill feed
- [ ] Set up 4 PARALLAX heroes by duplicating Lyra's hero blueprints
- [ ] Wire each hero's Q ability per docs/PARALLAX-DESIGN.md
- [ ] Wire each hero's F ultimate per docs/PARALLAX-DESIGN.md
- [ ] Generate placeholder music for menu (via Suno) and integrate
- [ ] Generate hit/death/capture SFX (via freesound.org) and integrate
- [ ] Set up GitHub Actions to build a Windows package on push to main
- [ ] Upload first playable build to itch.io as a free download
- [ ] Open a Discord invite link, add to main menu, so friends can join
```

Pace yourself. This list is 2–6 weeks of autonomous work, depending on Claude's run frequency and your iteration loops.
