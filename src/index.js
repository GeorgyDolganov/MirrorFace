import PhaserRaycaster from 'phaser-raycaster'
import NavMeshPlugin from "phaser-navmesh"

import Arena0 from './Scenes/arena0'
import GameMenuScene from "./Scenes/GameMenuScene"
import RoundShop from "./Scenes/roundShop"

import {getQueryParams} from "./Helpers"

window.RoundShop = RoundShop

let scenes;
if( getQueryParams(document.location.search).dev ) {
    scenes = [Arena0, RoundShop, GameMenuScene]
} else if( getQueryParams(document.location.search).shop ) {
    scenes = [RoundShop, Arena0, GameMenuScene]
} else {
    scenes = [GameMenuScene, Arena0, RoundShop ];
}

let config = {
    type: Phaser.WEBGL,
    parent: 'game',
    width: 800,
    height: 600,
    backgroundColor: 'black',
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            // debugShowBody: true,
            // debugShowStaticBody: true,
            // debugShowVelocity: true,
            // debugVelocityColor: 0xffff00,
            // debugBodyColor: 0x0000ff,
            // debugStaticBodyColor: 0xffffff
        },
    },
    scene: scenes,
    loader: {
        baseURL: 'https://labs.phaser.io',
        crossOrigin: 'anonymous'
    },
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    //enable Phaser-raycaster plugin
    plugins: {
        scene: [
            {
                key: "NavMeshPlugin", // Key to store the plugin class under in cache
                plugin: NavMeshPlugin, // Class that constructs plugins
                mapping: "navMeshPlugin", // Property mapping to use for the scene, e.g. this.navMeshPlugin
                start: true,
            },
            {
                key: 'PhaserRaycaster',
                plugin: PhaserRaycaster,
                mapping: 'raycasterPlugin'
            }
        ]
    }
}


let game = new Phaser.Game(config);

window.input = game.input