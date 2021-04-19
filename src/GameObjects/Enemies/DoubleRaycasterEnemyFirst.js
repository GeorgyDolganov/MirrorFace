import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";

export default class DoubleRaycasterEnemyFirst extends Phaser.Physics.Arcade.Sprite {

    _rays = [];
    speed = 100;

    constructor(scene, x, y) {
        super(scene, x, y, "pyramidHead");

        this._rays[0] = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        })

        this._rays[1] = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        })

        scene.physics.add.existing(this)
    }

    update(player) {
        this.moveTo(player);
        this._rays[0].setOrigin(this.calculateRayOrigin(0));
        this._rays[0].setAngle(this.rotation + 0.25);
        this._rays[0].update();
        this._rays[1].setOrigin(this.calculateRayOrigin(1));
        this._rays[1].setAngle(this.rotation - 0.25);
        this._rays[1].update();
    }

    calculateRayOrigin(i) {
        let r = 30;
        return {
            x: this.x + (r + (i ? 0.5 : -0.5)) * Math.cos(this.rotation + (i ? 0.5 : -0.5)),
            y: this.y + (r + (i ? 0.5 : -0.5)) * Math.sin(this.rotation + (i ? 0.5 : -0.5)),
        }
    }

    moveTo(gameObject) {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, gameObject.x, gameObject.y);
        if (Phaser.Math.Distance.Between(this.x, this.y, gameObject.x, gameObject.y) > 150) {
            this.scene.physics.moveToObject(this, gameObject, this.speed);
        } else {
            this.body.stop();
        }
    }
}