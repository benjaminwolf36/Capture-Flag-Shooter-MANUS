import { MakkoEngine } from "@makko/engine";
import { BaseScene } from "../scene/base-scene";
import { Game } from "../game/game";

export interface HeroData {
    id: string;
    name: string;
    role: string;
    faction: string;
    hp: number;
    speed: number;
    lore: string[];
    passive: string;
    tactical: string;
    ultimate: string;
    color: string;
    accentColor: string;
}

export const HEROES: HeroData[] = [
    {
        id: "vanguard",
        name: "VANGUARD",
        role: "Tank",
        faction: "Core Syndicate",
        hp: 300,
        speed: 220,
        lore: [
            "\u201CWe hold the line so others can advance.\u201D",
            "\u2014 Commander Ryx Holloway"
        ],
        passive: "Armored Core: -10% damage taken, +20 max HP",
        tactical: "DEPLOY SHIELD: Stationary barrier, blocks projectiles for 5s",
        ultimate: "OVERCHARGE: 2x fire rate for 6 seconds",
        color: "#1a4a8a",
        accentColor: "#4a9eff"
    },
    {
        id: "specter",
        name: "SPECTER",
        role: "Scout",
        faction: "Void Nomads",
        hp: 150,
        speed: 320,
        lore: [
            "\u201CI exist between the seconds others waste.\u201D",
            "\u2014 Kira \u201CPhantom\u201D Vex"
        ],
        passive: "Phase Walker: Faster base movement speed",
        tactical: "PHASE SHIFT: 2.5s invisibility, cannot shoot",
        ultimate: "VOID VEIL: Slows all enemies in 300px radius for 4s",
        color: "#2a1a4a",
        accentColor: "#a040ff"
    },
    {
        id: "aegis",
        name: "AEGIS",
        role: "Support",
        faction: "Apex Resistance",
        hp: 200,
        speed: 250,
        lore: [
            "\u201CProtection is not a choice \u2014 it is a duty.\u201D",
            "\u2014 medic-prize Sera Okonkwo"
        ],
        passive: "Field Medic: Slowly regenerate HP out of combat",
        tactical: "HEAL DRONE: Auto-targets nearest damaged ally, burst heal 50 HP",
        ultimate: "RESURRECTION: Revives all dead allies within 400px at 50% HP",
        color: "#1a4a2a",
        accentColor: "#40ff80"
    },
    {
        id: "volt",
        name: "VOLT",
        role: "Damage",
        faction: "Core Syndicate",
        hp: 175,
        speed: 290,
        lore: [
            "\u201CSpeed is the best weapon. Everything else is compromise.\u201D",
            "\u2014 Zed \u201CFlash\u201D Tanaka"
        ],
        passive: "Kinetic Charge: Brief speed boost after a kill",
        tactical: "ARC BOLT: Chain lightning to 2 nearest enemies, 20 dmg each",
        ultimate: "THUNDERSTRUCK DASH: 500px burst forward, 40 dmg to all touched",
        color: "#4a3a1a",
        accentColor: "#ffaa00"
    }
];

export class HeroSelectScene extends BaseScene {
    readonly id = "hero-select";

    private selectedHero: string = "vanguard";
    private cardPositions: { x: number; y: number }[] = [];
    private hoverCard: number = -1;
    private transitionAlpha: number = 0;
    private transitioning: boolean = false;

    enter(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        const cardWidth = 300;
        const cardHeight = 420;
        const spacing = 40;
        const totalWidth = HEROES.length * cardWidth + (HEROES.length - 1) * spacing;
        const startX = (w - totalWidth) / 2;
        const cardY = h * 0.25;

        this.cardPositions = HEROES.map((_, i) => ({
            x: startX + i * (cardWidth + spacing),
            y: cardY
        }));

        this.selectedHero = "vanguard";
        this.hoverCard = -1;
        this.transitionAlpha = 0;
        this.transitioning = false;
    }

    update(dt: number): void {
        if (this.transitioning) {
            this.transitionAlpha += dt * 3;
            if (this.transitionAlpha >= 1) {
                (MakkoEngine.instance as Game).switchScene("match");
            }
        }

        const mx = MakkoEngine.input.mouseX;
        const my = MakkoEngine.input.mouseY;
        this.hoverCard = -1;

        HEROES.forEach((_, i) => {
            const pos = this.cardPositions[i];
            if (mx >= pos.x && mx <= pos.x + 300 && my >= pos.y && my <= pos.y + 420) {
                this.hoverCard = i;
            }
        });
    }

    handleInput(): void {
        if (MakkoEngine.input.isKeyPressed("Enter") || MakkoEngine.input.isKeyPressed("Space")) {
            if (!this.transitioning) {
                this.doDeploy();
            }
        }
    }

    onMouseDown(button: number, x: number, y: number): void {
        if (this.transitioning) return;

        HEROES.forEach((hero, i) => {
            const pos = this.cardPositions[i];
            if (x >= pos.x && x <= pos.x + 300 && y >= pos.y && y <= pos.y + 420) {
                this.selectedHero = hero.id;
            }
        });

        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;
        const btnX = w / 2 - 100;
        const btnY = h - 65;
        if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 50) {
            this.doDeploy();
        }
    }

    private doDeploy(): void {
        (MakkoEngine.instance as Game).selectedHeroId = this.selectedHero;
        this.transitioning = true;
    }

    render(): void {
        const display = MakkoEngine.display;
        const w = display.width;
        const h = display.height;

        display.setGlobalOffset(0, 0);
        display.drawRect(0, 0, w, h, { fill: "#080c14" });

        display.drawText(w / 2, 60, "SELECT YOUR SYNC-RUNNER", {
            fontSize: 42, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
            textAlign: "center", shadow: { blur: 15, color: "#00d4ff" }
        });

        display.drawText(w / 2, 100, "Choose your hero to enter the Flagfall Arena", {
            fontSize: 18, fontFamily: "Rajdhani, sans-serif", fill: "#6a8aaa",
            textAlign: "center"
        });

        HEROES.forEach((hero, i) => {
            const pos = this.cardPositions[i];
            const isSelected = hero.id === this.selectedHero;
            const isHovered = this.hoverCard === i;
            this.renderHeroCard(hero, pos.x, pos.y, isSelected, isHovered);
        });

        const selectedHero = HEROES.find(h => h.id === this.selectedHero)!;
        this.renderHeroDetail(selectedHero, w / 2, h - 180);
        this.renderDeployButton(w / 2, h - 40);

        if (this.transitioning) {
            display.setGlobalAlpha(this.transitionAlpha);
            display.drawRect(0, 0, w, h, { fill: "#000000" });
            display.setGlobalAlpha(1);
            display.drawText(w / 2, h / 2, "SYNC LINKING...", {
                fontSize: 48, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
                textAlign: "center"
            });
        }
    }

    private renderHeroCard(hero: HeroData, x: number, y: number, selected: boolean, hovered: boolean): void {
        const display = MakkoEngine.display;
        const cardWidth = 300;
        const cardHeight = 420;

        const bgColor = selected ? hero.color : (hovered ? "#1a2530" : "#0d1520");
        const borderColor = selected ? hero.accentColor : (hovered ? "#4a6080" : "#2a3a50");
        const borderWidth = selected ? 3 : 2;

        display.drawRect(x, y, cardWidth, cardHeight, {
            fill: bgColor,
            stroke: borderColor,
            lineWidth: borderWidth
        });

        if (selected) {
            display.setGlobalAlpha(0.2);
            display.drawRect(x - 5, y - 5, cardWidth + 10, cardHeight + 10, {
                fill: "none",
                stroke: hero.accentColor,
                lineWidth: 2
            });
            display.setGlobalAlpha(1);
        }

        const centerX = x + cardWidth / 2;
        const avatarY = y + 80;

        display.setGlobalAlpha(0.3);
        display.drawCircle(centerX, avatarY, 50, { fill: hero.accentColor });
        display.setGlobalAlpha(1);
        display.drawCircle(centerX, avatarY, 40, { fill: hero.color, stroke: hero.accentColor, lineWidth: 3 });

        display.drawText(centerX, y + 150, hero.name, {
            fontSize: 28, fontFamily: "Orbitron, sans-serif", fill: "#ffffff",
            textAlign: "center"
        });

        display.drawRect(x + 90, y + 165, 120, 24, { fill: hero.accentColor, stroke: "none" });
        display.drawText(centerX, y + 177, hero.role.toUpperCase(), {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#000000",
            textAlign: "center"
        });

        display.drawText(centerX, y + 200, hero.faction, {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#8090a0",
            textAlign: "center"
        });

        const barWidth = 200;
        const barX = x + (cardWidth - barWidth) / 2;
        this.renderStatBar(barX, y + 230, barWidth, 12, hero.hp, 300, "#ff4040", "HP");
        this.renderStatBar(barX, y + 255, barWidth, 12, hero.speed, 320, "#40ff80", "SPD");

        display.drawText(centerX, y + 295, hero.lore[0], {
            fontSize: 13, fontFamily: "Rajdhani, sans-serif", fill: "#8aa0b0",
            textAlign: "center"
        });
        display.drawText(centerX, y + 312, hero.lore[1], {
            fontSize: 12, fontFamily: "Rajdhani, sans-serif", fill: "#607080",
            textAlign: "center"
        });

        display.drawText(x + 40, y + cardHeight - 30, "Q: " + hero.tactical.substring(0, 20) + "...", {
            fontSize: 11, fontFamily: "Rajdhani, sans-serif", fill: "#7090a0",
            textAlign: "left"
        });
        display.drawText(x + 40, y + cardHeight - 15, "F: " + hero.ultimate.substring(0, 20) + "...", {
            fontSize: 11, fontFamily: "Rajdhani, sans-serif", fill: "#7090a0",
            textAlign: "left"
        });
    }

    private renderStatBar(x: number, y: number, width: number, height: number, value: number, max: number, color: string, label: string): void {
        const display = MakkoEngine.display;
        display.drawRect(x, y, width, height, { fill: "#1a2530" });
        const fillWidth = (value / max) * width;
        display.drawRect(x, y, fillWidth, height, { fill: color });
        display.drawText(x + 5, y + height / 2, label, {
            fontSize: 10, fontFamily: "Rajdhani, sans-serif", fill: "#ffffff",
            textAlign: "left"
        });
    }

    private renderHeroDetail(hero: HeroData, x: number, y: number): void {
        const display = MakkoEngine.display;
        display.drawRect(x - 400, y - 60, 800, 120, {
            fill: "#0d1520",
            stroke: hero.accentColor,
            lineWidth: 2
        });

        display.drawText(x - 380, y - 40, "PASSIVE:", {
            fontSize: 14, fontFamily: "Orbitron, sans-serif", fill: "#6a8aaa",
            textAlign: "left"
        });
        display.drawText(x - 250, y - 40, hero.passive, {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#aac0d0",
            textAlign: "left"
        });

        display.drawText(x - 380, y - 10, "Q  TACTICAL:", {
            fontSize: 14, fontFamily: "Orbitron, sans-serif", fill: "#00d4ff",
            textAlign: "left"
        });
        display.drawText(x - 250, y - 10, hero.tactical, {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#aac0d0",
            textAlign: "left"
        });

        display.drawText(x - 380, y + 20, "F  ULTIMATE:", {
            fontSize: 14, fontFamily: "Orbitron, sans-serif", fill: "#ff6b35",
            textAlign: "left"
        });
        display.drawText(x - 250, y + 20, hero.ultimate, {
            fontSize: 14, fontFamily: "Rajdhani, sans-serif", fill: "#aac0d0",
            textAlign: "left"
        });

        display.drawText(x + 200, y - 20, "[Q] Tactical Ability", {
            fontSize: 16, fontFamily: "Rajdhani, sans-serif", fill: "#00d4ff",
            textAlign: "right"
        });
        display.drawText(x + 200, y + 10, "[F] Ultimate Ability", {
            fontSize: 16, fontFamily: "Rajdhani, sans-serif", fill: "#ff6b35",
            textAlign: "right"
        });
        display.drawText(x + 200, y + 40, "[T] Parallax View", {
            fontSize: 16, fontFamily: "Rajdhani, sans-serif", fill: "#a040ff",
            textAlign: "right"
        });
    }

    private renderDeployButton(x: number, y: number): void {
        const display = MakkoEngine.display;
        const btnWidth = 200;
        const btnHeight = 50;

        display.drawRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, {
            fill: "#00d4ff",
            stroke: "#ffffff",
            lineWidth: 2
        });

        display.drawText(x, y, "DEPLOY", {
            fontSize: 24, fontFamily: "Orbitron, sans-serif", fill: "#000000",
            textAlign: "center"
        });
    }
}