/**
 * Projectile Types
 *
 * Shared interfaces for the projectile system.
 */

/**
 * Owner tag to prevent friendly fire
 */
export type ProjectileOwner = 'player' | 'enemy';

/**
 * Configuration for spawning a projectile
 */
export interface ProjectileConfig {
  /** Horizontal velocity (pixels/sec, negative = left) */
  velocityX: number;
  /** Vertical velocity (pixels/sec, negative = up) */
  velocityY: number;
  /** Projectile width in pixels */
  width: number;
  /** Projectile height in pixels */
  height: number;
  /** Damage dealt on hit */
  damage: number;
  /** Time before auto-despawn (seconds) */
  lifetime: number;
  /** Who fired this projectile */
  owner: ProjectileOwner;
  /** Render color */
  color: string;
}

/**
 * Default projectile configs
 */
export const PLAYER_BULLET: ProjectileConfig = {
  velocityX: 500,
  velocityY: 0,
  width: 8,
  height: 4,
  damage: 1,
  lifetime: 2,
  owner: 'player',
  color: '#00ffff',
};

export const ENEMY_BULLET: ProjectileConfig = {
  velocityX: -300,
  velocityY: 0,
  width: 6,
  height: 6,
  damage: 1,
  lifetime: 3,
  owner: 'enemy',
  color: '#ff4444',
};

/**
 * A simple AABB bounds for hit detection
 */
export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Result of a hit check
 */
export interface HitResult {
  /** Index of the target that was hit */
  targetIndex: number;
  /** The projectile that hit */
  projectileIndex: number;
  /** Damage dealt */
  damage: number;
  /** Owner of the projectile */
  owner: ProjectileOwner;
}
