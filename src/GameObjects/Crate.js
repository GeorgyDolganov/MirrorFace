import Phaser from "phaser";

const GRENADES_TYPES = ['burn','damage','freeze','blink','reflection'];

export default class Crate extends Phaser.Physics.Arcade.Sprite {
    type

    constructor(scene, x, y, type) {
        super(scene, x, y, type);

        this.setPipeline('Light2D');

        this.name = 'crate';
        this.type = type;
        let side = this.type === 'crateBig' ? 64 : 32;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(side, side, x, y)

        this.play(type+'Idle');

        this.maxHealth = type === 'crateBig' ? 50 : 25;
        this.health = this.maxHealth;
        this.destroyed = false;

        this.canReflect = false;
        this.setDamping(true);
        this.setDrag(0.0009);
        this.setCollideWorldBounds(true);
    }

    damage(damage) {
        if ( this.destroyed ) return;

        this.health -= damage;

        if ( this.health <= 0 ) {
            this.destroyed = true;

            this.body.setEnable(false);

            this.on('animationcomplete', _ => {
                this.setVisible(false);
                this.setActive(false);

                let type = GRENADES_TYPES[Math.floor(Math.random() * GRENADES_TYPES.length)];
                let quantity = Math.floor(Math.random() * (this.type === 'crateBig' ? 4 : 2));

                if ( quantity > 0 ) scene.player.addItem(type, quantity);

                scene.tweens.add({
                    targets: this,
                    duration: ( Math.floor(Math.random() * 3) + 2 ) * 1000,
                    x: Math.floor( Math.random() * scene.physics.world.bounds.width ),
                    y: Math.floor( Math.random() * scene.physics.world.bounds.height ),
                    onComplete: tween => {
                        this.destroyed = false;

                        this.on('animationcomplete', _ => {});
                        this.play(this.type+'Idle');

                        this.health = this.maxHealth;

                        this.body.setEnable(true);
                        this.setActive(true);
                        this.setVisible(true);
                    }
                });
            });
            this.play(this.type+'Destroy');
        }
    }
}