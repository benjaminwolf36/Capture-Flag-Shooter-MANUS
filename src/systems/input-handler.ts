import { MakkoEngine } from "../engine";

export class InputHandler {
    public isPaused: boolean = false;

    /**
     * Get the current movement direction from WASD
     */
    getMovementVector(): { x: number; y: number } {
        let x = 0;
        let y = 0;

        if (MakkoEngine.input.isKeyDown("KeyW") || MakkoEngine.input.isKeyDown("ArrowUp")) y -= 1;
        if (MakkoEngine.input.isKeyDown("KeyS") || MakkoEngine.input.isKeyDown("ArrowDown")) y += 1;
        if (MakkoEngine.input.isKeyDown("KeyA") || MakkoEngine.input.isKeyDown("ArrowLeft")) x -= 1;
        if (MakkoEngine.input.isKeyDown("KeyD") || MakkoEngine.input.isKeyDown("ArrowRight")) x += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }

        return { x, y };
    }

    /**
     * Check if movement keys are held
     */
    isMoving(): boolean {
        return MakkoEngine.input.isKeyDown("KeyW") || MakkoEngine.input.isKeyDown("KeyS") ||
               MakkoEngine.input.isKeyDown("KeyA") || MakkoEngine.input.isKeyDown("KeyD") ||
               MakkoEngine.input.isKeyDown("ArrowUp") || MakkoEngine.input.isKeyDown("ArrowDown") ||
               MakkoEngine.input.isKeyDown("ArrowLeft") || MakkoEngine.input.isKeyDown("ArrowRight");
    }

    /**
     * Get mouse position in game coordinates (world space)
     */
    get mouseX(): number {
        return MakkoEngine.input.mouseX;
    }

    get mouseY(): number {
        return MakkoEngine.input.mouseY;
    }

    /**
     * Check if left mouse button is held
     */
    isMouseDown(): boolean {
        return MakkoEngine.input.isMouseDown(0);
    }

    /**
     * Check if left mouse button was just pressed
     */
    isMousePressed(): boolean {
        return MakkoEngine.input.isMousePressed(0);
    }

    /**
     * Check if a key is held down
     */
    isKeyDown(key: string): boolean {
        return MakkoEngine.input.isKeyDown(key);
    }

    /**
     * Check if a key was just pressed this frame
     */
    isKeyPressed(key: string): boolean {
        return MakkoEngine.input.isKeyPressed(key);
    }

    /**
     * Calculate angle from hero position to mouse cursor (in radians)
     */
    getAngleTowardMouse(heroX: number, heroY: number): number {
        const mx = this.mouseX;
        const my = this.mouseY;
        return Math.atan2(my - heroY, mx - heroX);
    }
}