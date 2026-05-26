/**
 * Particle System
 *
 * Pooled particles for visual effects like explosions, dust, sparks.
 * Particles are visual-only (no collision) and short-lived.
 *
 * Usage:
 *   const particles = new ParticleSystem();
 *   particles.spawn(enemy.x, enemy.y, '#ff0', 10, 100, 500); // Yellow burst
 *   // In game loop: particles.update(dt); particles.render(display);
 */

import { MakkoEngine } from '../engine';

/**
 * Particle interface
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
}

/**
 * ParticleSystem - pooled particles with gravity and fade
 */
export class ParticleSystem {
  private pool: Particle[] = [];
  gravity: number = 200; // Pixels per second squared (set to 0 for floating particles)
  friction: number = 0.98; // Velocity multiplier per frame

  /**
   * Spawn a burst of particles
   * @param x Center X position
   * @param y Center Y position
   * @param color Particle color
   * @param count Number of particles
   * @param speed Initial velocity magnitude
   * @param life Lifetime in milliseconds
   */
  spawn(
    x: number,
    y: number,
    color: string,
    count: number,
    speed: number,
    life: number
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.getOrCreate();
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * velocity;
      p.vy = Math.sin(angle) * velocity;
      p.life = life;
      p.maxLife = life;
      p.color = color;
      p.size = 2 + Math.random() * 3;
      p.active = true;
    }
  }

  /**
   * Spawn particles in a directional cone
   * @param x Start X position
   * @param y Start Y position
   * @param angle Center angle in radians
   * @param spread Spread angle in radians
   * @param color Particle color
   * @param count Number of particles
   * @param speed Initial velocity magnitude
   * @param life Lifetime in milliseconds
   */
  spawnDirectional(
    x: number,
    y: number,
    angle: number,
    spread: number,
    color: string,
    count: number,
    speed: number,
    life: number
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.getOrCreate();
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      p.x = x;
      p.y = y;
      p.vx = Math.cos(particleAngle) * velocity;
      p.vy = Math.sin(particleAngle) * velocity;
      p.life = life;
      p.maxLife = life;
      p.color = color;
      p.size = 2 + Math.random() * 3;
      p.active = true;
    }
  }

  private getOrCreate(): Particle {
    const inactive = this.pool.find((p) => !p.active);
    if (inactive) return inactive;

    const p: Particle = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#fff',
      size: 2,
      active: false,
    };
    this.pool.push(p);
    return p;
  }

  /**
   * Update all active particles
   */
  update(dt: number): void {
    const dtSec = dt / 1000;

    for (const p of this.pool) {
      if (!p.active) continue;

      // Move
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;

      // Apply gravity
      p.vy += this.gravity * dtSec;

      // Apply friction
      p.vx *= this.friction;
      p.vy *= this.friction;

      // Decay lifetime
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
      }
    }
  }

  /**
   * Render all active particles
   */
  render(): void {
    const display = MakkoEngine.display;

    for (const p of this.pool) {
      if (!p.active) continue;

      // Calculate alpha based on remaining life
      const alpha = Math.max(0, p.life / p.maxLife);

      display.drawRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, {
        fill: p.color,
        alpha,
      });
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    for (const p of this.pool) {
      p.active = false;
    }
  }

  /**
   * Get count of active particles
   */
  getActiveCount(): number {
    return this.pool.filter((p) => p.active).length;
  }
}

// ============================================================================
// Preset Effects
// ============================================================================

/**
 * Preset particle effects for common game events
 */
export const ParticlePresets = {
  /** Small hit effect - yellow sparks */
  hit(particles: ParticleSystem, x: number, y: number): void {
    particles.spawn(x, y, '#ff0', 5, 80, 300);
  },

  /** Medium explosion - orange and red */
  explosion(particles: ParticleSystem, x: number, y: number): void {
    particles.spawn(x, y, '#f80', 15, 120, 500);
    particles.spawn(x, y, '#f00', 10, 80, 400);
  },

  /** Death explosion - larger red burst */
  death(particles: ParticleSystem, x: number, y: number): void {
    particles.spawn(x, y, '#f00', 20, 150, 800);
    particles.spawn(x, y, '#ff0', 10, 100, 600);
  },

  /** Dust puff - gray, low gravity */
  dust(particles: ParticleSystem, x: number, y: number): void {
    const oldGravity = particles.gravity;
    particles.gravity = 50;
    particles.spawn(x, y, '#888', 8, 40, 400);
    particles.gravity = oldGravity;
  },

  /** Sparkle - white, no gravity */
  sparkle(particles: ParticleSystem, x: number, y: number): void {
    const oldGravity = particles.gravity;
    particles.gravity = 0;
    particles.spawn(x, y, '#fff', 6, 60, 500);
    particles.gravity = oldGravity;
  },

  /** Coin collect - gold upward burst */
  coin(particles: ParticleSystem, x: number, y: number): void {
    particles.spawnDirectional(x, y, -Math.PI / 2, Math.PI / 3, '#fc0', 8, 100, 400);
  },
};
