import Phaser, {
    Scene
} from 'phaser';
import Bullet from "../GameObjects/Bullet";
import ReflectableRay from "../GameObjects/ReflectableRay";
import Stats from "stats.js";
import createObstacles from '../functions/createObstacles';
import handlePlayerMovement from '../functions/handlePlayerMovment';
import updateMirrorPosition from '../functions/updateMirrorPosition';

import playerPNG from "../assets/Player.png"
import mirrorPNG from "../assets/mirror.png";
import metalfloorPNG from "../assets/metalfloor.png"
import mirrorwallPNG from "../assets/mirrorwall.png"

var raycaster;
var ray;
var graphics;
var bullets;
var obstacles
var cursors;

var staticObstacles;
var reflectableRay;

let tick = true;

var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);


Phaser.Geom.Line.fromAngle = function(x, y, angle, distance) {
    return new Phaser.Geom.Line(x, y, x + distance * Math.cos(angle), y + distance * Math.sin(angle));
};

export default class Arena0 extends Scene {

    preload() {
        this.load.image('player', playerPNG);
        this.load.image('mirror', mirrorPNG);
        this.load.image('metalfloor', metalfloorPNG)
        this.load.image('mirrorwall', mirrorwallPNG)
    }

    create() {

        this.physics.world.setBounds(0, 0, 1280, 1280);

        //Создаем арену
        this.arena = this.add.group()
        this.arena.floor = this.add.tileSprite(640, 640, 1280, 1280, 'metalfloor').setName('floor')
        this.arena.add(this.arena.floor)

        this.arena.walls = this.physics.add.group()
        this.arena.add(this.arena.walls)

        this.arena.wall0 = this.add.tileSprite(-16, 640, 32, 1280, 'mirrorwall').setName('wall0')
        this.arena.walls.add(this.arena.wall0)

        this.arena.wall1 = this.add.tileSprite(640, -16, 32, 1280, 'mirrorwall').setName('wall1')
        this.arena.wall1.angle = 90
        this.arena.walls.add(this.arena.wall1)

        this.arena.wall2 = this.add.tileSprite(1296, 640, 32, 1280, 'mirrorwall').setName('wall2')
        this.arena.wall2.angle = 180
        this.arena.walls.add(this.arena.wall2)

        this.arena.wall3 = this.add.tileSprite(640, 1296, 32, 1280, 'mirrorwall').setName('wall3')
        this.arena.wall3.angle = -90
        this.arena.walls.add(this.arena.wall3)

        //create raycaster
        raycaster = this.raycasterPlugin.createRaycaster();

        ReflectableRay.Raycaster = raycaster;

        //create ray
        ray = raycaster.createRay({
            origin: {
                x: 400,
                y: 300
            }
        });

        //enable auto slicing field of view
        ray.autoSlice = true;
        //enable arcade physics body
        ray.enablePhysics();
        //set collision (field of view) range
        ray.setCollisionRange(6000);

        //cast ray
        let intersection = ray.cast();

        bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });


        //create obstacles
        obstacles = this.add.group();
        createObstacles(this, obstacles, bullets);
        console.log(obstacles)
            //map obstacles
        console.log("obstacles", obstacles.getChildren());
        raycaster.mapGameObjects(obstacles.getChildren(), true);

        console.log(this.input.mousePointer)


        staticObstacles = this.physics.add.staticGroup({
            key: 'test',
            frameQuantity: 5
        });

        this.player.setCollideWorldBounds(true)

        this.physics.add.collider(this.player, staticObstacles);

        this.physics.add.collider(this.player, this.arena.walls);

        this.physics.add.collider(this.player, bullets, (player, bullet) => {
            console.log("Player hit", bullet);
            player.health -= 10;
            bullet.remove();
        });
        this.physics.add.collider(this.mirror, bullets, (mirror, bullet) => {
            console.log("Mirror hit", bullet);

            let mirrorLine = Phaser.Geom.Line.fromAngle(mirror.x, mirror.y, mirror.rotation, 200);
            let bulletLine = Phaser.Geom.Line.fromAngle(bullet.x, bullet.y, bullet.rotation, 200);

            let reflectionAngle = Phaser.Geom.Line.ReflectAngle(mirrorLine, bulletLine);
            console.log(reflectionAngle);

            this.physics.velocityFromRotation(mirror.rotation - (90 * Math.PI / 180), bullet.speed, bullet.body.velocity);
        });

        //draw ray
        graphics = this.add.graphics({
            lineStyle: {
                width: 1,
                color: 0x00ff00
            },
            fillStyle: {
                color: 0xff00ff
            }
        });
        let line = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        graphics.fillPoint(ray.origin.x, ray.origin.y, 3)
        graphics.strokeLineShape(line);

        //Set camera to follow the player
        this.cameras.main.startFollow(this.player);

        this.input.on('pointermove', function(pointer) {
            this.player.rotation = Phaser.Math.Angle.Between(800 / 2, 600 / 2, pointer.x, pointer.y)
        }, this);

        cursors = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        ray.setAngle(-Math.PI / 2);

        reflectableRay = new ReflectableRay({
            scene: this,
            fromPoint: { x: 400, y: 400 },
            angle: 0.48
        });
    }

    update(time, delta) {
        stats.begin();
        reflectableRay.update();
        //rotate ray
        ray.setAngle(ray.angle + 0.005);
        //cast ray
        let intersection = ray.cast();

        // let visibleObjects = ray.overlap();
        // if (visibleObjects.length > 0) console.log(visibleObjects);
        if (intersection.object === undefined) tick = true

        if (tick) {
            if (intersection.object !== undefined) {
                console.log("hit", {
                    object: intersection.object,
                    segment: intersection.segment,
                    pos: {
                        x: intersection.x,
                        y: intersection.y
                    }
                });
                tick = false
            }
        }

        handlePlayerMovement(this.player, cursors);
        updateMirrorPosition(this);


        //draw ray
        graphics.clear();
        let line = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        graphics.fillPoint(ray.origin.x, ray.origin.y, 3)
        graphics.strokeLineShape(line);

        if (intersection.object !== undefined && intersection.object.type == "Arc") {
            let angle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y, intersection.x, intersection.y);

            let tangentAngle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y,
                intersection.x + intersection.object.width / 2 * Math.cos(angle),
                intersection.y + intersection.object.width / 2 * Math.sin(angle));
            let tangent = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, tangentAngle + Math.PI / 2, 100);

            intersection.segment = tangent
        }
        if (intersection.segment !== undefined) {
            let reflectionAngle = Phaser.Geom.Line.ReflectAngle(line, intersection.segment);

            // draw reflected line
            const REFLECTED_LINE_LENGTH = 500
            let line2 = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, reflectionAngle, REFLECTED_LINE_LENGTH);
            graphics.strokeLineShape(line2);
        }

        this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
        stats.end();
    }
}