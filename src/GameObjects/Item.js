import Phaser from "phaser";
import EnemiesManager from "../Managers/EnemiesManager";

export default class Item extends Phaser.Physics.Arcade.Sprite {
    type

    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);

        this.type = type;
        scene.physics.add.existing(this);
    }

    throw(x, y) {
        this.scene.physics.moveTo(this, x, y, 500);

        let time = Math.sqrt( Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) ) / 500;
        setTimeout(_ => {this.action()}, time * 1000);
    }

    action() {
        switch( this.type ) {
            case 'blink': {
                this.scene.player.x = this.x;
                this.scene.player.y = this.y;
                break;
            }
            case 'freeze': {
                let area = this.scene.add.circle(this.x, this.y, 50).setStrokeStyle(1, 0xff0000);

                this.scene.EnemiesManager._enemies.forEach(enemy => {
                    if ( this.scene.physics.collisionDetection(area, enemy) ) {
                        let defaultSpeed = enemy.speed;
                        enemy.speed = 10;
                        setTimeout(_ => enemy.speed = defaultSpeed, 2000);
                    }
                });

                setTimeout(_ => {area.destroy()}, 100);

                break;
            }
            case 'damage': {
                let area = this.scene.add.circle(this.x, this.y, 50).setStrokeStyle(1, 0xff0000);

                this.scene.EnemiesManager._enemies.forEach(enemy => {
                    if ( this.scene.physics.collisionDetection(area, enemy) ) {
                        enemy.changeHealth(-50);
                    }
                });

                setTimeout(_ => {area.destroy()}, 100);

                break;
            }
            case 'burn': {
                let area = this.scene.add.circle(this.x, this.y, 100).setStrokeStyle(1, 0xff0000);

                const EnemiesManager = this.scene.EnemiesManager
                const physics = this.scene.physics

                EnemiesManager._enemies.forEach(enemy => {
                    if ( physics.collisionDetection(area, enemy) ) {
                        if (enemy) enemy.changeHealth(-5);
                        let burned = Math.random() > .5;
                        if ( burned ) {
                            let burnedTimer = setInterval(_ => {if ( enemy ) enemy.changeHealth(-1)}, 500);
                            setTimeout(_ => clearInterval(burnedTimer), 2000);
                        }
                    }
                });

                let fireAreaTimer = setInterval(_ => {
                    EnemiesManager._enemies.forEach(enemy => {
                        if ( physics.collisionDetection(area, enemy) ) {
                            if ( enemy ) enemy.changeHealth(-1);
                            let burned = Math.random() > .5;
                            if ( burned ) {
                                let burnedTimer = setInterval(_ => {if ( enemy ) enemy.changeHealth(-1)}, 500);
                                setTimeout(_ => clearInterval(burnedTimer), 2000);
                            }
                        }
                    });
                }, 500)

                setTimeout(_ => {clearInterval(fireAreaTimer); area.destroy();}, 5000);

                break;
            }
        }

        this.destroy();
    }
}