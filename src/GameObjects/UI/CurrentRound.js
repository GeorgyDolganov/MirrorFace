export default class CurrentRound extends Phaser.GameObjects.Text {
    constructor(scene) {
        super(scene, 170, 533, 'Round: 0', { font: '"Press Start 2P"', align: 'center', fontSize: 72 });
    }

    setRound(round) {
        this.text = "Round: " + round;
    }
}