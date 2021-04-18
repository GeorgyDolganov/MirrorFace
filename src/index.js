import Phaser, {
  Scene
} from 'phaser';
import playerPNG from './assets/player.png';
import PhaserRaycaster from 'phaser-raycaster';
import Enemy from "./GameObjects/Enemy";
import Bullet from "./GameObjects/Bullet";
import mirrorPNG from "./assets/mirror.png";

Phaser.Geom.Line.fromAngle = function (x, y, angle, distance) {
  return new Phaser.Geom.Line(x, y, x + distance * Math.cos(angle), y + distance * Math.sin(angle));
}

let config = {
  type: Phaser.Auto,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: 'black',
  physics: {
    default: 'arcade',
    debug: true,
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  loader: {
    baseURL: 'https://labs.phaser.io',
    crossOrigin: 'anonymous'
  },
  //enable Phaser-raycaster plugin
  plugins: {
    scene: [{
      key: 'PhaserRaycaster',
      plugin: PhaserRaycaster,
      mapping: 'raycasterPlugin'
    }]
  }
}

Phaser.Geom.Line.fromAngle = function (x, y, angle, distance) {
  return new Phaser.Geom.Line(x, y, x + distance * Math.cos(angle), y + distance * Math.sin(angle));
};

let game = new Phaser.Game(config);

var raycaster;
var ray;
var graphics;
var obstacles;
var cursors
var staticObstacles;

//Stores all bullets on the scenes
var bullets;

//preload
function preload() {
  this.load.image('player', playerPNG);
  this.load.image('mirror', mirrorPNG);
  //this.load.atlas('space', 'assets/tests/space/space.png', 'assets/tests/space/space.json');
}

//create
function create() {

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
  console.log("obstacles", obstacles.getChildren());
  raycaster.mapGameObjects(obstacles.getChildren(), true);

  console.log(this.input.mousePointer)


  staticObstacles = this.physics.add.staticGroup({
    key: 'test',
    frameQuantity: 5
  });

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
      'down': Phaser.Input.Keyboard.KeyCodes.S ,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D,
  });

  ray.setAngle(-Math.PI / 2);
}


let tick = true;

//update
function update() {

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

  if ( intersection.object !== undefined && intersection.object.type == "Arc" ) {
    let angle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y, intersection.x, intersection.y);

    let tangentAngle = Phaser.Math.Angle.Between(intersection.object.x, intersection.object.y,  
    intersection.x + intersection.object.width / 2 * Math.cos(angle), 
    intersection.y + intersection.object.width / 2 * Math.sin(angle));
    let tangent = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, tangentAngle + Math.PI / 2, 100);

    intersection.segment = tangent
  }
  if ( intersection.segment !== undefined ) {
    let reflectionAngle = Phaser.Geom.Line.ReflectAngle(line, intersection.segment);

    // draw reflected line
    const REFLECTED_LINE_LENGTH = 500
    let line2 = Phaser.Geom.Line.fromAngle(intersection.x, intersection.y, reflectionAngle, REFLECTED_LINE_LENGTH);
    graphics.strokeLineShape(line2);
  }

  this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
}

function handlePlayerMovement(player) {
    const angle = cursors.up.isDown && cursors.left.isDown
              ||  cursors.up.isDown && cursors.right.isDown
              ||  cursors.down.isDown && cursors.left.isDown
              ||  cursors.down.isDown && cursors.right.isDown

    const BASE_SPEED = 160
    const SPEED = angle ? Math.sqrt( BASE_SPEED * BASE_SPEED / 2 ) : BASE_SPEED

    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-SPEED);
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(SPEED);
    }

    if (cursors.up.isDown)
    {
        player.body.setVelocityY(-SPEED);
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
  obstacles.add(scene.mirror, true);
}

function updateMirrorPosition(scene) {
    let angle =  scene.player.rotation;
    let r = 50;

    scene.mirror.x = scene.player.x + r * Math.cos(angle);
    scene.mirror.y = scene.player.y + r * Math.sin(angle);
    scene.mirror.rotation = angle + (90 * Math.PI/180);
}