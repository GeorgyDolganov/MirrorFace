export default class CurrentRound extends Phaser.GameObjects.Text {
    constructor(scene) {
        super(scene, 0, 588, 'Round: 0', { font: '"Press Start 2P"', align: 'center', fontSize: 20 });
    }

    setRound(round) {
        this.text = "Round: " + round;
    }
}