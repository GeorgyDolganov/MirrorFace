import Phaser from "phaser";


export default class ReflectableRay {

    //Raycaster reference
    static Raycaster;

    //Origin and starting angle
    fromPoint;
    angle;

    //Damage per update tick on ray start
    initialDamage = 0.05;
    //Damage per update tick on current ray. It could be changed during reflection process
    damage = this.initialDamage;

    _graphics;
    _ray;
    _raySegments = [];

    MAX_REFLECTS = 3;

    constructor({scene, fromPoint, angle}) {
        this.scene = scene;
        this._graphics = scene.add.graphics({
            lineStyle: {
                width: 5,
                color: 0xb83530
            },
            fillStyle: {
                color: 0xff00ff
            }
        });
        this._graphics.lineGradientStyle(5, 0xff0000, 0xff0000, 0x0000ff, 0x0000ff, 1);
        this.fromPoint = fromPoint;
        this.angle = angle;

        this.update();
    }

    _createRayRecursively(fromPoint, angle) {
        this._raySegments = [];
        this.damage = this.initialDamage;
        let ray = this._getRay(fromPoint,angle);
        let intersection = ray.cast();
        this.calculateCircleSegment(intersection);

        let raySegment = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        this._raySegments.push(raySegment);
        this._createNextSegment(raySegment, intersection);
    }

    _tick = 0;
    _createNextSegment(prevRaySegment, intersection) {
        this.calculateCircleSegment(intersection);

        if( intersection.segment === undefined ) return;

        this._tick+= 1;
        if( this._tick > 100) {
            console.log(intersection);
            this._tick = 0;
        }

        let reflectionAngle = Phaser.Geom.Line.ReflectAngle(prevRaySegment, intersection.segment);

        if( intersection.object.onRayHit ) {
            intersection.object.onRayHit(this, {
                intersection, reflectionAngle, beforeReflectRayLine: prevRaySegment
            });
        }

        if( !intersection.object.canReflect ) {
            return;
        }

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

    changeDamage(changeBy) {
        this.damage += changeBy;
    }

    multiplyDamage(multiplyBy) {
        this.damage *= multiplyBy;
    }

    createReflectedParticles() {
        this.particlesContainer = this.scene.add.container();
        const particles = this.scene.add.particles('spark');

        this.emitter = particles.createEmitter({
            x: 400,
            y: 300,
            angle: { min: 240, max: 300 },
            speed: 400,
            gravityY: 0,
            lifespan: { min: 400, max: 800},
            quantity: 1,
            scale: 0.1,
            blendMode: 'ADD',
            alpha: { start: 0.7, end: 0 },
            accelerationX: -1,
            accelerationY: -1,
        });
        // this.emitter.stop
        // this.emitter.stop();

        this.particlesContainer.add(particles);
    }
}