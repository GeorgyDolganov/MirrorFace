import AEnemy from "./AEnemy";
import Phaser from "phaser";

export default class VampireEnemy extends AEnemy {

    maxHealth = 20;
    health = this.maxHealth;

    speed = 120;
    recalcPath = 0;

    currentAction;
    timestamp;

    isPerformingAttack = false;
    hitTween = { iterator: 0 };
    hitDelay = 400;

    blinkCooldown = Math.random() * 5000 + 5000;

    _isRetreated = false;
    _blinkTween;

    constructor(scene, x, y) {
        super(scene, x, y, "vampire");
        this.play({key: 'vampire_walk', repeat: -1});
        console.log(this.body.width);
        console.log(this.body.height);

        this.body.setCircle(18);
        this.body.setOffset(42, 32);

        this.setAction("movement");
    }

    onUpdate(time, delta) {
        if( !this.isAlive() ) return;

        this.healthBar.setPosition(this.x - 25, this.y + 35);
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) -Math.PI/2;
        this.blinkCooldown -= delta;


        if( this.health < 8 && !this._isRetreated ) {
            this.setAction("retreat");
            this._isRetreated = true;
            this.blinkCooldown = Math.random() * 5000 + 5000;
        }

        if( this.blinkCooldown < 0 ) {
            this.setAction("blink");
            this.blinkCooldown = Math.random() * 5000 + 5000;
        }

        this.doMirrorDamage();
        this.processVampireAction(time,delta);
    }


    doMirrorDamage() {
        return false;
        // var angleDiff = (Phaser.Math.Angle.Normalize(this.rotation) + Math.PI/2) - Phaser.Math.Angle.Normalize(this.scene.player.rotation) + Math.PI
        // const distanceBetween = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        // if( Math.abs(angleDiff) < 0.1 && distanceBetween < 300 ) {
        //     this.tint = 0xff0000;
        // } else {
        //     this.clearTint();
        // }
    }

    moveTowardsTo(gameObject) {
        let distance = Phaser.Math.Distance.Between(this.x, this.y, gameObject.x, gameObject.y);

        if( this.isPerformingAttack ) {
            if( distance > 90 ) {
                this.interruptAttack();
            }
        } else {
            if( distance > 40 ) {
                this.goTo(gameObject);
            } else {
                this.doTheHit();
                this.body.stop();
            }
        }
    }

    interruptAttack() {
        this.play({key: 'vampire_walk', repeat: -1});
        this.scene.tweens.killTweensOf(this.hitTween);
        this.isPerformingAttack = false;
    }

    processVampireAction(time, delta) {
        switch (this.currentAction) {
            case "movement":
                this.handleMovementAction(time,delta);
                break;
            case "retreat":
                this.handleRetreatAction(time,delta);
                break;
            case "blink":
                this.handleBlinkAction(time,delta);
                break;
        }
    }

    handleRetreatAction(time, delta) {
        this.blinkTo(this.getFarthestPoint(), () => {
            this.changeHealth(10);
        });
    }

    handleBlinkAction(time, delta) {
        this.blinkTo({
            x: this.scene.player.x + 30 * Math.cos(this.scene.player.rotation + Math.PI),
            y: this.scene.player.y + 30 * Math.sin(this.scene.player.rotation + Math.PI),
        }, () => {
            this.scene.player.changeHealth(-3);
            this.scene.player.runBloodAnimation(this.getHitAngleDegree());
        });
    }

    getFarthestPoint() {
        let points = [
            { x: 100, y: 100}, {x:1400,y:100}, {x:100,y:1400},{x:1400, y: 1400}
        ]
        let selectedPoint = points[0];
        let maxDistance = 0;
        points.forEach( p => {
            const distance = Phaser.Math.Distance.Between(p.x, p.y, this.scene.player.x, this.scene.player.y);
            if( distance > maxDistance ) {
                selectedPoint = p;
                maxDistance = distance;
            }
        })
        return selectedPoint;
    }
    blinkTo(target, onComplete) {
        if( this._blinkTween ) return;
        this._blinkTween = this.scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: 200,
            onComplete: tween => {
                this.setAction("movement");
                this._blinkTween = null;
                if( onComplete ) onComplete();
            }
        });
    }

    handleMovementAction(time,delta) {
        if ( this.recalcPath++ > 100 ) {
            this.recalcPath = 0;
            this.moveTowardsTo(this.scene.player);
        } else {
            if ( !this.releasePath() ) this.moveTowardsTo(this.scene.player);
        }
    }

    setAction(actionName) {
        this.timestamp = 0;
        if( actionName === "movement" ) {
            this.play({key: 'vampire_walk', repeat: -1})
        }

        this.currentAction = actionName;
    }

    doTheHit() {
        this.isPerformingAttack = true;

        this.hitTween = { iterator: 0 };

        this.play("vampire_attack")
        this.scene.tweens.add({
            targets: this.hitTween,
            iterator: this.hitDelay,
            duration: this.hitDelay,
            onComplete: tween => {
                if( !this.isAlive() ) return;
                this.isPerformingAttack = false;
                this.play({key: 'vampire_walk', repeat: -1});

                this.scene.player.changeHealth(-10);
                let deg =
                this.scene.player.runBloodAnimation(this.getHitAngleDegree());
                this.changeHealth(10);
            }
        });
    }

    getHitAngleDegree() {
        return Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Normalize(
                Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.scene.player.x, this.scene.player.y
                )
            )
        );
    }

    onDeath() {
        this.setActive(true);
        this.setVisible(true);
        this.play('vampire_death');
        this.scene.time.delayedCall(1200, () => {
            this.setActive(false);
            this.setVisible(false);
        });
    }
}