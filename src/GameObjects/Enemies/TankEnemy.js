import AEnemy from "./AEnemy";

/**
 * Simple enemy that cast single ray and moved to the player.
 * You can create your enemies based on this.
 */
export default class TankEnemy extends AEnemy {
    maxHealth = 200;
    health = this.maxHealth;

    hitReady = true;
    hitTween = { iterator: 0 };
    hitDelay = 1000;

    /**
     * RaycasterEnemy constructor
     * @param scene
     * @param x
     * @param y
     * @param spriteName
     */
    constructor(scene, x, y, spriteName = "pyramidHead") {
        super(scene, x, y, spriteName);

        this.setScale(2)
    }

    /**
     * Update ticker
     * @param time
     * @param delta
     */
    onUpdate(time, delta) {
        this.moveTowardsTo(this.scene.player);
    }

    moveTowardsTo(gameObject) {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, gameObject.x, gameObject.y);
        if (Phaser.Math.Distance.Between(this.x, this.y, gameObject.x, gameObject.y) > 75) {
            this.hitReady = true;
            this.scene.tweens.killTweensOf(this.hitTween);
            this.scene.physics.moveToObject(this, gameObject, this.speed);
        } else {
            if ( this.hitReady ) this.doTheHit();
            this.body.stop();
        }
    }

    doTheHit() {
        this.hitReady = false;
        this.hitTween = { iterator: 0 };

        this.scene.tweens.add({
            targets: this.hitTween,
            iterator: this.hitDelay,
            duration: this.hitDelay,
            onComplete: tween => {
                this.hitReady = true;
                this.scene.player.changeHealth(-10);

                this.scene.tweens.add({
                    targets: this.scene.player,
                    duration: 100,
                    x: this.scene.player.x + 20 * Math.cos(this.rotation),
                    y: this.scene.player.y + 20 * Math.sin(this.rotation)
                })
            }
        });
    }
}