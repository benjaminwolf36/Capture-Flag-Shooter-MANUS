import { MakkoEngine } from "@makko/engine";
import { Hero } from "../hero";
import type { MatchScene } from "../../scenes/match-scene";

export class Vanguard extends Hero {
    public readonly heroId = "vanguard";
    public readonly displayName = "VANGUARD";
    public readonly heroColor = "#3a6a9a";
    public readonly accentColor = "#4a9eff";

    private shieldActive: boolean = false;
    private shieldX: number = 0;
    private shieldY: number = 0;
    private shieldAngle: number = 0;

    constructor(x: number, y: number, team: string, isPlayer: boolean) {
        super(x, y, team, isPlayer);

        this.maxHp = 300;
        this.hp = this.maxHp;
        this.speed = 220;
        this.fireRate = 0.4;

        this.tacticalMaxCooldown = 10;
        this.ultimateMaxCooldown = 30;
    }

    protected applyPassiveBonuses(): void {
        this.passiveDamageReduction = 0.1;
        this.passiveMaxHpBonus = 20;
        this.maxHp = 300 + 20;
        if (this.hp > 0) this.hp = Math.min(this.hp, this.maxHp);
    }

    protected getBulletColor(): string {
        return this.team === "blue" ? "#6ab4ff" : "#ffaa66";
    }

    protected getBaseDamage(): number {
        return 20;
    }

    protected onTactical(): void {
        this.shieldActive = true;
        this.tacticalActive = true;
        this.tacticalDuration = 5;
        this.shieldX = this.position.x + Math.cos(this.angle) * 40;
        this.shieldY = this.position.y + Math.sin(this.angle) * 40;
        this.shieldAngle = this.angle;
    }

    protected endTactical(): void {
        this.tacticalActive = false;
        this.shieldActive = false;
    }

    protected onUltimate(): void {
        this.ultimateActive = true;
        this.ultimateDuration = 6;
        this.firingRateMultiplier = 2;
    }

    protected endUltimate(): void {
        this.ultimateActive = false;
        this.firingRateMultiplier = 1;
    }

    render(scene: MatchScene, isPlayerHero: boolean): void {
        super.render(scene, isPlayerHero);

        if (this.shieldActive) {
            const display = MakkoEngine.display;

            // Draw shield as a rotated rectangle
            display.setGlobalAlpha(0.7);
            display.drawRect(
                this.shieldX - 30,
                this.shieldY - 50,
                60,
                100,
                {
                    fill: "#4a9eff",
                    stroke: "#ffffff",
                    lineWidth: 3
                }
            );
            display.setGlobalAlpha(1);

            // Shield HP indicator
            const shieldPct = this.tacticalDuration / 5;
            display.drawRect(
                this.shieldX - 25,
                this.shieldY + 50,
                50 * shieldPct,
                4,
                { fill: "#40ff80" }
            );
        }
    }

    getShieldBounds(): { x: number; y: number; width: number; height: number } | null {
        if (!this.shieldActive) return null;
        return { x: this.shieldX - 30, y: this.shieldY - 50, width: 60, height: 100 };
    }
}