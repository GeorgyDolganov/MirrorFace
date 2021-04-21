import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";
import DoubleRaycasterEnemyFirst from "../GameObjects/Enemies/DoubleRaycasterEnemyFirst";
import DoubleRaycasterEnemySecond from "../GameObjects/Enemies/DoubleRaycasterEnemySecond";
import EnemyFactory from "./EnemiesPool";

export default class EnemiesManager {
    _enemies = [];
    _enemiesPool;

    spawnCooldown = 10000;
    currentCooldown = 0;

    constructor(scene, raycaster) {
        this._scene = scene;
        this._enemiesPool = new EnemyFactory(scene, raycaster);
    }

    update(time, delta) {
        this.updateEnemies(time, delta);

        // this.currentCooldown += delta;
        // if( this.currentCooldown > this.spawnCooldown ) {
        //     this.spawnRandomAt({x: 100, y: 100});
        //     this.currentCooldown = 0;
        // }
    }

    updateEnemies(time, delta) {
        let markForRemove = [];
        this._enemies.forEach((e, index) => {
            if( e.isAlive() ) {
                e.update(time, delta);
            } else {
                markForRemove.push(index);
                this._enemiesPool.kill(e);
            }
        });
        markForRemove.forEach(i => {
            this._enemies.splice(i, 1);
        })
    }

    spawnRandomAt(position) {
        this.spawnAt(position, this.getRandomEnemyType());
    }

    spawnAt(position, type) {
        let enemy = this._enemiesPool.create(type, position);
        this._enemies.push(enemy);
    }

    getRandomEnemyType() {
        let map = [ RaycasterEnemy, DoubleRaycasterEnemyFirst, DoubleRaycasterEnemySecond ];

        let index = Math.floor(Math.random() * (map.length));
        return map[index];
    }

    countEnemies() {
        return this._enemies.length;
    }
}