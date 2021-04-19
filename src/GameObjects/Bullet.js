import Phaser from "phaser";


export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor (scene, x, y)
    {
        super(scene, x, y, 'space', 'blaster');

        this.lifeTime = 10000;
        this.speed = 400;

        this.setBlendMode(1);
        this.setDepth(1);
    }

    fire ({x, y, rotation})
    {
        this.setBounce(1, 1);
        this.body.reset(x, y);
        this.lifeTime = 10000;
        this.setActive(true);
        this.setVisible(true);
        this.body.setEnable(true);

        this.rotation = rotation;
        this.scene.physics.velocityFromRotation(rotation, this.speed, this.body.velocity);
    }

    update(time, delta)
    {
        super.update(time, delta);
        this.lifeTime -= delta;
        if( this.lifeTime < 0 ) {
            this.remove();
        }
    }

    remove() {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.setEnable(false);
    }

}