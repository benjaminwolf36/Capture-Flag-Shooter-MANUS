import { MakkoEngine } from "@makko/engine";
import { BaseScene } from "../scene/base-scene";
import { Game } from "../game/game";
import { MapArena } from "../entities/map-arena";
import { Camera } from "../systems/camera";
import { InputHandler } from "../systems/input-handler";
import { MatchManager } from "../systems/match-manager";
import { Hero } from "../entities/hero";
import { Vanguard } from "../entities/heroes/vanguard";
import { Specter } from "../entities/heroes/specter";
import { Aegis } from "../entities/heroes/aegis";
import { Volt } from "../entities/heroes/volt";
import { Flag } from "../entities/flag";
import { ProjectilePool } from "../projectile/projectile-pool";
import { CombatFX } from "../combat/particle-fx";
import { AiController } from "../entities/ai-controller";
import { HUD } from "../ui/hud";

export class MatchScene extends BaseScene {
    readonly id = "match";

    public mapArena!: MapArena;
    public camera!: Camera;
    public inputHandler!: InputHandler;
    public matchManager!: MatchManager;
    public projectilePool!: ProjectilePool;
    public particleFX!: CombatFX;
    public hud!: HUD;

    public playerHero!: Hero;
    public allies: Hero[] = [];
    public enemies: Hero[] = [];
    public flag!: Flag;
    public aiControllers: AiController[] = [];

    private matchIntroTimer: number = 3;
    private matchIntro: boolean = true;
    private timeScale: number = 1;
    private slowMoTimer: number = 0;
    private slowMoDuration: number = 0;
    private screenShakeIntensity: number = 0;
    private screenShakeTimer: number = 0;
    private lowHpVignette: number = 0;
    private captureBanner: string = "";
    private captureBannerTimer: number = 0;

    enter(): void {
        const game = MakkoEngine.instance as Game;
        const selectedHeroId = game.selectedHeroId || "vanguard";

        this.mapArena = new MapArena();
        this.camera = new Camera(this.mapArena);
        this.inputHandler = new InputHandler();
        this.matchManager = new MatchManager();
        this.projectilePool = new ProjectilePool(30);
        this.particleFX = new CombatFX();

        this.playerHero = this.createHero(selectedHeroId, this.mapArena.blueBaseSpawn, "blue", true);

        const allyHeroes = ["specter", "aegis"];
        this.allies = allyHeroes.map((heroId, i) => {
            const spawn = {
                x: this.mapArena.blueBaseSpawn.x + (i - 0.5) * 100,
                y: this.mapArena.blueBaseSpawn.y + 50
            };
            return this.createHero(heroId, spawn, "blue", false);
        });

        const enemyHeroes = ["vanguard", "volt", "specter"];
        this.enemies = enemyHeroes.map((heroId, i) => {
            const spawn = {
                x: this.mapArena.orangeBaseSpawn.x + (i - 1) * 80,
                y: this.mapArena.orangeBaseSpawn.y + (i % 2) * 60
            };
            return this.createHero(heroId, spawn, "orange", false);
        });

        this.flag = new Flag(this.mapArena.flagSpawn);
        this.aiControllers = [...this.allies, ...this.enemies].map(hero => new AiController(hero, this));
        this.hud = new HUD(this);

        this.matchIntroTimer = 3;
        this.matchIntro = true;
        this.timeScale = 1;
        this.slowMoTimer = 0;
        this.screenShakeIntensity = 0;
        this.screenShakeTimer = 0;
        this.lowHpVignette = 0;
        this.captureBanner = "";
        this.captureBannerTimer = 0;
    }

    exit(): void {
        // Cleanup if needed
    }

    private createHero(heroId: string, spawn: { x: number; y: number }, team: string, isPlayer: boolean): Hero {
        switch (heroId) {
            case "vanguard":
                return new Vanguard(spawn.x, spawn.y, team, isPlayer);
            case "specter":
                return new Specter(spawn.x, spawn.y, team, isPlayer);
            case "aegis":
                return new Aegis(spawn.x, spawn.y, team, isPlayer);
            case "volt":
                return new Volt(spawn.x, spawn.y, team, isPlayer);
            default:
                return new Vanguard(spawn.x, spawn.y, team, isPlayer);
        }
    }

    update(dt: number): void {
        const scaledDt = dt * this.timeScale;

        if (this.matchIntro) {
            this.matchIntroTimer -= dt;
            if (this.matchIntroTimer <= 0) {
                this.matchIntro = false;
            }
            return;
        }

        if (this.inputHandler.isPaused) return;

        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= dt;
            if (this.slowMoTimer <= 0) {
                this.timeScale = 1;
            }
        }

        if (this.screenShakeTimer > 0) {
            this.screenShakeTimer -= dt;
        }

        if (this.playerHero && this.playerHero.hp > 0) {
            const hpPercent = this.playerHero.hp / this.playerHero.maxHp;
            this.lowHpVignette = hpPercent < 0.3 ? (1 - hpPercent / 0.3) * 0.5 : 0;
        }

        if (this.captureBannerTimer > 0) {
            this.captureBannerTimer -= dt;
        }

        if (this.playerHero && this.playerHero.hp > 0) {
            const worldMouse = this.camera.screenToWorld(this.inputHandler.mouseX, this.inputHandler.mouseY);
            this.playerHero.update(scaledDt, this.inputHandler, worldMouse, this);
        }

        for (const ally of this.allies) {
            if (ally.hp > 0) {
                ally.update(scaledDt, null, null, this);
            } else {
                ally.updateDeath(dt, this);
            }
        }

        for (const enemy of this.enemies) {
            if (enemy.hp > 0) {
                enemy.update(scaledDt, null, null, this);
            } else {
                enemy.updateDeath(dt, this);
            }
        }

        for (const ai of this.aiControllers) {
            ai.update(scaledDt);
        }

        this.flag.update(scaledDt, this);
        this.projectilePool.update(scaledDt, this);
        this.matchManager.update(scaledDt, this);
        this.camera.update(dt, this.playerHero.position);
        this.hud.update(dt);

        if (this.matchManager.gameOver) {
            const game = MakkoEngine.instance as Game;
            const winner = this.matchManager.blueScore >= 3 ? "Blue" : "Orange";
            game.matchWinner = winner;
            game.matchStats = {
                kills: this.matchManager.blueScore >= 3 ? 15 : 12,
                captures: this.matchManager.blueScore >= 3 ? 3 : 2,
                time: 180 - this.matchManager.matchTimer
            };
            game.switchScene("result");
        }
    }

    handleInput(): void {
        const input = MakkoEngine.input;

        if (input.isKeyPressed("Escape")) {
            this.inputHandler.isPaused = !this.inputHandler.isPaused;
            if (this.inputHandler.isPaused) {
                (MakkoEngine.instance as Game).pushScene("pause");
            }
        }

        if (input.isKeyPressed("KeyT") && !this.matchIntro) {
            (MakkoEngine.instance as Game).pushScene("tactical");
        }
    }

    onKeyDown(key: string): void {
        if (key === "Escape") {
            this.inputHandler.isPaused = !this.inputHandler.isPaused;
            if (this.inputHandler.isPaused) {
                (MakkoEngine.instance as Game).pushScene("pause");
            }
        }
        if (key === "KeyT" && !this.matchIntro) {
            (MakkoEngine.instance as Game).pushScene("tactical");
        }
        if (key === "KeyQ" && !this.matchIntro && this.playerHero && this.playerHero.hp > 0) {
            this.playerHero.tryTactical(this);
        }
        if (key === "KeyF" && !this.matchIntro && this.playerHero && this.playerHero.hp > 0) {
            this.playerHero.tryUltimate(this);
        }
    }

    onKeyUp(key: string): void {
        if (key === "KeyT") {
            (MakkoEngine.instance as Game).popScene();
        }
    }

    onMouseDown(button: number, x: number, y: number): void {
        if (this.matchIntro || this.inputHandler.isPaused) return;

        if (button === 0 && this.playerHero && this.playerHero.hp > 0) {
            this.playerHero.tryShoot(this);
        }

        if (button === 2) {
            if (MakkoEngine.input.isKeyDown("KeyT")) {
                (MakkoEngine.instance as Game).popScene();
            } else {
                (MakkoEngine.instance as Game).pushScene("tactical");
            }
        }
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        let shakeX = 0, shakeY = 0;
        if (this.screenShakeTimer > 0) {
            shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
            shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
        }

        display.setGlobalOffset(
            -this.camera.x + w / 2 + shakeX,
            -this.camera.y + h / 2 + shakeY
        );

        this.mapArena.render(this);
        this.flag.render(this);

        if (this.playerHero && this.playerHero.hp > 0) {
            this.playerHero.render(this, true);
        }
        for (const ally of this.allies) {
            if (ally.hp > 0) ally.render(this, false);
        }
        for (const enemy of this.enemies) {
            if (enemy.hp > 0) enemy.render(this, false);
        }

        this.projectilePool.render(this);
        this.particleFX.render(this);

        display.setGlobalOffset(0, 0);
        this.hud.render();

        if (this.matchIntro) {
            display.setGlobalAlpha(0.8);
            display.drawRect(0, 0, w, h, { fill: "#000000" });
            display.setGlobalAlpha(1);

            const introText = this.matchIntroTimer > 0 ?
                "SYNC ESTABLISHED..." :
                "GO!";
            const fontSize = this.matchIntroTimer > 0 ? 48 : 72;

            display.drawText(w / 2, h / 2, introText, {
                fontSize: fontSize, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
                textAlign: "center", shadow: { blur: 20, color: "#00d4ff" }
            });
        }

        if (this.captureBannerTimer > 0) {
            const alpha = Math.min(1, this.captureBannerTimer * 2);
            display.setGlobalAlpha(alpha);
            display.drawText(w / 2, h / 3, this.captureBanner, {
                fontSize: 48, fontFamily: "Orbitron, sans-serif", fill: "#ff6b35",
                textAlign: "center", shadow: { blur: 15, color: "#ff6b35" }
            });
            display.setGlobalAlpha(1);
        }

        if (this.lowHpVignette > 0) {
            display.setGlobalAlpha(this.lowHpVignette);
            const cornerSize = 150;
            display.drawRect(0, 0, cornerSize, cornerSize, { fill: "#ff0000" });
            display.drawRect(w - cornerSize, 0, cornerSize, cornerSize, { fill: "#ff0000" });
            display.drawRect(0, h - cornerSize, cornerSize, cornerSize, { fill: "#ff0000" });
            display.drawRect(w - cornerSize, h - cornerSize, cornerSize, cornerSize, { fill: "#ff0000" });
            display.setGlobalAlpha(1);
        }

        if (this.inputHandler.isKeyDown("KeyT")) {
            display.drawText(w - 20, h - 20, "PARALLAX VIEW ACTIVE", {
                fontSize: 16, fontFamily: "Orbitron, sans-serif", fill: "#a040ff",
                textAlign: "right"
            });
        }
    }

    triggerSlowMo(duration: number): void {
        this.slowMoDuration = duration;
        this.slowMoTimer = duration;
        this.timeScale = 0.2;
    }

    triggerScreenShake(intensity: number, duration: number): void {
        this.screenShakeIntensity = intensity;
        this.screenShakeTimer = duration;
    }

    showCaptureBanner(text: string): void {
        this.captureBanner = text;
        this.captureBannerTimer = 3;
    }
}