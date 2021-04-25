import Phaser from "phaser";
import Item from "./Item";

let mirrorTween
export default class Player extends Phaser.Physics.Arcade.Sprite {
    hitReady = true;
    speed = 200;
    items = [
        {
            quantity: 1,
            type: 'burn'
        },
        {
            quantity: 2,
            type: 'damage'
        },
        {
            quantity: 1,
            type: 'freeze'
        },
    ];
    mirror = 'small'
    perks = [
        {
            name: 'lightArmor',
            img: '',
            health: -20,
            speed: 20
        }
    ]
    currentItem = false;

    _bloodEmitter;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene, 100, 500, "player");

        scene.physics.add.existing(this);

        this.setDamping(true);
        this.setDrag(0.0009);
        this.setMaxVelocity(500);
        this.health = 100;

        this.body.setCircle(15);
        this.body.setOffset(0, 15);

        this.grenadeType = scene.grenadeType;

        this.mirrorPushSound = scene.sound.add('mirrorPush', {
            volume: 0.25,
            loop: false
        })


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

        const particles = scene.add.particles('spark');
        particles.setDepth(10);
        this._bloodEmitter = particles.createEmitter({
            x: 400,
            y: 300,
            angle: { min: 0, max: 220 },
            speed: { min: 0, max: 300 },
            lifespan: { min: 200, max: 600 },
            quantity: 6,
            scale: { start: 0.2, end: 0.1 },
            alpha: { start: 1, end: 0},
            blendMode: 'ADD',
            tint: 0xff0000,

        });
        this._bloodEmitter.stop();

        this.setDepth(8);
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
        this.mirrorPushSound.play()
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
            if ( el.gameObject.name === 'crate' ) {
                el.gameObject.damage(5)
            }
            if (el?.gameObject && el.gameObject.constructor.name.includes('Enemy')) {
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
        this.scene.scene.start("GameMenuScene")
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
        this.grenadeType.add(type, quantity);

        let itemIndex = this.items.findIndex(item => item.type === type);

        if ( itemIndex > -1 ) {
            this.items[itemIndex].quantity += quantity;
            if ( itemIndex === this.currentItem ) this.grenadeType.set( this.items[this.currentItem] );
        } else {
            this.items.push({type, quantity});
        }
    }

    runBloodAnimation(angle) {

        this._bloodEmitter.setAngle({
            min: angle - 20, max: angle + 20
        });
        this._bloodEmitter.explode(100, this.x,this.y);
    }
}