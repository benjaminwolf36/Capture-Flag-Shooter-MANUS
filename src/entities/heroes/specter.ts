import { Hero } from "../hero";
import type { MatchScene } from "../../scenes/match-scene";

export class Specter extends Hero {
    public readonly heroId = "specter";
    public readonly displayName = "SPECTER";
    public readonly heroColor = "#5a3a8a";
    public readonly accentColor = "#a040ff";

    constructor(x: number, y: number, team: string, isPlayer: boolean) {
        super(x, y, team, isPlayer);

        this.maxHp = 150;
        this.hp = this.maxHp;
        this.speed = 320; // Fast base speed (passive)
        this.fireRate = 0.12; // Fast fire rate

        this.tacticalMaxCooldown = 8;
        this.ultimateMaxCooldown = 30;
    }

    protected applyPassiveBonuses(): void {
        this.passiveSpeedBonus = 30; // Phase Walker passive
    }

    protected getBulletColor(): string {
        return "#c080ff";
    }

    protected getBaseDamage(): number {
        return 8;
    }

    protected onTactical(): void {
        // Phase Shift: 2.5s invisibility, cannot shoot
        this.isInvisible = true;
        this.tacticalActive = true;
        this.tacticalDuration = 2.5;
    }

    protected endTactical(): void {
        this.tacticalActive = false;
        this.isInvisible = false;
    }

    protected onUltimate(): void {
        // Void Veil: Slows all enemies in 300px radius for 4s
        this.ultimateActive = true;
        this.ultimateDuration = 4;

        if (!this.isPlayer) return;

        const scene = this.findMatchScene();
        if (!scene) return;

        // Find all enemies and slow them
        for (const enemy of scene.enemies) {
            if (enemy.dead) continue;
            const dx = enemy.position.x - this.position.x;
            const dy = enemy.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 300) {
                enemy.isSlowed = true;
            }
        }
    }

    protected endUltimate(): void {
        this.ultimateActive = false;
    }

    tryShoot(scene: MatchScene): void {
        // Cannot shoot during phase shift
        if (this.isInvisible) return;
        super.tryShoot(scene);
    }

    private findMatchScene(): MatchScene | null {
        // We don't have direct scene reference in update, so this needs
        // to be called from match scene context
        return null;
    }
}