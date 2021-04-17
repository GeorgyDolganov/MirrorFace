import Phaser from "phaser";
import Mirror from "./Mirror";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, "player");

        this.mirror = new Mirror(scene);

    }


    preUpdate(time, delta) {
        this.mirror.x = this.x;
        this.mirror.y = this.y;
    }
}