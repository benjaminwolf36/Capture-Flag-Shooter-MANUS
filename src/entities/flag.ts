import { MakkoEngine } from '../engine';
import type { Hero } from './hero';
import type { MatchScene } from '../scenes/match-scene';

type FlagState = 'neutral' | 'carried' | 'dropped';

const RETURN_TIME = 10; // seconds before dropped flag auto-returns
const PICKUP_RADIUS = 40;

export class Flag {
  public x: number;
  public y: number;
  public carrier: Hero | null = null;
  public state: FlagState = 'neutral';

  private homeX: number;
  private homeY: number;
  private returnTimer: number = 0;

  constructor(spawn: { x: number; y: number }) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.homeX = spawn.x;
    this.homeY = spawn.y;
  }

  update(dt: number, scene: MatchScene): void {
    if (this.state === 'carried' && this.carrier) {
      if (this.carrier.dead) {
        this.drop(this.carrier);
        return;
      }
      this.x = this.carrier.position.x;
      this.y = this.carrier.position.y;
      return;
    }

    if (this.state === 'dropped') {
      this.returnTimer -= dt;
      if (this.returnTimer <= 0) {
        this.reset({ x: this.homeX, y: this.homeY });
        return;
      }
    }

    // Check for pickup by any living hero
    const candidates = [scene.playerHero, ...scene.allies, ...scene.enemies];
    for (const hero of candidates) {
      if (hero.dead) continue;
      const dx = hero.position.x - this.x;
      const dy = hero.position.y - this.y;
      if (Math.sqrt(dx * dx + dy * dy) <= PICKUP_RADIUS) {
        this.pickup(hero);
        return;
      }
    }
  }

  pickup(hero: Hero): void {
    this.carrier = hero;
    this.state = 'carried';
  }

  drop(hero: Hero): void {
    if (this.carrier !== hero) return;
    this.x = hero.position.x;
    this.y = hero.position.y;
    this.carrier = null;
    this.state = 'dropped';
    this.returnTimer = RETURN_TIME;
  }

  reset(pos: { x: number; y: number }): void {
    this.x = pos.x;
    this.y = pos.y;
    this.carrier = null;
    this.state = 'neutral';
    this.returnTimer = 0;
  }

  render(_scene: MatchScene): void {
    if (this.state === 'carried') return; // rendered on top of carrier below

    const display = MakkoEngine.display;
    const pulse = 0.7 + Math.sin(performance.now() / 300) * 0.3;

    if (this.state === 'dropped') {
      // Dropped: red pulsing flag + return timer arc
      display.setGlobalAlpha(pulse);
      display.drawCircle(this.x, this.y, 14, {
        fill: '#ff4040',
        stroke: '#ffffff',
        lineWidth: 2,
        shadow: { color: '#ff4040', blur: 12 }
      });
      display.setGlobalAlpha(1);
      display.drawText(
        Math.ceil(this.returnTimer).toString(),
        this.x,
        this.y - 24,
        { fontSize: 12, fontFamily: 'Orbitron, sans-serif', fill: '#ff4040', textAlign: 'center' }
      );
    } else {
      // Neutral: cyan diamond
      display.setGlobalAlpha(pulse);
      display.drawCircle(this.x, this.y, 12, {
        fill: '#00d4ff',
        stroke: '#ffffff',
        lineWidth: 2,
        shadow: { color: '#00d4ff', blur: 18 }
      });
      display.setGlobalAlpha(1);
      display.drawText('F', this.x, this.y, {
        fontSize: 12, fontFamily: 'Orbitron, sans-serif',
        fill: '#ffffff', textAlign: 'center'
      });
    }
  }

  renderOnCarrier(display: ReturnType<typeof MakkoEngine['display']['canvas']['getContext']> | null): void {
    // Called from carrier's render — draw flag indicator above hero
    if (this.state !== 'carried' || !this.carrier) return;
    const d = MakkoEngine.display;
    d.drawCircle(this.carrier.position.x, this.carrier.position.y - 30, 8, {
      fill: '#00d4ff',
      stroke: '#ffffff',
      lineWidth: 2,
      shadow: { color: '#00d4ff', blur: 10 }
    });
  }
}
