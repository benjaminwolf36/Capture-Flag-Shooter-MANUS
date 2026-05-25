import { MakkoEngine } from "@makko/engine";
import { BaseScene } from "../scene/base-scene";
import { MatchScene } from "./match-scene";

export class TacticalOverlay extends BaseScene {
    readonly id = "tactical";

    private currentScale: number = 1;
    private targetScale: number = 0.4;
    private transitionSpeed: number = 5;

    enter(): void {
        this.currentScale = 1;
        this.targetScale = 0.4;
    }

    update(dt: number): void {
        this.currentScale += (this.targetScale - this.currentScale) * dt * this.transitionSpeed;
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        display.setGlobalAlpha(0.85);
        display.drawRect(0, 0, w, h, { fill: "#0a0e1a" });
        display.setGlobalAlpha(1);

        const game = MakkoEngine.instance as any;
        const matchScene = game.getActiveScene() as MatchScene;

        if (!matchScene || !matchScene.mapArena) return;

        const arenaWidth = matchScene.mapArena.width * this.currentScale;
        const arenaHeight = matchScene.mapArena.height * this.currentScale;
        const offsetX = (w - arenaWidth) / 2;
        const offsetY = (h - arenaHeight) / 2;

        display.setGlobalOffset(offsetX, offsetY);
        display.scale(this.currentScale, this.currentScale);

        this.renderMapBase(matchScene);
        this.renderFlag(matchScene);
        this.renderCaptureZones(matchScene);
        this.renderHeroDots(matchScene);

        display.setGlobalOffset(0, 0);
        this.renderTacticalFrame(w, h);
        this.renderLegend(w, h, matchScene);
    }

    private renderMapBase(matchScene: MatchScene): void {
        const display = MakkoEngine.display;
        const map = matchScene.mapArena;

        display.setGlobalAlpha(0.3);
        display.drawRect(0, 0, map.width, map.height, { fill: "#0d1520" });
        display.setGlobalAlpha(1);

        const gridSize = 80;
        display.setGlobalAlpha(0.2);
        for (let x = 0; x < map.width; x += gridSize) {
            display.drawLine(x, 0, x, map.height, { stroke: "#1a3050", lineWidth: 1 });
        }
        for (let y = 0; y < map.height; y += gridSize) {
            display.drawLine(0, y, map.width, y, { stroke: "#1a3050", lineWidth: 1 });
        }
        display.setGlobalAlpha(1);

        display.setGlobalAlpha(0.8);
        for (const wall of map.walls) {
            display.drawRect(wall.x, wall.y, wall.width, wall.height, {
                fill: "#2a3a50",
                stroke: "#4a6080",
                lineWidth: 2
            });
        }
        display.setGlobalAlpha(1);
    }

    private renderFlag(matchScene: MatchScene): void {
        const display = MakkoEngine.display;
        const flag = matchScene.flag;

        display.setGlobalAlpha(0.9);

        let flagColor = "#ffffff";
        if (flag.carrier) {
            flagColor = flag.carrier.team === "blue" ? "#4a9eff" : "#ff8844";
        }

        const size = 20;
        display.drawRect(flag.position.x - size / 2, flag.position.y - size / 2, size, size, {
            fill: flagColor,
            stroke: "#ffffff",
            lineWidth: 2
        });

        display.setGlobalAlpha(1);
    }

    private renderCaptureZones(matchScene: MatchScene): void {
        const display = MakkoEngine.display;
        const map = matchScene.mapArena;

        display.setGlobalAlpha(0.4);
        display.drawRect(map.blueBase.x, map.blueBase.y, map.blueBase.width, map.blueBase.height, {
            fill: "#1a4a8a"
        });
        display.setGlobalAlpha(0.7);
        display.drawRect(map.blueBase.x, map.blueBase.y, map.blueBase.width, map.blueBase.height, {
            stroke: "#4a9eff",
            lineWidth: 3
        });

        display.setGlobalAlpha(0.4);
        display.drawRect(map.orangeBase.x, map.orangeBase.y, map.orangeBase.width, map.orangeBase.height, {
            fill: "#8a4a1a"
        });
        display.setGlobalAlpha(0.7);
        display.drawRect(map.orangeBase.x, map.orangeBase.y, map.orangeBase.width, map.orangeBase.height, {
            stroke: "#ff8844",
            lineWidth: 3
        });

        display.setGlobalAlpha(1);
    }

    private renderHeroDots(matchScene: MatchScene): void {
        const display = MakkoEngine.display;

        if (matchScene.playerHero && matchScene.playerHero.hp > 0) {
            display.setGlobalAlpha(1);
            display.drawCircle(matchScene.playerHero.position.x, matchScene.playerHero.position.y, 15, {
                fill: "#00ffff",
                stroke: "#ffffff",
                lineWidth: 3
            });
        }

        for (const ally of matchScene.allies) {
            if (ally.hp > 0) {
                display.setGlobalAlpha(0.8);
                display.drawCircle(ally.position.x, ally.position.y, 10, {
                    fill: "#4a9eff"
                });
            }
        }

        for (const enemy of matchScene.enemies) {
            if (enemy.hp > 0) {
                display.setGlobalAlpha(0.5);
                display.drawCircle(enemy.position.x, enemy.position.y, 10, {
                    fill: "#ff4040"
                });
            }
        }
    }

    private renderTacticalFrame(w: number, h: number): void {
        const display = MakkoEngine.display;
        const cornerSize = 60;
        const thickness = 4;

        display.setGlobalAlpha(0.8);

        display.drawLine(10, 10, 10 + cornerSize, 10, { stroke: "#a040ff", lineWidth: thickness });
        display.drawLine(10, 10, 10, 10 + cornerSize, { stroke: "#a040ff", lineWidth: thickness });

        display.drawLine(w - 10 - cornerSize, 10, w - 10, 10, { stroke: "#a040ff", lineWidth: thickness });
        display.drawLine(w - 10, 10, w - 10, 10 + cornerSize, { stroke: "#a040ff", lineWidth: thickness });

        display.drawLine(10, h - 10 - cornerSize, 10 + cornerSize, h - 10, { stroke: "#a040ff", lineWidth: thickness });
        display.drawLine(10, h - 10, 10, h - 10 - cornerSize, { stroke: "#a040ff", lineWidth: thickness });

        display.drawLine(w - 10 - cornerSize, h - 10, w - 10, h - 10, { stroke: "#a040ff", lineWidth: thickness });
        display.drawLine(w - 10, h - 10 - cornerSize, w - 10, h - 10, { stroke: "#a040ff", lineWidth: thickness });

        display.setGlobalAlpha(1);
    }

    private renderLegend(w: number, h: number, matchScene: MatchScene): void {
        const display = MakkoEngine.display;

        const legendX = 20;
        const legendY = h - 100;

        display.setGlobalAlpha(0.7);
        display.drawRect(legendX, legendY, 180, 80, {
            fill: "#0a1525",
            stroke: "#4a6080",
            lineWidth: 1
        });
        display.setGlobalAlpha(1);

        display.drawText(legendX + 10, legendY + 20, "TACTICAL VIEW", {
            fontSize: 14, fontFamily: "Orbitron, sans-serif", fill: "#a040ff",
            textAlign: "left"
        });

        display.drawCircle(legendX + 20, legendY + 45, 6, { fill: "#00ffff" });
        display.drawText(legendX + 40, legendY + 45, "You", {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#ffffff",
            textAlign: "left"
        });

        display.drawCircle(legendX + 20, legendY + 65, 5, { fill: "#4a9eff" });
        display.drawText(legendX + 40, legendY + 65, "Ally", {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#ffffff",
            textAlign: "left"
        });

        display.drawCircle(legendX + 100, legendY + 45, 5, { fill: "#ff4040" });
        display.drawText(legendX + 120, legendY + 45, "Enemy", {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#ffffff",
            textAlign: "left"
        });

        display.drawRect(legendX + 95, legendY + 58, 10, 10, { fill: "#ffffff" });
        display.drawText(legendX + 120, legendY + 65, "Flag", {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#ffffff",
            textAlign: "left"
        });

        display.drawText(w - 20, h - 20, "Release T to exit tactical view", {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#6a8aaa",
            textAlign: "right"
        });
    }

    onKeyUp(key: string): void {
        if (key === "KeyT") {
            (MakkoEngine.instance as any).popScene();
        }
    }

    onMouseUp(button: number, x: number, y: number): void {
        if (button === 2) {
            (MakkoEngine.instance as any).popScene();
        }
    }
}