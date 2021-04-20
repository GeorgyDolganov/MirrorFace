import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";
import GameObjectHealthBar from "../UI/GameObjectHealthBar";

export default class Skeleton extends Phaser.GameObjects.Container {

    _ray;
    _healthBar;

    speed = 100;
    maxHealth = 20;
    health = this.maxHealth;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {*} x 
     * @param {*} y 
     * @param {*} children 
     */
    constructor(scene, x, y, children) {
        super(scene, x, y, children)
        scene.add.existing(this)

        this._ray = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        })

        this._healthBar = new GameObjectHealthBar(scene); //TODO not working atm
        scene.add.existing(this._healthBar);
        scene.add.existing(this);
        scene.physics.add.existing(this)

        this.skeletonLegs = scene.add.sprite(0, 25, 'skeleton_legs')
        this.skeletonLegs.setScale(1.35)
        this.skeletonLegs.setOrigin(0.5, 0.5)
        this.skeletonLegs.play({key: 'walk', repeat: -1})
        this.add(this.skeletonLegs)
        this.skeletonBody = scene.add.sprite(0, 0, 'Skeleton_body')
        this.skeletonBody.setOrigin(0.5, 0)
        this.skeletonBody.setScale(1.35)
        this.add(this.skeletonBody)
        this.skeletonHead = scene.add.sprite(0, 0, 'Skeleton_head')
        this.skeletonHead.setOrigin(0.5, 0)
        this.skeletonHead.setScale(1.35)
        this.add(this.skeletonHead)
        

    }

    update() {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y) - 1.5
        this.moveTo(scene.player);
        this._ray.setOrigin(this.calculateRayOrigin());
        this._ray.setAngle(this.rotation + 1.5);
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
            x: this.x + r * Math.cos(this.rotation + 1.5),
            y: this.y + r * Math.sin(this.rotation + 1.5)
        }
    }

    moveTo(gameObject) {
        // this.rotation = Phaser.Math.Angle.Between(this.x, this.y, gameObject.x, gameObject.y);
        if (Phaser.Math.Distance.Between(this.x, this.y, gameObject.x, gameObject.y) > 150) {
            this.scene.physics.moveToObject(this, gameObject, this.speed);
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
        this.body.setEnable(false);
        this._healthBar.setVisible(false);
        this._ray.disable();
    }

    isAlive() {
        return this.health > 0;
    }
}