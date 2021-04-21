import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";
import GameObjectHealthBar from "../UI/GameObjectHealthBar";
import RaycasterEnemy from "./RaycasterEnemy";

export default class SkeletonEnemy extends RaycasterEnemy {

    constructor(scene, x, y, children) {
        super(scene, x, y, "skeleton")
        this.play({key: 'walk', repeat: -1})
        this.setScale(0.7);
    }

    onUpdate(time, delta) {
        super.onUpdate(time, delta);
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y) - 1.5;
        this.healthBar.setPosition(this.x - 25, this.y + 40);

    }

    _calculateRayOrigin() {
        let r = 80;
        return {
            x: this.x + r * Math.cos(this.rotation),
            y: this.y + r * Math.sin(this.rotation)
        }
    }
}