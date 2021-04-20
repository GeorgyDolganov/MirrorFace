import Phaser from "phaser";

export default class Item extends Phaser.Physics.Arcade.Sprite {
    type

    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);

        this.type = type;
        scene.physics.add.existing(this);

        this.physics = this.scene.physics;
        this.player = this.scene.player;
        this.EnemiesManager = this.scene.EnemiesManager;
    }

    throw(x, y) {
        this.scene.physics.moveTo(this, x, y, 500);

        let time = Math.sqrt( Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) ) / 500;
        setTimeout(_ => {this.action()}, time * 1000);
    }

    checkCollisions(area, callback) {
        const physics = this.physics;
        const player = this.player;
        const EnemiesManager = this.EnemiesManager;

        EnemiesManager._enemies.forEach(enemy => {
            if ( physics.collisionDetection(area, enemy) ) {
                callback(enemy);
            }
        });

        if ( physics.collisionDetection(area, player) ) {
            callback(player);
        }
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

                this.checkCollisions(area, (unit) => {
                    let defaultSpeed = unit.speed;
                    unit.speed = unit.speed / 10;
                    setTimeout(_ => unit.speed = defaultSpeed, 2000);
                })

                setTimeout(_ => {area.destroy()}, 100);

                break;
            }
            case 'reflection': {
                let limit = 5;
        
                this.scene.reflectionParticles.forEach(particle => {
                    if ( limit <= 0 || particle.x !== -999 ) return;

                    limit -= 1;

                    particle.x = this.x + 50 * Math.cos(Math.random() * 2 - 1);
                    particle.y = this.y + 50 * Math.sin(Math.random() * 2 - 1);

                    setTimeout(_ => {
                        particle.x = -999;
                        particle.y = -999;
                    }, Math.random() * 3000 + 1000)
                })

                break;
            }
            case 'damage': {
                let area = this.scene.add.circle(this.x, this.y, 50).setStrokeStyle(1, 0xff0000);

                this.checkCollisions(area, (unit) => {
                    unit.changeHealth(-50);
                })

                setTimeout(_ => {area.destroy()}, 100);

                break;
            }
            case 'burn': {
                let area = this.scene.add.circle(this.x, this.y, 100).setStrokeStyle(1, 0xff0000);

                this.checkCollisions(area, (unit) => {
                    if ( unit ) unit.changeHealth(-5);

                    let burned = Math.random() > .5;
                    if ( burned ) {
                        let burnedTimer = setInterval(_ => {if ( unit ) unit.changeHealth(-1)}, 500);
                        setTimeout(_ => clearInterval( burnedTimer ), 2000);
                    }
                })

                let fireAreaTimer = setInterval(_ => {
                    this.checkCollisions(area, (unit) => {
                        if ( unit ) unit.changeHealth(-1);

                        let burned = Math.random() > .5;
                        if ( burned ) {
                            let burnedTimer = setInterval(_ => {if ( unit ) unit.changeHealth(-1)}, 500);
                            setTimeout(_ => clearInterval( burnedTimer ), 2000);
                        }
                    })
                }, 500)

                setTimeout(_ => {clearInterval(fireAreaTimer); area.destroy();}, 5000);

                break;
            }
        }

        this.destroy();
    }
}