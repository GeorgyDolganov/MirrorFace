import Phaser from "phaser";

export default class GameObjectHealthBar extends Phaser.GameObjects.Container {

    _innerBar;
    _background;


    constructor(scene) {
        super(scene);

        this._background = scene.add.graphics({
            lineStyle: {
                width: 1,
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

        this._background.fillRect(0,0, 50, 8);
        this._background.strokeRect(0,0, 50, 8);
        this._innerBar.fillRect(1, 1, 48, 6);
    }


    setHealth(health) {
        super.update();
        this._innerBar.clear();
        this._innerBar.fillRect(1, 1, Math.max(48 * health/100, 0), 6);
    }
}