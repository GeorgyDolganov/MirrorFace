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
        {
            quantity: 1,
            type: 'health'
        }
    ];
    mirror = 'mirrorSmall'
    perks = [
        {
            name: 'mediumArmor',
            img: '',
            health: 0,
            speed: 0
        }
    ]
    currentItem = false;

    _bloodEmitter;

    isGameOverShown;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene, 100, 500, "player");

        scene.physics.add.existing(this);

        this.setDamping(true);
        this.setDrag(0.0009);
        this.setMaxVelocity(500);
        this.maxHealth = 100;
        this.health = this.maxHealth;

        this.body.setCircle(15);
        this.body.setOffset(0, 15);

        this.grenadeType = scene.grenadeType;

        this.mirrorPushSound = scene.sound.add('mirrorPush', {
            volume: 0.25,
            loop: false
        })


        scene.input.on('pointerdown', (pointer) => {

            if (this.isDead()) return;

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
        if( this.isDead() ) return;
        this.tint = 0xff0000;
        this.changeHealth(-ray.damage);
    }

    showGameOverScreen() {
        if( this.isGameOverShown ) return;
        this.isGameOverShown = true;
        let container = this.scene.add.container();
        let blackout = this.scene.add.graphics();
        blackout.fillStyle(0x000000, 0.8);
        blackout.fillRect(0, 0, 800, 600);
        blackout.setScrollFactor(0);
        let text = this.scene.add.text(400,  200, "YOU DIED", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 40, color: "#f15c5c" });
        text.setScrollFactor(0);
        text.setOrigin(0.5);

        let roundSurvived = this.scene.add.text(400, 250, "Rounds survived: " + this.scene.gameStats.roundsSurvived, {
            fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#ff7836"
        });
        roundSurvived.setOrigin(0.5).setScrollFactor(0);
        let kills = this.scene.add.text(400, 270, "Kills: " + this.scene.gameStats.kills, {
            fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#ff7836"
        });
        kills.setOrigin(0.5).setScrollFactor(0);
        let t = this.scene.add.text(400, 320, "Return to main menu", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 18, color: "#3b9a52" });
        t.setPosition(t.x - t.width/2, t.y);
        this.scene.input.enableDebug(t);
        t.setScrollFactor(0);
        t.setInteractive({ cursor: 'pointer' });
        t.on("pointerdown", () => {
            this.scene.scene.start("GameMenuScene")
        });
        t.on('pointerover', (pointer) => {
            t.setColor("#4fd06e")
        });
        t.on('pointerout',  (pointer) => {
            t.setColor("#3b9a52")
        });

        container.add(blackout);
        container.add(text);
        container.add(t);
        container.add(kills);
        container.add(roundSurvived);
        container.setDepth(100);

        container.setAlpha(0);
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            duration: 600,
        });
    }

    changeHealth(changeBy) {
        this.health += changeBy;
        if ( this.health > this.maxHealth ) this.health = this.maxHealth;
        this.scene.healthBar.update(this.health);
        if(this.health <= 0 ) this.showGameOverScreen();
    }

    preUpdate(time, delta) {
        this.tint = 0xffffff;
        if( this.isDead() ) this.body.stop();
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

    isDead() {
        return this.health <= 0;
    }
}