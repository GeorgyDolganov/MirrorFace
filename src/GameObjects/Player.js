import Phaser from "phaser";
import Item from "./Item";

let mirrorTween
export default class Player extends Phaser.Physics.Arcade.Sprite {
    hitReady = true;
    speed = 160;
    items = [
        {
            quantity: 10,
            type: 'burn'
        },
        {
            quantity: 10,
            type: 'damage'
        },
        {
            quantity: 10,
            type: 'freeze'
        },
        {
            quantity: 10,
            type: 'blink'
        },
        {
            quantity: 10,
            type: 'reflection'
        }
    ];
    currentItem = false;
    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene, 100, 500, "player");
        this.health = 100;
        scene.physics.add.existing(this);
        this.setDamping(true);
        this.setDrag(0.0009);
        this.setMaxVelocity(200);
        this.health = 100;

        this.body.setCircle(15);
        this.body.setOffset(0, 15);

        this.grenadeType = scene.grenadeType;

        scene.input.on('pointerdown', function (pointer) {

            if (pointer.leftButtonDown())
            {
                scene.player.hit();
            }
            else if (pointer.rightButtonDown())
            {
            }
            else if (pointer.middleButtonDown())
            {
            }
            else if (pointer.backButtonDown())
            {
            }
            else if (pointer.forwardButtonDown())
            {
            }

        });
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased()) {
                scene.player.cooldownMirror()
            }
        });
    }

    cooldownMirror() {
        if ( scene.player.hitReady === true ) return;

        mirrorTween?.stop()
        scene.tweens.add({
            targets: scene.mirror,
            radius: {
                value: 23, duration: 100, ease: 'Cubic.easeInOut'
            },
            onComplete: _ => {
                scene.player.hitReady = true;
            }
        })
    }

    hit() {
        if ( this.hitReady === false ) return;

        this.hitReady = false;

        mirrorTween = scene.tweens.add({
            targets: scene.mirror,
            radius: {
                value: 30, duration: 100, ease: 'Power1'
            }
        })

        let intersections = scene.physics.overlapCirc(scene.mirror.x, scene.mirror.y, 23, true, true);
        let rotation = this.rotation;
        intersections.forEach(el=>{
            if (el?.gameObject?.name === 'pyramidHead' || el?.gameObject?.name === 'skeleton') {
                el.gameObject.changeHealth(-5);

                scene.tweens.add({
                    targets: el.gameObject,
                    duration: 200,
                    x: el.gameObject.x + 10 * Math.cos(rotation),
                    y: el.gameObject.y + 10 * Math.sin(rotation)
                })
            }
        })
    }

    onRayHit(ray) {
        this.tint = 0xff0000;
        this.changeHealth(-ray.damage);
    }

    dead() {
        alert("YOU ARE DAED");
        window.location.reload();
        this.dead = () => {};
    }

    changeHealth(changeBy) {
        this.health += changeBy;
        this.scene.healthBar.update(this.health);
        if(this.health <= 0 ) this.dead();
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

        let item = new Item(this.scene, this.x, this.y, currentItem.type);

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
    
    addItem(type, quantity) {
        let itemIndex = this.items.findIndex(item => item.type === type);

        if ( itemIndex ) {
            this.items[itemIndex].quantity += quantity;
        } else {
            this.items.push({type, quantity});
        }
    }
}