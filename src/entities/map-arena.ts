import { MakkoEngine } from "@makko/engine";
import type { MatchScene } from "../scenes/match-scene";

export interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Zone {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class MapArena {
    public readonly width: number = 2400;
    public readonly height: number = 1600;

    public readonly walls: Wall[] = [];
    public readonly blueBase: Zone;
    public readonly orangeBase: Zone;
    public readonly blueBaseSpawn: { x: number; y: number };
    public readonly orangeBaseSpawn: { x: number; y: number };
    public readonly flagSpawn: { x: number; y: number };

    constructor() {
        const w = this.width;
        const h = this.height;

        // Blue base (left side)
        this.blueBase = { x: 50, y: h / 2 - 150, width: 180, height: 300 };
        this.blueBaseSpawn = { x: 130, y: h / 2 };

        // Orange base (right side)
        this.orangeBase = { x: w - 230, y: h / 2 - 150, width: 180, height: 300 };
        this.orangeBaseSpawn = { x: w - 130, y: h / 2 };

        // Central flag spawn
        this.flagSpawn = { x: w / 2, y: h / 2 };

        // Wall layout: 3-tier Sky-City Citadel
        // Top tier walls
        this.walls.push({ x: 400, y: 50, width: 40, height: 300 });
        this.walls.push({ x: 700, y: 80, width: 300, height: 40 });
        this.walls.push({ x: 1100, y: 50, width: 40, height: 200 });
        this.walls.push({ x: 1300, y: 80, width: 40, height: 200 });
        this.walls.push({ x: 1600, y: 100, width: 200, height: 40 });
        this.walls.push({ x: 1950, y: 50, width: 40, height: 300 });

        // Top tier cover
        this.walls.push({ x: 200, y: 200, width: 100, height: 40 });
        this.walls.push({ x: 600, y: 250, width: 80, height: 80 });
        this.walls.push({ x: 900, y: 180, width: 120, height: 40 });
        this.walls.push({ x: 1500, y: 200, width: 80, height: 80 });
        this.walls.push({ x: 2100, y: 200, width: 100, height: 40 });

        // Middle tier walls (central corridor)
        this.walls.push({ x: 500, y: 550, width: 40, height: 200 });
        this.walls.push({ x: 700, y: 600, width: 250, height: 40 });
        this.walls.push({ x: 1100, y: 580, width: 200, height: 40 });
        this.walls.push({ x: 1500, y: 580, width: 200, height: 40 });
        this.walls.push({ x: 1850, y: 600, width: 250, height: 40 });
        this.walls.push({ x: 1860, y: 550, width: 40, height: 200 });

        // Central plaza pillars
        this.walls.push({ x: w / 2 - 200, y: h / 2 - 200, width: 60, height: 60 });
        this.walls.push({ x: w / 2 + 140, y: h / 2 - 200, width: 60, height: 60 });
        this.walls.push({ x: w / 2 - 200, y: h / 2 + 140, width: 60, height: 60 });
        this.walls.push({ x: w / 2 + 140, y: h / 2 + 140, width: 60, height: 60 });

        // Bottom tier walls
        this.walls.push({ x: 400, y: 1250, width: 40, height: 300 });
        this.walls.push({ x: 700, y: 1260, width: 300, height: 40 });
        this.walls.push({ x: 1100, y: 1300, width: 40, height: 250 });
        this.walls.push({ x: 1300, y: 1260, width: 40, height: 250 });
        this.walls.push({ x: 1600, y: 1260, width: 200, height: 40 });
        this.walls.push({ x: 1950, y: 1250, width: 40, height: 300 });

        // Bottom tier cover
        this.walls.push({ x: 200, y: 1350, width: 100, height: 40 });
        this.walls.push({ x: 600, y: 1120, width: 80, height: 80 });
        this.walls.push({ x: 900, y: 1200, width: 120, height: 40 });
        this.walls.push({ x: 1500, y: 1120, width: 80, height: 80 });
        this.walls.push({ x: 2100, y: 1350, width: 100, height: 40 });

        // Side corridors
        this.walls.push({ x: 0, y: 500, width: 250, height: 40 });
        this.walls.push({ x: 0, y: 700, width: 200, height: 40 });
        this.walls.push({ x: 0, y: 1000, width: 250, height: 40 });
        this.walls.push({ x: 2150, y: 500, width: 250, height: 40 });
        this.walls.push({ x: 2200, y: 700, width: 200, height: 40 });
        this.walls.push({ x: 2150, y: 1000, width: 250, height: 40 });

        // Additional mid-level cover
        this.walls.push({ x: 350, y: 750, width: 80, height: 80 });
        this.walls.push({ x: 1970, y: 750, width: 80, height: 80 });
        this.walls.push({ x: 450, y: 900, width: 120, height: 40 });
        this.walls.push({ x: 1830, y: 900, width: 120, height: 40 });
    }

    render(_scene: MatchScene): void {
        const display = MakkoEngine.display;
        const w = this.width;
        const h = this.height;

        // Background
        display.setGlobalAlpha(0.4);
        display.drawRect(0, 0, w, h, { fill: "#0a1020" });
        display.setGlobalAlpha(1);

        // Grid lines
        const gridSize = 80;
        display.setGlobalAlpha(0.15);
        for (let x = 0; x < w; x += gridSize) {
            display.drawLine(x, 0, x, h, { stroke: "#1a3050", lineWidth: 1 });
        }
        for (let y = 0; y < h; y += gridSize) {
            display.drawLine(0, y, w, y, { stroke: "#1a3050", lineWidth: 1 });
        }
        display.setGlobalAlpha(1);

        // Circuit lines (decorative)
        display.setGlobalAlpha(0.3);
        display.drawLine(w / 2, 0, w / 2, h / 2 - 300, { stroke: "#00d4ff", lineWidth: 2 });
        display.drawLine(w / 2, h / 2 + 300, w / 2, h, { stroke: "#00d4ff", lineWidth: 2 });
        display.drawLine(0, h / 2, w / 2 - 300, h / 2, { stroke: "#00d4ff", lineWidth: 2 });
        display.drawLine(w / 2 + 300, h / 2, w, h / 2, { stroke: "#00d4ff", lineWidth: 2 });
        display.setGlobalAlpha(1);

        // Capture zones
        this.renderZone(this.blueBase, "#4a9eff", "BLUE NEXUS");
        this.renderZone(this.orangeBase, "#ff8844", "ORANGE NEXUS");

        // Walls
        for (const wall of this.walls) {
            this.renderWall(wall);
        }
    }

    private renderZone(zone: Zone, color: string, label: string): void {
        const display = MakkoEngine.display;

        // Zone fill
        display.setGlobalAlpha(0.25);
        display.drawRect(zone.x, zone.y, zone.width, zone.height, { fill: color });
        display.setGlobalAlpha(1);

        // Zone border glow
        display.setGlobalAlpha(0.5);
        display.drawRect(zone.x, zone.y, zone.width, zone.height, {
            stroke: color,
            lineWidth: 3,
            shadow: { color: color, blur: 15 }
        });
        display.setGlobalAlpha(1);

        // Zone label
        display.drawText(
            zone.x + zone.width / 2,
            zone.y + zone.height / 2,
            label,
            {
                fontSize: 18,
                fontFamily: "Orbitron, sans-serif",
                fill: color,
                textAlign: "center"
            }
        );
    }

    private renderWall(wall: Wall): void {
        const display = MakkoEngine.display;

        // Wall body
        display.drawRect(wall.x, wall.y, wall.width, wall.height, {
            fill: "#1a2a3a",
            stroke: "#3a5a7a",
            lineWidth: 2
        });

        // Top highlight
        display.drawRect(wall.x, wall.y, wall.width, 4, { fill: "#4a7a9a" });

        // Neon edge (right and bottom)
        display.setGlobalAlpha(0.6);
        display.drawLine(wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + wall.height, {
            stroke: "#00d4ff",
            lineWidth: 1
        });
        display.drawLine(wall.x, wall.y + wall.height, wall.x + wall.width, wall.y + wall.height, {
            stroke: "#00d4ff",
            lineWidth: 1
        });
        display.setGlobalAlpha(1);
    }

    /**
     * AABB collision check - resolve hero movement against walls
     */
    resolveWallCollision(x: number, y: number, radius: number): { x: number; y: number } {
        let newX = x;
        let newY = y;

        for (const wall of this.walls) {
            // Find closest point on wall to circle center
            const closestX = Math.max(wall.x, Math.min(newX, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(newY, wall.y + wall.height));

            const dx = newX - closestX;
            const dy = newY - closestY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const dist = Math.sqrt(distSq);
                if (dist > 0) {
                    const overlap = radius - dist;
                    newX += (dx / dist) * overlap + 1;
                    newY += (dy / dist) * overlap + 1;
                } else {
                    // Inside the wall, push out
                    const centerX = wall.x + wall.width / 2;
                    const centerY = wall.y + wall.height / 2;
                    const pushX = newX - centerX;
                    const pushY = newY - centerY;
                    const pushDist = Math.sqrt(pushX * pushX + pushY * pushY);
                    if (pushDist > 0) {
                        newX += (pushX / pushDist) * (radius + 1);
                        newY += (pushY / pushDist) * (radius + 1);
                    }
                }
            }
        }

        return { x: newX, y: newY };
    }

    /**
     * Check if a point is inside a zone
     */
    isInZone(zone: Zone, x: number, y: number): boolean {
        return x >= zone.x && x <= zone.x + zone.width &&
               y >= zone.y && y <= zone.y + zone.height;
    }

    /**
     * Simple line-of-sight check using ray vs AABB
     */
    lineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
        const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 20);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;

            for (const wall of this.walls) {
                if (x >= wall.x && x <= wall.x + wall.width &&
                    y >= wall.y && y <= wall.y + wall.height) {
                    return false;
                }
            }
        }
        return true;
    }
}