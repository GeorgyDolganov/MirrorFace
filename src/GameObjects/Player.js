import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, healthBar) {
        super(scene, 100, 500, "player");
        this.health = 100;

        scene.physics.add.existing(this);
        this.setDamping(true);
        this.setDrag(0.0009);
        this.setMaxVelocity(200);
        this.health = 100;

        this.healthBar = healthBar;
    }

    onHit(bullet) {
        this.health -= 10;
        this.healthBar.update(this.health);
    }

    preUpdate(time, delta) {
    }
}