import Phaser, {
    Scene
  } from 'phaser';
import Bullet from "../GameObjects/Bullet";
import mirrorPNG from "../assets/mirror.png";
import Enemy from "../GameObjects/Enemy";
import playerPNG from "../assets/Player.png"


var raycaster;
var ray;
var graphics;
var bullets;
var obstacles
var cursors;

var staticObstacles;

let tick = true;

Phaser.Geom.Line.fromAngle = function (x, y, angle, distance) {
    return new Phaser.Geom.Line(x, y, x + distance * Math.cos(angle), y + distance * Math.sin(angle));
};

function handlePlayerMovement(player) {
    const angle = cursors.up.isDown && cursors.left.isDown
              ||  cursors.up.isDown && cursors.right.isDown
              ||  cursors.down.isDown && cursors.left.isDown
              ||  cursors.down.isDown && cursors.right.isDown

    const BASE_SPEED = 160
    const SPEED = angle ? Math.sqrt( BASE_SPEED * BASE_SPEED / 2 ) : BASE_SPEED

    if (cursors.left.isDown)
    {
        player.setVelocityX(-SPEED);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(SPEED);
    }

    if (cursors.up.isDown)
    {
        player.setVelocityY(-SPEED);
    }
    else if (cursors.down.isDown)
    {
        player.body.setVelocityY(SPEED);
    }
}

//create obstacles
function createObstacles(scene) {
    //create rectangle obstacle
    let obstacle = scene.add.rectangle(100, 100, 75, 75)
      .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle, true);
  
    //create line obstacle
    obstacle = scene.add.line(400, 100, 0, 0, 200, 50)
      .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);
  
    //create circle obstacle
    obstacle = scene.add.circle(650, 100, 50)
      .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);
  
    //create polygon obstacle
    obstacle = scene.add.polygon(650, 500, [0, 0, 50, 50, 100, 0, 100, 75, 50, 100, 0, 50])
      .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);
  
    //create overlapping obstacles
    for (let i = 0; i < 5; i++) {
      obstacle = scene.add.rectangle(350 + 30 * i, 550 - 30 * i, 50, 50)
        .setStrokeStyle(1, 0xff0000);
      obstacles.add(obstacle, true);
    }
  
    //create image obstacle
    scene.player = scene.physics.add.sprite(100, 500, 'player');
    scene.player.setDamping(true);
    scene.player.setDrag(0.0009);
    scene.player.setMaxVelocity(200);
    scene.player.health = 100;
  
    scene.mirror = scene.physics.add.sprite(0, 0, "mirror");
    scene.mirror.setImmovable();
  
    scene.enemy = new Enemy(scene, 100, 200, bullets);
    obstacles.add(scene.enemy, true);
    obstacles.add(scene.player, true);
}  

function updateMirrorPosition(scene) {
    let angle =  scene.player.rotation;
    let r = 20;

    scene.mirror.x = scene.player.x + r * Math.cos(angle);
    scene.mirror.y = scene.player.y + r * Math.sin(angle);
    scene.mirror.rotation = angle + (90 * Math.PI/180);
}

export default class Arena0 extends Scene {

    preload() {
        this.load.image('player', playerPNG);
        this.load.image('mirror', mirrorPNG);
        //this.load.atlas('space', 'assets/tests/space/space.png', 'assets/tests/space/space.json');
    }

    create() {
        //create raycaster
        raycaster = this.raycasterPlugin.createRaycaster();

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
        createObstacles(this);
        console.log(obstacles)
        //map obstacles
        console.log(obstacles.getChildren());
        raycaster.mapGameObjects(obstacles.getChildren());

        console.log(this.input.mousePointer)


        staticObstacles = this.physics.add.staticGroup({
            key: 'test',
            frameQuantity: 5
        });
        Phaser.Actions.PlaceOnRectangle(staticObstacles.getChildren(), new Phaser.Geom.Rectangle(100,100, 600, 400));

        staticObstacles.refresh();
        this.physics.add.collider(this.player, staticObstacles);

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

            this.physics.velocityFromRotation(mirror.rotation - (90 * Math.PI/180), bullet.speed, bullet.body.velocity);
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

        this.input.on('pointermove', function (pointer) {
            this.player.rotation = Phaser.Math.Angle.Between(800/2, 600/2, pointer.x, pointer.y)
        }, this);

        cursors = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        ray.setAngle(-Math.PI / 2);
    }

    update(time, delta) {
        raycaster.mapGameObjects(obstacles.getChildren());

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

        handlePlayerMovement(this.player);
        updateMirrorPosition(this);


        //draw ray
        graphics.clear();
        let line = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
        graphics.fillPoint(ray.origin.x, ray.origin.y, 3)
        graphics.strokeLineShape(line);

        if ( intersection.segment !== undefined ) {
            let reflectionAngle = Phaser.Geom.Line.ReflectAngle(line, intersection.segment);

            // draw reflected line
            const REFLECTED_LINE_LENGTH = 500
            let line2 = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, reflectionAngle, REFLECTED_LINE_LENGTH);
            graphics.strokeLineShape(line2);
        }

        this.enemy.update(this.player)
    }
}