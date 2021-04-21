import Phaser from "phaser";
import ReflectableRay from "../ReflectableRay";
import GameObjectHealthBar from "../UI/GameObjectHealthBar";
import RaycasterEnemy from "./RaycasterEnemy";

export default class SkeletonEnemy extends RaycasterEnemy {

    targetPosition;
    currentAction;
    timestamp;

    maxHealth = 25;
    health = this.maxHealth;

    speed = 200;

    constructor(scene, x, y, children) {
        super(scene, x, y, "skeleton")
        this.setScale(0.7);
        this.setAction("movement");


        this.rays[0].damage = 0.2;
    }

    onUpdate(time, delta) {
        this.healthBar.setPosition(this.x - 25, this.y + 40);
        this.processSkeletonAction(time,delta);
    }

    processSkeletonAction(time, delta) {
       switch (this.currentAction) {
           case "movement":
               this.handleMovementAction(time,delta);
               break;
           case "charge":
               this.handleChargeAction(time,delta);
               break;
           case "fire":
               this.handleFireAction(time,delta);
               break;
       }
    }


    handleMovementAction(time, delta) {
        this.moveTo(this.targetPosition);
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y) - 1.5;

        if( Phaser.Math.Distance.BetweenPoints(this, this.targetPosition) < 200 ) {
            this.body.stop();
            if( Phaser.Math.Distance.BetweenPoints(this, this.scene.player) > 500) {
                this.setAction("movement");
            } else {
                this.setAction("charge");
            }
        }
    }

    handleChargeAction(time, delta) {
        this.stop();
        this.body.stop();
        this.timestamp += delta;
        if( this.timestamp > 1000 ) {
            this.setAction("fire");
        }
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) - 1.5;
    }

    handleFireAction(time, delta) {
        this.body.stop();
        this.timestamp += delta;
        if( this.timestamp > 2000 ) {
            this.setAction("movement");
            this.rays.forEach( r => r.disable() );
            return;
        }


        this.rays.forEach((r, index) => {
            r.setOrigin(this._calculateRayOrigin());
            r.setAngle(Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y));
            r.update();
        });
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) - 1.5;
    }

    setAction(actionName) {
        this.timestamp = 0;
        if( actionName === "movement" ) {
            this.findNextPosition();
            this.play({key: 'walk', repeat: -1})
        } else {
            this.stop();
        }

        this.currentAction = actionName;
    }

    findNextPosition() {
        let area = new Phaser.Geom.Circle(this.scene.player.x, this.scene.player.y, 200);
        this.targetPosition = area.getRandomPoint();
    }

    _calculateRayOrigin() {
        let r = 80;
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        return {
            x: this.x + r * Math.cos(angle),
            y: this.y + r * Math.sin(angle)
        }
    }
}