import Phaser from "phaser";
import ShakePosition from 'phaser3-rex-plugins/plugins/shakeposition.js';

const GRENADES_TYPES = ['burn','damage','freeze','blink','reflection'];
const HEALING_TYPES = ['health', 'regeneration'];

export default class Crate extends Phaser.Physics.Arcade.Sprite {
    type

    constructor(scene, x, y, type) {
        super(scene, x, y, type + 'Idle');

        this.setPipeline('Light2D');

        this.name = 'crate';
        this.type = type;
        let side = this.type === 'crateBig' ? 64 : 32;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setTexture(type+'Idle');

        this.maxHealth = type === 'crateBig' ? 50 : 25;
        this.health = this.maxHealth;
        this.destroyed = false;

        this.canReflect = false;
        this.setDamping(true);
        this.setDrag(0.0009);
        this.setCollideWorldBounds(true);
        this.damageShake = new ShakePosition(this, {
            mode: 1, // 0|'effect'|1|'behavior'
            duration: 150,
            magnitude: 5,
            magnitudeMode: 1, // 0|'constant'|1|'decay'
        });

        this.crateHitSound = scene.crateHitSound
        this.itemPickUpSound = scene.itemPickUpSound

        this.on('animationcomplete', this.onDestroy );
    }

    onDestroy() {
        if ( this.destroyed === false ) return;

        this.setVisible(false);
        this.setActive(false);

        this.scene.tweens.add({
            targets: this,
            duration: ( Math.floor(Math.random() * 3) + 2 ) * 1000,
            x: Math.floor( Math.random() * scene.physics.world.bounds.width ),
            y: Math.floor( Math.random() * scene.physics.world.bounds.height ),
            onComplete: tween => {
                this.destroyed = false;

                this.setTexture(this.type+'Idle');

                this.health = this.maxHealth;

                this.body.setEnable(true);
                this.setActive(true);
                this.setVisible(true);
            }
        });
    }

    spawnItem() {
        let SUBTYPE_NAME = Math.random() > .5 ? 'throwable' : 'consumable';
        let SUBTYPE = SUBTYPE_NAME === 'throwable' ? GRENADES_TYPES : HEALING_TYPES;
        let type = SUBTYPE[Math.floor(Math.random() * SUBTYPE.length)];

        let newItem = {
            type,
            subtype: SUBTYPE_NAME,
            quantity: Math.floor(Math.random() * (this.type === 'crateBig' ? 4 : 2))
        }

        if ( newItem.quantity > 0 ) {
            let item = scene.add.sprite(this.x, this.y, newItem.subtype === 'throwable' ? 'grenade' : 'health');
            scene.physics.world.enable([ item ]);
            let collider = scene.physics.add.collider(scene.player, item, _ => {
                this.itemPickUpSound.play()
                scene.player.addItem(newItem);
                item.destroy();
                collider.destroy();
            })
        }
    }

    damage(damage) {
        if ( this.destroyed ) return;

        this.health -= damage;
        this.damageShake.shake({duration: 150});
        this.crateHitSound.play()

        if ( this.health <= 0 ) {
            this.destroyed = true;
            this.visible = false
            this.body.setEnable(false);

            this.spawnItem();
            this.destroyAnimation()
        }
    }

    destroyAnimation() {
        const pieces = this.type === 'crateBig' ? [
            "crateBigPiece0", "crateBigPiece1", "crateBigPiece2", "crateBigPiece3",
        ] : [
            "cratePiece0", "cratePiece1", "cratePiece2", "cratePiece3",
        ]


        pieces.forEach(p => {
            const image = this.scene.add.image(this.x, this.y, p);
            const targetPos = new Phaser.Geom.Circle(this.x,this.y, 50).getRandomPoint();
            this.scene.tweens.add({
                targets: image,
                x: targetPos.x,
                y: targetPos.y,
                ease: 'Cubic.easeOut',
                duration: 300,
                onComplete: () => {
                    image.setDepth(0);
                    // this.setActive(false);
                    // this.setVisible(false);
                }
            })
        });
    }
}