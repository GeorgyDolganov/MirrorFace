import Phaser, {
    Scene
} from 'phaser';
import ReflectableRay from "../GameObjects/ReflectableRay";
import Stats from "stats.js";
import createObstacles from '../functions/createObstacles';
import handlePlayerMovement from '../functions/handlePlayerMovment';
import updateMirrorPosition from '../functions/updateMirrorPosition';
import Crate from "../GameObjects/Crate";
import GameUI from "../GameObjects/UI/GameUI";
import EnemiesManager from "../Managers/EnemiesManager";

import playerPNG from "../assets/Player.png"
import grenadePNG from "../assets/grenade.png"
import shardPNG from "../assets/shard.png"
import pyramidHeadPNG from "../assets/PyramidHead.png"
import mirrorPNG from "../assets/mirror.png";
import tilefloorPNG from "../assets/floor.png"
import tilefloorNormal from "../assets/floor_n.png"
import mirrorwallPNG from "../assets/mirrorwall.png"
import Skeleton_bodyPNG from "../assets/Skeleton_body.png"
import Skeleton_headPNG from "../assets/Skeleton_head.png"
import blueSparkPNG from "../assets/blue.png"
import reflectParticlesPNG from "../assets/particles.png"

import cratePNG from "../assets/crate.png"
import crate2PNG from "../assets/crate2.png"
import crateBigPNG from "../assets/crateBig.png"
import bonePNG from "../assets/bone.png"

import skeletonPNG from "../assets/SpriteSheets/Skeleton.png"
import skeletonJSON from "../assets/SpriteSheets/Skeleton.json"
import floorPNG from "../assets/SpriteSheets/floor.png"
import floorJSON from "../assets/SpriteSheets/floor.json"

import bgLoopMP3 from "../assets/audio/bgloopNew.wav"
import RoundManager from "../Managers/RoundManager";
import Player from "../GameObjects/Player";
import Mirror from "../GameObjects/Mirror";

import arena0Map from "../assets/tilemap/arena0.json"
import tilesetPNG from "../assets/SpriteSheets/tileset.png"

var raycaster;
var obstacles
var cursors;

var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

Phaser.Geom.Line.fromAngle = function (x, y, angle, distance) {
    return new Phaser.Geom.Line(x, y, x + distance * Math.cos(angle), y + distance * Math.sin(angle));
};

export default class Arena0 extends Scene {

    constructor() {
        super("Arena0");
    }

    preload() {
        this.load.image('player', playerPNG)
        this.load.image('grenade', grenadePNG)
        this.load.image('shard', shardPNG)
        this.load.image('pyramidHead', pyramidHeadPNG)
        this.load.image('mirror', mirrorPNG);
        this.load.image({key:'tilefloor',url:tilefloorPNG, normalMap:tilefloorNormal})
        this.load.image('mirrorwall', mirrorwallPNG)

        this.load.image('bone', bonePNG)
        this.load.image('crate', cratePNG);
        this.load.image('crate2', crate2PNG)
        this.load.image('crateBig', crateBigPNG)

        this.load.image('Skeleton_body', Skeleton_bodyPNG)
        this.load.image('Skeleton_head', Skeleton_headPNG)

        this.load.audio('bgloop', bgLoopMP3)

        this.load.aseprite('skeleton', skeletonPNG, skeletonJSON)
        this.load.spritesheet('reflectParticles', reflectParticlesPNG, { frameWidth: 32, frameHeight: 32 });
        this.load.atlas('floorAtlas', floorPNG, floorJSON);

        this.load.image('tileset', tilesetPNG)
        this.load.tilemapTiledJSON( 'map', arena0Map);
        this.load.image('spark', blueSparkPNG);
    }

    create() {
        this.physics.collisionDetection = function (a, b) {
            const ab = {
                x: a.x,
                y: a.y,
                width: a.width,
                height: a.height
            }
            const bb = {
                x: b.x,
                y: b.y,
                width: b.width,
                height: b.height
            }

            return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
        }

        this.physics.world.setBounds(0, 0, 48 * 32, 48 * 32);

        //Анимации
        this.anims.createFromAseprite('skeleton');
        this.textures.get('floorAtlas');

        //Создаем арену
        this.arena = this.add.group()
        // this.arena.floor = this.add.tileSprite(640, 640, 1280, 1280, 'tilefloor').setName('floor').setPipeline('Light2D');
        // this.arena.floor.setScale(1)
        // this.arena.add(this.arena.floor)

        this.playerlight  = this.lights.addLight(0, 0, 250, undefined, 1.);

        this.lights.enable().setAmbientColor(0xdddddd);

        this.arena.walls = this.add.group()
        this.arena.add(this.arena.walls)

        // this.arena.wall0 = this.add.tileSprite(-16, 640, 32, 1280, 'mirrorwall').setName('wall0').setPipeline('Light2D');
        // this.arena.wall0.canReflect = true
        // this.arena.walls.add(this.arena.wall0)

        // this.arena.wall1 = this.add.tileSprite(640, -16, 32, 1280, 'mirrorwall').setName('wall1').setPipeline('Light2D');
        // this.arena.wall1.canReflect = true
        // this.arena.wall1.angle = 90
        // this.arena.walls.add(this.arena.wall1)

        // this.arena.wall2 = this.add.tileSprite(1296, 640, 32, 1280, 'mirrorwall').setName('wall2').setPipeline('Light2D');
        // this.arena.wall2.canReflect = true
        // this.arena.wall2.angle = 180
        // this.arena.walls.add(this.arena.wall2)

        // this.arena.wall3 = this.add.tileSprite(640, 1296, 32, 1280, 'mirrorwall').setName('wall3').setPipeline('Light2D');
        // this.arena.wall3.canReflect = true
        // this.arena.wall3.angle = -90
        // this.arena.walls.add(this.arena.wall3)

        const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32  });
        console.log(map)
        const tiles = map.addTilesetImage('tileset', 'tileset');

        this.groundLayer = map.createStaticLayer('Floor', [tiles], 0, 0)
        this.spikeLayer = map.createStaticLayer('Spikes', [tiles], 0, 0)
        this.objLayer = map.createStaticLayer('Stones and barrels', [tiles], 0, 0)
        this.wallLayer = map.createStaticLayer('Walls', [tiles], 0, 0)

        this.objLayer.setCollisionBetween(1, 50);
        this.wallLayer.setCollisionBetween(1, 50);
        // this.wallLayer.setCollisionByProperty({collides:true})
        console.log(this.wallLayer)
        this.wallLayer.forEachTile((tile, i)=>{
            if (tile.properties.canReflect) {
                tile.canReflect = true
                console.log(tile)
            }
            
        })
        
        let bgLoopMusic = this.sound.add('bgloop', {
            loop: true,
            volume: 0.25
        });
        
        bgLoopMusic.play();
        
        //create raycaster
        raycaster = this.raycasterPlugin.createRaycaster();
        this.raycaster = raycaster;

        ReflectableRay.Raycaster = raycaster;
        
        //Create game ui
        this.gameUI = new GameUI(this);
        this.add.existing(this.gameUI);
        
        //create obstacles
        obstacles = this.add.group();
        createObstacles(this, obstacles);

        this.player = new Player(this);
        this.physics.add.collider(this.player, [this.wallLayer, this.objLayer])
        this.add.existing(this.player);
        this.mirror = new Mirror(this);

        this.addObstacles();

        //Debug info
        window.scene = this;
        
        //map obstacles
        raycaster.mapGameObjects(obstacles.getChildren(), true);
        raycaster.mapGameObjects(this.mirror, true);
        raycaster.mapGameObjects(this.player, true);
        raycaster.mapGameObjects(this.arena.walls.getChildren(), true);

        this.EnemiesManager = new EnemiesManager(this, raycaster);
        this.RoundManager = new RoundManager(this, this.EnemiesManager);
        this.RoundManager.setRound(1);


        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.arena.walls);


        //Set camera to follow the player
        this.cameras.main.startFollow(this.player);

        this.input.on('pointermove', function (pointer) {
            this.player.rotation = Phaser.Math.Angle.Between(800 / 2, 600 / 2, pointer.x, pointer.y)
        }, this);

        cursors = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.input.mouse.disableContextMenu();

        
    }

    update(time, delta) {
        stats.begin();

        this.EnemiesManager.update(time, delta);
        this.RoundManager.update(time, delta);

        handlePlayerMovement(this.player, cursors);
        updateMirrorPosition(this);

        this.playerlight.setPosition(
            this.player.x,
            this.player.y
        )

        stats.end();
    }

    addObstacles() {
        const objects = ['crate', 'crate2', 'crateBig']

        let bonesGroup = this.add.group();
        for (let i = 0; i < 20;  i++) {
            let bones = this.add.sprite(Math.random() * 1200, Math.random() * 1200, 'bone').setPipeline('Light2D')
            bones.rotation = Math.random() - Math.random()
            bonesGroup.add(bones);
        }

        let cratesGroup = this.add.group();
        for (let i = 0; i < 10;  i++) {
            let crateType = Math.round(Math.random() * 2);
            let crate = new Crate(this, Math.random() * 1200 + 100, Math.random() * 1200 + 100, objects[crateType]);
 
            cratesGroup.add(crate);
        }

        raycaster.mapGameObjects(cratesGroup.getChildren(), true);
        this.physics.add.collider(cratesGroup, [this.player, this.wallLayer, this.objLayer]);
        this.physics.add.collider(cratesGroup, cratesGroup);

        this.staticObstacles = cratesGroup;
        this.cosmeticObstacles = bonesGroup;
    }
}