import Phaser from "phaser";

const GRENADES_TYPES = ['burn','damage','freeze','blink','reflection','health']; // 'regeneration'

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

        this.on('animationcomplete', this.onDestroy );
    }

    onDestroy() {
        if ( this.destroyed === false ) return;

        this.setVisible(false);
        this.setActive(false);

        scene.tweens.add({
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
        let type = GRENADES_TYPES[Math.floor(Math.random() * GRENADES_TYPES.length)]
        let newItem = {
            type,
            quantity: Math.floor(Math.random() * (this.type === 'crateBig' ? 4 : 2))
        }

        if ( newItem.quantity > 0 ) {
            let item = scene.add.sprite(this.x, this.y, type === 'health' ? 'health' : 'grenade')
            scene.physics.world.enable([ item ]);
            let collider = scene.physics.add.collider(scene.player, item, _ => {
                scene.player.addItem(newItem.type, newItem.quantity);
                item.destroy();
                collider.destroy();
            })
        }
    }

    damage(damage) {
        if ( this.destroyed ) return;

        this.health -= damage;

        if ( this.health <= 0 ) {
            this.destroyed = true;

            this.body.setEnable(false);

            this.spawnItem();
            this.play(this.type+'Destroy');
        }
    }
}