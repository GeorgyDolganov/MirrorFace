import Phaser, { Scene } from 'phaser';
import logoImg from './assets/logo.png';
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


//preload
function preload() {
  this.load.image('crate', 'assets/sprites/ghost.png');
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

}


let tick = 0;

//update
function update() {
  //rotate ray
  ray.setAngle(ray.angle + 0.01);
  //cast ray
  let intersection = ray.cast();

  let visibleObjects = ray.overlap();
  if (visibleObjects.length > 0) console.log(visibleObjects);
  
  // console.log(
  //   ray.overlap(
  //     obstacles.getChildren()
  //   )
  // );
  if( tick++ > 100 ) {
    console.log("hit", intersection.object); //hit object
    console.log("segment", intersection.segment); //segment object
    tick = 0;
  }

  
  this.physics.add.overlap(ray, obstacles.getChildren(), function (rayFoVCircle, target) {
    console.log({
      rayFoVCircle,
      target
    })
    /*
     * What to do with game objects in line of sight.
     */
  }, ray.processOverlap.bind(ray));




  //draw ray
  graphics.clear();
  let line = new Phaser.Geom.Line(ray.origin.x, ray.origin.y, intersection.x, intersection.y);
  graphics.fillPoint(ray.origin.x, ray.origin.y, 3)
  graphics.strokeLineShape(line);
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
  obstacle = scene.add.image(100, 500, 'crate');
  obstacles.add(obstacle, true);
}