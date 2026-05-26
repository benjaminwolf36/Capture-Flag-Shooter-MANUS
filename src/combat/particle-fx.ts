import { ParticleSystem } from '../pool/particle-system';
import type { MatchScene } from '../scenes/match-scene';

/**
 * CombatFX - thin wrapper over ParticleSystem for game-specific combat effects.
 */
export class CombatFX {
  private particles: ParticleSystem;

  constructor() {
    this.particles = new ParticleSystem();
    this.particles.gravity = 80;
    this.particles.friction = 0.96;
  }

  spawnHitFX(x: number, y: number): void {
    this.particles.spawn(x, y, '#ffdd44', 6, 120, 250);
    this.particles.spawn(x, y, '#ffffff', 3, 80, 150);
  }

  spawnDeathFX(x: number, y: number, team: string): void {
    const primary = team === 'blue' ? '#4a9eff' : '#ff8844';
    this.particles.spawn(x, y, primary, 20, 200, 700);
    this.particles.spawn(x, y, '#ffffff', 10, 150, 500);
    this.particles.spawn(x, y, '#ff4040', 8, 100, 400);
  }

  spawnAbilityFX(x: number, y: number, color: string): void {
    const old = this.particles.gravity;
    this.particles.gravity = 0;
    this.particles.spawn(x, y, color, 15, 150, 600);
    this.particles.gravity = old;
  }

  spawnCaptureFX(x: number, y: number, team: string): void {
    const color = team === 'blue' ? '#4a9eff' : '#ff8844';
    const old = this.particles.gravity;
    this.particles.gravity = -100; // float up
    this.particles.spawn(x, y, color, 30, 250, 1200);
    this.particles.spawn(x, y, '#ffffff', 15, 180, 900);
    this.particles.gravity = old;
  }

  update(dt: number): void {
    this.particles.update(dt);
  }

  render(_scene: MatchScene): void {
    this.particles.render();
  }
}
