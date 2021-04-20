import Phaser from "phaser";
import Item from "./Item";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    speed = 160;
    items = [
        {
            name: 'pyramidHead',
            quantity: 10,
            type: 'burn'
        },
        {
            name: 'pyramidHead',
            quantity: 10,
            type: 'damage'
        },
        {
            name: 'pyramidHead',
            quantity: 10,
            type: 'freeze'
        },
        {
            name: 'pyramidHead',
            quantity: 10,
            type: 'blink'
        },
        {
            name: 'pyramidHead',
            quantity: 10,
            type: 'reflection'
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
        this.grenadeType = scene.grenadeType;
    }

    onRayHit(ray) {
        this.tint = 0xff0000;
        this.changeHealth(-ray.damage);
        if(this.health <= 0 ) this.dead();
    }

    dead() {
        alert("YOU ARE DAED");
        window.location.reload();
        this.dead = () => {};
    }

    changeHealth(changeBy) {
        this.health += changeBy;
        this.healthBar.update(this.health);
    }

    onHit(bullet) {
        this.health -= 10;
        this.healthBar.update(this.health);
    }

    preUpdate(time, delta) {
        this.tint = 0xffffff;
    }

    throw() {
        if ( this.currentItem === false || this.items.length === 0 || this.items[this.currentItem] === undefined ) return;
        if ( this.items.length === 0 ) {
            this.currentItem === false;
            this.grenadeType.set();
            return;
        }

        let currentItem = this.items[this.currentItem];

        let item = new Item(this.scene, this.x, this.y, currentItem.name, currentItem.type);

        currentItem.quantity -= 1;

        this.scene.item = item
        item.throw(input.activePointer.worldX, input.activePointer.worldY);

        this.grenadeType.set( currentItem );

        if ( currentItem.quantity <= 0 ) {
            this.items.splice(this.currentItem, 1);
            this.currentItem = false;
            this.grenadeType.set( false );
        }
    }

    changeItem() {
        this.currentItem = this.items.length > 0 ? ( 1 + this.currentItem ) % this.items.length : false;
        this.grenadeType.set( this.items[this.currentItem] );
    }
}