import { MakkoEngine } from '../engine';
import type { MatchScene } from '../scenes/match-scene';
import type { Hero } from '../entities/hero';

const ORBITRON = 'Orbitron, sans-serif';
const FONT_SM = '11px ' + ORBITRON;
const FONT_MD = '14px ' + ORBITRON;
const FONT_LG = '20px ' + ORBITRON;
const FONT_XL = '28px ' + ORBITRON;

interface KillFeedEntry {
  text: string;
  timer: number;
}

export class HUD {
  private scene: MatchScene;
  private killFeed: KillFeedEntry[] = [];
  private prevAnnouncements: string[] = [];

  constructor(scene: MatchScene) {
    this.scene = scene;
  }

  addKill(text: string): void {
    this.killFeed.unshift({ text, timer: 4 });
    if (this.killFeed.length > 5) this.killFeed.pop();
  }

  update(dt: number): void {
    // Decay kill feed
    for (const e of this.killFeed) e.timer -= dt;
    this.killFeed = this.killFeed.filter(e => e.timer > 0);

    // Pull new announcements from match manager
    const anns = this.scene.matchManager.getAnnouncements();
    if (anns.length > this.prevAnnouncements.length) {
      for (let i = this.prevAnnouncements.length; i < anns.length; i++) {
        this.addKill(anns[i]);
      }
      this.prevAnnouncements = [...anns];
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const W = display.width;
    const H = display.height;
    const hero = this.scene.playerHero;

    this.renderScoreTimer(W, H);
    this.renderHealthAbilities(W, H, hero);
    this.renderKillFeed(W);
    this.renderMinimap(W, H);
  }

  // ── Top-center: scores + timer ──────────────────────────────────────────────
  private renderScoreTimer(W: number, H: number): void {
    const display = MakkoEngine.display;
    const cx = W / 2;
    const y = 12;
    const mm = this.scene.matchManager;

    // Background bar
    display.drawRoundRect(cx - 120, y, 240, 40, 6, {
      fill: 'rgba(0,0,0,0.6)',
      stroke: 'rgba(255,255,255,0.15)',
      lineWidth: 1,
    });

    // Blue score
    display.drawText(mm.blueScore.toString(), cx - 70, y + 20, {
      font: FONT_XL, fill: '#4a9eff', textAlign: 'center'
    });

    // Timer
    const secs = Math.max(0, Math.ceil(mm.matchTimer));
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;
    display.drawText(timeStr, cx, y + 22, {
      font: FONT_MD, fill: '#ffffff', textAlign: 'center'
    });

    // Orange score
    display.drawText(mm.orangeScore.toString(), cx + 70, y + 20, {
      font: FONT_XL, fill: '#ff8844', textAlign: 'center'
    });

    // Score pips
    for (let i = 0; i < mm.targetScore; i++) {
      const filled = i < mm.blueScore;
      display.drawCircle(cx - 90 + i * 14, y + 34, 4, {
        fill: filled ? '#4a9eff' : 'rgba(74,158,255,0.2)',
        stroke: '#4a9eff', lineWidth: 1
      });
    }
    for (let i = 0; i < mm.targetScore; i++) {
      const filled = i < mm.orangeScore;
      display.drawCircle(cx + 58 + i * 14, y + 34, 4, {
        fill: filled ? '#ff8844' : 'rgba(255,136,68,0.2)',
        stroke: '#ff8844', lineWidth: 1
      });
    }
  }

  // ── Bottom-center: health + abilities ──────────────────────────────────────
  private renderHealthAbilities(W: number, _H: number, hero: Hero): void {
    const display = MakkoEngine.display;
    const H = display.height;
    const cx = W / 2;
    const baseY = H - 70;

    // Panel
    display.drawRoundRect(cx - 180, baseY - 10, 360, 70, 8, {
      fill: 'rgba(0,0,0,0.65)',
      stroke: 'rgba(255,255,255,0.12)',
      lineWidth: 1,
    });

    // Hero name
    display.drawText(hero.displayName, cx, baseY + 4, {
      font: FONT_SM, fill: hero.accentColor, textAlign: 'center'
    });

    // Health bar
    const barW = 200;
    const barH = 10;
    const barX = cx - barW / 2;
    const barY = baseY + 16;
    display.drawRoundRect(barX, barY, barW, barH, 4, {
      fill: '#1a1a1a', stroke: '#333', lineWidth: 1
    });
    const hpPct = hero.hp / hero.maxHp;
    const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    if (hpPct > 0) {
      display.drawRoundRect(barX + 1, barY + 1, (barW - 2) * hpPct, barH - 2, 3, {
        fill: hpColor
      });
    }
    display.drawText(`${Math.ceil(hero.hp)}/${hero.maxHp}`, cx, barY + barH / 2, {
      font: '9px ' + ORBITRON, fill: '#ffffff', textAlign: 'center'
    });

    // Ability icons: Q (tactical) and F (ultimate)
    this.renderAbilityIcon(cx - 80, baseY + 32, 'Q', hero.tacticalCooldown, hero.tacticalMaxCooldown, hero.accentColor);
    this.renderAbilityIcon(cx + 80, baseY + 32, 'F', hero.ultimateCooldown, hero.ultimateMaxCooldown, '#ff6b35');

    // Flag indicator
    if (this.scene.flag.carrier === hero) {
      display.drawText('▶ FLAG SECURED ◀', cx, baseY + 55, {
        font: FONT_SM, fill: '#00d4ff', textAlign: 'center',
        shadow: { color: '#00d4ff', blur: 8 }
      });
    }
  }

  private renderAbilityIcon(cx: number, cy: number, key: string, cooldown: number, maxCooldown: number, color: string): void {
    const display = MakkoEngine.display;
    const size = 26;

    const ready = cooldown <= 0;
    const bgAlpha = ready ? 0.8 : 0.3;

    display.setGlobalAlpha(bgAlpha);
    display.drawRoundRect(cx - size / 2, cy - size / 2, size, size, 5, {
      fill: ready ? color : '#333',
      stroke: color,
      lineWidth: ready ? 2 : 1,
    });
    display.setGlobalAlpha(1);

    display.drawText(key, cx, cy, {
      font: FONT_SM, fill: '#ffffff', textAlign: 'center'
    });

    if (!ready) {
      // Cooldown overlay
      const pct = cooldown / maxCooldown;
      display.drawRoundRect(cx - size / 2, cy - size / 2, size, size * pct, 5, {
        fill: 'rgba(0,0,0,0.5)'
      });
      const cdText = Math.ceil(cooldown).toString();
      display.drawText(cdText, cx, cy + 10, {
        font: '9px ' + ORBITRON, fill: '#aaaaaa', textAlign: 'center'
      });
    }
  }

  // ── Top-right: kill feed ────────────────────────────────────────────────────
  private renderKillFeed(W: number): void {
    if (this.killFeed.length === 0) return;
    const display = MakkoEngine.display;
    const x = W - 20;
    let y = 70;

    for (const entry of this.killFeed) {
      const alpha = Math.min(1, entry.timer);
      display.setGlobalAlpha(alpha * 0.85);
      const tw = display.measureText(entry.text, { font: FONT_SM }).width;
      display.drawRoundRect(x - tw - 16, y - 8, tw + 16, 18, 3, {
        fill: 'rgba(0,0,0,0.6)'
      });
      display.drawText(entry.text, x, y + 1, {
        font: FONT_SM, fill: '#ffffff', textAlign: 'right'
      });
      display.setGlobalAlpha(1);
      y += 22;
    }
  }

  // ── Bottom-right: minimap ───────────────────────────────────────────────────
  private renderMinimap(W: number, H: number): void {
    const display = MakkoEngine.display;
    const mmW = 240;
    const mmH = 160;
    const mmX = W - mmW - 12;
    const mmY = H - mmH - 12;
    const arena = this.scene.mapArena;
    const scaleX = mmW / arena.width;
    const scaleY = mmH / arena.height;

    // Background
    display.drawRoundRect(mmX, mmY, mmW, mmH, 6, {
      fill: 'rgba(0,5,15,0.8)',
      stroke: 'rgba(0,212,255,0.3)',
      lineWidth: 1,
    });

    // Walls
    display.setGlobalAlpha(0.5);
    for (const wall of arena.walls) {
      display.drawRect(
        mmX + wall.x * scaleX, mmY + wall.y * scaleY,
        Math.max(1, wall.width * scaleX), Math.max(1, wall.height * scaleY),
        { fill: '#3a5a7a' }
      );
    }
    display.setGlobalAlpha(1);

    // Bases
    display.setGlobalAlpha(0.4);
    display.drawRect(
      mmX + arena.blueBase.x * scaleX, mmY + arena.blueBase.y * scaleY,
      arena.blueBase.width * scaleX, arena.blueBase.height * scaleY,
      { fill: '#4a9eff' }
    );
    display.drawRect(
      mmX + arena.orangeBase.x * scaleX, mmY + arena.orangeBase.y * scaleY,
      arena.orangeBase.width * scaleX, arena.orangeBase.height * scaleY,
      { fill: '#ff8844' }
    );
    display.setGlobalAlpha(1);

    // Flag
    if (this.scene.flag.state !== 'carried') {
      display.drawCircle(
        mmX + this.scene.flag.x * scaleX,
        mmY + this.scene.flag.y * scaleY,
        3, { fill: '#00d4ff', shadow: { color: '#00d4ff', blur: 4 } }
      );
    }

    // Heroes
    const renderDot = (h: Hero, color: string, big: boolean) => {
      if (h.dead) return;
      display.drawCircle(
        mmX + h.position.x * scaleX,
        mmY + h.position.y * scaleY,
        big ? 4 : 3,
        { fill: color, stroke: big ? '#ffffff' : 'none', lineWidth: 1 }
      );
      // Flag indicator on carrier
      if (this.scene.flag.carrier === h) {
        display.drawCircle(
          mmX + h.position.x * scaleX,
          mmY + h.position.y * scaleY,
          6, { stroke: '#00d4ff', lineWidth: 1.5 }
        );
      }
    };

    renderDot(this.scene.playerHero, '#00ffff', true);
    for (const a of this.scene.allies) renderDot(a, '#4a9eff', false);
    for (const e of this.scene.enemies) renderDot(e, '#ff6644', false);

    // Label
    display.drawText('MAP', mmX + 4, mmY + 12, {
      font: '9px ' + ORBITRON, fill: 'rgba(0,212,255,0.5)', textAlign: 'left'
    });
  }
}
