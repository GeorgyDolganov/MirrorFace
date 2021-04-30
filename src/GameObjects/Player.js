import Phaser from "phaser";
import Item from "./Item";

let mirrorTween
export default class Player extends Phaser.Physics.Arcade.Sprite {
    hitReady = true;
    speed = 200;

    inventory = {
        throwable: {
            items: [
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
                }
            ],
            current: false
        },
        consumable: {
            items: [
                {
                    quantity: 1,
                    type: 'health'
                },
                {
                    quantity: 1,
                    type: 'regeneration'
                }
            ],
            current: false
        }
    }

    mirror = 'mirrorSmall'

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
        this.healingType = scene.healingType;

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
        blackout.fillStyle(0x000000, 0.9);
        blackout.fillRect(0, 0, 800, 600);
        blackout.setScrollFactor(0);
        let text = this.scene.add.text(400,  100, "YOU DIED", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 40, color: "#f15c5c" });
        text.setScrollFactor(0);
        text.setOrigin(0.5);

        let image = this.scene.add.image(0, 0, 'ded')
        image.setOrigin(0,0);
        image.setScrollFactor(0);
        
        let roundSurvived = this.scene.add.text(400, 450, "Rounds survived: " + this.scene.gameStats.roundsSurvived, {
            fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#ff7836"
        });
        roundSurvived.setOrigin(0.5).setScrollFactor(0);
        let kills = this.scene.add.text(400, 470, "Kills: " + this.scene.gameStats.kills, {
            fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#ff7836"
        });
        kills.setOrigin(0.5).setScrollFactor(0);
        let t = this.scene.add.text(400, 520, "Return to main menu", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 18, color: "#3b9a52" });
        t.setPosition(t.x - t.width/2, t.y);
        this.scene.input.enableDebug(t);
        t.setScrollFactor(0);
        t.setInteractive({ cursor: 'pointer' });
        t.on("pointerdown", () => {
            this.scene.game.sound.stopAll();
            this.scene.scene.start("GameMenuScene")
        });
        t.on('pointerover', (pointer) => {
            t.setColor("#4fd06e")
        });
        t.on('pointerout',  (pointer) => {
            t.setColor("#3b9a52")
        });
        
        container.add(blackout);
        container.add(image)
        container.add(text);
        container.add(t);
        container.add(kills);
        container.add(roundSurvived);
        container.setDepth(100);

        container.setAlpha(0);
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            ease: "Power2",
            duration: 600,
        });
    }

    changeHealth(changeBy) {
        this.health += changeBy;
        if ( this.health > this.maxHealth ) this.health = this.maxHealth;
        this.scene.healthBar.update(this.health/this.maxHealth * 100);
        if(this.health <= 0 ) this.showGameOverScreen();
    }

    preUpdate(time, delta) {
        this.tint = 0xffffff;
        if( this.isDead() ) this.body.stop();
    }

    consume() {
        if ( this.inventory['consumable'].current === false || this.inventory['consumable'].items.length === 0 || this.inventory['consumable'].items[this.inventory['consumable'].current] === undefined ) return;
        if ( this.inventory['consumable'].items.length === 0 ) {
            this.inventory['consumable'].current === false;
            this.healingType.set();
            return;
        }

        let currentItem = this.inventory['consumable'].items[this.inventory['consumable'].current];

        let item = new Item(this.scene, this.x, this.y, currentItem.type);

        currentItem.quantity -= 1;

        item.consume();

        this.healingType.set( currentItem );

        if ( currentItem.quantity <= 0 ) {
            this.inventory['consumable'].items.splice(this.inventory['consumable'].current, 1);
            this.inventory['consumable'].current = false;
            this.healingType.set( false );
        }
    }

    throw() {
        if ( this.inventory['throwable'].current === false || this.inventory['throwable'].items.length === 0 || this.inventory['throwable'].items[this.inventory['throwable'].current] === undefined ) return;
        if ( this.inventory['throwable'].items.length === 0 ) {
            this.inventory['throwable'].current === false;
            this.grenadeType.set();
            return;
        }

        let currentItem = this.inventory['throwable'].items[this.inventory['throwable'].current];

        let item = new Item(this.scene, this.x, this.y, currentItem.type);

        currentItem.quantity -= 1;

        this.scene.item = item
        item.throw(input.activePointer.worldX, input.activePointer.worldY);

        this.grenadeType.set( currentItem );

        if ( currentItem.quantity <= 0 ) {
            this.inventory['throwable'].items.splice(this.inventory['throwable'].current, 1);
            this.inventory['throwable'].current = false;
            this.grenadeType.set( false );
        }
    }

    changeItem(type) {
        this.inventory[type].current = this.inventory[type].items.length > 0 ? ( 1 + this.inventory[type].current ) % this.inventory[type].items.length : false;

        if ( type === 'throwable' ) this.grenadeType.set( this.inventory[type].items[this.inventory[type].current] );
        if ( type === 'consumable' ) this.healingType.set( this.inventory[type].items[this.inventory[type].current] );
    }
    
    addItem(newItem) {
        const {type, subtype, quantity} = newItem;
        subtype === 'throwable' ? this.grenadeType.add(type, quantity) : this.healingType.add(type, quantity);

        let itemIndex = this.inventory[subtype].items.findIndex(item => item.type === type);

        if ( itemIndex > -1 ) {
            this.inventory[subtype].items[itemIndex].quantity += quantity;
            if ( itemIndex === this.inventory[subtype].current ) subtype === 'throwable' ? this.grenadeType.set( this.inventory[subtype].items[this.inventory[subtype].current] ) : this.healingType.set( this.inventory[subtype].items[this.inventory[subtype].current] );
        } else {
            this.inventory[subtype].items.push({type, quantity});
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