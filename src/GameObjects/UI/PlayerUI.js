import PlayerHealthBar from "./PlayerHealthBar";


export default class GameUI extends Phaser.GameObjects.Container {

    _healthBar;
    _grenadeType;

    constructor(scene) {
        super(scene);

        this.setScrollFactor(0);
        this._healthBar = new PlayerHealthBar(scene);
        this._healthBar.setPosition(250, 550);
        scene.healthBar = this._healthBar;
        this.add(this._healthBar);

        this._grenadeType = new Phaser.GameObjects.Text(scene, 700, 550, 'Grenade Type:\nnone', { font: '"Press Start 2P"', align: 'center' });
        this._grenadeType.set = name => this._grenadeType.text = 'Grenade Type:\n' + name;
        scene.grenadeType = this._grenadeType;
        this.add(this._grenadeType)
    }
}