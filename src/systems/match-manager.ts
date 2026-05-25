import type { MatchScene } from "../scenes/match-scene";

export class MatchManager {
    public blueScore: number = 0;
    public orangeScore: number = 0;
    public matchTimer: number = 300; // 5 minutes
    public gameOver: boolean = false;
    public targetScore: number = 3;

    private flagResetTimer: number = 0;
    private announcements: string[] = [];
    private lastAnnouncementTime: number = 0;

    update(dt: number, scene: MatchScene): void {
        if (this.gameOver) return;

        // Update timer
        this.matchTimer -= dt / 1000;

        // Flag reset timer
        if (this.flagResetTimer > 0) {
            this.flagResetTimer -= dt / 1000;
            if (this.flagResetTimer <= 0) {
                scene.flag.reset(scene.mapArena.flagSpawn);
            }
        }

        // Check for capture
        if (scene.flag.carrier) {
            const zone = scene.flag.carrier.team === "blue" ? 
                scene.mapArena.orangeBase : scene.mapArena.blueBase;
            
            if (scene.mapArena.isInZone(zone, scene.flag.carrier.position.x, scene.flag.carrier.position.y)) {
                this.scoreCapture(scene.flag.carrier.team, scene);
            }
        }

        // Check for game over
        if (this.blueScore >= this.targetScore || this.orangeScore >= this.targetScore) {
            this.gameOver = true;
        } else if (this.matchTimer <= 0) {
            this.gameOver = true;
        }

        // Clean old announcements
        const now = performance.now();
        if (now - this.lastAnnouncementTime > 3000) {
            this.announcements = [];
        }
    }

    private scoreCapture(team: string, scene: MatchScene): void {
        if (team === "blue") {
            this.blueScore++;
        } else {
            this.orangeScore++;
        }

        const carrier = scene.flag.carrier!;
        scene.flag.drop(carrier);
        this.flagResetTimer = 3;

        // Trigger effects
        const banner = team === "blue" ? "BLUE NEXUS CAPTURED!" : "ORANGE NEXUS CAPTURED!";
        scene.showCaptureBanner(banner);
        scene.triggerSlowMo(0.5);
        scene.triggerScreenShake(5, 0.3);

        // Spawn celebration particles
        const zone = team === "blue" ? scene.mapArena.orangeBase : scene.mapArena.blueBase;
        const cx = zone.x + zone.width / 2;
        const cy = zone.y + zone.height / 2;
        scene.particleFX.spawnCaptureFX(cx, cy, team);

        // Add announcement
        this.announcements.push(banner);
        this.lastAnnouncementTime = performance.now();
    }

    getAnnouncements(): string[] {
        return this.announcements;
    }

    addKillAnnouncement(killer: string, victim: string): void {
        this.announcements.push(`${killer} eliminated ${victim}`);
        this.lastAnnouncementTime = performance.now();
    }
}