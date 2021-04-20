import PlayerHealthBar from "./PlayerHealthBar";
import CurrentRound from "./CurrentRound";


export default class GameUI extends Phaser.GameObjects.Container {

    currentRound;

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
        this._grenadeType.set = grenade => {
            if ( grenade ) this._grenadeType.text = 'Grenade Type:\n' + grenade.type + ' x' + grenade.quantity;
            else this._grenadeType.text = 'Grenade Type:\nnone';
        };
        scene.grenadeType = this._grenadeType;

        this.currentRound = new CurrentRound(scene);
        this.add(this.currentRound);
        this.add(this._grenadeType)
    }


}