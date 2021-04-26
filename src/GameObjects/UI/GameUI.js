import PlayerHealthBar from "./PlayerHealthBar";
import CurrentRound from "./CurrentRound";
import MirrorStabilityBar from "./MirrorStabilityBar";


export default class GameUI extends Phaser.GameObjects.Container {

    currentRound;

    _healthBar;
    _grenadeType;

    mirrorStabilityBar;

    constructor(scene) {
        super(scene);

        this.setScrollFactor(0);
        this._healthBar = new PlayerHealthBar(scene);
        this._healthBar.setDepth(2)
        this._healthBar.setPosition(250, 550);
        scene.healthBar = this._healthBar;
        this.add(this._healthBar);

        this.mirrorStabilityBar = new MirrorStabilityBar(scene);
        this.mirrorStabilityBar.setDepth(2)
        this.mirrorStabilityBar.setPosition(250, 534);
        this.add(this.mirrorStabilityBar);

        this._addItem = new Phaser.GameObjects.Text(scene, 700, 575, '+1 test', { font: '"Press Start 2P"', align: 'center', color: '#FFFF00' });
        this._addItem.alpha = 0
        this._addItem.setDepth(2)

        this._grenadeType = new Phaser.GameObjects.Text(
            scene,
            680,
            535,
            'Item Type:\nnone', { font: '"Press Start 2P"', align: 'left' }
        );
        this._grenadeType.setDepth(2)
        this._grenadeType.set = grenade => {
            if (grenade) this._grenadeType.text = 'Item Type:\n' + grenade.type + ' x' + grenade.quantity;
            else this._grenadeType.text = 'Item Type:\nnone';
        };
        this._grenadeType.add = (type, quantity) => {
            this._addItem.text = '+' + quantity + ' ' + type;
            scene.tweens.add({
                targets: this._addItem,
                repeat: 3,
                duration: 500,
                ease: Phaser.Math.Easing.Circular.Out,
                alpha: 1,
                onComplete: _ => {
                    this._addItem.alpha = 0;
                }
            })
        }
        scene.grenadeType = this._grenadeType;

        this.currentRound = new CurrentRound(scene);
        this.currentRound.scale = 2;
        this.add(this.currentRound);
        this.add(this._addItem)
        this.add(this._grenadeType)
    }


}