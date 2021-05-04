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

        this._addItem = new Phaser.GameObjects.Text(scene, 565, 570, '+1 test', { font: '"Press Start 2P"', align: 'center', color: '#FFFF00' });
        this._addItem.alpha = 0
        this._addItem.setDepth(2)

        this._grenadeType = new Phaser.GameObjects.Text(
            scene,
            565,
            533,
            'Grenade:\nnone', { font: '"Press Start 2P"', align: 'left' }
        );
        this._grenadeType.scale = 1.5;
        this._grenadeType.setDepth(2)
        this._grenadeType.set = grenade => {
            if (grenade) this._grenadeType.text = 'Grenade:\n' + grenade.type + ' x' + grenade.quantity;
            else this._grenadeType.text = 'Grenade:\nnone';
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

        this._healingType = new Phaser.GameObjects.Text(
            scene,
            665,
            533,
            'Healing:\nnone', { font: '"Press Start 2P"', align: 'left' }
        );
        this._healingType.scale = 1.5;
        this._healingType.setDepth(2)
        this._healingType.set = healing => {
            if (healing) this._healingType.text = 'Healing:\n' + healing.type + ' x' + healing.quantity;
            else this._healingType.text = 'Healing:\nnone';
        };
        this._healingType.add = (type, quantity) => {
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
        scene.healingType = this._healingType;

        this.currentRound = new CurrentRound(scene);
        this.currentRound.scale = 1.5;
        this.add(this.currentRound);
        this.add(this._addItem)
        this.add(this._grenadeType)
        this.add(this._healingType)
    }


}