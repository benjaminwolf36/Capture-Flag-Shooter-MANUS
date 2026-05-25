import { MakkoEngine } from "@makko/engine";
import type { MapArena } from "../entities/map-arena";

export class Camera {
    public x: number = 0;
    public y: number = 0;
    public zoom: number = 1;
    public targetZoom: number = 1;
    public zoomTransitionSpeed: number = 5;

    private readonly deadzoneRadius: number = 120;
    private readonly followSpeed: number = 8;

    private readonly arena: MapArena;
    private readonly displayWidth: number;
    private readonly displayHeight: number;

    constructor(arena: MapArena) {
        this.arena = arena;
        const display = MakkoEngine.display;
        this.displayWidth = display.width;
        this.displayHeight = display.height;
        
        // Center on arena initially
        this.x = arena.width / 2;
        this.y = arena.height / 2;
    }

    /**
     * Update camera position (follows target with deadzone)
     */
    update(dt: number, target: { x: number; y: number }): void {
        const dtSec = dt / 1000;

        // Deadzone check
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.deadzoneRadius) {
            // Move toward target
            const speed = this.followSpeed * 100;
            const moveX = (dx / dist) * Math.min(speed * dtSec, dist - this.deadzoneRadius);
            const moveY = (dy / dist) * Math.min(speed * dtSec, dist - this.deadzoneRadius);
            this.x += moveX;
            this.y += moveY;
        }

        // Smooth zoom transition
        this.zoom += (this.targetZoom - this.zoom) * dtSec * this.zoomTransitionSpeed;

        // Clamp to arena bounds
        const halfW = (this.displayWidth / 2) / this.zoom;
        const halfH = (this.displayHeight / 2) / this.zoom;
        this.x = Math.max(halfW, Math.min(this.arena.width - halfW, this.x));
        this.y = Math.max(halfH, Math.min(this.arena.height - halfH, this.y));
    }

    /**
     * Set tactical overhead zoom
     */
    setTacticalZoom(enabled: boolean): void {
        this.targetZoom = enabled ? 0.4 : 1;
    }

    /**
     * Reset camera to defaults
     */
    reset(): void {
        this.x = this.arena.width / 2;
        this.y = this.arena.height / 2;
        this.zoom = 1;
        this.targetZoom = 1;
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        const display = MakkoEngine.display;
        
        // First, adjust for display CSS scaling
        const rect = display.canvas.getBoundingClientRect();
        const scaleX = display.width / rect.width;
        const scaleY = display.height / rect.height;
        
        const gameX = screenX * scaleX;
        const gameY = screenY * scaleY;
        
        // Then subtract camera offset (with zoom)
        const worldX = (gameX - display.width / 2) / this.zoom + this.x;
        const worldY = (gameY - display.height / 2) / this.zoom + this.y;
        
        return { x: worldX, y: worldY };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        const display = MakkoEngine.display;
        
        const screenX = (worldX - this.x) * this.zoom + display.width / 2;
        const screenY = (worldY - this.y) * this.zoom + display.height / 2;
        
        return { x: screenX, y: screenY };
    }
}