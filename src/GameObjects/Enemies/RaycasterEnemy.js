import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";

export default class RaycasterEnemy extends Phaser.Physics.Arcade.Sprite {

    _ray;
    speed = 100;

    constructor(scene, x, y) {
        super(scene, x, y, "pyramidHead");

        this._ray = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        })

        scene.physics.add.existing(this)
    }

    update(player) {
        this.moveTo(player);
        this._ray.setOrigin(this.calculateRayOrigin());
        this._ray.setAngle(this.rotation);
        this._ray.update();
    }

    calculateRayOrigin() {
        let r = 18;
        return {
            x: this.x + r * Math.cos(this.rotation),
            y: this.y + r * Math.sin(this.rotation)
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