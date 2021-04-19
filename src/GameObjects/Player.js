import Phaser from "phaser";
import Item from "./Item";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    items = [
        {
            name: 'pyramidHead',
            quantity: 10
        }
    ];
    currentItem = false;

    constructor(scene, healthBar) {
        super(scene, 100, 500, "player");
        this.health = 100;

        scene.physics.add.existing(this);
        this.setDamping(true);
        this.setDrag(0.0009);
        this.setMaxVelocity(200);
        this.health = 100;

        this.body.setCircle(15);
        this.body.setOffset(0, 15);

        this.healthBar = healthBar;
    }

    onRayHit(ray) {
        this.health -= ray.damage;
        this.healthBar.update(this.health);
    }

    onHit(bullet) {
        this.health -= 10;
        this.healthBar.update(this.health);
    }

    preUpdate(time, delta) {
    }

    throw() {
        if ( this.currentItem === false || this.items.length === 0 ) return;

        let currentItem = this.items[this.currentItem];

        let item = new Item(this.scene, this.x, this.y, currentItem.name);

        currentItem.quantity -= 1;
        if ( currentItem.quantity <= 0 ) {
            this.items.splice(this.currentItem, 1)
        }

        this.scene.item = item
        item.throw(input.activePointer.worldX, input.activePointer.worldY);
    }

    changeItem() {
        this.currentItem = this.items.length > 0 ? ( 1 + this.currentItem ) % this.items.length : false;
    }
}