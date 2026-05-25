import { MakkoEngine } from "@makko/engine";
import { BaseScene } from "../scene/base-scene";
import { Game } from "../game/game";
import { MatchScene } from "./match-scene";

export class PauseScene extends BaseScene {
    readonly id = "pause";

    private selectedOption: number = 0;
    private hoverOption: number = -1;
    private options = ["RESUME", "QUIT TO TITLE"];

    enter(): void {
        this.selectedOption = 0;
        this.hoverOption = -1;
    }

    handleInput(): void {
        const input = MakkoEngine.input;
        if (input.isKeyPressed("ArrowUp") || input.isKeyPressed("KeyW")) {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        }
        if (input.isKeyPressed("ArrowDown") || input.isKeyPressed("KeyS")) {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
        }
        if (input.isKeyPressed("Enter") || input.isKeyPressed("Space")) {
            this.selectOption();
        }
        if (input.isKeyPressed("Escape")) {
            this.resume();
        }
    }

    onMouseMove(x: number, y: number): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        const panelWidth = 400;
        const panelHeight = 300;
        const panelX = (w - panelWidth) / 2;
        const panelY = (h - panelHeight) / 2;

        this.hoverOption = -1;
        const optionY = panelY + 120;
        const optionSpacing = 60;

        this.options.forEach((_, i) => {
            const optY = optionY + i * optionSpacing - 20;
            if (x >= panelX + 50 && x <= panelX + 50 + panelWidth - 100 &&
                y >= optY && y <= optY + 45) {
                this.hoverOption = i;
                this.selectedOption = i;
            }
        });
    }

    onMouseDown(button: number, x: number, y: number): void {
        if (button === 0) {
            if (this.hoverOption !== -1) {
                this.selectedOption = this.hoverOption;
                this.selectOption();
            }
        }
    }

    private selectOption(): void {
        if (this.selectedOption === 0) {
            this.resume();
        } else if (this.selectedOption === 1) {
            (MakkoEngine.instance as Game).popScene();
            (MakkoEngine.instance as Game).switchScene("title");
        }
    }

    private resume(): void {
        const game = MakkoEngine.instance as Game;
        game.popScene();
        const matchScene = game.getActiveScene() as MatchScene;
        if (matchScene && matchScene.inputHandler) {
            matchScene.inputHandler.isPaused = false;
        }
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        display.setGlobalOffset(0, 0);
        display.setGlobalAlpha(0.7);
        display.drawRect(0, 0, w, h, { fill: "#000000" });
        display.setGlobalAlpha(1);

        const panelWidth = 400;
        const panelHeight = 300;
        const panelX = (w - panelWidth) / 2;
        const panelY = (h - panelHeight) / 2;

        display.drawRect(panelX, panelY, panelWidth, panelHeight, {
            fill: "#0d1520",
            stroke: "#00d4ff",
            lineWidth: 3
        });

        display.drawText(w / 2, panelY + 50, "PAUSED", {
            fontSize: 36, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
            textAlign: "center", shadow: { blur: 10, color: "#00d4ff" }
        });

        const optionY = panelY + 120;
        const optionSpacing = 60;

        this.options.forEach((option, i) => {
            const y = optionY + i * optionSpacing;
            const isHovered = this.hoverOption === i;
            const isSelected = i === this.selectedOption;

            const bgColor = isSelected ? "#1a4a8a" : (isHovered ? "#1a2530" : "#0a1525");
            const borderColor = isSelected ? "#00d4ff" : (isHovered ? "#4a6080" : "#2a3a50");

            display.drawRect(panelX + 50, y - 20, panelWidth - 100, 45, {
                fill: bgColor,
                stroke: borderColor,
                lineWidth: isSelected ? 2 : 1
            });

            const textColor = isSelected ? "#ffffff" : (isHovered ? "#aac0d0" : "#6a8aaa");
            display.drawText(w / 2, y, option, {
                fontSize: 20, fontFamily: "Orbitron, sans-serif", fill: textColor,
                textAlign: "center"
            });

            if (isSelected) {
                display.drawText(panelX + 60, y, "\u25B6", {
                    fontSize: 16, fontFamily: "sans-serif", fill: "#00d4ff",
                    textAlign: "left"
                });
            }
        });

        display.drawText(w / 2, panelY + panelHeight - 30, "Press ENTER to select, ESC to resume", {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#4a6080",
            textAlign: "center"
        });
    }
}