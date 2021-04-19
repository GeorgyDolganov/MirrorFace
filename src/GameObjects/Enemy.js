import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, bullets) {
        super(scene, x, y, 'pyramidHead');
        this.bullets = bullets;

        this.fireCooldown = 2000;
        this.currentCooldown = 0;

        scene.physics.add.existing(this)
    }
    preUpdate(time, delta) {
        this.currentCooldown += delta;

        if (this.currentCooldown > this.fireCooldown) {
            let bullet = this.bullets.get();
            if (bullet) bullet.fire(this);
            this.currentCooldown = 0;
        }
    }

    getBullets() {
        return this.bullets;
    }

    update(player, scene) {
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        if (Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) > 150) {
            scene.physics.moveToObject(this, player, 1000, 3 * 1000);
        } else {
            this.body.stop();
        }

    }
}