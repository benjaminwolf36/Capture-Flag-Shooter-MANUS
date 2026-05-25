/**
 * Projectile Pool
 *
 * Manages a pool of projectiles with spawning, updating, rendering, and hit detection.
 * Wraps object-pool's Pool class for efficient reuse.
 *
 * Usage:
 *   const pool = new ProjectilePool();
 *   pool.spawn(player.x + 16, player.y + 8, PLAYER_BULLET);
 *   // In update loop:
 *   pool.updateAll(dt);
 *   const hits = pool.checkHits(enemyBounds, 'player');
 *   pool.renderAll();
 */

import { MakkoEngine } from '@makko/engine';
import { Pool } from '../pool/pool';
import { Projectile } from './projectile';
import type { ProjectileConfig, ProjectileOwner, HitBox, HitResult } from './projectile-types';

/**
 * ProjectilePool - manages all active projectiles
 */
export class ProjectilePool {
  private pool: Pool<Projectile>;

  /**
   * @param initialSize Number of projectiles to pre-allocate
   */
  constructor(initialSize: number = 30) {
    this.pool = new Pool(() => new Projectile(), initialSize);
  }

  /**
   * Spawn a new projectile
   * @param x Spawn X position
   * @param y Spawn Y position
   * @param config Projectile configuration
   * @returns The spawned projectile
   */
  spawn(x: number, y: number, config: ProjectileConfig): Projectile {
    const proj = this.pool.get();
    proj.spawn(x, y, config);
    return proj;
  }

  /**
   * Update all active projectiles
   * @param dt Delta time in seconds
   * @param solidCheck Optional function to check tile collision (returns true if position is solid)
   */
  updateAll(dt: number, solidCheck?: (x: number, y: number) => boolean): void {
    this.pool.forEach((proj) => {
      proj.update(dt);

      // Check tile collision if provided
      if (solidCheck && proj.active) {
        const cx = proj.x + proj.width / 2;
        const cy = proj.y + proj.height / 2;
        if (solidCheck(cx, cy)) {
          proj.kill();
        }
      }
    });
  }

  /**
   * Check projectiles against a list of target hitboxes
   * Only checks projectiles from the specified owner
   * @param targets Array of hitboxes to test against
   * @param ownerFilter Only check projectiles from this owner
   * @returns Array of hit results
   */
  checkHits(targets: HitBox[], ownerFilter: ProjectileOwner): HitResult[] {
    const hits: HitResult[] = [];

    this.pool.forEach((proj) => {
      if (proj.owner !== ownerFilter) return;

      const pb = proj.getBounds();

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        // AABB overlap test
        if (
          pb.x < t.x + t.width &&
          pb.x + pb.width > t.x &&
          pb.y < t.y + t.height &&
          pb.y + pb.height > t.y
        ) {
          hits.push({
            targetIndex: i,
            projectileIndex: 0, // Not meaningful for forEach
            damage: proj.damage,
            owner: proj.owner,
          });
          proj.kill();
          break; // Each projectile can only hit one target
        }
      }
    });

    return hits;
  }

  /**
   * Render all active projectiles
   */
  renderAll(): void {
    const display = MakkoEngine.display;

    this.pool.forEach((proj) => {
      display.drawRect(proj.x, proj.y, proj.width, proj.height, {
        fill: proj.color,
      });
    });
  }

  /**
   * Get count of active projectiles
   */
  getActiveCount(): number {
    return this.pool.getActiveCount();
  }

  /**
   * Deactivate all projectiles
   */
  clear(): void {
    this.pool.clear();
  }

  /**
   * Run a function on each active projectile
   */
  forEach(fn: (proj: Projectile) => void): void {
    this.pool.forEach(fn);
  }
}
