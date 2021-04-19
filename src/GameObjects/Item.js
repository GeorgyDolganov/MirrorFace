import Phaser from "phaser";

export default class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.physics.add.existing(this);
    }

    throw(x, y) {
        this.scene.physics.moveTo(this, x, y, 500);

        let time = Math.sqrt( Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) ) / 500;
        setTimeout(_ => {this.destroy()}, time * 1000);
    }
}