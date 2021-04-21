import Phaser from "phaser";


export default class ReflectableRay {

    //Raycaster reference
    static Raycaster;

    //Origin and starting angle
    fromPoint;
    angle;

    //Damage per update tick
    damage = 0.05;


    _graphics;
    _ray;
    _raySegments = [];

    MAX_REFLECTS = 3;

    constructor({scene, fromPoint, angle}) {
        this._graphics = scene.add.graphics({
            lineStyle: {
                width: 5,
                color: 0xb83530
            },
            fillStyle: {
                color: 0xff00ff
            }
        });
        this.fromPoint = fromPoint;
        this.angle = angle;

        this.update();
    }

    _createRayRecursively(fromPoint, angle) {
        this._raySegments = [];
        let ray = this._getRay(fromPoint,angle);
        let intersection = ray.cast();
        this.calculateCircleSegment(intersection);

        let raySegment = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        this._raySegments.push(raySegment);
        this._createNextSegment(raySegment, intersection);
    }

    _createNextSegment(prevRaySegment, intersection) {
        this.calculateCircleSegment(intersection);

        if( intersection.segment === undefined ) return;

        if( intersection.object.onRayHit ) intersection.object.onRayHit(this);

        if( !intersection.object.canReflect ) {
            return;
        }

        let reflectionAngle = Phaser.Geom.Line.ReflectAngle(prevRaySegment, intersection.segment);
        let ray = this._getRay({
            x: intersection.x + Math.cos(reflectionAngle)/1000,
            y: intersection.y + Math.sin(reflectionAngle)/1000
        }, reflectionAngle);

        let nextIntersection = ray.cast();

        let raySegment = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, nextIntersection.x, nextIntersection.y);
        this._raySegments.push(raySegment);
        if( this._raySegments.length < this.MAX_REFLECTS) {
            this._createNextSegment(raySegment,nextIntersection);
        }
    }

    calculateCircleSegment(intersection) {
        if ( intersection.object !== undefined && intersection.object.type == "Arc" ) {
            let angle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y, intersection.x, intersection.y);

            let tangentAngle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y,
                intersection.x + intersection.object.width / 2 * Math.cos(angle),
                intersection.y + intersection.object.width / 2 * Math.sin(angle));
            let tangent = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, tangentAngle + Math.PI / 2, 100);

            intersection.segment = tangent
        }
    }

    setOrigin(newOrigin) {
        this.fromPoint = newOrigin;
    }

    setAngle(angle) {
        this.angle = angle;
    }

    update() {
        this._createRayRecursively(this.fromPoint, this.angle);
        this.render();
    }

    render() {
        this._graphics.clear();
        this._raySegments.forEach(line => {
            this._graphics.strokeLineShape(line);
        });
    }

    _getRay(from, angle) {
        if( this._ray === undefined ) {
           this._ray = ReflectableRay.Raycaster.createRay({
                origin: from
            });
        } else {
            this._ray.origin = from;
        }

        this._ray.enablePhysics();
        this._ray.setCollisionRange(6000);
        this._ray.setAngle(angle);

        return this._ray;
    }

    disable() {
        this._graphics.clear();
    }
}