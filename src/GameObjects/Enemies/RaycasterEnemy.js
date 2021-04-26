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
    recalcPath = 0;
    reward = 10;

    /**
     * RaycasterEnemy constructor
     * @param scene
     * @param x
     * @param y
     * @param spriteName
     */
    constructor(scene, x, y, spriteName = "pyramidhead_walk") {
        super(scene, x, y, spriteName);
        this.setName('pyramidhead_walk');
        this.setOffset(70,30);
        this.setOrigin(0.5,0.5);
        this.play({key: "phwalk", repeat: -1});
        this.rays.push(new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        }));

        this.body.setCircle(12);
        this.body.setOffset(4, 16);
        this.rays[0].firstIgnoredObjects.push(this);
        this.goTo(this.scene.player);
    }

    /**
     * Update ticker
     * @param time
     * @param delta
     */
    onUpdate(time, delta) {
        // this.moveTowardsTo(this.scene.player);
        if (Phaser.Math.Distance.Between(this.x, this.y, scene.player.x, scene.player.y) > 150) {
            if ( this.recalcPath++ > 200 ) {
                this.recalcPath = 0;
                this.goTo(scene.player);
            } else
                if ( this.releasePath() ) {
                    if ( this.isStacked() ) {
                        // nothing
                    }
                } else {
                    this.goTo(scene.player);
                }
        } else {
            this.recalcPath = 0;
            this.body.velocity.set(0);
        }

        let angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y)
        this.rotation = angle;

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
        let r = 6;
        return {
            x: this.x + r * Math.cos(this.rotation),
            y: this.y + r * Math.sin(this.rotation)
        }
    }
}