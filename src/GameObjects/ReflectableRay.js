import Phaser from "phaser";


export default class ReflectableRay {

    static Raycaster;

    _graphics;
    _ray;
    _raySegments = [];

    MAX_REFLECTS = 7;

    constructor({scene, fromPoint, angle}) {
        this._graphics = scene.add.graphics({
            lineStyle: {
                width: 1,
                color: 0x00ff00
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

        let raySegment = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        this._raySegments.push(raySegment);
        this._createNextSegment(raySegment, intersection);
    }

    _createNextSegment(prevRaySegment, intersection) {

        if( intersection.segment === undefined ) return;
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
        let ray = ReflectableRay.Raycaster.createRay({
            origin: from
        });
        ray.enablePhysics();
        ray.setCollisionRange(6000);
        ray.setAngle(angle);

        return ray;
    }
}