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
        debug: true,
    },
    scene: [Arena0],
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