import Phaser from "phaser";
import GameObjectHealthBar from "../UI/GameObjectHealthBar";

/**
 * Abstract class with base implementation of enemies
 * Inherit this class to create your enemy and define it behaviour.
 */
export default class AEnemy extends Phaser.Physics.Arcade.Sprite {
    /**
     * Reference to health bar GameObject attached to this enemy
     */
    healthBar;
    /**
     * Movement speed
     * @type {number}
     */
    speed = 100;
    /**
     * Maximum health points
     * @type {number}
     */
    maxHealth = 20;
    /**
     * Current health
     * @type {number}
     */
    health = this.maxHealth;

    /**
     * AEnemy constructor
     * @param scene
     * @param x
     * @param y
     * @param spriteName
     */
    constructor(scene, x, y, spriteName) {
        super(scene, x, y, spriteName);
        this.healthBar = new GameObjectHealthBar(scene);
        scene.physics.world.enable([ this ]);
        scene.add.existing(this.healthBar);
        scene.add.existing(this);
    }

    /**
     * Update Method for overriding in your enemy implementation
     * @param time
     * @param delta
     */
    onUpdate(time, delta) {}

    /**
     * Called whenever enemy is dead (e.g. health below or equal 0).
     */
    onDeath() {}

    /**
     * Internal update method.
     * Do not override this, use onUpdate instead.
     * @param args
     */
    update(...args) {
        super.update(...args);
        this.healthBar.setPosition(this.x -this.width * 0.75, this.y + 30);
        this.tint = 0xffffff;
        this.onUpdate(...args);
    }

    /**
     * Start movement towards target game object
     * @param gameObject
     */
    moveTowardsTo(gameObject) {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, gameObject.x, gameObject.y);
        if (Phaser.Math.Distance.Between(this.x, this.y, gameObject.x, gameObject.y) > 150) {
            this.scene.physics.moveToObject(this, gameObject, this.speed);
        } else {
            this.body.stop();
        }
    }

    moveTo(position) {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, position.x, position.y);
        if (Phaser.Math.Distance.Between(this.x, this.y, position.x, position.y) > 150) {
            this.scene.physics.moveTo(this, position.x, position.y, this.speed);
        } else {
            this.body.stop();
        }
    }

    /**
     * Called every frame whenever this enemy is being hit by a ray.
     * @param ray
     */
    onRayHit(ray) {
        this.changeHealth(-ray.damage);
        this.tint = 0xff0000;
    }

    /**
     * Change health of this enemy.
     * @param changeBy
     */
    changeHealth(changeBy) {
        this.health += changeBy;
        if( this.health > this.maxHealth ) this.health = this.maxHealth;
        this.healthBar.setHealth(this.health/this.maxHealth * 100);
    }

    /**
     * Internal method for killing this enemy.
     */
    die() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.setEnable(false);
        this.healthBar.setVisible(false);
        this.onDeath();
    }

    /**
     * Fast check whether this enemy is alive
     * @returns {boolean}
     */
    isAlive() {
        return this.health > 0;
    }
}