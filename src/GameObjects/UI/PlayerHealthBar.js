import Phaser from "phaser";

export default class PlayerHealthBar extends Phaser.GameObjects.Container {

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
                color: 0xff0000
            },
            fillStyle: {
                color: 0xff0000
            }
        });

        this.add(this._background);
        this.add(this._innerBar);

        this._background.fillRect(0,0, 300, 20);
        this._background.strokeRect(0,0, 300, 20);
        this._innerBar.fillRect(3, 3, 300-6, 20-6);
    }

    update(health) {
        super.update();
        this._innerBar.clear();
        this._innerBar.fillRect(3, 3, Math.max((300-6) * health/100, 0), 20-6);
    }
}