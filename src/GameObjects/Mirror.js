import Phaser from "phaser";

export default class Mirror extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, "mirror");
        scene.mirror.radius = 23;
        this.width = 100;
        this.height = 20;
    }
}