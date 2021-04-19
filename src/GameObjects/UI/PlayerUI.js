import PlayerHealthBar from "./PlayerHealthBar";


export default class GameUI extends Phaser.GameObjects.Container {

    _healthBar;

    constructor(scene) {
        super(scene);

        this.setScrollFactor(0);
        this._healthBar = new PlayerHealthBar(scene);
        this._healthBar.setPosition(250, 550);
        scene.healthBar = this._healthBar;
        this.add(this._healthBar);
    }
}