import Phaser from "phaser";


export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');

        this.lifeTime = 10000;
        this.currentLifetime = 0;
    }

    fire (x, y)
    {
        this.setBounce(1);
        this.body.reset(x, y);
        this.currentLifetime = 0;
        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(300);

    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);
        this.currentLifetime += delta;
        if( this.currentLifetime > this.lifeTime ) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

}