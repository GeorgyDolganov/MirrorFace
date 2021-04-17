import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, bullets)
    {
        super(scene, x, y, 'player');

        this.bullets = bullets;

        this.fireCooldown = 2000;
        this.currentCooldown = 0;
    }
    preUpdate(time, delta) {
        this.currentCooldown += delta;

        if( this.currentCooldown > this.fireCooldown ) {
            let bullet = this.bullets.get();
            if( bullet ) bullet.fire(this);
            this.currentCooldown = 0;
        }
    }

    getBullets() {
        return this.bullets;
    }
}