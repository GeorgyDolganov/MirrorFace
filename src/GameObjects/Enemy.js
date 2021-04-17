import Phaser from "phaser";
import BulletGroup from "./BulletGroup";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y)
    {
        super(scene, x, y, 'player');

        this.bullets = new BulletGroup(scene);

        this.fireCooldown = 2000;
        this.currentCooldown = 0;
    }
    preUpdate(time, delta) {
        this.currentCooldown += delta;

        if( this.currentCooldown > this.fireCooldown ) {
            this.shoot();
            this.currentCooldown = 0;
        }
    }

    shoot() {
        this.bullets.fireBullet(this.x, this.y);
    }
}