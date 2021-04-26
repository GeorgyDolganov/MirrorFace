import Phaser from "phaser";

let anim;

class AnimatedParticle extends Phaser.GameObjects.Particles.Particle
{
    constructor (emitter)
    {
        super(emitter);

        this.t = 0;
        this.i = 0;
    }

    update (delta, step, processors)
    {
        var result = super.update(delta, step, processors);

        this.t += delta;

        if (this.t >= anim.msPerFrame)
        {
            this.i++;

            if (this.i > 4)
            {
                this.i = 0;
            }

            this.frame = anim.frames[this.i].frame;

            this.t -= anim.msPerFrame;
        }

        return result;
    }
}
export default class Mirror extends Phaser.Physics.Arcade.Sprite {

    /**
     * Radius of mirror related to player
     * @type {number}
     */
    radius = 23;
    /**
     * Flag that this object reflects rays
     * @type {boolean}
     */
    canReflect = true;
    /**
     * Reflected rays will have damage multiplied by this
     * @type {number}
     */
    reflectDamageMultiplier = 1;
    /**
     * Amount of damage this mirror can absorb before being broken
     * @type {number}
     */
    maxStability = 100;
    /**
     * Amount of current stability
     * @type {number}
     */
    stability = this.maxStability;
    /**
     * Amount of stability restored per second while no damage received
     * @type {number}
     */
    restoreRate = 30;
    /**
     * Delay in seconds before starting restoring mirror stability
     * @type {number}
     */
    restoreDelay = 2;
    /**
     * Time elapsed without taking damage
     * @param scene
     */
    noDamageTime;

    soundPlaying = false;

    _regenerationParticles;
    _particlesContainer;

    _reflectParticles;
    _reflectEmitters = [];

    constructor(scene) {
        super(scene, 0, 0, scene.player.mirror);
        scene.physics.add.existing(this);
        this._scene = scene
        this.setImmovable();
        scene.add.existing(this);
        anim = scene.anims.create({
            key: 'emit',
            frames: scene.anims.generateFrameNumbers('reflectParticles'),
            frameRate: 18,
            repeat: -1
            
        })
        this._reflectParticles2 = scene.add.particles('reflectParticles')
        this._reflectParticles2.setDepth(10)
        this._reflectParticles = scene.add.particles('spark');

        
        this._particlesContainer = scene.add.container();
        let particles = scene.add.particles('spark');
        this._particlesContainer.setDepth(10);
        this._regenerationParticles = particles.createEmitter({
            x: { min: -30, max: 30},
            y: { min: -10, max: 10},
            lifespan: 400,
            quantity: 1,
            scale:  0.15,
            blendMode: 'ADD',
            alpha: { start: 1, end: 0},
        });
        this._particlesContainer.add(particles);

        this.setDepth(9)
    }

    preUpdate(time, delta) {
        this.noDamageTime += delta;
        this.clearParticles(delta);

        if (this.noDamageTime > this.restoreDelay * 1000) {
            this.restoreStability(delta);
        } else {
            this._regenerationParticles.stop();
        }
    }

    clearParticles(delta) {
        let markForRemove = [];
        this._reflectEmitters.forEach((e, index) => {
            if (e.timestamp > 150) {
                markForRemove.push(index);
                e.emitter.stop();
                if (this._scene.mirrorHitSound.isRunning){
                    this._scene.mirrorHitSound.stop()
                }
                this._reflectParticles2.removeEmitter(e);
            } else {
                e.timestamp += delta;
            }
        });
        markForRemove.forEach(i => {
            this._reflectEmitters.splice(i, 1);
        })
    }

    addReflectEmitter(ray, {
        reflectionAngle,
        intersection,
        beforeReflectRayLine
    }) {
        const originAngle = Phaser.Geom.Line.Angle(beforeReflectRayLine);
        const origDeg = Phaser.Math.RadToDeg(originAngle);
        const reflectDeg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Normalize(reflectionAngle)) - 180;
        const min = origDeg > reflectDeg ? reflectDeg : origDeg;
        const max = origDeg > reflectDeg ? origDeg : reflectDeg;

        const existedEmitter = this._reflectEmitters.find(e => e.srcRay === ray);
        if (existedEmitter) {
            existedEmitter.timestamp = 0;
            existedEmitter.emitter.setPosition(intersection.x, intersection.y);
            existedEmitter.emitter.setAngle({
                min: min - 20 + 180,
                max: max + 20 + 180
            });
            existedEmitter.emitter.setQuantity(ray.damage / 0.05);
        } else {
            const emitter = this._reflectParticles2.createEmitter({
                x: intersection.x,
                y: intersection.y,
                angle: {
                    min: 225,
                    max: 315
                },
                speed: 400,
                gravityY: 0,
                lifespan: {
                    min: 100,
                    max: 200
                },
                quantity: ray.damage / 0.05,
                scale: {
                    start: 1,
                    end: 0
                },
                blendMode: 'ADD',
                // alpha: { start: 0.7, end: 0 },
                // tint: 0xff0000
                alpha: {
                    start: 1,
                    end: 1
                },
                tint: 0xb83530,
                particleClass: AnimatedParticle
            });
            this._reflectEmitters.push({
                srcRay: ray,
                emitter: emitter,
                timestamp: 0,
            })

        }
    }

    restoreStability(delta) {
        if (this.stability === this.maxStability) {
            this._regenerationParticles.stop();
            return;
        }

        this._regenerationParticles.start();
        this._particlesContainer.setPosition(this.x, this.y);
        this._particlesContainer.setRotation(this.rotation);
        // this._regenerationParticles.setPosition(
        //     {min: this.x-20, max: this.x+20,},
        //     {min: this.y-20, max: this.y+20,}
        // );
        this.changeStability(this.restoreRate * delta / 1000);
    }

    onRayHit(ray, intersectionInfo) {
        this.addReflectEmitter(ray, intersectionInfo);
        this.noDamageTime = 0;
        this.changeStability(-ray.damage);
        ray.multiplyDamage(this.reflectDamageMultiplier);
        if (Math.round(Math.random() * 5) === 3){
            this._scene.mirrorHitSound.play()
        }
        
    }

    changeStability(changeBy) {
        this.stability += changeBy;
        this.setTint(0xffffff)
        if (this.stability > this.maxStability) this.stability = this.maxStability;
        if (this.stability < 0) {
            this.stability = 0;
            this.disableReflect();
        } else {
            this.enableReflect();
        }
        this.scene.gameUI.mirrorStabilityBar.update(this.stability / this.maxStability * 100);
    }

    disableReflect() {
        this.scene.raycaster.removeMappedObjects(this);
        this.canReflect = false;

        this.setAlpha(0.4);
    }

    enableReflect() {
        this.scene.raycaster.mapGameObjects(this);
        this.canReflect = true;
        this.setAlpha(1);
    }
}