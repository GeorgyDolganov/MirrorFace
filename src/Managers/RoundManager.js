import config from "../Configs/rounds.json";
import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";
import SkeletonEnemy from "../GameObjects/Enemies/SkeletonEnemy";

export default class RoundManager {
    _scene;
    _enemiesManager;


    _currentRound;
    _timestamps = [];
    _enemiesRemaining = [];

    _enemyTypesMap = {
        ["RaycasterEnemy"]: RaycasterEnemy,
        ["SkeletonEnemy"]: SkeletonEnemy,
    }

    constructor(scene, enemiesManager) {
        this._scene = scene;
        this._enemiesManager = enemiesManager;

        this.setRound(1);
        console.log(this, config);
    }

    setNextRound() {
        console.log("------ Next round -----");
        this.setRound(this._currentRound.round + 1);
    }

    setRound(roundNumber) {
        let roundConfig = config.rounds.find(r => r.round === roundNumber);
        if( roundConfig === undefined ) {
            return;
        }

        this._currentRound = {
            ...roundConfig
        };

        this._currentRound.spawns.forEach((spawn,index) => {
            this._timestamps[index] = 0;
            this._enemiesRemaining[index] = spawn.totalSpawns;
        });

        this._scene.gameUI.currentRound.setRound(roundNumber);
    }

    update(time, delta) {
        let roundInProgress = false;
        this._currentRound.spawns.forEach((spawn, index) => {
            if( this._enemiesRemaining[index] <= 0 ) return;

            roundInProgress = true;
            this._timestamps[index] += delta;

            if(this._timestamps[index] > spawn.spawnRate * 1000) {
                this._enemiesManager.spawnAt(spawn.position, this.getEnemyType(spawn.enemyType));
                this._enemiesRemaining[index] -= 1;
                this._timestamps[index] = 0;
            }
        });

        if( !roundInProgress && this._enemiesManager.countEnemies() === 0 ) {
            //TODO: handle last round
            this.setNextRound();
        }
    }

    getEnemyType(stringType) {
        let type = this._enemyTypesMap[stringType];
        if( type === undefined ) throw new Error(`Trying to get unsupported enemy type ${stringType}`);
        return this._enemyTypesMap[stringType];
    }
}