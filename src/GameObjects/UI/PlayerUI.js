import HealthBar from "./HealthBar";


export default class GameUI extends Phaser.GameObjects.Container {

    _healthBar;

    constructor(scene) {
        super(scene);

        this.setScrollFactor(0);
        this._healthBar = new HealthBar(scene);
        this._healthBar.setPosition(250, 550);
        scene.healthBar = this._healthBar;
        this.add(this._healthBar);
    }
}