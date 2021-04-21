import PhaserRaycaster from 'phaser-raycaster';


import Arena0 from './Scenes/arena0'


let config = {
    type: Phaser.Auto,
    parent: 'game',
    width: 800,
    height: 600,
    backgroundColor: 'black',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            debugShowBody: true,
            debugShowStaticBody: true,
            debugShowVelocity: true,
            debugVelocityColor: 0xffff00,
            debugBodyColor: 0x0000ff,
            debugStaticBodyColor: 0xffffff
        },
    },
    scene: [Arena0],
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
        scene: [{
            key: 'PhaserRaycaster',
            plugin: PhaserRaycaster,
            mapping: 'raycasterPlugin'
        }]
    }
}


let game = new Phaser.Game(config);

window.input = game.input