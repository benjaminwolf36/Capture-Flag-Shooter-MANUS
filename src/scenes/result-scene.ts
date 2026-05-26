import { MakkoEngine } from "../engine";
import { BaseScene } from "../scene/base-scene";
import { Game } from "../game/game";

export class ResultScene extends BaseScene {
    readonly id = "result";

    private animateTimer: number = 0;
    private showStats: boolean = false;
    private showButtons: boolean = false;

    enter(): void {
        this.animateTimer = 0;
        this.showStats = false;
        this.showButtons = false;
    }

    update(dt: number): void {
        this.animateTimer += dt;

        if (this.animateTimer > 1.5 && !this.showStats) {
            this.showStats = true;
        }
        if (this.animateTimer > 2.5 && !this.showButtons) {
            this.showButtons = true;
        }
    }

    handleInput(): void {
        if (this.showButtons) {
            if (MakkoEngine.input.isKeyPressed("Enter") || MakkoEngine.input.isKeyPressed("Space")) {
                (MakkoEngine.instance as Game).switchScene("hero-select");
            }
        }
    }

    onMouseDown(button: number, x: number, y: number): void {
        if (!this.showButtons) return;

        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        const btnY = h * 0.85;
        const btnWidth = 180;
        const btnHeight = 50;
        const spacing = 30;

        const hsBtnX = w / 2 - btnWidth - spacing / 2;
        if (x >= hsBtnX && x <= hsBtnX + btnWidth && y >= btnY - btnHeight / 2 && y <= btnY + btnHeight / 2) {
            (MakkoEngine.instance as Game).switchScene("hero-select");
            return;
        }

        const rtBtnX = w / 2 + spacing / 2;
        if (x >= rtBtnX && x <= rtBtnX + btnWidth && y >= btnY - btnHeight / 2 && y <= btnY + btnHeight / 2) {
            (MakkoEngine.instance as Game).switchScene("title");
        }
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;
        const game = MakkoEngine.instance as Game;

        display.setGlobalOffset(0, 0);

        const isVictory = game.matchWinner === "Blue";
        const bgColor = isVictory ? "#0a1a2a" : "#2a1a0a";
        display.drawRect(0, 0, w, h, { fill: bgColor });

        const gridOffset = (this.animateTimer * 20) % 40;
        display.setGlobalAlpha(0.2);
        for (let x = -40 + gridOffset; x < w + 40; x += 40) {
            display.drawLine(x, 0, x, h, { stroke: isVictory ? "#00d4ff" : "#ff6b35", lineWidth: 1 });
        }
        for (let y = -40 + gridOffset; y < h + 40; y += 40) {
            display.drawLine(0, y, w, y, { stroke: isVictory ? "#00d4ff" : "#ff6b35", lineWidth: 1 });
        }
        display.setGlobalAlpha(1);

        const mainText = isVictory ? "VICTORY NEXUS" : "DEFEAT";
        const mainColor = isVictory ? "#00d4ff" : "#ff4040";

        if (this.animateTimer > 0.5) {
            const alpha = Math.min(1, (this.animateTimer - 0.5) * 2);
            display.setGlobalAlpha(alpha);

            display.drawText(w / 2, h * 0.2, mainText, {
                fontSize: 72, fontFamily: "Orbitron, sans-serif", fill: mainColor,
                textAlign: "center", shadow: { blur: 30, color: mainColor }
            });

            display.setGlobalAlpha(1);
        }

        if (this.animateTimer > 1) {
            const alpha = Math.min(1, (this.animateTimer - 1) * 2);
            display.setGlobalAlpha(alpha);

            const winnerText = game.matchWinner.toUpperCase() + " TEAM WINS";
            const winnerColor = isVictory ? "#4a9eff" : "#ff8844";

            display.drawText(w / 2, h * 0.32, winnerText, {
                fontSize: 32, fontFamily: "Orbitron, sans-serif", fill: winnerColor,
                textAlign: "center"
            });

            display.setGlobalAlpha(1);
        }

        if (this.showStats && game.matchStats) {
            const panelWidth = 500;
            const panelHeight = 200;
            const panelX = (w - panelWidth) / 2;
            const panelY = h * 0.45;

            display.drawRect(panelX, panelY, panelWidth, panelHeight, {
                fill: "#0d1520",
                stroke: "#4a6080",
                lineWidth: 2
            });

            display.drawText(w / 2, panelY + 30, "MATCH STATISTICS", {
                fontSize: 20, fontFamily: "Orbitron, sans-serif", fill: "#6a8aaa",
                textAlign: "center"
            });

            const statY = panelY + 80;
            const stats = [
                { label: "KILLS", value: game.matchStats.kills.toString() },
                { label: "CAPTURES", value: game.matchStats.captures.toString() },
                { label: "TIME", value: Math.floor(game.matchStats.time).toString() + "s" }
            ];

            const colWidth = panelWidth / 3;
            stats.forEach((stat, i) => {
                const colX = panelX + colWidth * i + colWidth / 2;

                display.drawText(colX, statY, stat.value, {
                    fontSize: 36, fontFamily: "Orbitron, sans-serif", fill: "#ffffff",
                    textAlign: "center"
                });
                display.drawText(colX, statY + 40, stat.label, {
                    fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#6a8aaa",
                    textAlign: "center"
                });
            });

            display.drawLine(panelX + 50, panelY + 70, panelX + panelWidth - 50, panelY + 70, {
                stroke: "#2a3a50",
                lineWidth: 1
            });
        }

        if (this.showButtons) {
            const btnY = h * 0.85;
            const btnWidth = 180;
            const btnHeight = 50;
            const spacing = 30;

            const hsBtnX = w / 2 - btnWidth - spacing / 2;
            display.drawRect(hsBtnX, btnY - btnHeight / 2, btnWidth, btnHeight, {
                fill: "#1a4a8a",
                stroke: "#4a9eff",
                lineWidth: 2
            });
            display.drawText(w / 2 - spacing / 2, btnY, "HERO SELECT", {
                fontSize: 18, fontFamily: "Orbitron, sans-serif", fill: "#ffffff",
                textAlign: "center"
            });

            const rtBtnX = w / 2 + spacing / 2;
            display.drawRect(rtBtnX, btnY - btnHeight / 2, btnWidth, btnHeight, {
                fill: "#0d1520",
                stroke: "#4a6080",
                lineWidth: 2
            });
            display.drawText(w / 2 + btnWidth / 2 + spacing / 2, btnY, "TITLE", {
                fontSize: 18, fontFamily: "Orbitron, sans-serif", fill: "#6a8aaa",
                textAlign: "center"
            });
        }

        display.drawText(w / 2, h - 40, "Press ENTER to continue", {
            fontSize: 16, fontFamily: "Rajdhani, sans-serif", fill: "#4a6080",
            textAlign: "center"
        });
    }
}