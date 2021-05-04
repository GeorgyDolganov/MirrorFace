import Phaser from "phaser";

export default class Item extends Phaser.Physics.Arcade.Sprite {
    type

    constructor(scene, x, y, type) {
        super(scene, x, y, 'grenade');

        if ( type === 'magicicanAttack' || type === 'blink' ) this.play('magicball');
        if ( type === 'hydraBurn' || type === 'hydraExplode' ) this.play('fireball');

        this.type = type;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.tweens = this.scene.tweens;
        this.physics = this.scene.physics;
        this.player = this.scene.player;
        this.EnemiesManager = this.scene.EnemiesManager;
    }

    consume(delay = 0) {
        this.delayedCall(delay, _ => {this.action()});
    }

    throw(x, y) {
        let time = Math.sqrt( Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) ) / 500 * 1000;

        if ( this.type === 'blink' ) time /= 10;

        this.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: time,
            onComplete: tween => {
                this.action();
            }
        });
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

    delayedCall(delay, callback, repeat = false) {
        let fakeObject = { iterator: 0 };

        this.tweens.add({
            targets: fakeObject,
            iterator: delay,
            duration: delay,
            repeat: repeat ? repeat - 1 : 0,
            onRepeat: tween => {
                callback();
            },
            onComplete: tween => {
                callback();
            }
        });
    }

    action() {
        switch( this.type ) {
            case 'blink': {
                this.scene.player.x = this.x;
                this.scene.player.y = this.y;
                break;
            }
            case 'health': {
                this.delayedCall(100, _ => {
                    scene.player.changeHealth(5 + Math.floor(Math.random() * 6));
                }, 10);
                break;
            }
            case 'regeneration': {
                this.delayedCall(500, _ => {
                    scene.player.changeHealth(1);
                }, Math.floor( Math.random() * 100 ) + 50);
                break;
            }
            case 'freeze': {
                let area = this.scene.add.circle(this.x, this.y, 50)//.setStrokeStyle(1, 0xff0000);

                this.checkCollisions(area, (unit) => {
                    let defaultSpeed = unit.speed;
                    unit.speed = unit.speed / 10;

                    scene.tweens.add({
                        targets: unit,
                        speed: defaultSpeed,
                        duration: 6000
                    });
                })

                this.delayedCall(100, _ => {area.destroy()});

                break;
            }
            case 'reflection': {
                let limit = 10;
        
                this.scene.reflectionParticles.forEach(particle => {
                    if ( limit <= 0 || particle.x !== -999 ) return;

                    limit -= 1;

                    let delta = limit < 5 ? 50 : 100;

                    particle.x = this.x + delta * Math.cos(Math.random() * Math.PI);
                    particle.y = this.y + delta * Math.sin(Math.random() * Math.PI);
                    particle.rotation = Math.random() * 6;

                    this.delayedCall(Math.random() * 2000 + 3000, _ => {
                        particle.x = -999;
                        particle.y = -999;
                    });
                })

                break;
            }
            case 'hydraExplode':
            case 'damage': {
                let area = this.scene.add.circle(this.x, this.y, 50)//.setStrokeStyle(1, 0xff0000);

                let explode = this.scene.add.sprite(this.x, this.y, 'explode').play('explode');
                explode.scale = 2;
                explode.on('animationcomplete', _ => { explode.destroy() });

                this.scene.cameras.main.shake(200, .005);
                this.checkCollisions(area, (unit) => {
                    unit.changeHealth(-50);
                })

                this.delayedCall(100, _ => {area.destroy()});

                break;
            }
            case 'magicicanAttack': {
                let area = this.scene.add.circle(this.x, this.y, 25)//.setStrokeStyle(1, 0xff0000);

                let explode = this.scene.add.sprite(this.x, this.y, 'explode').play('explode');
                explode.scale = 1;
                explode.on('animationcomplete', _ => { explode.destroy() });

                this.scene.cameras.main.shake(100, .0025);
                this.checkCollisions(area, (unit) => {
                    unit.changeHealth(-25);
                })

                this.delayedCall(100, _ => {area.destroy()});

                break;
            }
            case 'hydraBurn':
            case 'burn': {
                let area = this.scene.add.circle(this.x, this.y, 100)//.setStrokeStyle(1, 0xff0000);

                let burn = this.scene.add.sprite(this.x, this.y, 'fire').play('fire');
                burn.scale = 2;

                this.checkCollisions(area, (unit) => {
                    if ( unit ) unit.changeHealth(-5);

                    let burned = Math.random() > .5;
                    if ( burned ) {

                        let burnedTicker = {times: 4, last: 4};

                        this.tweens.add({
                            targets: burnedTicker,
                            times: 0,
                            duration: 2000,
                            onUpdate: tween => {
                                if ( parseInt(burnedTicker.times) < burnedTicker.last ) {
                                    burnedTicker.last = parseInt(burnedTicker.times);

                                    if ( unit ) unit.changeHealth(-1);
                                    else this.tweens.killTweensOf(burnedTicker);
                                }
                            }
                        })
                    }
                })

                let fireAreaTicker = {times: 10, last: 10};

                this.tweens.add({
                    targets: fireAreaTicker,
                    times: 0,
                    duration: 5000,
                    onUpdate: tween => {
                        if ( parseInt(fireAreaTicker.times) < fireAreaTicker.last ) {
                            fireAreaTicker.last = parseInt(fireAreaTicker.times);
                            
                            this.checkCollisions(area, (unit) => {
                                if ( unit ) unit.changeHealth(-1);
        
                                let burned = Math.random() > .5;
                                if ( burned ) {
                                    let burnedTicker = {times: 4, last: 4};

                                    this.tweens.add({
                                        targets: burnedTicker,
                                        times: 0,
                                        duration: 2000,
                                        onUpdate: tween => {
                                            if ( parseInt(burnedTicker.times) < burnedTicker.last ) {
                                                burnedTicker.last = parseInt(burnedTicker.times);

                                                if ( unit ) unit.changeHealth(-1);
                                                else this.tweens.killTweensOf(burnedTicker);
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    },
                    onComplete: tween => {
                        area.destroy();
                        burn.destroy();
                    }
                });

                break;
            }
        }

        this.destroy();
    }
}