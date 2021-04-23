import Phaser from "phaser";

export default class MirrorStabilityBar extends Phaser.GameObjects.Container {

    _innerBar;
    _background;


    constructor(scene) {
        super(scene);

        this._background = scene.add.graphics({
            lineStyle: {
                width: 3,
                color: 0xffffff
            },
            fillStyle: {
                color: 0x6d6d6d
            }
        });

        this._innerBar = scene.add.graphics({
            lineStyle: {
                width: 1,
                color: 0x00adff
            },
            fillStyle: {
                color: 0x00adff
            }
        });

        this.add(this._background);
        this.add(this._innerBar);

        this._background.fillRect(0,0, 300, 16);
        this._background.strokeRect(0,0, 300, 16);
        // this._background.beginPath();
        // this._background.moveTo(16, 0);
        // this._background.lineTo(300 - 16, 0);
        // this._background.lineTo(300, 16);
        // this._background.lineTo(0, 16);
        // this._background.lineTo(16, 0);
        // this._background.closePath();
        // this._background.strokePath();

        this._innerBar.fillRect(2, 2, 300-4, 16-4);
    }



    update(stability) {
        super.update();
        this._innerBar.clear();
        this._innerBar.fillRect(2, 2, Math.max((300-4) * stability/100, 0), 16-4);
    }
}