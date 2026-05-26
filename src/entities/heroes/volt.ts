import { MakkoEngine } from '../../engine';
import { Hero } from '../hero';
import type { MatchScene } from '../../scenes/match-scene';

const CHAIN_RANGE = 200;
const CHAIN_DAMAGE = 20;
const DASH_DIST = 500;
const DASH_DAMAGE = 40;

export class Volt extends Hero {
  public readonly heroId = 'volt';
  public readonly displayName = 'VOLT';
  public readonly heroColor = '#3a3a1a';
  public readonly accentColor = '#ffee00';

  private dashX: number = 0;
  private dashY: number = 0;
  private dashProgress: number = 0;
  private dashStartX: number = 0;
  private dashStartY: number = 0;
  private dashActive: boolean = false;

  constructor(x: number, y: number, team: string, isPlayer: boolean) {
    super(x, y, team, isPlayer);
    this.maxHp = 175;
    this.hp = this.maxHp;
    this.speed = 290;
    this.fireRate = 0.1; // twin pistols = fast
    this.tacticalMaxCooldown = 8;
    this.ultimateMaxCooldown = 25;
  }

  protected applyPassiveBonuses(): void {
    this.passiveSpeedBonus = 15;
  }

  protected getBulletColor(): string {
    return '#ffee00';
  }

  protected getBaseDamage(): number {
    return 7; // fast fire rate compensates
  }

  /** Q — Arc Bolt: chain lightning to up to 2 nearby enemies */
  protected onTactical(): void {
    const scene = this.findScene();
    if (!scene) return;

    const targets = this.team === 'blue' ? scene.enemies : [scene.playerHero, ...scene.allies];
    const inRange = targets
      .filter(h => !h.dead)
      .map(h => {
        const dx = h.position.x - this.position.x;
        const dy = h.position.y - this.position.y;
        return { hero: h, dist: Math.sqrt(dx * dx + dy * dy) };
      })
      .filter(e => e.dist <= CHAIN_RANGE)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);

    for (const { hero } of inRange) {
      hero.takeDamage(CHAIN_DAMAGE, scene);
      scene.particleFX.spawnAbilityFX(hero.position.x, hero.position.y, '#ffee00');
    }

    scene.particleFX.spawnAbilityFX(this.position.x, this.position.y, '#ffee00');
  }

  /** F — Thunderstruck Dash: 500px instant dash, deals 40dmg to anything touched */
  protected onUltimate(): void {
    const scene = this.findScene();
    if (!scene) return;

    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);
    this.dashStartX = this.position.x;
    this.dashStartY = this.position.y;
    this.dashX = this.position.x + dx * DASH_DIST;
    this.dashY = this.position.y + dy * DASH_DIST;
    this.dashProgress = 0;
    this.dashActive = true;
    this.ultimateActive = true;
    this.ultimateDuration = 0.15; // brief
    this.invulnerable = 0.15;
  }

  update(dt: number, input: any, worldMouse: any, scene: MatchScene): void {
    if (this.dashActive) {
      this.dashProgress = Math.min(1, this.dashProgress + dt * 8);
      this.position.x = this.dashStartX + (this.dashX - this.dashStartX) * this.dashProgress;
      this.position.y = this.dashStartY + (this.dashY - this.dashStartY) * this.dashProgress;

      // Check damage during dash
      const targets = this.team === 'blue' ? scene.enemies : [scene.playerHero, ...scene.allies];
      for (const hero of targets) {
        if (hero.dead || hero.invulnerable > 0) continue;
        const dx = hero.position.x - this.position.x;
        const dy = hero.position.y - this.position.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.radius + hero.radius) {
          hero.takeDamage(DASH_DAMAGE, scene);
          scene.particleFX.spawnAbilityFX(hero.position.x, hero.position.y, '#ffee00');
        }
      }

      if (this.dashProgress >= 1) {
        this.dashActive = false;
        const resolved = scene.mapArena.resolveWallCollision(this.position.x, this.position.y, this.radius);
        this.position.x = resolved.x;
        this.position.y = resolved.y;
      }
      return;
    }

    super.update(dt, input, worldMouse, scene);
  }

  render(scene: MatchScene, isPlayerHero: boolean): void {
    super.render(scene, isPlayerHero);
    if (this.dashActive) {
      const d = MakkoEngine.display;
      d.setGlobalAlpha(0.4);
      d.drawCircle(this.position.x, this.position.y, this.radius + 12, {
        fill: '#ffee00', blendMode: 'lighter'
      });
      d.setGlobalAlpha(1);
    }
  }

  protected endUltimate(): void {
    this.ultimateActive = false;
    this.dashActive = false;
  }

  private findScene(): MatchScene | null {
    return (MakkoEngine.instance as any)?.getActiveScene?.() as MatchScene ?? null;
  }
}
