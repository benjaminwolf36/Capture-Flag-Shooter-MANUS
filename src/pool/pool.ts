/**
 * Object Pool System
 *
 * Generic object pooling to reuse entities and prevent garbage collection spikes.
 * Use for bullets, particles, pickups, enemies - anything spawned/despawned frequently.
 *
 * Usage:
 *   const bulletPool = new Pool(() => ({ x: 0, y: 0, vx: 0, vy: 0, active: false }), 50);
 *   const bullet = bulletPool.get();
 *   bullet.x = player.x; bullet.y = player.y; bullet.active = true;
 *   // Later: bullet.active = false; // Returns to pool
 */

/**
 * Poolable interface - objects must have an active flag
 */
export interface Poolable {
  active: boolean;
}

/**
 * Generic Pool - manages reusable objects.
 * Type parameter T must have an `active: boolean` property.
 */
export class Pool<T extends Poolable> {
  private items: T[] = [];
  private factory: () => T;

  /**
   * Create a pool with a factory function
   * @param factory Function that creates new instances
   * @param initialSize Number of objects to pre-allocate
   */
  constructor(factory: () => T, initialSize: number = 10) {
    this.factory = factory;

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      const item = factory();
      item.active = false;
      this.items.push(item);
    }
  }

  /**
   * Get an inactive object from the pool, or create a new one
   * Note: The returned object is NOT automatically activated - set active = true yourself
   */
  get(): T {
    // Find inactive object
    const inactive = this.items.find((item) => !item.active);
    if (inactive) {
      return inactive;
    }

    // Create new object if none available
    const newItem = this.factory();
    this.items.push(newItem);
    return newItem;
  }

  /**
   * Get all active objects for iteration
   */
  getActive(): T[] {
    return this.items.filter((item) => item.active);
  }

  /**
   * Get all objects (active and inactive)
   */
  getAll(): T[] {
    return this.items;
  }

  /**
   * Count of active objects
   */
  getActiveCount(): number {
    return this.items.filter((item) => item.active).length;
  }

  /**
   * Total pool size
   */
  getSize(): number {
    return this.items.length;
  }

  /**
   * Deactivate all objects
   */
  clear(): void {
    for (const item of this.items) {
      item.active = false;
    }
  }

  /**
   * Run a function on each active object
   */
  forEach(fn: (item: T) => void): void {
    for (const item of this.items) {
      if (item.active) {
        fn(item);
      }
    }
  }
}

// ============================================================================
// Typed Pool Helpers
// ============================================================================

/**
 * Projectile interface - common for bullets, arrows, etc.
 */
export interface Projectile extends Poolable {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  lifetime: number;
}

/**
 * Create a projectile factory
 */
export function createProjectileFactory(): () => Projectile {
  return () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    damage: 1,
    lifetime: 5000,
    active: false,
  });
}

/**
 * Spawn a projectile from pool with initial values
 */
export function spawnProjectile(
  pool: Pool<Projectile>,
  x: number,
  y: number,
  angle: number,
  speed: number,
  damage: number = 1,
  lifetime: number = 5000
): Projectile {
  const projectile = pool.get();
  projectile.x = x;
  projectile.y = y;
  projectile.vx = Math.cos(angle) * speed;
  projectile.vy = Math.sin(angle) * speed;
  projectile.damage = damage;
  projectile.lifetime = lifetime;
  projectile.active = true;
  return projectile;
}

/**
 * Update projectiles - move and check bounds
 */
export function updateProjectiles(
  pool: Pool<Projectile>,
  dt: number,
  bounds: { width: number; height: number },
  padding: number = 50
): void {
  const dtSec = dt / 1000;

  pool.forEach((p) => {
    p.x += p.vx * dtSec;
    p.y += p.vy * dtSec;
    p.lifetime -= dt;

    // Deactivate if out of bounds or expired
    if (
      p.lifetime <= 0 ||
      p.x < -padding ||
      p.x > bounds.width + padding ||
      p.y < -padding ||
      p.y > bounds.height + padding
    ) {
      p.active = false;
    }
  });
}
