import AEnemy from "./AEnemy";
import ReflectableRay from "../ReflectableRay";
import {silentLog} from "../../Helpers";
import Phaser from "phaser";

export default class HydraEnemy extends AEnemy {

    _container;
    _leftHead;
    _rightHead;
    _centerHead;

    _leftRay;
    _rightRay;
    _centerRay;

    maxHealth = 300;
    health = this.maxHealth;

    _realRotation;

    leftTrun = Math.floor(Math.random() * 1000) + 1000
    rughtTrun = Math.floor(Math.random() * 1000) + 1000

    constructor(scene, x, y) {
        super(scene, x, y, "hydra");

        this._container = scene.add.container();
        this._centerHead = scene.add.image(0, 18, "hydra_head");
        this._leftHead = scene.add.image(30, 15, "hydra_head");
        this._rightHead =  scene.add.image(-30, 15, "hydra_head");

        this._leftHead.rotation = 0.1;
        this._rightHead.rotation = -0.1;
        this._container.add(this._rightHead);
        this._container.add(this._leftHead);
        this._container.add(this._centerHead);
        this.play("hydra_walk");

        this._leftRay = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        });

        this._centerRay = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        });

        this._rightRay = new ReflectableRay({
            scene, fromPoint: {x: 0, y: 0}, angle: 0
        });
        this._rightRay.firstIgnoredObjects.push(this, this._leftHead, this._rightHead, this._centerHead,this._container);
        this._centerRay.firstIgnoredObjects.push(this, this._leftHead, this._rightHead, this._centerHead,this._container);
        this._leftRay.firstIgnoredObjects.push(this, this._leftHead, this._rightHead, this._centerHead,this._container);

        this._centerRay.initialDamage = 0.22;
        this._leftRay.initialDamage = 0.14;
        this._rightRay.initialDamage = 0.14;

        this.body.setCircle(22);
        this.body.setOffset(0, 40);

    }

    onRayHit(ray) {
        super.onRayHit(ray);
        this._leftHead.tint = 0xff0000;
        this._centerHead.tint = 0xff0000;
        this._rightHead.tint = 0xff0000;
    }

    turn(head) {
        if ( head.turning === true ) return;
        head.turning = true;

        let baseRotation = head.rotation;

        scene.tweens.add({
            targets: head,
            duration: 1000,
            rotation: baseRotation < 0 ? Math.PI / 4 : -Math.PI / 4,
            onComplete: tween => {
                scene.tweens.add({
                    targets: head,
                    duration: 1000,
                    rotation: baseRotation,
                    onComplete: tween => {
                        head.turning = false;
                    }
                })
            }
        })
    }

    onUpdate(time, delta) {
        this._leftHead.clearTint();
        this._centerHead.clearTint();
        this._rightHead.clearTint();
        this._realRotation = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) - Math.PI/2;

        this._container.setRotation(this._realRotation);
        this._container.setPosition(this.x, this.y);
        this.healthBar.setPosition(this.x - 25, this.y + 60);

        if ( this.leftTrun-- <= 0 ) {
            this.leftTrun = Math.floor(Math.random() * 1000) + 500
            this.turn(this._leftHead)
        }
        if ( this.rughtTrun-- <= 0 ) {
            this.rughtTrun = Math.floor(Math.random() * 1000) + 500
            this.turn(this._rightHead)
        }

        if (Phaser.Math.Distance.Between(this.x, this.y, scene.player.x, scene.player.y) > 150) {
            if ( this.recalcPath++ > 100 ) {
                this.recalcPath = 0;
                this.goTo(scene.player);
            } else
            if ( this.releasePath() ) {
                if ( this.isStacked() ) {
                    scene.tweens.add({
                        targets: this,
                        duration: 100,
                        x: this.x + 10 * Math.sin(Math.random() * Math.PI * 2),
                        y: this.y + 10 * Math.cos(Math.random() * Math.PI * 2)
                    })
                }
            } else {
                this.goTo(scene.player);
            }
        } else {
            this.recalcPath = 0;
            this.body.velocity.set(0);
        }
        this.setRotation(this._realRotation);
        this.updateRays();
    }

    updateRays() {
        // let centerTranslate = this.translatePoint2(0, 34, this.x, this.y, Phaser.Math.Angle.Normalize(this.rotation));
        // this._centerRay.setOrigin({
        //     x:  centerTranslate.x, y:   centerTranslate.y
        // });
        // this._centerRay.setAngle(Phaser.Math.Angle.Between(
        //     this.scene.player.x, this.scene.player.y,
        //     centerTranslate.x, centerTranslate.y
        // ));
        // this._centerRay.update();
        this.updateRay(this._centerRay, {x: 0, y: 34}, this._centerHead.rotation)
        this.updateRay(this._leftRay, {x: 30, y: 30}, this._leftHead.rotation)
        this.updateRay(this._rightRay, {x: -30, y: 30}, this._rightHead.rotation)
    }

    updateRay(ray, offset, headRotation) {
        let translate = this.translatePoint2(offset.x, offset.y, this.x, this.y, this._realRotation + headRotation / 3);
        ray.setOrigin({
            x: translate.x,
            y: translate.y
        });
        if ( headRotation == 0 ) {
            ray.setAngle(Phaser.Math.Angle.Between(
                this.scene.player.x, this.scene.player.y,
                translate.x, translate.y
            ) - Math.PI);
        } else {
            ray.setAngle(this._realRotation + Math.PI / 2 + headRotation);
        }
        ray.update();
    }

    onDeath() {
        this._centerRay.disable();
        this._leftRay.disable();
        this._rightRay.disable();
        this._container.setVisible(false);
        this._container.setActive(false);

        this.setActive(true);
        this.setVisible(true);
        this.clearTint();
        this.play("hydra_death");

        this.scene.time.delayedCall(700, () => {
            this.setActive(false);
            this.setVisible(false);
            this.explode();
        });
    }

    explode() {
        const pieces = [
            "hydra_piece0", "hydra_piece1", "hydra_piece2", "hydra_piece3", "hydra_piece4", "hydra_piece5","hydra_piece6","hydra_piece7","hydra_piece8"
        ]


        pieces.forEach(p => {
            const image = this.scene.add.image(this.x, this.y, p);
            const targetPos = new Phaser.Geom.Circle(this.x,this.y, 120).getRandomPoint();
            this.scene.tweens.add({
                targets: image,
                x: targetPos.x,
                y: targetPos.y,
                ease: 'Cubic.easeOut',
                duration: 600,
                onComplete: () => {
                    image.setDepth(0);
                    // this.setActive(false);
                    // this.setVisible(false);
                }
            })
        });
    }

    translatePoint2(pointX, pointY, centerX, centerY, rotationDegrees){
        var radians = rotationDegrees;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var x = centerX + (pointX * cos) - (pointY * sin);
        var y = centerY + (pointX * sin) + (pointY * cos);
        return {x, y};
    }
}