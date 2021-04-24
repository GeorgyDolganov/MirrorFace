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

import cratePNG from "../assets/SpriteSheets/crateDestroy.png"
import crateJSON from "../assets/SpriteSheets/crateDestroy.json"
import crate2PNG from "../assets/SpriteSheets/crate2Destroy.png"
import crate2JSON from "../assets/SpriteSheets/crate2Destroy.json"
import crateBigPNG from "../assets/SpriteSheets/crateBigDestroy.png"
import crateBigJSON from "../assets/SpriteSheets/crateBigDestroy.json"
import bonePNG from "../assets/bone.png"

import skeletonPNG from "../assets/SpriteSheets/Skeleton.png"
import skeletonJSON from "../assets/SpriteSheets/Skeleton.json"
import floorPNG from "../assets/SpriteSheets/floor.png"
import floorJSON from "../assets/SpriteSheets/floor.json"

import vampirePNG from "../assets/SpriteSheets/Vampire.png"
import vampireJSON from "../assets/SpriteSheets/Vampire.json"

import bgLoopMP3 from "../assets/audio/moom.mp3"
import mirrorPushWAV from "../assets/audio/mirrorPush.wav"
import laser0WAV from "../assets/audio/laser0.wav"

import RoundManager from "../Managers/RoundManager";
import Player from "../GameObjects/Player";
import Mirror from "../GameObjects/Mirror";

import arena0Map from "../assets/tilemap/arena0.json"
import arenaSkullMap from "../assets/tilemap/arenaSkull.json"
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
        this.load.atlas('crate', cratePNG, crateJSON)
        this.load.atlas('crate2', crate2PNG, crate2JSON)
        this.load.atlas('crateBig', crateBigPNG, crateBigJSON)

        this.load.image('Skeleton_body', Skeleton_bodyPNG)
        this.load.image('Skeleton_head', Skeleton_headPNG)

        this.load.audio('bgloop', bgLoopMP3)
        this.load.audio('mirrorPush', mirrorPushWAV)
        this.load.audio('laser0', laser0WAV)

        this.load.aseprite('skeleton', skeletonPNG, skeletonJSON)
        this.load.spritesheet('reflectParticles', reflectParticlesPNG, { frameWidth: 32, frameHeight: 32 });
        this.load.atlas('floorAtlas', floorPNG, floorJSON);

        this.load.image('tileset', tilesetPNG)
        this.load.tilemapTiledJSON( 'map', arenaSkullMap);
        this.load.image('spark', blueSparkPNG);

        this.load.aseprite('vampire', vampirePNG, vampireJSON);
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

        this.physics.world.setBounds(0, 0, 64 * 32, 64 * 32);

        //Анимации
        this.anims.create({ key: 'crateIdle', frames: this.anims.generateFrameNames('crate', { prefix: 'particles.png_', end: 0, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.create({ key: 'crateDestroy', frames: this.anims.generateFrameNames('crate', { prefix: 'particles.png_', end: 60, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.create({ key: 'crate2Idle', frames: this.anims.generateFrameNames('crate2', { prefix: 'crate2.png_', end: 0, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.create({ key: 'crate2Destroy', frames: this.anims.generateFrameNames('crate2', { prefix: 'crate2.png_', end: 60, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.create({ key: 'crateBigIdle', frames: this.anims.generateFrameNames('crateBig', { prefix: 'render.png_', end: 0, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.create({ key: 'crateBigDestroy', frames: this.anims.generateFrameNames('crateBig', { prefix: 'render.png_', end: 60, zeroPad: 0 }), repeat: 0, repeatDelay: 500, frameRate: 60 });
        this.anims.createFromAseprite('skeleton');
        this.anims.createFromAseprite('vampire');
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


        const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32  });
        console.log(map)
        const tiles = map.addTilesetImage('tileset', 'tileset');

        this.groundLayer = map.createStaticLayer('Floor', [tiles], 0, 0)
        this.spikeLayer = map.createStaticLayer('Spikes', [tiles], 0, 0)
        this.objLayer = map.createStaticLayer('Stones', [tiles], 0, 0)
        this.wallLayer = map.createStaticLayer('Walls', [tiles], 0, 0)
        this.reflectLayer = map.createStaticLayer('ReflectableWalls', [tiles], 0, 0)

        this.objLayer.setCollisionBetween(1, 50);
        this.wallLayer.setCollisionBetween(1, 50);
        this.reflectLayer.setCollisionBetween(1, 50);
        // this.wallLayer.setCollisionByProperty({collides:true})
        console.log(this.wallLayer)
        this.wallLayer.forEachTile((tile, i)=>{
            if (tile.properties.canReflect) {
                tile.canReflect = true
                console.log(tile)
            }
        })

        this.mirrorHitSound = this.sound.add('laser0', {
            volume: 0.10,
            loop: true
        })

        const layers = [this.groundLayer, this.spikeLayer, this.objLayer, this.wallLayer, this.reflectLayer];

        const navMesh = this.navMeshPlugin.buildMeshFromTilemap("mesh1", map, layers);
        this.navMesh = navMesh;

        // Graphics overlay for visualizing path
        const graphics = this.add.graphics(0, 0).setAlpha(0.5);
        navMesh.enableDebug(graphics);
        const drawDebug = () => {
        navMesh.debugDrawClear();
        navMesh.debugDrawMesh({
            drawCentroid: true,
            drawBounds: true,
            drawNeighbors: true,
            drawPortals: true,
        });
        };
        //drawDebug();
        this.input.keyboard.on("keydown-M", drawDebug);
        
        let bgLoopMusic = this.sound.add('bgloop', {
            loop: true,
            volume: 1
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
        this.physics.add.collider(this.player, [this.wallLayer, this.objLayer, this.reflectLayer])
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
        //TODO: fix corrupted tilemap
        raycaster.mapGameObjects(this.wallLayer, false, {
            collisionTiles: [10,11,12,13,15,17, 18,19,20,21,7, 8, 14, 16] //array of tiles types which can collide with ray // 10,11,12,13,15,17, 18,19,20,21,7, 8, 14, 16
        });
        raycaster.mapGameObjects(this.objLayer, false, {
            collisionTiles: [10,11, 18, 19, 20, 21] //array of tiles types which can collide with ray //10,11, 18, 19, 20, 21
        });
        raycaster.mapGameObjects(this.reflectLayer, false, {
            collisionTiles: [10,11,12,13,15,17, 18,19,20,21,7, 8, 14, 16] //array of tiles types which can collide with ray // 10,11,12,13,15,17, 18,19,20,21,7, 8, 14, 16
        });

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
        this.physics.add.collider(cratesGroup, [this.player, this.wallLayer, this.objLayer, this.reflectLayer]);
        this.physics.add.collider(cratesGroup, cratesGroup);

        this.staticObstacles = cratesGroup;
        this.cosmeticObstacles = bonesGroup;
    }
}