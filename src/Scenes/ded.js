import Phaser, {
    Scene
} from 'phaser';

export default class Arena0 extends Scene {

    preload() {
        this.load.image('player', playerPNG);
        this.load.image('pyramidHead', pyramidHeadPNG);
        this.load.image('mirror', mirrorPNG);
        this.load.image('metalfloor', metalfloorPNG)
        this.load.image('mirrorwall', mirrorwallPNG)
        this.load.audio('bgloop', bgLoopMP3);
    }

    create() {

        
    }

    update(time, delta) {
        
    }
}