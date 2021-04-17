import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 100, 500, "player");
        this.health = 100;
    }

    onHit(bullet) {
        this.health -= 10;
    }

    preUpdate(time, delta) {
    }
}