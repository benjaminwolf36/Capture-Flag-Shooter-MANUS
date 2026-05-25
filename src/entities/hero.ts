import { MakkoEngine } from "@makko/engine";
import type { MatchScene } from "../scenes/match-scene";
import type { InputHandler } from "../systems/input-handler";
import type { ProjectileConfig } from "../projectile/projectile-types";

export interface HeroPosition {
    x: number;
    y: number;
}

export class Hero {
    public position: HeroPosition;
    public velocity: HeroPosition = { x: 0, y: 0 };
    public angle: number = 0; // Radians, direction hero faces
    public hp: number;
    public maxHp: number;
    public speed: number;
    public team: string; // "blue" or "orange"
    public isPlayer: boolean;
    public alive: boolean = true;
    public radius: number = 18;

    // Weapon system
    public weaponCooldown: number = 0;
    public fireRate: number = 0.2; // Seconds between shots

    // Ability cooldowns
    public tacticalCooldown: number = 0;
    public tacticalMaxCooldown: number = 8;
    public tacticalActive: boolean = false;
    public tacticalDuration: number = 0;

    public ultimateCooldown: number = 0;
    public ultimateMaxCooldown: number = 30;
    public ultimateActive: boolean = false;
    public ultimateDuration: number = 0;

    // Passive effects
    public passiveDamageReduction: number = 0;
    public passiveSpeedBonus: number = 0;
    public passiveMaxHpBonus: number = 0;

    // State
    public dead: boolean = false;
    public respawnTimer: number = 0;
    public readonly respawnTime: number = 5;

    // Combat state
    public invulnerable: number = 0; // invincibility frames in seconds
    public speedMultiplier: number = 1;
    public firingRateMultiplier: number = 1;
    public isInvisible: boolean = false;
    public isSlowed: boolean = false;

    // Hero identity
    public readonly heroId: string = "hero";
    public readonly displayName: string = "HERO";
    public readonly heroColor: string = "#ffffff";
    public readonly accentColor: string = "#00ffff";

    constructor(x: number, y: number, team: string, isPlayer: boolean) {
        this.position = { x, y };
        this.team = team;
        this.isPlayer = isPlayer;

        // Base stats (overridden by subclasses)
        this.maxHp = 200;
        this.hp = this.maxHp;
        this.speed = 250;

        this.applyPassiveBonuses();
    }

    /**
     * Override in subclasses to set hero-specific stats
     */
    protected applyPassiveBonuses(): void {
        // Subclasses override this
    }

    /**
     * Get the bullet config for this hero's weapon
     */
    protected getBulletConfig(): ProjectileConfig {
        return {
            velocityX: Math.cos(this.angle) * 600,
            velocityY: Math.sin(this.angle) * 600,
            width: 8,
            height: 4,
            damage: this.getBaseDamage(),
            lifetime: 2,
            owner: this.isPlayer ? "player" : "enemy",
            color: this.getBulletColor()
        };
    }

    protected getBaseDamage(): number {
        return 10;
    }

    protected getBulletColor(): string {
        return this.team === "blue" ? "#4a9eff" : "#ff8844";
    }

    /**
     * Main update called every frame
     */
    update(dt: number, input: InputHandler | null, worldMouse: { x: number; y: number } | null, scene: MatchScene): void {
        if (this.dead) return;

        const dtSec = dt / 1000;

        // Update cooldowns
        if (this.weaponCooldown > 0) this.weaponCooldown -= dtSec;
        if (this.tacticalCooldown > 0) this.tacticalCooldown -= dtSec;
        if (this.ultimateCooldown > 0) this.ultimateCooldown -= dtSec;

        // Update ability durations
        if (this.tacticalActive) {
            this.tacticalDuration -= dtSec;
            if (this.tacticalDuration <= 0) this.endTactical();
        }
        if (this.ultimateActive) {
            this.ultimateDuration -= dtSec;
            if (this.ultimateDuration <= 0) this.endUltimate();
        }

        // Update invulnerability
        if (this.invulnerable > 0) this.invulnerable -= dtSec;

        // Movement
        if (input && this.isPlayer) {
            const move = input.getMovementVector();
            const actualSpeed = this.getEffectiveSpeed();
            this.velocity.x = move.x * actualSpeed;
            this.velocity.y = move.y * actualSpeed;

            // Aim toward mouse
            if (worldMouse) {
                this.angle = Math.atan2(worldMouse.y - this.position.y, worldMouse.x - this.position.x);
            }
        }

        // Apply velocity
        this.position.x += this.velocity.x * dtSec;
        this.position.y += this.velocity.y * dtSec;

        // Resolve wall collisions
        const resolved = scene.mapArena.resolveWallCollision(this.position.x, this.position.y, this.radius);
        this.position.x = resolved.x;
        this.position.y = resolved.y;

        // Apply slow effect
        if (this.isSlowed) {
            this.velocity.x *= 0.5;
            this.velocity.y *= 0.5;
            this.isSlowed = false; // Reset each frame
        }

        // Passive regen (Aegis)
        this.applyPassiveRegen(dtSec);
    }

    protected getEffectiveSpeed(): number {
        let spd = this.speed + this.passiveSpeedBonus;
        if (this.speedMultiplier !== 1) spd *= this.speedMultiplier;
        return spd;
    }

    protected applyPassiveRegen(_dtSec: number): void {
        // Aegis overrides this for out-of-combat regen
    }

    /**
     * Try to shoot (called on left click for player)
     */
    tryShoot(scene: MatchScene): void {
        if (this.dead || this.weaponCooldown > 0 || this.isInvisible) return;

        const config = this.getBulletConfig();
        scene.projectilePool.spawn(
            this.position.x + Math.cos(this.angle) * this.radius,
            this.position.y + Math.sin(this.angle) * this.radius,
            config
        );

        // Reset cooldown
        this.weaponCooldown = this.fireRate / this.firingRateMultiplier;
    }

    /**
     * Try to use tactical ability (Q)
     */
    tryTactical(_scene: MatchScene): void {
        if (this.dead || this.tacticalCooldown > 0) return;
        this.onTactical();
        this.tacticalCooldown = this.tacticalMaxCooldown;
    }

    protected onTactical(): void {
        // Override in subclasses
    }

    protected endTactical(): void {
        this.tacticalActive = false;
    }

    /**
     * Try to use ultimate ability (F)
     */
    tryUltimate(_scene: MatchScene): void {
        if (this.dead || this.ultimateCooldown > 0) return;
        this.onUltimate();
        this.ultimateCooldown = this.ultimateMaxCooldown;
    }

    protected onUltimate(): void {
        // Override in subclasses
    }

    protected endUltimate(): void {
        this.ultimateActive = false;
        this.firingRateMultiplier = 1;
    }

    /**
     * Take damage
     */
    takeDamage(amount: number, scene: MatchScene): void {
        if (this.dead || this.invulnerable > 0) return;

        // Apply damage reduction
        const actualDamage = amount * (1 - this.passiveDamageReduction);
        this.hp -= actualDamage;

        // Spawn hit particles
        scene.particleFX.spawnHitFX(this.position.x, this.position.y);

        // Screen shake for player
        if (this.isPlayer) {
            scene.triggerScreenShake(3, 0.1);
        }

        // Check for death
        if (this.hp <= 0) {
            this.hp = 0;
            this.die(scene);
        }

        // Brief invulnerability
        this.invulnerable = 0.1;
    }

    /**
     * Die - drop flag, start respawn
     */
    protected die(scene: MatchScene): void {
        this.dead = true;
        this.dead = true;
        this.respawnTimer = this.respawnTime;

        // Spawn death particles
        scene.particleFX.spawnDeathFX(this.position.x, this.position.y, this.team);

        // Screen shake
        if (this.isPlayer) {
            scene.triggerScreenShake(5, 0.2);
        }

        // Drop flag
        if (scene.flag.carrier === this) {
            scene.flag.drop(this);
        }

        // Announce kill
        const matchScene = scene as any;
        if (matchScene.matchManager) {
            matchScene.matchManager.addKillAnnouncement(this.getDisplayName(), "Unknown");
        }
    }

    protected getDisplayName(): string {
        return this.displayName;
    }

    /**
     * Update death/respawn
     */
    updateDeath(dt: number, scene: MatchScene): void {
        this.respawnTimer -= dt / 1000;

        if (this.respawnTimer <= 0) {
            this.respawn(scene);
        }
    }

    protected respawn(scene: MatchScene): void {
        this.dead = false;
        this.hp = this.maxHp;
        this.invulnerable = 3; // 3 seconds spawn protection

        // Respawn at team base
        if (this.team === "blue") {
            this.position = { ...scene.mapArena.blueBaseSpawn };
        } else {
            this.position = { ...scene.mapArena.orangeBaseSpawn };
        }

        this.velocity = { x: 0, y: 0 };
    }

    /**
     * Render hero as a circle with glow
     */
    render(scene: MatchScene, isPlayerHero: boolean): void {
        const display = MakkoEngine.display;
        const x = this.position.x;
        const y = this.position.y;

        // Invisibility effect
        if (this.isInvisible) {
            display.setGlobalAlpha(0.15);
        } else if (this.invulnerable > 0) {
            display.setGlobalAlpha(0.5 + Math.sin(performance.now() / 50) * 0.3);
        }

        // Outer glow
        display.setGlobalAlpha(display.globalAlpha * 0.4);
        display.drawCircle(x, y, this.radius + 8, {
            fill: this.accentColor,
            blendMode: 'lighter'
        });
        display.setGlobalAlpha(this.isInvisible ? 0.15 : (this.invulnerable > 0 ? 0.5 : 1));

        // Main body circle
        display.drawCircle(x, y, this.radius, {
            fill: this.heroColor,
            stroke: this.accentColor,
            lineWidth: 3,
            shadow: { color: this.accentColor, blur: 10 }
        });

        // Direction indicator (weapon)
        const weaponLen = this.radius * 0.8;
        display.drawLine(
            x, y,
            x + Math.cos(this.angle) * (this.radius + weaponLen),
            y + Math.sin(this.angle) * (this.radius + weaponLen),
            { stroke: this.accentColor, lineWidth: 4 }
        );

        // Player highlight ring
        if (isPlayerHero) {
            display.drawCircle(x, y, this.radius + 4, {
                stroke: "#00ffff",
                lineWidth: 2,
                alpha: 0.7
            });
        }

        // Team color indicator
        const teamRingColor = this.team === "blue" ? "#4a9eff" : "#ff8844";
        display.drawCircle(x, y, this.radius - 5, {
            fill: teamRingColor,
            stroke: "none"
        });

        // Health bar (small, above hero)
        if (this.hp < this.maxHp) {
            const barWidth = 40;
            const barHeight = 4;
            const barX = x - barWidth / 2;
            const barY = y - this.radius - 15;

            display.drawRect(barX, barY, barWidth, barHeight, { fill: "#333" });
            display.drawRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight, {
                fill: this.hp > this.maxHp * 0.3 ? "#40ff40" : "#ff4040"
            });
        }

        display.setGlobalAlpha(1);
    }

    /**
     * Get hitbox for collision
     */
    getHitbox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.position.x - this.radius,
            y: this.position.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}