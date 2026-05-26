import { StateMachine } from '../state/state-machine';
import type { Hero } from './hero';
import type { MatchScene } from '../scenes/match-scene';

type AIContext = { ai: AiController; scene: MatchScene };
type AIState = 'seekFlag' | 'fight' | 'retreat' | 'capture';

const FIGHT_RANGE = 350;
const RETREAT_HP = 0.25;
const WANDER_CHANGE = 2; // seconds between wander direction changes

export class AiController {
  private hero: Hero;
  private scene: MatchScene;
  private sm: StateMachine<AIContext>;
  private wanderAngle: number = Math.random() * Math.PI * 2;
  private wanderTimer: number = 0;
  private shootTimer: number = 0;

  constructor(hero: Hero, scene: MatchScene) {
    this.hero = hero;
    this.scene = scene;
    this.sm = this.buildMachine();
    this.sm.transition('seekFlag', { ai: this, scene });
  }

  update(dt: number): void {
    if (this.hero.dead) return;
    this.sm.update(dt, { ai: this, scene: this.scene });
  }

  private buildMachine(): StateMachine<AIContext> {
    const machine = new StateMachine<AIContext>();

    machine.add('seekFlag', {
      update(dt, { ai, scene }) {
        if (ai.hero.hp / ai.hero.maxHp < RETREAT_HP) return 'retreat';
        if (scene.flag.carrier === ai.hero) return 'capture';

        const nearEnemy = ai.findNearestEnemy(scene);
        if (nearEnemy && ai.hasLOS(nearEnemy, scene)) return 'fight';

        // Move toward flag
        if (scene.flag.carrier && scene.flag.carrier.team === ai.hero.team) {
          // Ally has flag — escort
          ai.moveToward(scene.flag.carrier.position.x, scene.flag.carrier.position.y, dt);
        } else {
          ai.moveToward(scene.flag.x, scene.flag.y, dt);
        }

        ai.maybeShoot(scene, dt);
        return;
      }
    });

    machine.add('fight', {
      update(dt, { ai, scene }) {
        if (ai.hero.hp / ai.hero.maxHp < RETREAT_HP) return 'retreat';
        if (scene.flag.carrier === ai.hero) return 'capture';

        const enemy = ai.findNearestEnemy(scene);
        if (!enemy) return 'seekFlag';

        const dx = enemy.position.x - ai.hero.position.x;
        const dy = enemy.position.y - ai.hero.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > FIGHT_RANGE * 1.5) return 'seekFlag';

        // Strafe around enemy
        ai.hero.angle = Math.atan2(dy, dx);
        const strafe = Math.atan2(dy, dx) + Math.PI / 2;
        const spd = ai.hero.speed * 0.6;
        ai.hero.velocity.x = Math.cos(strafe) * spd;
        ai.hero.velocity.y = Math.sin(strafe) * spd;

        ai.maybeShoot(scene, dt);
        ai.maybeUseTactical(scene);
        return;
      }
    });

    machine.add('retreat', {
      update(dt, { ai, scene }) {
        if (ai.hero.hp / ai.hero.maxHp > 0.55) return 'seekFlag';

        const base = ai.hero.team === 'blue'
          ? scene.mapArena.blueBaseSpawn
          : scene.mapArena.orangeBaseSpawn;

        ai.moveToward(base.x, base.y, dt);
        return;
      }
    });

    machine.add('capture', {
      update(dt, { ai, scene }) {
        if (scene.flag.carrier !== ai.hero) return 'seekFlag';
        if (ai.hero.hp / ai.hero.maxHp < RETREAT_HP) {
          // Still try to capture but also fight back
        }

        // Move to enemy base
        const targetBase = ai.hero.team === 'blue'
          ? scene.mapArena.orangeBase
          : scene.mapArena.blueBase;
        const tx = targetBase.x + targetBase.width / 2;
        const ty = targetBase.y + targetBase.height / 2;
        ai.moveToward(tx, ty, dt);
        ai.maybeShoot(scene, dt);
        return;
      }
    });

    return machine;
  }

  private moveToward(tx: number, ty: number, dt: number): void {
    const dx = tx - this.hero.position.x;
    const dy = ty - this.hero.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) {
      this.hero.velocity.x = 0;
      this.hero.velocity.y = 0;
      return;
    }
    const speed = this.hero.speed;
    this.hero.angle = Math.atan2(dy, dx);
    this.hero.velocity.x = (dx / dist) * speed;
    this.hero.velocity.y = (dy / dist) * speed;
  }

  private findNearestEnemy(scene: MatchScene): Hero | null {
    const enemies = this.hero.team === 'blue'
      ? scene.enemies
      : [scene.playerHero, ...scene.allies];

    let nearest: Hero | null = null;
    let nearestDist = FIGHT_RANGE;

    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.position.x - this.hero.position.x;
      const dy = e.position.y - this.hero.position.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    }

    return nearest;
  }

  private hasLOS(target: Hero, scene: MatchScene): boolean {
    return scene.mapArena.lineOfSight(
      this.hero.position.x, this.hero.position.y,
      target.position.x, target.position.y
    );
  }

  private maybeShoot(scene: MatchScene, dt: number): void {
    this.shootTimer -= dt;
    if (this.shootTimer > 0) return;

    const enemy = this.findNearestEnemy(scene);
    if (!enemy || !this.hasLOS(enemy, scene)) return;

    const dx = enemy.position.x - this.hero.position.x;
    const dy = enemy.position.y - this.hero.position.y;
    this.hero.angle = Math.atan2(dy, dx);
    this.hero.tryShoot(scene);
    this.shootTimer = 0.08 + Math.random() * 0.15;
  }

  private maybeUseTactical(scene: MatchScene): void {
    if (this.hero.tacticalCooldown <= 0 && Math.random() < 0.02) {
      this.hero.tryTactical(scene);
    }
  }
}
