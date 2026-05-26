import { MakkoEngine } from '../../engine';
import { Hero } from '../hero';
import type { MatchScene } from '../../scenes/match-scene';

export class Aegis extends Hero {
  public readonly heroId = 'aegis';
  public readonly displayName = 'AEGIS';
  public readonly heroColor = '#2a5a4a';
  public readonly accentColor = '#40ff90';

  private regenCooldown: number = 0;

  constructor(x: number, y: number, team: string, isPlayer: boolean) {
    super(x, y, team, isPlayer);
    this.maxHp = 200;
    this.hp = this.maxHp;
    this.speed = 250;
    this.fireRate = 0.25;
    this.tacticalMaxCooldown = 10;
    this.ultimateMaxCooldown = 35;
  }

  protected applyPassiveBonuses(): void {
    this.passiveDamageReduction = 0.05;
  }

  protected getBulletColor(): string {
    return '#40ff90';
  }

  protected getBaseDamage(): number {
    return 12;
  }

  protected applyPassiveRegen(dtSec: number): void {
    this.regenCooldown -= dtSec;
    if (this.regenCooldown <= 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 5 * dtSec);
    }
  }

  takeDamage(amount: number, scene: MatchScene): void {
    this.regenCooldown = 4; // pause regen 4s after taking damage
    super.takeDamage(amount, scene);
  }

  /** Q — Heal Drone: burst 50hp to the nearest living ally within 400px */
  protected onTactical(): void {
    const scene = this.findScene();
    if (!scene) return;

    const allies = scene.playerHero.team === this.team
      ? [scene.playerHero, ...scene.allies]
      : [...scene.enemies];

    let closest: Hero | null = null;
    let closestDist = 400;

    for (const ally of allies) {
      if (ally === this || ally.dead) continue;
      const dx = ally.position.x - this.position.x;
      const dy = ally.position.y - this.position.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < closestDist) { closestDist = d; closest = ally; }
    }

    if (closest) {
      closest.hp = Math.min(closest.maxHp, closest.hp + 50);
      scene.particleFX.spawnAbilityFX(closest.position.x, closest.position.y, '#40ff90');
    }
    // Also heal self a bit
    this.hp = Math.min(this.maxHp, this.hp + 20);
    scene.particleFX.spawnAbilityFX(this.position.x, this.position.y, '#40ff90');
  }

  /** F — Field Resurrect: revive all dead allies within 400px */
  protected onUltimate(): void {
    const scene = this.findScene();
    if (!scene) return;

    const deadAllies = this.team === 'blue'
      ? scene.allies.filter(a => a.dead)
      : scene.enemies.filter(e => e.dead);

    for (const ally of deadAllies) {
      const dx = ally.position.x - this.position.x;
      const dy = ally.position.y - this.position.y;
      if (Math.sqrt(dx * dx + dy * dy) > 400) continue;
      ally.dead = false;
      ally.hp = Math.floor(ally.maxHp * 0.4);
      ally.respawnTimer = 0;
      ally.invulnerable = 2;
      scene.particleFX.spawnAbilityFX(ally.position.x, ally.position.y, '#40ff90');
    }

    this.ultimateActive = true;
    this.ultimateDuration = 0.1; // just for the flag
  }

  render(scene: MatchScene, isPlayerHero: boolean): void {
    super.render(scene, isPlayerHero);
    if (this.tacticalActive) {
      const d = MakkoEngine.display;
      d.setGlobalAlpha(0.2);
      d.drawCircle(this.position.x, this.position.y, 400, {
        stroke: '#40ff90', lineWidth: 1
      });
      d.setGlobalAlpha(1);
    }
  }

  private findScene(): MatchScene | null {
    return (MakkoEngine.instance as any)?.getActiveScene?.() as MatchScene ?? null;
  }
}
