/**
 * Projectile
 *
 * Individual projectile entity with position, velocity, damage, and lifetime.
 * Implements the Poolable interface for use with the object-pool system.
 *
 * Usage:
 *   const proj = new Projectile();
 *   proj.spawn(100, 200, PLAYER_BULLET);
 *   // In update loop:
 *   proj.update(dt); // dt in seconds
 */

import type { Poolable } from '../pool/pool';
import type { ProjectileConfig, ProjectileOwner, HitBox } from './projectile-types';

/**
 * Projectile - a single bullet/shot entity
 */
export class Projectile implements Poolable {
  active: boolean = false;

  x: number = 0;
  y: number = 0;
  velocityX: number = 0;
  velocityY: number = 0;
  width: number = 8;
  height: number = 4;
  damage: number = 1;
  lifetime: number = 2;
  owner: ProjectileOwner = 'player';
  color: string = '#00ffff';

  private timeAlive: number = 0;

  /**
   * Initialize projectile with spawn position and config
   */
  spawn(x: number, y: number, config: ProjectileConfig): void {
    this.x = x;
    this.y = y;
    this.velocityX = config.velocityX;
    this.velocityY = config.velocityY;
    this.width = config.width;
    this.height = config.height;
    this.damage = config.damage;
    this.lifetime = config.lifetime;
    this.owner = config.owner;
    this.color = config.color;
    this.timeAlive = 0;
    this.active = true;
  }

  /**
   * Update position and lifetime
   * @param dt Delta time in seconds
   */
  update(dt: number): void {
    if (!this.active) return;

    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.timeAlive += dt;

    if (this.timeAlive >= this.lifetime) {
      this.active = false;
    }
  }

  /**
   * Get bounding box for collision detection
   */
  getBounds(): HitBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Deactivate and return to pool
   */
  kill(): void {
    this.active = false;
  }
}
