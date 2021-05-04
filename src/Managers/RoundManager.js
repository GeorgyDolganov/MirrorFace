import config from "../Configs/rounds.json";
import TankEnemy from "../GameObjects/Enemies/TankEnemy";
import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";
import SkeletonEnemy from "../GameObjects/Enemies/SkeletonEnemy";
import VampireEnemy from "../GameObjects/Enemies/VampireEnemy";
import HydraEnemy from "../GameObjects/Enemies/HydraEnemy";
import MagicianEnemy from "../GameObjects/Enemies/MagicianEnemy";

export default class RoundManager {
    _scene;
    _enemiesManager;


    _currentRound;
    _timestamps = [];
    _enemiesRemaining = [];

    _enemyTypesMap = {
        ["MagicianEnemy"]: MagicianEnemy,
        ["TankEnemy"]: TankEnemy,
        ["RaycasterEnemy"]: RaycasterEnemy,
        ["SkeletonEnemy"]: SkeletonEnemy,
        ["VampireEnemy"]: VampireEnemy,
        ["HydraEnemy"]: HydraEnemy,
    }

    constructor(scene, enemiesManager) {
        this._scene = scene;
        this._enemiesManager = enemiesManager;

        this.blackout = scene.add.graphics();
        this.blackout.fillStyle(0x000000, 1);
        this.blackout.fillRect(0, 0, 800, 600);
        this.blackout.alpha = 0
        this.blackout.setScrollFactor(0);
        this.blackout.setDepth(10)
        this.setRound(1);
    }

    setNextRound() {
        this._scene.gameStats.roundsSurvived += 1;
        console.log("------ Next round -----");
        return this.setRound(this._currentRound.round + 1);
    }

    setRound(roundNumber) {
        let roundConfig = config.rounds.find(r => r.round === roundNumber);
        if (roundConfig === undefined) {
            let congrats = new Phaser.GameObjects.Text( scene, 100, 200, "CONGRATULATIONS!!!\nYOU WON!!!", { font: '"Press Start 2P"', align: 'center', color: '#FFFF00' } );
            congrats.scale = 6

            let congratsInterval = setInterval(_ => {
                congrats.x = congrats.x === 100 ? 120 : 100;
                congrats.scale = congrats.scale === 6 ? 5.5 : 6;

                congrats.setColor(congrats.scale === 6 ? '#FFFF00' : '#FFFFFF');
            }, 500);
            setTimeout(_ => {
                clearInterval(congratsInterval);
                congrats.destroy();
            }, 5000);
            
            scene.gameUI.add(congrats);

            return false;
        }

        this._currentRound = {
            ...roundConfig
        };

        this._currentRound.spawns.forEach((spawn, index) => {
            this._timestamps[index] = 0;
            this._enemiesRemaining[index] = spawn.totalSpawns;
        });

        this._scene.gameUI.currentRound.setRound(roundNumber);

        return true;
    }

    update(time, delta, scene) {
        let roundInProgress = false;
        this._currentRound.spawns.forEach((spawn, index) => {
            if (this._enemiesRemaining[index] <= 0) return;

            roundInProgress = true;
            this._timestamps[index] += delta;

            if (this._timestamps[index] > spawn.spawnRate * 1000) {
                this._enemiesManager.spawnAt(spawn.position, this.getEnemyType(spawn.enemyType));
                this._enemiesRemaining[index] -= 1;
                this._timestamps[index] = 0;
            }
        });

        if (!roundInProgress && this._enemiesManager.countEnemies() === 0) {
            //TODO: handle last round
            if ( !this.setNextRound() ) {this.setNextRound = _ => {}; return;}
            let ctx = this
            new Promise((res) => {
                scene.tweens.add({
                    targets: ctx.blackout,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        res()
                    }
                })
            }).then(_ => {
                scene.game.sound.stopAll();
                scene.scene.sleep()
                scene.scene.run('roundShop', scene.wallet.amount.text);
                scene.tweens.add({
                    targets: ctx.blackout,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2',
                })
            })
        }
    }

    getEnemyType(stringType) {
        let type = this._enemyTypesMap[stringType];
        if (type === undefined) throw new Error(`Trying to get unsupported enemy type ${stringType}`);
        return this._enemyTypesMap[stringType];
    }
}