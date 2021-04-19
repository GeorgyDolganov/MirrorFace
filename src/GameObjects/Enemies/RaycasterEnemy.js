import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";
import GameObjectHealthBar from "../UI/GameObjectHealthBar";

export default class RaycasterEnemy extends Phaser.Physics.Arcade.Sprite {

    _ray;
    _healthBar;

    maxHealth = 20;
    health = this.maxHealth;

    constructor(scene, x, y) {
        super(scene, x, y, "pyramidHead");

        this._ray = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        })

        this._healthBar = new GameObjectHealthBar(scene); //TODO not working atm
        scene.add.existing(this._healthBar);
        scene.add.existing(this);
        scene.physics.add.existing(this)
    }

    update(player) {
        this.moveTo(player);
        this._ray.setOrigin(this.calculateRayOrigin());
        this._ray.setAngle(this.rotation);
        this._ray.update();
        this._healthBar.setPosition(this.x -this.width * 0.75, this.y + 30);
    }

    onRayHit(ray) {
        this.changeHealth(-ray.damage);
        this.tint = 0xff0000
    }

    changeHealth(changeBy) {
        this.health += changeBy;
        this._healthBar.setHealth(this.health/this.maxHealth * 100);
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
            this.scene.physics.moveToObject(this, gameObject, 1000, 3 * 1000);
        } else {
            this.body.stop();
        }
    }

    preUpdate(time, delta) {
        this.tint = 0xffffff;
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this._healthBar.setVisible(false);
        this._ray.disable();
    }

    isAlive() {
        return this.health > 0;
    }
}