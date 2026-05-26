# UE5 Migration Setup — From 2D Canvas to Real Game

This is the exact step-by-step to switch from the 2D web prototype to a real Unreal Engine 5 multiplayer game using Lyra as the foundation. After this, you hand control to Claude and walk away.

---

## Why Lyra

Lyra Starter Game is Epic's official AAA-quality multiplayer hero-shooter template. It is **free**, ships with UE5, and already includes:

- Networked multiplayer (replication, authoritative server, lag compensation)
- Lobby + matchmaking via Epic Online Services
- Hero/character system with abilities (the "Gameplay Ability System")
- Weapons, projectiles, hit detection, damage
- HUD framework, scoreboard, kill feed, match flow
- Common Game Modes (Team Deathmatch, Control, Elimination) — capture-the-flag is a small mod
- Cross-platform input (keyboard/mouse + controller)
- Working test maps

We start at ~70% complete. PARALLAX is a customization pass, not a from-scratch build.

---

## One-Time Setup (your part — ~30 minutes)

### 1. Hardware sanity check
- Windows 10/11 or recent macOS (Linux is possible but harder)
- 16 GB RAM minimum, 32 GB recommended
- ~150 GB free disk space (UE5 + Lyra is huge)
- GPU that can run UE5 (anything from the last ~5 years on desktop)

### 2. Install Epic Games Launcher
- https://store.epicgames.com/en-US/download
- Sign in or create a free Epic account

### 3. Install Unreal Engine 5
- Open Epic Games Launcher → "Unreal Engine" tab → "Library"
- Click the **+** next to Engine Versions → install the latest **UE 5.4** or **5.5**
- This will download ~30–50 GB. Go make coffee.

### 4. Download Lyra Starter Game
- In Epic Games Launcher → "Unreal Engine" → "Samples" tab
- Search "Lyra" → click "Free" → "Create Project"
- Pick a folder (you'll point Claude here later). Suggest `~/Documents/UnrealProjects/PARALLAX`

### 5. Install Visual Studio (Windows) or Xcode (Mac)
- Required for compiling C++ changes. UE5 will refuse to launch without it.
- Windows: install **Visual Studio 2022 Community** (free) with the "Game development with C++" workload
- Mac: install **Xcode** from the App Store

### 6. Open the project once
- Double-click `PARALLAX.uproject` in your Lyra folder
- UE5 will compile shaders for ~15 minutes the first time. Let it finish.
- Press the green ▶ Play button. Confirm it runs.

### 7. Install Node.js (for Claude Code itself)
- https://nodejs.org → install the LTS version
- Open Terminal/PowerShell, run `node --version` to confirm

### 8. Install Claude Code locally
```
npm install -g @anthropic-ai/claude-code
```
Confirm: `claude --version`

### 9. Get a GitHub account + create a repo
- Make a new repo for PARALLAX (private is fine)
- In your project folder, run:
```
git init
git remote add origin <your-repo-url>
echo "Saved/\nIntermediate/\nBinaries/\nDerivedDataCache/\n*.sln" > .gitignore
git add .gitignore
git commit -m "initial"
git push -u origin main
```

### 10. Create your Epic Online Services app (free)
- https://dev.epicgames.com/portal — sign in with your Epic account
- Create a product called "PARALLAX FLAGFALL"
- Copy the **Client ID, Client Secret, Sandbox ID, Deployment ID** — you'll paste these into the UE5 project later. Claude will guide that step.

---

## Hand-Off to Claude (the part where you walk away)

### 1. Open Terminal in the project folder
```
cd ~/Documents/UnrealProjects/PARALLAX
```

### 2. Launch Claude in bypass mode
```
claude --dangerously-skip-permissions
```
This means Claude can run any command without asking. Required for hands-off operation. Only do this in a project folder you trust the work to happen in.

### 3. Drop in the kickoff prompt
Copy/paste this exact message to Claude on the first run:

```
You are the lead designer and engineer of PARALLAX: FLAGFALL.
Read docs/AUTONOMOUS-GAMEDEV-GUIDE.md first for your operating instructions.
Then read docs/PARALLAX-DESIGN.md for the game vision.
Then check todo.md for the current task list, pick the next unchecked
item, implement it, test it, commit it, push it, mark it done, and start
the next one. Use /loop to keep going for the next 4 hours.
```

(You'll copy `AUTONOMOUS-GAMEDEV-GUIDE.md` and a design doc into this project — Claude generates them on first run if missing.)

### 4. Close your laptop lid, go to sleep
Claude commits to GitHub. When you wake up, pull the changes, open UE5, press Play, see what got built.

---

## What this gets you on Day 1
- A working multiplayer hero-shooter (Lyra) rebranded to PARALLAX
- The original 4 heroes from your concept art set up as Lyra characters with placeholder MetaHumans
- One playable map (Lyra ships with several — pick one as the starting point for Sky-City Citadel)
- A friend can join via "Invite Friend" through Epic Online Services
- Source pushed to GitHub

## What gets layered in over the following sessions
- Custom hero abilities matching the concept art (heal drone, arc bolt, phase shift, etc.)
- Sky-City Citadel map built from Megascans + procedural geometry
- Overgrown Lab map (second arena)
- Capture-the-Flag game mode (Lyra has Control Points — small mod to make it CTF)
- Custom HUD matching the cyberpunk aesthetic
- Music + SFX (free via Suno AI generations + Epic's free sound library)
- Hero models — start with MetaHumans, replace with custom Meshy-generated 3D when budget allows

---

## What you (the human) still do, occasionally
- Decide if you like a direction Claude went and tell it to change course
- Approve real money spending (if you ever want paid asset packs or non-free hosting)
- Playtest with friends and give Claude feedback ("Vanguard feels too slow", "I want Volt's dash to feel snappier")
- Push the "publish to Steam" button when the game is ready (that requires a human signing a developer agreement)

Everything else can run on autopilot.
