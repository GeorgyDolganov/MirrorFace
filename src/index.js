import Phaser, {
  Scene
} from 'phaser';
import playerPNG from './assets/player.png';
import PhaserRaycaster from 'phaser-raycaster';

let config = {
  type: Phaser.Auto,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: 'black',
  physics: {
    default: 'arcade',
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

let game = new Phaser.Game(config);

var raycaster;
var ray;
var graphics;
var obstacles;
var cursors

//preload
function preload() {
  this.load.image('player', playerPNG);
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
  ray.setCollisionRange(600);

  //cast ray
  let intersection = ray.cast();

  //create obstacles
  obstacles = this.add.group();
  createObstacles(this);
  console.log(obstacles)
  //map obstacles
  raycaster.mapGameObjects(obstacles.getChildren());

  console.log(this.input.mousePointer)




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
  console.log(this)

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
}


let tick = true;

//update
function update() {
  //rotate ray
  ray.setAngle(ray.angle + 0.01);
  //cast ray
  let intersection = ray.cast();

  // let visibleObjects = ray.overlap();
  // if (visibleObjects.length > 0) console.log(visibleObjects);

  // console.log(
  //   ray.overlap(
  //     obstacles.getChildren()
  //   )
  // );
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

  //draw ray
  graphics.clear();
  let line = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
  graphics.fillPoint(ray.origin.x, ray.origin.y, 3)
  graphics.strokeLineShape(line);
}

function handlePlayerMovement(player) {
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
    }

    if (cursors.up.isDown)
    {
        player.setVelocityY(-160);
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(160);
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


  obstacles.add(scene.player, true);
}