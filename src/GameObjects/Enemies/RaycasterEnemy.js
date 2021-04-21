import ReflectableRay from "../ReflectableRay";
import AEnemy from "./AEnemy";

/**
 * Simple enemy that cast single ray and moved to the player.
 * You can create your enemies based on this.
 */
export default class RaycasterEnemy extends AEnemy {

    /**
     * Rays caster by this enemy
     * @type {ReflectableRay[]}
     */
    rays = [];

    /**
     * RaycasterEnemy constructor
     * @param scene
     * @param x
     * @param y
     * @param spriteName
     */
    constructor(scene, x, y, spriteName = "pyramidHead") {
        super(scene, x, y, spriteName);
        this.setName('pyramidHead')
        this.rays.push(new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        }));
    }

    /**
     * Update ticker
     * @param time
     * @param delta
     */
    onUpdate(time, delta) {
        this.moveTowardsTo(this.scene.player);
        this.updateRays();
    }

    updateRays() {
        this.rays.forEach((r, index) => {
            r.setOrigin(this._calculateRayOrigin());
            r.setAngle(this.rotation);
            r.update();
        });
    }

    onDeath() {
        this.rays.forEach(r => r.disable() );
    }

    _calculateRayOrigin() {
        let r = 18;
        return {
            x: this.x + r * Math.cos(this.rotation),
            y: this.y + r * Math.sin(this.rotation)
        }
    }
}