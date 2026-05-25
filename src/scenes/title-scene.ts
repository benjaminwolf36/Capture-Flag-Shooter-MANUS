import { MakkoEngine } from "@makko/engine";
import { BaseScene } from "../scene/base-scene";
import { Game } from "../game/game";

export class TitleScene extends BaseScene {
    readonly id = "title";

    private loreScrollY: number = 0;
    private loreComplete: boolean = false;
    private showPrompt: boolean = false;
    private promptAlpha: number = 0;
    private logoPhase: number = 0;
    private scanLineOffset: number = 0;
    private gridOffset: number = 0;

    enter(): void {
        this.loreScrollY = 0;
        this.loreComplete = false;
        this.showPrompt = false;
        this.promptAlpha = 0;
    }

    update(dt: number): void {
        if (!this.loreComplete) {
            this.loreScrollY += dt * 15;
            if (this.loreScrollY > 600) {
                this.loreComplete = true;
                this.loreScrollY = 600;
            }
        } else {
            this.promptAlpha = Math.min(1, this.promptAlpha + dt * 2);
        }

        this.logoPhase += dt * 2;
        this.scanLineOffset = (this.scanLineOffset + dt * 50) % 4;
        this.gridOffset += dt * 20;
    }

    handleInput(): void {
        // Bridge engine input to scene handlers
        const input = MakkoEngine.input;
        if (input.isKeyPressed("Enter") || input.isKeyPressed("Space")) {
            if (this.loreComplete) {
                (MakkoEngine.instance as Game).switchScene("hero-select");
            }
        }
        // Mouse click handled via onMouseDown
    }

    onKeyDown(key: string): void {
        if ((key === "Enter" || key === "Space") && this.loreComplete) {
            (MakkoEngine.instance as Game).switchScene("hero-select");
        }
    }

    onMouseDown(button: number, x: number, y: number): void {
        if (this.loreComplete) {
            (MakkoEngine.instance as Game).switchScene("hero-select");
        }
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        display.setGlobalOffset(0, 0);
        display.drawRect(0, 0, w, h, { fill: "#0a0e1a" });

        const gridSize = 40;
        const offsetMod = this.gridOffset % gridSize;
        for (let x = -gridSize + offsetMod; x < w + gridSize; x += gridSize) {
            display.drawLine(x, 0, x, h, { stroke: "#1a3050", lineWidth: 1 });
        }
        for (let y = -gridSize + offsetMod; y < h + gridSize; y += gridSize) {
            display.drawLine(0, y, w, y, { stroke: "#1a3050", lineWidth: 1 });
        }

        const logoY = h * 0.25 + Math.sin(this.logoPhase) * 5;

        display.setGlobalAlpha(0.3);
        display.drawText(w / 2, logoY - 60, "PARALLAX", {
            fontSize: 96, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
            textAlign: "center", shadow: { blur: 40, color: "#00d4ff" }
        });
        display.setGlobalAlpha(1);

        display.drawText(w / 2, logoY - 20, "PARALLAX", {
            fontSize: 96, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
            textAlign: "center", shadow: { blur: 20, color: "#00d4ff" }
        });

        display.drawText(w / 2, logoY + 50, "FLAGFALL", {
            fontSize: 64, fontFamily: "Orbitron, sans-serif", fill: "#ff6b35",
            textAlign: "center", shadow: { blur: 15, color: "#ff6b35" }
        });

        display.setGlobalAlpha(0.1);
        for (let y = this.scanLineOffset; y < h; y += 4) {
            display.drawLine(0, y, w, y, { stroke: "#00d4ff", lineWidth: 1 });
        }
        display.setGlobalAlpha(1);

        display.drawRect(w * 0.15, h * 0.5, w * 0.7, 200, { fill: "#0a1525", stroke: "#00d4ff", lineWidth: 2 });

        const loreText = [
            "YEAR 2187 — THE GREAT DISCONTINUITY reshaped Earth's political landscape.",
            "Territorial disputes that once required armies now settle in the Flagfall Arena.",
            "Sync-Runners, rare individuals capable of interfacing with Parallax Sync technology,",
            "battle to capture Data Flags in arenas that double as sacred ground.",
            "Three factions compete: the Core Syndicate, the Apex Resistance, and the Void Nomads.",
            "Neural-link to the Parallax grants perception of both tactical overhead",
            "and ground-level combat simultaneously. The edge belongs to those who Sync."
        ].join("\n");

        display.drawText(w / 2, h * 0.5 + 100 - this.loreScrollY * 0.4 + 400, loreText, {
            fontSize: 18, fontFamily: "Rajdhani, sans-serif", fill: "#8ab4d4",
            textAlign: "center", lineHeight: 28
        });

        if (this.showPrompt || this.loreComplete) {
            const alpha = this.loreComplete ? this.promptAlpha : (this.loreScrollY > 500 ? (this.loreScrollY - 500) / 100 : 0);
            display.setGlobalAlpha(alpha);
            const pulse = 0.7 + Math.sin(this.logoPhase * 3) * 0.3;
            display.setGlobalAlpha(alpha * pulse);
            display.drawText(w / 2, h * 0.92, "PRESS ENTER OR CLICK TO CONTINUE", {
                fontSize: 24, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
                textAlign: "center", shadow: { blur: 10, color: "#00d4ff" }
            });
            display.setGlobalAlpha(1);
        }
    }
}