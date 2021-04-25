import AEnemy from "./AEnemy";
import Phaser from "phaser";
import Item from "../Item";

export default class MagicianEnemy extends AEnemy {
    action = 'none'

    recalcPath = 0
    attackDelay = 0
    queue = false

    speed = 200

    reward = 50

    constructor(scene, x, y) {
        super(scene, x, y, "magician");
    }

    onUpdate() {
        let distance = Phaser.Math.Distance.Between(this.x, this.y, scene.player.x, scene.player.y);

        if ( distance > 300) {
            this.setAction('walk');

            if ( this.recalcPath++ > 100 ) {
                this.recalcPath = 0;
                this.goTo(scene.player);
            } else
                if ( this.releasePath() ) {
                    if ( this.isStacked() ) {
                        // nothing
                    }
                } else {
                    this.goTo(scene.player);
                }
        } else if ( distance < 200 ) {
            this.setAction('retreat');

            if ( this.recalcPath++ > 100 ) {
                this.recalcPath = 0;
                this.goTo( this.getRandomPoint() );
            } else
                if ( this.releasePath() ) {
                    if ( this.isStacked() ) {
                        // nothing
                    }
                } else {
                    this.goTo( this.getRandomPoint() );
                }
        } else {
            this.setAction('attack');
            this.recalcPath = 0;
            this.body.velocity.set(0);

            if ( this.attackDelay++ > 100 ) {
                this.attackDelay = 0;

                let item = new Item(scene, this.x + 100 * Math.sin(this._realRotation), this.y + 100 * Math.cos(this._realRotation), 'magicicanAttack');
                this.queue = !this.queue;
                this.throw(item, this.queue ? {x: 0, y: 35} : {x: 0, y: -35}, this.rotation);
            }
        }

        let angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y) + Math.PI;
        this.rotation = angle;
    }

    getRandomPoint() {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);

        return {
            x: this.x + 300 * Math.sin( angle ),
            y: this.y + 300 * Math.cos( angle )
        }
    }

    throw(item, offset, rotation) {
        let translate = this.translatePoint2(offset.x, offset.y, this.x, this.y, rotation);

        item.x = translate.x;
        item.y = translate.y;

        item.update();
        
        item.throw(scene.player.x, scene.player.y);
    }

    translatePoint2(pointX, pointY, centerX, centerY, rotationDegrees){
        var radians = rotationDegrees;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var x = centerX + (pointX * cos) - (pointY * sin);
        var y = centerY + (pointX * sin) + (pointY * cos);
        return {x, y};
    }

    setAction(action) {
        if ( action === this.action ) return;
        this.action = action;

        if ( action === 'walk' ) {
            this.path = null;
            this.play({key: 'Walk', repeat: -1});
            return;
        }

        if ( action === 'retreat' ) {
            this.path = null;
            this.play({key: 'Walk', repeat: -1});
            return;
        }

        if ( action === 'attack' ) {
            this.play({key: 'attack', repeat: -1});
            return;
        }
    }
}